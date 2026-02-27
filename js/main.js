/* ============================================================
   ZORKA CREATIVE LANDING — MAIN JS
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   HEADER: scroll state
   ------------------------------------------------------------ */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ------------------------------------------------------------
   MOBILE MENU
   ------------------------------------------------------------ */
const burgerBtn   = document.getElementById('burgerBtn');
const mobileMenu  = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burgerBtn.classList.toggle('open', isOpen);
  burgerBtn.setAttribute('aria-expanded', isOpen);
  mobileMenu.setAttribute('aria-hidden', !isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burgerBtn.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
});

/* ------------------------------------------------------------
   SMOOTH SCROLL (all internal anchors)
   ------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 76;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ------------------------------------------------------------
   SHOWREEL VIDEO PLAYER
   ------------------------------------------------------------ */
const showreelWrap   = document.getElementById('showreelWrap');
const showreelVideo  = document.getElementById('showreelVideo');
const showreelPoster = document.getElementById('showreelPoster');
const showreelCtrls  = document.getElementById('showreelControls');
const ctrlPlayPause  = document.getElementById('ctrlPlayPause');
const ctrlProgress   = document.getElementById('ctrlProgress');
const progressFill   = document.getElementById('progressFill');
const ctrlTime       = document.getElementById('ctrlTime');
const ctrlMute       = document.getElementById('ctrlMute');
const ctrlFullscreen = document.getElementById('ctrlFullscreen');

let showreelSrcLoaded = false;

function loadShowreelSrc() {
  if (showreelSrcLoaded) return;
  showreelSrcLoaded = true;
  const src = showreelVideo.dataset.src;
  if (src) { showreelVideo.src = src; showreelVideo.load(); }
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function setShowreelPlaying(playing) {
  const iconPlay  = ctrlPlayPause.querySelector('.icon-play');
  const iconPause = ctrlPlayPause.querySelector('.icon-pause');
  iconPlay.style.display  = playing ? 'none'  : '';
  iconPause.style.display = playing ? ''      : 'none';
}

// Click on poster → load & play
showreelPoster.addEventListener('click', () => {
  loadShowreelSrc();
  showreelVideo.play();
  showreelPoster.classList.add('hidden');
  setShowreelPlaying(true);
});

// Click on video → toggle pause
showreelVideo.addEventListener('click', () => {
  if (showreelVideo.paused) { showreelVideo.play(); setShowreelPlaying(true); }
  else                      { showreelVideo.pause(); setShowreelPlaying(false); }
});

// Play/Pause button
ctrlPlayPause.addEventListener('click', e => {
  e.stopPropagation();
  if (showreelVideo.paused) {
    loadShowreelSrc();
    showreelVideo.play();
    showreelPoster.classList.add('hidden');
    setShowreelPlaying(true);
  } else {
    showreelVideo.pause();
    setShowreelPlaying(false);
  }
});

// Progress bar
showreelVideo.addEventListener('timeupdate', () => {
  if (!showreelVideo.duration) return;
  const pct = (showreelVideo.currentTime / showreelVideo.duration) * 100;
  progressFill.style.width = pct + '%';
  ctrlTime.textContent = fmtTime(showreelVideo.currentTime);
});

ctrlProgress.addEventListener('click', e => {
  e.stopPropagation();
  const track = ctrlProgress.querySelector('.progress-track');
  const rect  = track.getBoundingClientRect();
  showreelVideo.currentTime = ((e.clientX - rect.left) / rect.width) * showreelVideo.duration;
});

// Mute
ctrlMute.addEventListener('click', e => {
  e.stopPropagation();
  showreelVideo.muted = !showreelVideo.muted;
  ctrlMute.querySelector('.sound-wave').style.opacity = showreelVideo.muted ? '0.25' : '1';
});

// Fullscreen
ctrlFullscreen.addEventListener('click', e => {
  e.stopPropagation();
  const el = showreelWrap;
  if      (el.requestFullscreen)       el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
});

// Ended
showreelVideo.addEventListener('ended', () => {
  setShowreelPlaying(false);
  showreelPoster.classList.remove('hidden');
  progressFill.style.width = '0%';
  ctrlTime.textContent = '0:00';
});

/* ------------------------------------------------------------
   VIDEO CARDS — lazy load + play on click, muted by default
   ------------------------------------------------------------ */
const videoCards = document.querySelectorAll('.video-card:not(.placeholder)');

// Lazy-load src when card is near viewport
const loadObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const video = entry.target.querySelector('.vcard-video');
    if (video && video.dataset.src && !video.src) {
      video.src = video.dataset.src;
      video.load();
    }
    loadObserver.unobserve(entry.target);
  });
}, { rootMargin: '300px' });

