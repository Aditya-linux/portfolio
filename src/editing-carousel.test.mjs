import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

test('buttons and keyboard navigate the five-video row with Embla', () => {
  const source = ts.createSourceFile('App.tsx', readFileSync(new URL('./components/editing-showcase.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'EditingCarousel');
  const clips = source.statements.find((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => declaration.name.getText(source) === 'editingClips'));
  const navigation = [];
  const carousel = {
    scrollPrev: () => navigation.push('previous'), scrollNext: () => navigation.push('next'),
  };
  const carouselRef = () => {};
  const HoverClip = () => null;
  const ClipPoster = () => null;
  const rendered = runInNewContext(ts.transpileModule(`${clips.getText(source)} ${component.getText(source).replace('export ', '')}; EditingCarousel();`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useState: (value) => [value, () => {}],
    useEmblaCarousel: (options) => {
      assert.equal(options.startIndex, 0);
      assert.equal(options.loop, false);
      return [carouselRef, carousel];
    },
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat() } }) },
    HoverClip,
    ClipPoster,
    VolumeSlider: () => null,
    VolumeIcon: () => null,
  });
  assert.equal(rendered.props.children[0], false, 'no volume control without playable clips');
  const { props } = rendered.props.children[1];
  assert.equal(props.ref, carouselRef);
  const slides = props.children[0].props.children;
  assert.equal(slides.length, 5);
  const stages = slides.map((slide) => slide.props.children[0].props.children[0].props.children[0].props.children[0]);
  assert.ok(stages.every((stage) => stage.type === ClipPoster), 'clips without a video file show a static poster');
  const captions = Array.from(slides, (slide) => slide.props.children[0].props.children[1].props.children[0]);
  const titles = captions.map((caption) => typeof caption === 'string' ? caption : caption.props.children[0]);
  assert.deepEqual(titles, ['Moment of Inertia', 'Fatty liver', 'Dal Lake', 'Commerce & government', 'Microwave Edit']);
  const instagramLink = captions[1];
  assert.equal(instagramLink.type, 'a');
  assert.equal(instagramLink.props.href, 'https://www.instagram.com/reel/DNrzNoj0Gc1/');
  assert.equal(instagramLink.props.target, '_blank');
  assert.equal(instagramLink.props.rel, 'noopener noreferrer');
  assert.equal(instagramLink.props['aria-label'], 'Watch Fatty liver on Instagram (opens in a new tab)');
  const root = {};
  const event = { currentTarget: root, target: root, preventDefault: () => {} };
  props.onKeyDown({ ...event, key: 'ArrowLeft' });
  props.onKeyDown({ ...event, key: 'ArrowRight' });
  props.onKeyDown({ ...event, target: {}, key: 'ArrowRight' });
  const buttons = rendered.props.children[2].props.children;
  buttons[0].props.onClick();
  buttons[1].props.onClick();
  assert.deepEqual(navigation, ['previous', 'next', 'previous', 'next']);
});
test('the phone uses a tap surface for playback and applies slider volume through audio gain', async () => {
  const source = ts.createSourceFile('App.tsx', readFileSync(new URL('./components/editing-showcase.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const component = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'HoverClip');
  const refs = [];
  const effects = [];
  const gain = { gain: { value: 1 }, connect: () => {} };
  let resumed = false;
  const render = runInNewContext(ts.transpileModule(`${component.getText(source)}; HoverClip;`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    useRef: (current) => { const ref = { current }; refs.push(ref); return ref; },
    useState: (value) => [value, () => {}],
    useEffect: (effect) => effects.push(effect),
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
    Image: () => null,
    AudioContext: class {
      destination = {};
      createGain() { return gain; }
      createMediaElementSource(player) { assert.equal(player, refs[0].current); return { connect: () => gain }; }
      resume() { resumed = true; return Promise.resolve(); }
      close() { return Promise.resolve(); }
    },
  });
  const rendered = render({ src: 'clip.mp4', poster: 'poster.jpg', title: 'Clip', volume: 25 });
  const player = {
    paused: true, volume: 1, muted: false,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
  };
  refs[0].current = player;
  const video = rendered.props.children[0];
  const button = rendered.props.children[2];
  assert.equal(video.props.controls, undefined);
  assert.equal(button.type, 'div');
  assert.equal(button.props.role, 'button');
  assert.equal(button.props.tabIndex, 0);
  assert.equal(button.props['aria-label'], 'Play Clip');
  effects[1]();
  assert.equal(player.volume, 0.25);
  button.props.onPointerEnter({ pointerType: 'touch' });
  assert.equal(player.paused, true);
  button.props.onPointerEnter({ pointerType: 'mouse' });
  assert.equal(player.paused, false, 'hover must start playback before any click');
  assert.equal(player.muted, false, 'hover must request audible playback');
  button.props.onPointerLeave({ pointerType: 'mouse' });
  button.props.onClick();
  assert.equal(player.paused, false);
  assert.equal(player.muted, false, 'clicking a muted preview must enable audio without pausing');
  assert.equal(player.volume, 1);
  assert.equal(gain.gain.value, 0.25);
  assert.ok(resumed);
  button.props.onPointerLeave({ pointerType: 'touch' });
  assert.equal(player.paused, false);
  button.props.onClick();
  assert.equal(player.paused, true);
  button.props.onPointerEnter({ pointerType: 'mouse' });
  assert.equal(player.paused, false);
  button.props.onPointerLeave({ pointerType: 'mouse' });
  assert.equal(player.paused, true);
  effects[1]();
  assert.equal(player.volume, 1, 'the volume effect must use gain after the graph is connected');
  button.props.onKeyDown({ key: 'Enter', preventDefault: () => {} });
  assert.equal(player.paused, false);
  button.props.onKeyDown({ key: ' ', preventDefault: () => {} });
  assert.equal(player.paused, true);
  let siblingPaused = false;
  player.closest = () => ({ querySelectorAll: () => [player, { pause: () => { siblingPaused = true; } }] });
  video.props.onPlay({ currentTarget: player });
  assert.ok(siblingPaused, 'playing a visible phone must pause the other clips');
  let attempts = 0;
  player.play = () => {
    if (++attempts === 1) return Promise.reject(new Error('Audio autoplay blocked'));
    player.paused = false;
    return Promise.resolve();
  };
  button.props.onPointerEnter({ pointerType: 'mouse' });
  await Promise.resolve();
  assert.equal(attempts, 2, 'blocked audio must fall back to a muted preview');
  assert.equal(player.muted, true);
  button.props.onClick();
  assert.equal(player.muted, false, 'clicking the fallback preview must enable audio');
});

test('the volume control is a native range that reports numeric volume', () => {
  const source = ts.createSourceFile('editing-showcase.tsx', readFileSync(new URL('./components/editing-showcase.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const slider = source.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'VolumeSlider');
  const values = [];
  const render = runInNewContext(ts.transpileModule(`${slider.getText(source).replace('export ', '')}; VolumeSlider;`, {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    VolumeIcon: () => null,
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) },
  });
  const input = render({ value: 50, onChange: (value) => values.push(value) }).props.children[1];
  assert.equal(input.type, 'input');
  assert.equal(input.props.type, 'range');
  assert.equal(input.props.min, 0);
  assert.equal(input.props.max, 100);
  assert.equal(input.props.value, 50);
  assert.equal(input.props['aria-label'], 'Volume');
  input.props.onChange({ currentTarget: { value: '25' } });
  input.props.onChange({ currentTarget: { value: '0' } });
  assert.deepEqual(values, [25, 0]);
});

