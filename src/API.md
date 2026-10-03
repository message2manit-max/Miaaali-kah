# Anime story engine: author's guide

The film is one HTML page that draws every frame live on a `<canvas>`. No images, no video, no libraries.
`tools/build.mjs` concatenates these files, in order, into ONE function scope (so every top-level
function/var below is visible to every later file):

1. `src/kit.js`: rendering kit (this guide)
2. `src/characters.js`: anime character rig: `person()`, `bust()`, `spirit()`, `CAST`
3. `src/scenes/*.js`: one file per chapter, sorted by filename, each calling `defineScene({...})`
4. `src/player.js`: timeline, narration sync, transitions, controls

Plain ES5-style JavaScript (`var`, `function`), no modules, no `import`, no TypeScript. Never use
`Math.random()` inside a draw (frames must be reproducible); use `hash(a, b)` for 0..1 pseudo-randomness.

## Stage

- Logical stage: `W = 1280`, `H = 720`. Always draw in these coordinates; the renderer scales to the screen.
- `ctx` is the current 2D context. `NOW` is wall-clock seconds (idle motion while paused).
- **Alpha rule:** never assign `ctx.globalAlpha = x`. Multiply (`ctx.globalAlpha *= x` inside save/restore) or use
  `fade(a, fn)`. The renderer cross-fades scenes through globalAlpha.
- Always balance `ctx.save()` / `ctx.restore()`. Reset any `globalCompositeOperation` you change.

## Visual style (the bar every file must meet)

Modern TV anime, motion-comic style: clean dark-indigo ink outlines (`P.ink`), flat colour with ONE hard-edged
cel shadow tone, bright rim light on edges facing the light, glowing gradient skies, lens flares, light rays,
speed lines, dramatic camera moves and close-ups. Characters are BIG and prominent: frame people waist-up or
in close-up most of the time; full-body figures should still be at least 60% of the stage height. Not chibi,
not childish, not crayon. Warm, hopeful, cinematic.

## Math and timing helpers

| function | what it does |
|---|---|
| `clamp(v, a=0, b=1)` | clamp |
| `seg(t, start, dur)` | 0..1 progress of t through [start, start+dur]; safe with Infinity/NaN (returns 0) |
| `lerp(a, b, u)`, `mix(hexA, hexB, u)`, `rgba(hex, a)` | interpolation and colours |
| `eo(x)` ease-out, `ei(x)` ease-in, `eio(x)` ease-in-out, `back(x)` overshoot pop, `elastic(x)` | easings (input clamped) |
| `pulse(t, speed)` | 0..1 sine pulse |
| `hash(a, b)` | deterministic 0..1 |

## Transforms and camera

- `at(x, y, scale, rot, fn, flip)`: draw `fn` in a local frame at (x, y). `flip=true` mirrors horizontally.
- `fade(a, fn)`: draw with extra alpha.
- `camera(x, y, zoom, rot, fn)`: puts logical point (x, y) at screen centre, zoomed. Wrap a scene's world in it
  for push-ins, pans and dutch angles; draw HUD elements (titles, badges) outside it.
- `shake(t, k)` returns [dx, dy] impact shake (k 0..1). `drift(t, amt)` returns a slow hand-held drift [dx, dy].

## Shapes and cel shading

- `poly(pts)`, `smooth(pts, closed, tension)` (Catmull-Rom), `rrect(x, y, w, h, r)`: path builders (no beginPath).
- `fillWith(build, style)`, `inkWith(build, width, colour)`.
- `cel(build, base, { shade, shadeBuild, light, lightBuild, line, ink })`: base fill, hard shade shape clipped
  inside, optional highlight shape, then ink outline (`line` width, 0 = none).
- `lin(x0, y0, x1, y1, [[stop, colour]...])`, `rad(x, y, r0, r1, stops)`: gradients.

## Backgrounds and atmosphere

- `sky(name | [c0, c1, c2, c3], horizonY)`: name in `SKIES`: dawn, sunset, golden, day, night, storm, lab, space.
  `skyBlend(a, b, u, horizonY)` blends two.
- `stars(seed, n, t, [x, y, w, h])`, `sun(x, y, r)`, `moon(x, y, r)`.
- `cloud(x, y, s, { base, shade, shade2, rim, seed, puffs })`, `cloudRow(y, seed, t, tone, scale, count)`:
  tone: sunset, day, golden, night, storm, dawn. Clouds drift with t.
- `city(groundY, { color, lit, seed, height, bw, density, rim })`: skyline silhouettes; `lit` = window colour.
  Layer 2 to 3 calls (far = lighter/bluer, near = darker with lit windows) for depth.
- `ground(y, top, bottom)`.
- `rays(x, y, n, len, spread, colour, alpha, t, dir)`: god rays. `glow(x, y, r, colour, a)`,
  `bloom(...)` (additive glow).
- `bokeh(seed, n, t, { colors, area, size, speed, a })`, `petals(seed, n, t, { color, wind })`.
- `speedLines(cx, cy, t, { n, inner, color, a, width })`: manga focus lines. `motionLines(t, { angle, n, color, a })`.
- `sparkle(x, y, r, colour, rot, a)`, `sparkles(seed, n, t, area, colour)`, `lensFlare(x, y, k, angle)`.
- `vignette(k, colour)`, `letterbox(k)` (cinema bars), `flash(k, colour)`, `tint(colour, a)`.

