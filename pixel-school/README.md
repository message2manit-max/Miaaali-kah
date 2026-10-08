# The 5.5 Family Builds a School

A 3:06 cartoon in a blocky, Minecraft-style 2.5D look. Every critter, block, tree and prop is built from shaded cubes. Opus 5.5 (in glasses and a suit, later the principal) plans a school, Sonnet 5.5 (the chef and master builder) cooks the cement and builds every precision part, and three Haiku 5.5 builders in hard hats finish every job before the sentence ends. On day two they extend it to School V2: two wings, a glass dome, a grand staircase and nine rooms. The cast is only Claude critters (and one bug), drawn after the "Meet the 5.5 family" card.

Motion is continuous: positions, walk cycles, blinks, jumps (with squash and stretch), poses and camera moves are all computed for the exact moment being drawn and rounded to real screen pixels, so the video is smooth at 60 fps. The day runs from morning to golden hour.

Open `index.html` in a browser and press **Play the short**. It is one self-contained file with no build step needed to watch it. Every frame is drawn live on a canvas and the sound effects are synthesized with Web Audio, so there are no image or audio files.

## Story (16 chapters)

Day one:

1. **Meet the crew**: the cast drops in, then ticket #55 lands: BUILD A SCHOOL.
2. **The empty lot**: the Haikus shout "ON IT!!" and zoom off before the plan is finished.
3. **The plan**: three steps on the board. "This meeting could've been an email."
4. **Foundation**: Sonnet tastes the cement ("needs more gravel") and the Haikus pour it in one dash.
5. **Walls**: flying bricks, one of them lands on Opus, and Sonnet places exactly one window, as scoped.
6. **The bug**: a literal bug, a three-Haiku pile-up, and Sonnet's pot lid. "Bug fixed."
7. **Roof and tower**: the Haikus stack into a tower for the roof, and Sonnet tosses up the clock and bell ("precision parts").
8. **Finishing touches**: red door, trees, a playground, the "5.5 ACADEMY" sign and the flag.
9. **Opening day**: the bell rings, the kids arrive, and one asks where the cafeteria is. "...That's v2."
10. **Day one, done**: a team photo.

Day two (V2):

11. **Principal Opus**: the Haikus pin a gold star on Opus, the kids demand more rooms, and ticket #56 lands: SCHOOL V2.
12. **Blueprint v2**: Sonnet claims the complex parts (dome, stairs, arches) and Principal Opus stamps it APPROVED.
13. **The new wings**: blocks fly in from both sides while Sonnet builds a glass dome from the scaffolding, then the arched windows.
14. **The inspection**: the front wall flies off like a dollhouse, and Principal Opus tours the cafeteria, his office, the lobby with Sonnet's staircase, a classroom, the science lab, the music room, the computer lab, the library and the art room.
15. **Grand opening**: at dusk the wall flies back with lit windows, fireworks go up, and someone asks for a pool. "...That's v3."
16. **The end**: the day-two photo.

## Source

`src/` holds the parts. `node tools/build.mjs` assembles them into `index.html`.

| File | What it does |
| --- | --- |
| `core.js` | Device-pixel renderer, smooth camera, the cube primitive, easing and jumps, bitmap fonts |
| `sprites.js` | The cube critters: Opus, Sonnet, the Haikus, baby critters and the bug, with blended poses |
| `world.js` | Sky through the day, voxel hills, the grass-block lawn, block cubes, props and the build schedule |
| `fx.js` | Dust, cube crumbs, confetti, XP orbs, milestone toasts, the fight cloud, bubbles and wipes |
| `audio.js` | All sound effects, synthesized live and rendered offline for the video |
| `school2.js` | V2: the two wings, the glass dome, arches, scaffolding, staircase and the dollhouse cutaway |
| `rooms.js` | The nine rooms behind the front wall, with their furniture |
| `story.js` | Day one: ten scenes, each a pure function of time |
| `story2.js` | Day two (V2): six scenes |
| `timeline.js` | Reading pauses, start times, every sound event, and the frame renderer |
| `player.js` | Playback, controls, chapters and the hooks used for recording |

Every scene is a pure function of time, so any frame can be rendered on demand. That makes seeking instant and the video recording frame-exact.

## Tools

- `node tools/record.mjs --fps 60` renders every frame in headless Chromium, renders the sound offline, and encodes a 1920x1080 MP4 with ffmpeg.
- `node tools/shoot.mjs 12.5 40 --scene walls 3` saves PNG frames for review.
- `node tools/sheet.mjs` draws a close-up model sheet of the characters.

Fan-made and unofficial.
