import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Exercise the real navigation hook with deterministic layout and animation clocks.
function navigation({ footerTop = 780, scrollY = 0, reduced = false } = {}) {
  const source = ts.createSourceFile('page-transition.tsx', readFileSync(new URL('./components/page-transition.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const body = source.statements.filter((node) => !ts.isImportDeclaration(node)).map((node) => node.getText(source).replace('export ', '')).join('\n');
  const hooks = [];
  let cursor = 0;
  let pathname = '/about';
  const effects = [];
  const listeners = new Map();
  const documentListeners = new Map();
  class Element { closest() { return this; } }
  class HTMLAnchorElement extends Element {
    constructor(href) { super(); this.href = href; this.target = ''; }
    hasAttribute() { return false; }
  }
  const frames = new Map();
  let frameId = 0;
  let resized;
  const elements = [];
  const window = {
    innerHeight: 1000, scrollY, location: { hash: '', origin: 'https://example.com', href: 'https://example.com/about' },
    matchMedia: () => ({ matches: reduced }),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    scrollTo: () => { window.scrollY = 0; },
  };
  function effect(callback, deps) {
    const index = cursor++;
    const previous = hooks[index];
    if (!previous || deps.some((dep, n) => dep !== previous.deps[n])) {
      effects.push(() => { previous?.cleanup?.(); hooks[index] = { deps, cleanup: callback() }; });
    }
  }
  function element(top = 0) {
    const animations = [];
    const node = {
      top, offsetHeight: top, visualY: 0, style: {}, animations,
      getBoundingClientRect() { return { top: this.top + this.visualY, height: this.offsetHeight }; },
      querySelector: () => ({ paddingTop: '180' }),
      getAnimations: () => animations.filter((a) => a.playState === 'running'),
      animate(keyframes, options) {
        node.visualY = parseFloat(keyframes[0].transform?.match(/translateY\(([-\d.]+)/)?.[1] ?? '0');
        const animation = { keyframes, options, playState: 'running', cancel() { this.playState = 'idle'; node.visualY = 0; this.oncancel?.(); } };
        animations.push(animation);
        return animation;
      },
    };
    elements.push(node);
    return node;
  }
  const page = element();
  const view = element(500);
  const inner = element(500);
  const footer = element(footerTop);
  const sky = element();
  const args = Object.fromEntries(Object.entries({ page, view, inner, footer, sky }).map(([key, value]) => [key, { current: value }]));
  args.getLenis = () => ({ resize() {}, scrollTo() { window.scrollY = 0; } });
  const hook = runInNewContext(ts.transpileModule(`${body}; usePageTransition;`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, {
    usePathname: () => pathname,
    useRef: (value) => { const index = cursor++; return hooks[index] ??= { current: value }; },
    useEffect: effect, useLayoutEffect: effect,
    window, Element, HTMLAnchorElement,
    document: {
      addEventListener: (name, callback) => documentListeners.set(name, callback),
      removeEventListener: (name) => documentListeners.delete(name),
    },
    getComputedStyle: (el) => ({ transform: el.visualY ? `translateY(${el.visualY}px)` : 'none', paddingTop: el.paddingTop }),
    DOMMatrixReadOnly: class { constructor(value) { this.m42 = parseFloat(value.match(/translateY\(([-\d.]+)/)[1]); } },
    ResizeObserver: class { constructor(callback) { resized = callback; } observe() {} disconnect() {} },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    URL,
  });
  const render = () => { cursor = 0; hook(args); effects.splice(0).forEach((run) => run()); };
  render();
  return {
    sky, footer, inner, view, window,
    resize() { resized(); },
    click(path) { documentListeners.get('click')({ button: 0, target: new HTMLAnchorElement(`https://example.com${path}`) }); },
    frame(progress = 0.5) {
      for (const node of elements) {
        for (const animation of node.animations.filter((a) => a.playState === 'running')) {
          const values = animation.keyframes.map((frame) => parseFloat(frame.transform?.match(/translateY\(([-\d.]+)/)?.[1] ?? '0'));
          node.visualY = values[0] + (values[1] - values[0]) * progress;
        }
      }
      const queued = [...frames.values()];
      frames.clear();
      queued.forEach((callback) => callback());
    },
    navigate(next, nextFooterTop) { pathname = next; footer.top = nextFooterTop; render(); },
    pop() { listeners.get('popstate')(); },
  };
}

test('auroras that keep their position stay still while the new content fades in', () => {
  const ui = navigation();
  ui.navigate('/contact', 780);
  assert.equal(ui.sky.animations.length, 0, 'the top aurora must not hop when it does not change position');
  assert.equal(ui.footer.animations.length, 0, 'the footer must not hop when it does not change position');
  assert.equal(ui.inner.animations[0]?.keyframes[0].opacity, 0);
  assert.equal(ui.inner.animations[0]?.keyframes[0].transform, undefined, 'new text must not jump vertically');
});

test('route glide cannot add a scrollbar or change the page width', () => {
  const css = readFileSync(new URL('./style.css', import.meta.url), 'utf8');
  assert.match(css, /\n\.page \{[^}]*overflow: clip/, 'transformed footer must not extend the scrollable page');
  assert.match(css, /\nhtml \{[^}]*scrollbar-gutter: stable/, 'short and long pages must keep the same width');
});

test('footer glides directly from its previous screen position after navigation resets scroll', () => {
  const ui = navigation({ footerTop: 650, scrollY: 500 });
  ui.navigate('/contact', 780);
  assert.equal(ui.footer.animations[0]?.keyframes[0].transform, 'translateY(-130px)');
  assert.equal(ui.window.scrollY, 0);
});

test('back navigation cancels in-flight transitions instead of leaving old transforms running', () => {
  const ui = navigation({ scrollY: 200 });
  ui.navigate('/contact', 780);
  ui.pop();
  ui.navigate('/about', 1200);
  assert.ok(ui.sky.animations.every((animation) => animation.playState !== 'running'));
});

test('reduced motion navigates without animation', () => {
  const ui = navigation({ reduced: true });
  ui.navigate('/contact', 780);
  assert.equal(ui.sky.animations.length, 0);
  assert.equal(ui.footer.animations.length, 0);
});


test('rapid navigation continues the header and footer from their last visible frame', () => {
  const ui = navigation({ footerTop: 650, scrollY: 500 });
  ui.navigate('/contact', 780);
  ui.frame();
  const headerY = ui.sky.visualY;
  const footerTop = ui.footer.getBoundingClientRect().top;
  ui.navigate('/about', 900);
  assert.equal(ui.sky.animations.at(-1).keyframes[0].transform, `translateY(${headerY}px)`);
  assert.equal(ui.footer.animations.at(-1).keyframes[0].transform, `translateY(${footerTop - 900}px)`);
});

test('late content layout rebases the footer before the next frame can record a jump', () => {
  const ui = navigation({ footerTop: 650, scrollY: 500 });
  ui.navigate('/contact', 780);
  ui.frame();
  const previousTop = ui.footer.getBoundingClientRect().top;
  ui.footer.top = 900;
  ui.frame();
  ui.resize();
  assert.equal(ui.footer.animations.at(-1).keyframes[0].transform, `translateY(${previousTop - 900}px)`);
});


test('capture the pre-navigation layout before scroll restoration and streamed content replace it', () => {
  const ui = navigation({ footerTop: 650, scrollY: 500 });
  ui.click('/contact');
  ui.footer.top = 780;
  ui.window.scrollY = 0;
  ui.resize();
  ui.navigate('/contact', 780);
  assert.equal(ui.footer.animations.at(-1).keyframes[0].transform, 'translateY(-130px)');
  assert.equal(ui.sky.animations.at(-1).keyframes[0].transform, 'translateY(-400px)');
});
