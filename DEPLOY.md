# Деплой Creative Landing → зорка.рф/creative-service

> Цель: разместить страницу `index.html` по адресу `зорка.рф/creative-service`
> без изменения основного сайта зорка.рф

---

## Доступы к серверу в .env

Подключение:
```bash
ssh root@45.132.18.176
```

---

## Шаг 1. Найти папку основного сайта зорка.рф

После подключения по SSH:

```bash
# Найти путь к сайту в конфиге Nginx
grep -r "server_name\|root " /etc/nginx/sites-enabled/ 2>/dev/null
grep -r "server_name\|root " /etc/nginx/conf.d/ 2>/dev/null
```

Ищем строки вида `server_name xn--80anjpk.xn--p1ai` и следующий за ней `root /путь/к/сайту`.

---

## Шаг 2. Сделать бэкап основного сайта на сервере

```bash
# Создать архив (замени /var/www/ПАПКА на реальный путь из шага 1)
tar -czf /root/backup_zorka_$(date +%Y%m%d).tar.gz /var/www/ПАПКА/

# Убедиться, что архив создался
ls -lh /root/backup_zorka_*.tar.gz
```

---

## Шаг 3. Скачать бэкап локально на Mac

Выполнить **на своём компьютере** (не на сервере):

```bash
scp root@45.132.18.176:/root/backup_zorka_*.tar.gz ~/Desktop/
```

После этого на Desktop появится архив — полная копия текущего сайта.

---

## Шаг 4. Загрузить файлы creative-service на сервер

Выполнить **на своём компьютере** из папки `Сreative_Landing`:

```bash
# Создать папку на сервере
ssh root@45.132.18.176 "mkdir -p /var/www/creative-service"

# Загрузить все файлы лендинга
scp -r /Users/viktorryzhov/Desktop/Vibecoding_Viktor/Сreative_Landing/* root@45.132.18.176:/var/www/creative-service/
```

---

## Шаг 5. Добавить роут в Nginx

На сервере найти конфиг зорка.рф и добавить внутрь блока `server { }` новый `location`:

```bash
# Открыть конфиг на редактирование (уточни имя файла из шага 1)
nano /etc/nginx/sites-enabled/ИМЯ_КОНФИГА
```

Добавить блок (вставить перед закрывающей `}`):

```nginx
location /creative-service {
    alias /var/www/creative-service/;
    index index.html;
    try_files $uri $uri/ /creative-service/index.html;
}
```

---

## Шаг 6. Проверить конфиг и перезагрузить Nginx

```bash
# Проверка на ошибки
nginx -t

# Если всё ок — применить изменения (без остановки сайта)
systemctl reload nginx
```

---

## Шаг 7. Проверить результат

Открыть в браузере: `https://зорка.рф/creative-service`

---

## Откат — если что-то пошло не так

### Удалить новый роут из Nginx:
```bash
nano /etc/nginx/sites-enabled/ИМЯ_КОНФИГА
# Удалить добавленный блок location /creative-service { ... }
nginx -t && systemctl reload nginx
```

### Восстановить основной сайт из бэкапа:
```bash
tar -xzf /root/backup_zorka_ДАТА.tar.gz -C /
systemctl reload nginx
```

---

## Диагностика

| Проблема | Команда |
|---|---|
| Логи Nginx (ошибки) | `tail -50 /var/log/nginx/error.log` |
| Статус Nginx | `systemctl status nginx` |
| Что слушает сервер | `ss -tlnp \| grep nginx` |
| Проверить файлы | `ls -la /var/www/creative-service/` |