videoCards.forEach(card => {
  loadObserver.observe(card);

  const video   = card.querySelector('.vcard-video');
  const playBtn = card.querySelector('.vcard-play');
  if (!video || !playBtn) return;

  // Inject play + pause SVG icons into the play button
  playBtn.innerHTML = `
    <svg class="icon-play" width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
      <polygon points="5,2 18,11 5,20"/>
    </svg>
    <svg class="icon-pause" width="22" height="22" viewBox="0 0 22 22" fill="currentColor" style="display:none">
      <rect x="4" y="2" width="5" height="18" rx="1"/>
      <rect x="13" y="2" width="5" height="18" rx="1"/>
    </svg>`;

  // Create mute button and append to card
  const muteBtn = document.createElement('button');
  muteBtn.className = 'vcard-mute';
  muteBtn.setAttribute('aria-label', 'Включить звук');
  muteBtn.innerHTML = `
    <svg class="icon-muted" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5v5h2.5L8 13V3L4.5 5.5H2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M11.5 6.5l3 3m0-3l-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <svg class="icon-sound" width="16" height="16" viewBox="0 0 16 16" fill="none" style="display:none">
      <path d="M2 5.5v5h2.5L8 13V3L4.5 5.5H2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M10.5 5.5a4 4 0 010 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M12.5 3.5a7 7 0 010 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`;
  card.appendChild(muteBtn);

  const iconPlay  = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  const iconMuted = muteBtn.querySelector('.icon-muted');
  const iconSound = muteBtn.querySelector('.icon-sound');

  // Stop all other playing videos
  function stopOthers() {
    videoCards.forEach(c => {
      if (c === card) return;
      const v  = c.querySelector('.vcard-video');
      const pb = c.querySelector('.vcard-play');
      const mb = c.querySelector('.vcard-mute');
      if (!v || v.paused) return;
      v.pause();
      c.classList.remove('playing');
      if (pb) {
        pb.querySelector('.icon-play').style.display  = '';
        pb.querySelector('.icon-pause').style.display = 'none';
      }
      if (mb) mb.classList.remove('visible');
    });
  }

  // Sync mute button icon with video.muted state
  function updateMuteUI() {
    const muted = video.muted;
    iconMuted.style.display = muted ? '' : 'none';
    iconSound.style.display = muted ? 'none' : '';
    muteBtn.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
  }

  // Play button: play / pause toggle
  playBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (video.dataset.src && !video.src) { video.src = video.dataset.src; video.load(); }

    if (video.paused) {
      stopOthers();
      video.play().then(() => {
        card.classList.add('playing');
        iconPlay.style.display  = 'none';
        iconPause.style.display = '';
        muteBtn.classList.add('visible');
        updateMuteUI();
      }).catch(() => {});
    } else {
      video.pause();
      card.classList.remove('playing');
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
      muteBtn.classList.remove('visible');
    }
  });

  // Mute button: toggle sound
  muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    video.muted = !video.muted;
    updateMuteUI();
  });
});

/* ------------------------------------------------------------
   PLAYABLE AD PREVIEWS — mute audio on load
   ------------------------------------------------------------ */
document.querySelectorAll('.icard-preview iframe').forEach(iframe => {
  iframe.addEventListener('load', () => {
    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument || win.document;
      // Mute any audio/video elements
      doc.querySelectorAll('audio, video').forEach(el => {
        el.muted = true;
        el.volume = 0;
      });
      // Cocos Creator: mute audio engine
      if (win.cc && win.cc.audioEngine) {
        win.cc.audioEngine.setVolume(0);
        win.cc.audioEngine.setMusicVolume(0);
        win.cc.audioEngine.setEffectsVolume(0);
      }
      // Suspend Web Audio context if accessible
      if (win.AudioContext || win.webkitAudioContext) {
        const OrigAC = win.AudioContext || win.webkitAudioContext;
        const ctx = win._audioCtx || (win.cc && win.cc.sys && win.cc.sys._audioCtx);
        if (ctx && ctx.state !== 'suspended') ctx.suspend();
      }
    } catch (e) {}
  });
});

/* ------------------------------------------------------------
   INTERACTIVE BANNERS MODAL
   ------------------------------------------------------------ */
const bannerModal    = document.getElementById('bannerModal');
const bannerModalBg  = document.getElementById('bannerModalBg');
const bannerModalClose = document.getElementById('bannerModalClose');
const bannerFrame    = document.getElementById('bannerFrame');

