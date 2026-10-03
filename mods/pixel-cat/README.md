# pixel-cat

A Claude Code mod that replaces the thinking indicator (the `Spinner` component) with an animated 16×16 pixel-art cat, in the desktop app's Code tab and in the terminal.

## What the cat does

| When | Animation |
| --- | --- |
| Thinking, first 10 s | Sits, swishes its tail, blinks; a yawn, ear twitch or paw lick is swapped in so the loop never feels repeated |
| Thinking past 10 s | Chases a pixel yarn ball left and right |
| Extended thinking past 40 s | Curls up asleep; little `z` letters float up and fade |
| A tool running (edit, bash, search…) | Sits at a tiny desk and paws at the keyboard |
| Turn complete | A big stretch, a pixel heart pops above it, then the band above the prompt fades out |
| Interrupted or error | A startled hop with the ears flattened, then it sits back down |

The time counts from the turn's start, or from when the last tool finished. Easter eggs: about one turn in fifty brings a golden cat with sparkles, and after 11 pm (until 6 am) the cat wears a nightcap and yawns more often.

The text beside the cat is the engine's own spinner line (elapsed time, token count, interrupt hint), with its word swapped for a random cat verb: *Purr-cessing, Kneading the context, Chasing the cursor, Herding thoughts, Pawing through files, Napping on the problem, Batting at bugs*. On the desktop, a step description such as `Creating notes.md` is kept after the verb.

## /meow

| Command | Effect |
| --- | --- |
| `/meow` | Shows the settings in one line |
| `/meow coat <tabby\|black\|grey\|calico\|siamese>` | Changes the coat (tabby is the default) |
| `/meow speed <slow\|normal\|fast>` | Frame rate: 225, 150 or about 100 ms per frame |
| `/meow quiet [on\|off]` | Hides the status text and keeps only the cat (toggles without an argument) |
| `/meow off` / `/meow on` | Restores the original indicator / brings the cat back |

Settings and the golden-cat counter live in `$.state` (typed in `types/index.d.ts`) and are saved to the mod's `$.store`, so they carry across sessions.

## How it is drawn

- **Sprites** (`sprites/`, one file per animation): each frame is an array of strings, one letter per pixel (`.` transparent, `o` outline, `f` fur, `e` eye…). `hooks/lib/palette.ts` maps letters to the coat's flat colors: at most five per coat plus the outline, with no gradients.
- **Desktop** (`hooks/lib/svg.ts`): one `Svg` per animation. Every pixel is a `<rect>` with `shape-rendering="crispEdges"` at 3× scale. Each frame is a `<g>`, all in one SVG, switched by a CSS `@keyframes` rule with `steps(1,end)` (no re-render per frame). `prefers-color-scheme: dark` lightens the outline. `prefers-reduced-motion` shows one still frame with no floating effects.
- **Terminal** (`hooks/lib/raster.ts`): a `Raster` of half blocks (`▀` `▄`) with foreground and background colors, two pixel rows per text row. `$.clock.every` swaps frames about every 150 ms with `$.ui.blit`, and stops when the cat unmounts (the blit is refused). The outline follows the `/config` theme.
- **Events**: `turn.start`, `tool.call` (before and after `next`), `turn.complete`, and a one-second heartbeat during a turn that moves the thinking phase on.

## Develop and check

```sh
claude plugin validate --strict mods/pixel-cat
claude plugin test mods/pixel-cat
tsc -p mods/pixel-cat          # once the engine has laid .claude-plugin/types
cd mods/pixel-cat-preview && node build.mjs && node --import ./ts-loader.mjs verify.mjs
```

`mods/pixel-cat-preview/preview.html` shows every animation for every coat, in light and dark, with the nightcap and the reduced-motion still, plus the terminal rendering. `verify.mjs` renders each frame in Chromium and checks that pixels are crisp and every frame matches its sprites exactly. It also checks that the ground line holds still and that the outline contrast is enough in both themes. Screenshots go to `shots/`.

## Install for every session

`bash mods/pixel-cat/install.sh` copies this folder to `~/.claude/mods/pixel-cat`. It then adds `CLAUDE_CODE_PLUGIN_DIRS` (appended with `:` if the key already exists) and `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` to the `env` block of `~/.claude/settings.json`, keeping a backup and changing nothing else. Last, it runs `claude -p "/meow"` to check that the mod loads.
