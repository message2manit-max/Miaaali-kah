# Pixel Cat

A Claude Code mod that swaps the terminal's "thinking" spinner for a blocky,
Minecraft-style ginger cat on a strip of grass. While Claude works she loops
through a little routine: prowls in, sits and blinks, licks her paw, stretches,
stalks and pounces on a butterfly (and misses), naps with floating Zzz, wakes
up with a "!", and wanders off. The caption under her says what she is doing,
what Claude is doing (thinking, using tools, writing) and how long it has been.

- Terminal only. Other surfaces keep their usual spinner.
- About 9 rows tall, up to 72 columns wide; it shrinks to fit narrow terminals.
- Drawn in half-block pixels, repainted 10 times a second.

## Use it

```sh
claude --plugin-dir /path/to/Miaaali-kah/mods/pixel-cat
```

## Check it

```sh
claude plugin validate mods/pixel-cat
claude plugin test mods/pixel-cat
```

`hooks/cat.ts` holds the sprites and the routine, `hooks/register.tsx` hooks the spinner.