document.querySelectorAll('.icard').forEach(card => {
  card.addEventListener('click', () => {
    const src = card.dataset.src;
    if (!src) return;
    bannerFrame.src = src;
    bannerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  bannerModal.classList.remove('open');
  bannerFrame.src = '';
  document.body.style.overflow = '';
}

bannerModalClose.addEventListener('click', closeModal);
bannerModalBg.addEventListener('click', closeModal);

/* ------------------------------------------------------------
   CASES MODAL
   ------------------------------------------------------------ */
const caseModal      = document.getElementById('caseModal');
const caseModalBg    = document.getElementById('caseModalBg');
const caseModalClose = document.getElementById('caseModalClose');
const caseModalInner = document.getElementById('caseModalInner');

document.querySelectorAll('.case-card').forEach(card => {
  card.addEventListener('click', () => {
    const id = card.dataset.case;
    const content = document.getElementById('caseContent' + id);
    if (!content) return;
    caseModalInner.innerHTML = content.innerHTML;
    caseModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Video reveal button
    const videoBtn = caseModalInner.querySelector('.case-video-btn');
    if (videoBtn) {
      videoBtn.addEventListener('click', () => {
        const src = videoBtn.dataset.src;
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.playsinline = true;
        video.className = 'case-video';
        videoBtn.closest('.case-video-wrap').replaceChild(video, videoBtn);
        video.play();
      });
    }
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
  });
});

function closeCaseModal() {
  caseModal.classList.remove('open');
  // pause video if playing
  const v = caseModalInner.querySelector('video');
  if (v) v.pause();
  caseModalInner.innerHTML = '';
  document.body.style.overflow = '';
}

caseModalClose.addEventListener('click', closeCaseModal);
caseModalBg.addEventListener('click', closeCaseModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeCaseModal(); }
});

/* ------------------------------------------------------------
   REVEAL ON SCROLL (IntersectionObserver)
   ------------------------------------------------------------ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ------------------------------------------------------------
   STATS COUNTER ANIMATION
   ------------------------------------------------------------ */
function animateCounter(el) {
  const raw    = el.dataset.val;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const isFloat = raw.includes('.');
  const target  = parseFloat(raw);
  const duration = 1400;
  const start    = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-val[data-val]').forEach(el => statsObserver.observe(el));

/* ------------------------------------------------------------
   FORM — validation + HubSpot submission
   ------------------------------------------------------------ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');

// Clear error state on input
contactForm.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('err'));
  el.addEventListener('change', () => el.classList.remove('err'));
});

contactForm.addEventListener('submit', async e => {
  e.preventDefault();

  // Validate required fields
  let valid = true;
  ['fname', 'fcompany', 'femail'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('err'); valid = false; }
  });
  const emailEl = document.getElementById('femail');
  if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('err'); valid = false;
  }
  if (!valid) {
    contactForm.querySelector('.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const submitBtn = contactForm.querySelector('.btn-submit');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoad   = submitBtn.querySelector('.btn-loading');

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoad.style.display = '';
  formSuccess.style.display = 'none';
  formError.style.display   = 'none';

  /* ----------------------------------------------------------------
     HubSpot Forms API
     Replace PORTAL_ID and FORM_ID after creating the form in HubSpot.
     Field names must match HubSpot internal property names.
     ---------------------------------------------------------------- */
  const PORTAL_ID = 'YOUR_PORTAL_ID';   // e.g. '12345678'
  const FORM_ID   = 'YOUR_FORM_ID';     // e.g. 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

  const fd = new FormData(contactForm);
  const fields = [];

  const mapping = {
    firstname:        'firstname',
    company:          'company',
    email:            'email',
    how_did_you_hear: 'how_did_you_hear_about_us',
    business_type:    'type_of_business',
    ad_budget:        'advertising_budget',
    strategic_goals:  'strategic_goals_and_plans',
  };

  for (const [key, value] of fd.entries()) {
    if (value && mapping[key]) {
      fields.push({ name: mapping[key], value });
    }
  }

  const payload = {
    fields,
    context: {
      pageUri: window.location.href,
      pageName: document.title,
    },
  };

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      contactForm.reset();
      formSuccess.style.display = 'flex';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      const err = await res.json().catch(() => ({}));
      console.error('HubSpot error:', err);
      formError.style.display = 'flex';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    formError.style.display = 'flex';
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = '';
    btnLoad.style.display = 'none';
  }
});
