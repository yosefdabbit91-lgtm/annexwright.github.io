/* Decorative only: content and purchase paths remain usable without JavaScript. */
(() => {
  const scene = document.querySelector('.blueprint-scene');
  if (!scene) return;
  const control = scene.querySelector('.motion-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const slow = matchMedia('(update: slow)');
  const limited = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  let frame = 0, x = 0, y = 0, visible = true, userPaused = false;
  const supported = () => !motion.matches && !slow.matches && !limited && pointer.matches;
  const allowed = () => supported() && !userPaused;
  const pause = () => {
    scene.classList.toggle('is-paused', !allowed() || !visible || document.hidden);
    if (control) {
      control.hidden = false;
      control.disabled = !supported();
      control.textContent = !supported() ? 'Motion off' : userPaused ? 'Resume motion' : 'Pause motion';
      control.setAttribute('aria-pressed', String(userPaused || !supported()));
    }
  };
  const reset = () => {
    cancelAnimationFrame(frame); frame = 0;
    scene.style.setProperty('--rx', '0deg');
    scene.style.setProperty('--ry', '0deg');
  };
  if (control) control.addEventListener('click', () => {
    userPaused = !userPaused; reset(); pause();
  });
  scene.addEventListener('pointermove', event => {
    if (!allowed() || !visible || document.hidden) return;
    const rect = scene.getBoundingClientRect();
    x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    if (!frame) frame = requestAnimationFrame(() => {
      scene.style.setProperty('--rx', `${-y * 3}deg`);
      scene.style.setProperty('--ry', `${x * 4}deg`);
      frame = 0;
    });
  }, { passive: true });
  scene.addEventListener('pointerleave', reset);
  for (const preference of [motion, pointer, slow]) preference.addEventListener('change', () => { reset(); pause(); });
  document.addEventListener('visibilitychange', () => { reset(); pause(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; if (!visible) reset(); pause();
  }).observe(scene);
  pause();
})();
