/* story.js: the scroll-story runtime for premium-web-design pages.
   No dependencies, classic script so it runs from file:// as well.
   Contract and authoring guide: references/scroll-story.md.

   Writes, and nothing else:
     <html>          data-story="live|static", data-active-scene="<id>", --page, --v
     [data-scene]    --p, --enter, --leave, data-state, data-current
     [data-step]     .is-active
     [data-track]    --t   (drives the element's paused CSS animation)
     [data-reveal]   --e   (lines: on each .line; count: the text;
                            with data-stagger: on each child)
     [data-stagger]  --d on each child, 0 at the origin to 1 at the farthest
   Every CSS fallback is the finished state, so the page reads without JS. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.Story = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.start);
    else api.start();
  }
})(function () {
  const LAMBDA = 9;
  const REVEAL_FROM = 0.92;
  const REVEAL_TO = 0.56;
  const LINE_STAGGER = 0.06;
  const STAGGER_SPREAD = 0.18;
  const ACTIVE_LINE = 0.5;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  const within = (p, from, to) => {
    const span = to - from;
    if (span === 0) return p >= to ? 1 : 0;
    return clamp01((p - from) / span);
  };

  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

  const sceneProgress = (top, height, viewport, y) => {
    const travel = height - viewport;
    if (travel <= 0) return y >= top ? 1 : 0;
    return clamp01((y - top) / travel);
  };

  const enterProgress = (top, viewport, y) => clamp01((y - top + viewport) / viewport);

  const leaveProgress = (top, height, viewport, y) => clamp01((y - top - height + viewport) / viewport);

  /* `held` is where a reveal inside a sticky element stops on screen, as a
     fraction of the viewport. It never rises past that, so the window has to
     finish there or the reveal stalls half done. */
  const revealProgress = (top, viewport, y, shift = 0, held = -Infinity) => {
    const span = REVEAL_FROM - REVEAL_TO;
    const to = Math.max(REVEAL_TO - shift, held);
    const from = Math.max(REVEAL_FROM, held + span) - shift;
    return within((top - y) / viewport, from, to);
  };

  const activeStep = (stepTops, y, viewport) => {
    const line = y + viewport * ACTIVE_LINE;
    return stepTops.filter((top) => top <= line).length - 1;
  };

  const STAGGER_ORIGINS = {
    first: () => 0,
    center: (count) => (count - 1) / 2,
    last: (count) => count - 1,
  };

  const staggerDistances = (count, from = 'first', grid = null) => {
    if (count < 2) return Array(count).fill(0);
    const [cols, rows] = grid || [count, 1];
    const origin = STAGGER_ORIGINS[from] || STAGGER_ORIGINS.first;
    const ox = grid ? origin(cols) : origin(count);
    const oy = grid ? origin(rows) : 0;
    const raw = Array.from({ length: count }, (_, i) =>
      grid ? Math.hypot((i % cols) - ox, Math.floor(i / cols) - oy) : Math.abs(i - ox));
    const max = Math.max(...raw) || 1;
    return raw.map((d) => d / max);
  };

  const parseRange = (value) => {
    const [from, to] = String(value || '0 1').trim().split(/\s+/).map(Number);
    return [Number.isFinite(from) ? from : 0, Number.isFinite(to) ? to : 1];
  };

  const formatLike = (sample, value) => {
    const decimals = (sample.split('.')[1] || '').replace(/\D/g, '').length;
    const fixed = value.toFixed(decimals);
    const group = (sample.match(/\d([ ,\u00a0\u202f])\d{3}/) || [])[1];
    if (!group) return fixed;
    const [whole, fraction] = fixed.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    return fraction ? `${grouped}.${fraction}` : grouped;
  };

  const countText = (source, e) => {
    const match = source.match(/\d[\d ,.\u00a0\u202f]*\d|\d/);
    if (!match || e >= 1) return source;
    const target = parseFloat(match[0].replace(/[^\d.]/g, ''));
    const index = match.index || 0;
    return source.slice(0, index) + formatLike(match[0], target * e) + source.slice(index + match[0].length);
  };

  const state = {
    running: false, frame: 0, last: 0, y: 0, viewport: 1, maxScroll: 1,
    scenes: [], tracks: [], reveals: [], chapters: [], pins: [], written: new WeakMap(), activeId: '', panel: null,
  };

  const docTop = (el) => {
    if (!(el instanceof HTMLElement)) return el.getBoundingClientRect().top + window.scrollY;
    let top = 0;
    for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
    return top;
  };

  const write = (el, prop, value) => {
    const rounded = typeof value === 'number' ? Math.round(value * 10000) / 10000 : value;
    let cache = state.written.get(el);
    if (!cache) state.written.set(el, (cache = {}));
    if (cache[prop] === rounded) return;
    cache[prop] = rounded;
    el.style.setProperty(prop, String(rounded));
  };

  const trackSource = (el, sceneOf) => {
    const kind = el.dataset.track;
    if (kind === 'page' || kind === 'story') return kind;
    const named = kind && kind.startsWith('#') ? document.getElementById(kind.slice(1)) : null;
    return sceneOf.get(named || el.closest('[data-scene]')) || 'page';
  };

  const staggerChildren = (el) => {
    const children = [...el.children];
    const grid = el.dataset.grid ? el.dataset.grid.trim().split(/\s+/).map(Number) : null;
    const d = staggerDistances(children.length, el.dataset.stagger, grid);
    return children.map((child, i) => ({ el: child, d: d[i] }));
  };

  const applyStaggers = () => {
    document.querySelectorAll('[data-stagger]').forEach((el) =>
      staggerChildren(el).forEach((child) => child.el.style.setProperty('--d', String(Math.round(child.d * 1000) / 1000))));
  };

  const collect = () => {
    state.scenes = [...document.querySelectorAll('[data-scene]')].map((el, index) => ({
      el, index, id: el.id || `scene-${index + 1}`, top: 0, height: 0,
      outer: !el.parentElement.closest('[data-scene]'),
      steps: [...el.querySelectorAll('[data-step]')], stepTops: [], step: -2, p: 0,
    }));
    const sceneOf = new Map(state.scenes.map((scene) => [scene.el, scene]));
    state.tracks = [...document.querySelectorAll('[data-track]')].map((el) => ({
      el, source: trackSource(el, sceneOf), range: parseRange(el.dataset.range),
    }));
    state.reveals = [...document.querySelectorAll('[data-reveal]')].map((el) => ({
      el, kind: el.dataset.reveal, top: 0, held: -Infinity, pin: stickyChain(el)[0] || null, source: el.textContent,
      lines: el.dataset.reveal === 'lines' ? [...el.querySelectorAll('.line')] : [],
      staggered: el.hasAttribute('data-stagger') ? staggerChildren(el) : [],
    }));
    const measured = [...state.reveals.map((r) => r.el), ...state.scenes.flatMap((s) => s.steps)];
    state.pins = [...new Set(measured.flatMap(stickyChain))];
    state.chapters = [...document.querySelectorAll('[data-chapters] a[href^="#"]')].map((link) => ({
      link, id: link.getAttribute('href').slice(1),
    }));
  };

  const stickyChain = (el) => {
    const chain = [];
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      if (getComputedStyle(node).position === 'sticky') chain.push(node);
    }
    return chain;
  };

  /* A stuck element reports where it is stuck, not where it sits in flow.
     Measure with every pin set to relative, which lays out identically to an
     unstuck sticky, then put them back before anything paints. */
  const measureUnstuck = (pins, read) => {
    const saved = pins.map((el) => el.style.position);
    pins.forEach((el) => { el.style.position = 'relative'; });
    read();
    pins.forEach((el, i) => { el.style.position = saved[i]; });
  };

  const measure = () => {
    if (document.documentElement.dataset.story !== 'live') return;
    state.viewport = window.innerHeight || 1;
    state.maxScroll = Math.max(1, document.documentElement.scrollHeight - state.viewport);
    const pinTop = new Map(state.pins.map((el) => [el, parseFloat(getComputedStyle(el).top) || 0]));
    measureUnstuck(state.pins, () => {
      state.scenes.forEach((scene) => {
        scene.top = docTop(scene.el);
        scene.height = scene.el.offsetHeight;
        scene.stepTops = scene.steps.map(docTop);
      });
      state.reveals.forEach((reveal) => {
        reveal.top = docTop(reveal.el);
        reveal.held = reveal.pin
          ? (reveal.top - docTop(reveal.pin) + pinTop.get(reveal.pin)) / state.viewport
          : -Infinity;
      });
    });
    kick();
  };

  const renderScenes = (y, vh) => {
    let story = 0;
    let activeId = '';
    const outer = state.scenes.filter((scene) => scene.outer).length;
    state.scenes.forEach((scene) => {
      scene.p = sceneProgress(scene.top, scene.height, vh, y);
      if (scene.outer) story += scene.p;
      write(scene.el, '--p', scene.p);
      write(scene.el, '--enter', enterProgress(scene.top, vh, y));
      write(scene.el, '--leave', leaveProgress(scene.top, scene.height, vh, y));
      const middle = y + vh * ACTIVE_LINE;
      const where = middle < scene.top ? 'before' : middle >= scene.top + scene.height ? 'after' : 'active';
      if (scene.el.dataset.state !== where) scene.el.dataset.state = where;
      if (where === 'active') activeId = scene.id;
      const step = activeStep(scene.stepTops, y, vh);
      if (step === scene.step) return;
      scene.step = step;
      scene.el.dataset.current = String(step);
      scene.steps.forEach((el, i) => el.classList.toggle('is-active', i === step));
    });
    return { story: outer ? story / outer : 0, activeId };
  };

  const renderTracks = (page, story) => {
    const sources = { page, story };
    state.tracks.forEach((track) => {
      const value = typeof track.source === 'string' ? sources[track.source] : track.source.p;
      write(track.el, '--t', within(value, track.range[0], track.range[1]));
    });
  };

  const renderReveals = (y, vh) => {
    state.reveals.forEach((reveal) => {
      const e = revealProgress(reveal.top, vh, y, 0, reveal.held);
      write(reveal.el, '--e', e);
      reveal.lines.forEach((line, i) =>
        write(line, '--e', revealProgress(reveal.top, vh, y, i * LINE_STAGGER, reveal.held)));
      reveal.staggered.forEach((child) =>
        write(child.el, '--e', revealProgress(reveal.top, vh, y, child.d * STAGGER_SPREAD, reveal.held)));
      if (reveal.kind !== 'count') return;
      const text = countText(reveal.source, e);
      if (reveal.el.textContent !== text) reveal.el.textContent = text;
    });
  };

  const renderChapters = (activeId) => {
    if (activeId === state.activeId) return;
    state.activeId = activeId;
    document.documentElement.dataset.activeScene = activeId;
    state.chapters.forEach(({ link, id }) => {
      if (id === activeId) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  };

  const debugWanted = () =>
    'storyDebug' in document.documentElement.dataset || /[?&#]story-debug\b/.test(window.location.href);

  const openPanel = () => {
    if (state.panel || !debugWanted()) return;
    state.panel = document.createElement('pre');
    state.panel.setAttribute('aria-hidden', 'true');
    state.panel.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;margin:0;padding:8px 10px;'
      + 'font:11px/1.45 ui-monospace,monospace;background:rgb(0 0 0 / 0.78);color:#9ef0b5;pointer-events:none;border-radius:6px';
    document.body.appendChild(state.panel);
  };

  const closePanel = () => {
    if (state.panel) state.panel.remove();
    state.panel = null;
  };

  const renderPanel = (page) => {
    if (!state.panel) return;
    const rows = state.scenes.map((scene) => {
      const mark = scene.el.dataset.state === 'active' ? '>' : ' ';
      const step = scene.steps.length ? ` step ${scene.step}` : '';
      return `${mark} ${scene.id.padEnd(14)} p ${scene.p.toFixed(2)} ${scene.el.dataset.state || ''}${step}`;
    });
    state.panel.textContent = [`page ${page.toFixed(2)}  y ${Math.round(state.y)}`, ...rows].join('\n');
  };

  const render = () => {
    const { y, viewport: vh } = state;
    const page = clamp01(y / state.maxScroll);
    const html = document.documentElement;
    write(html, '--page', page);
    write(html, '--v', clamp01(Math.abs(window.scrollY - y) / vh));
    const { story, activeId } = renderScenes(y, vh);
    renderTracks(page, story);
    renderReveals(y, vh);
    renderChapters(activeId);
    renderPanel(page);
  };

  const tick = (now) => {
    const dt = Math.min(0.05, (now - state.last) / 1000);
    state.last = now;
    const target = window.scrollY;
    state.y = damp(state.y, target, LAMBDA, dt);
    if (Math.abs(target - state.y) < 0.5) state.y = target;
    render();
    if (state.y === target) {
      state.running = false;
      return;
    }
    state.frame = requestAnimationFrame(tick);
  };

  function kick() {
    if (state.running || document.documentElement.dataset.story !== 'live') return;
    state.running = true;
    state.last = performance.now();
    state.frame = requestAnimationFrame(tick);
  }

  const clearWrites = () => {
    const els = [document.documentElement, ...state.scenes.map((s) => s.el), ...state.tracks.map((t) => t.el),
      ...state.reveals.flatMap((r) => [r.el, ...r.lines, ...r.staggered.map((c) => c.el)])];
    els.forEach((el) => ['--page', '--v', '--p', '--enter', '--leave', '--t', '--e'].forEach((p) => el.style.removeProperty(p)));
    state.reveals.filter((r) => r.kind === 'count').forEach((r) => { r.el.textContent = r.source; });
    state.written = new WeakMap();
  };

  const goStatic = (reason) => {
    cancelAnimationFrame(state.frame);
    state.running = false;
    clearWrites();
    closePanel();
    document.documentElement.dataset.story = 'static';
    console.info(`[story] static: ${reason}`);
  };

  const goLive = () => {
    document.documentElement.dataset.story = 'live';
    collect();
    openPanel();
    state.y = window.scrollY;
    measure();
    render();
    console.info(`[story] live: ${state.scenes.length} scenes, ${state.tracks.length} tracks, ${state.reveals.length} reveals`);
  };

  let started = false;
  function start() {
    if (started) return;
    started = true;
    applyStaggers();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) goStatic('prefers-reduced-motion');
    else goLive();
    reduced.addEventListener('change', (event) => (event.matches ? goStatic('prefers-reduced-motion') : goLive()));
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('load', measure);
    window.addEventListener('orientationchange', () => setTimeout(measure, 300));
    if (document.fonts) document.fonts.ready.then(measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  }

  const refresh = () => {
    applyStaggers();
    if (document.documentElement.dataset.story !== 'live') return;
    collect();
    measure();
  };

  return {
    start, refresh,
    clamp01, within, damp, sceneProgress, enterProgress, leaveProgress, revealProgress,
    activeStep, staggerDistances, parseRange, formatLike, countText,
  };
});
