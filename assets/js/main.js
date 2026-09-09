document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Fallback for "email us" buttons: some visitors have no mail app
  // registered to handle mailto: links, so let them copy the address instead.
  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(temp);
  }

  // Photo strip: auto-scrolls continuously, but yields to the visitor the
  // moment they interact with it (drag, arrows, keyboard), then resumes
  // flowing after a pause.
  const picScroller = document.querySelector('.pic-scroller');
  if (picScroller) {
    let autoplay = true;
    let resumeTimer = null;
    const speed = 0.5; // px per frame

    function pauseAutoplay() {
      autoplay = false;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { autoplay = true; }, 2200);
    }

    // Pause on genuine user input, not on the resulting `scroll` event —
    // scrollLeft changes fire `scroll` asynchronously, so listening to that
    // instead would end up reacting to our own auto-scroll and self-pausing.
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
      picScroller.addEventListener(evt, pauseAutoplay, { passive: true });
    });

    function tick() {
      if (autoplay) {
        const maxScroll = picScroller.scrollWidth - picScroller.clientWidth;
        if (maxScroll > 0) {
          picScroller.scrollLeft = picScroller.scrollLeft >= maxScroll - 1
            ? 0
            : picScroller.scrollLeft + speed;
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Arrow buttons: jump exactly one photo per click.
    const leftArrow = document.querySelector('.pic-arrow-left');
    const rightArrow = document.querySelector('.pic-arrow-right');
    function jump(direction) {
      pauseAutoplay();
      const firstImg = picScroller.querySelector('img');
      const trackStyle = getComputedStyle(picScroller.querySelector('.pic-track'));
      const gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
      const step = firstImg ? firstImg.getBoundingClientRect().width + gap : picScroller.clientWidth;
      const maxScroll = picScroller.scrollWidth - picScroller.clientWidth;
      let target = picScroller.scrollLeft + direction * step;
      if (target < 0) target = maxScroll; // wrap around at the start
      if (target > maxScroll) target = 0; // wrap around at the end
      picScroller.scrollTo({ left: target, behavior: 'smooth' });
    }
    if (leftArrow) leftArrow.addEventListener('click', () => jump(-1));
    if (rightArrow) rightArrow.addEventListener('click', () => jump(1));
  }

  const copyBtn = document.getElementById('copy-sponsor-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.textContent.trim();
      const status = document.getElementById('copy-sponsor-status');
      const showCopied = () => {
        status.textContent = ' Copied!';
        setTimeout(() => { status.textContent = ''; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showCopied).catch(() => { fallbackCopy(email); showCopied(); });
      } else {
        fallbackCopy(email);
        showCopied();
      }
    });
  }

  // Google Apps Script Web App URL for the mailing-list Google Sheet.
  // See assets/js/mailing-list-setup.md for how to create and deploy it.
  const MAILING_LIST_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkYvYLU9NqwBN6sA_FKkhqUdVd8tP-xmrLBG7lMojzzpeEeIDvOfl7mEdrPZhUuV4BEA/exec';

  const mailingListForm = document.getElementById('mailing-list-form');
  if (mailingListForm) {
    mailingListForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('mailing-list-status');
      const email = document.getElementById('ml-email').value;

      if (MAILING_LIST_SCRIPT_URL.includes('PASTE_YOUR')) {
        status.textContent = "This form isn't connected to the mailing list sheet yet. See assets/js/mailing-list-setup.md.";
        status.classList.add('show');
        return;
      }

      const data = new FormData();
      data.append('email', email);

      fetch(MAILING_LIST_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data })
        .then(() => {
          status.textContent = "Thanks! You're on the list.";
          status.classList.add('show', 'ok');
          mailingListForm.reset();
        })
        .catch(() => {
          status.textContent = "Something went wrong. Please try again or email us directly.";
          status.classList.add('show');
        });
    });
  }
});