## Text and UI overlays

Fonts: `FONT_D` = Dela Gothic One (bold display, titles), `FONT_R` = M PLUS Rounded 1c (500 and 800).

- `txt(str, x, y, size, { font: 'd'|'r', weight, color, stroke, sw, align, base, ls, shadow, glowColor })`
- `txtWidth(str, size, o)`, `typeOn(str, x, y, size, k, o)` (typewriter, k 0..1)
- `slam(str, x, y, size, k, o)`: impact title that scales in and lands (k 0..1 over ~0.5 s).
- `nameCard(name, k, { role, sub, side: 'left'|'right', y, color, size })`: anime character-intro card sliding in.
  Keep k at 1 to hold it.
- `yearBadge(str, k)`: time-skip badge, top-right. Scenes usually call `c.yr('2021')` instead (auto pop-in).
- `speech(x, y, w, h, tailX, tailY, str, size, k, o)`: speech bubble.
- `holoPanel(x, y, w, h, k, { color, fill })`: translucent sci-fi panel (charts, data, diagrams).

## Characters (src/characters.js)

- `person(who, x, y, s, o)`: full figure. (x, y) = ground point between the feet. At s = 1 the figure is about
  420 px tall (head top to feet).
- `bust(who, x, y, s, o)`: head-and-shoulders close-up. (x, y) = bottom centre of the shoulders (put it at
  y = 720 or below so the frame crops the body). At s = 1 the head is about 250 px tall.
- `spirit(x, y, s, o)`: Claude, the glowing orange spark spirit. (x, y) = centre. At s = 1 it is about 160 px
  across including rays.
- `who`: a key of `CAST` (dario, daniela, jared, sam, tom, chris, jack, ben, sciA, sciB) or a spec object.
- Pose/expression options `o` (all optional): `t` (seconds, drives blink/breath/hair sway: always pass c.t),
  `expr` ('smile' | 'grin' | 'determined' | 'worried' | 'surprised' | 'thinking' | 'sad' | 'calm'),
  `talk` (true = animated talking mouth), `look` ([-1..1, -1..1] gaze), `arms` ('down' | 'wave' | 'point' |
  'crossed' | 'fist' | 'hips' | 'raise' | 'hold' | 'type' | 'chin'), `walk` (phase in radians or null), `wind`
  (0..1 hair/clothes sway), `flip` (face left), `turn` (-1..1 body/head turn), `rim` (rim-light colour),
  `light` (0..1 how strongly the rim light shows), `alpha`.
- Spirit options: `t`, `mood` ('happy' | 'wow' | 'sleep' | 'determined' | 'talk' | 'proud'), `glow` (0..1),
  `power` (0..1 power-up aura), `look`, `wave`.

## Scenes (src/scenes/NN-id.js)

```js
defineScene({
  id: 'dario-intro',          // unique, kebab-case
  title: 'Meet Dario',        // chapter name in the UI
  alt: 'One-sentence description of what the scene shows, for screen readers.',
  min: 9,                     // minimum seconds on screen
  transition: 'fade',         // 'fade' (default) | 'flash' | 'wipe': how this scene enters
  lines: ['Narration line one.', 'Line two.'],   // what Claude says; each line is spoken then shown as a subtitle
  draw: function (c) { ... }
});
```

`c` gives timing that stays in sync with the narrator's real voice speed:

- `c.t`: seconds since the scene started.
- `c.since(i, f)`: seconds since line i reached fraction f (0..1) of its estimated duration. Negative (or
  -Infinity) before that moment. Use it for every story beat: `seg(c.since(1, 0.4), 0, 0.6)` = a 0.6 s
  animation that starts when the narrator is 40% through line 1.
- `c.when(i, f)`: scene time of that moment (Infinity if not reached yet).
- `c.lineK(i)`: 0..1 progress through line i.
- `c.yr('2023')`: draws the time-skip year badge (call every frame; it pops in when the value changes).

A scene must paint the WHOLE frame every time (start with a sky/background fill). It must look complete and
good at ANY time t, including t = 0.3 (first frame after the cross-fade) and long after the last line ends (a
slow voice can hold the scene for twice the estimate), so every animation must settle into a resting pose and
idle motion should keep going. Keep text inside the safe area (40 px from the edges) and away from the
top-right year badge (x > 1000, y < 120) when the scene uses `c.yr`.

## Checking your work

- `node tools/shoot.mjs --label <you> --ids <scene-id>[,...] --at 0.15,0.5,1` renders frames to
  `.shots/<you>/` (fractions of the scene's simulated length). Add `--t 1.2,3` for absolute times.
  Use `--only 05,06` to build only some scene files (faster) — ids still select frames.
- `node tools/sheet.mjs --chars src/characters.js --test my-test.js --t 0,1.5 --out .shots/<you>/name`
  renders a free-form test where `my-test.js` defines `function sheet(t) { ... }`.
- Open the PNGs with the Read tool and look at them critically. Fix overlaps, clipped text, empty areas,
  off-model characters, and anything that looks childish or unfinished.
