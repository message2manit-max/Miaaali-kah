# Pixel Cat

A Claude Code mod that swaps the terminal's "thinking" spinner for a blocky,
Minecraft-style ginger cat on a strip of grass. While Claude works she loops
through a little routine: prowls in, sits and blinks, licks her paw, stretches,
stalks and pounces on a butterfly (and misses), naps with floating Zzz, wakes
up with a "!", and wanders off. The caption under her says what she is doing,
what Claude is doing (thinking, using tools, writing) and how long it has been.

![The pixel cat](preview.svg)

Where she shows up:

- **Terminal:** in place of the spinner, drawn in half-block pixels and
  repainted 10 times a second. About 9 rows tall, up to 72 columns wide.
- **Desktop app and web Code tab:** in the spinner row, as an animated SVG.
- **Phone app and VS Code:** these have no spinner a mod can change, so she
  gets a small "Pixel Cat" pane that opens when you send a message and closes
  when Claude finishes.

## Use it

```sh
claude --plugin-dir /path/to/Miaaali-kah/mods/pixel-cat
```

## Check it

```sh
claude plugin validate mods/pixel-cat
claude plugin test mods/pixel-cat
```

`hooks/cat.ts` holds the sprites and the routine, `hooks/svg.ts` bakes the routine into one
looping SVG for the apps, and `hooks/register.tsx` hooks the spinner and the pane.
