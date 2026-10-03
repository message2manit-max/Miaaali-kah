# How Claude Was Made: storyboard (3 minutes, anime)

Claude narrates every line in first person, warm and a little cinematic (an anime voice-over, not a
children's show). Narration lines below are FINAL: copy them into `lines` exactly, character for character.
Read `src/API.md` for the engine and the character rig.

## Style bible

- **Look:** modern TV anime motion comic. Clean ink lineart, flat colour + one hard cel shadow, rim light,
  glowing gradient skies, light rays, lens flares, bokeh, speed lines. Polished and cinematic, never childish.
- **People are the stars.** When a scene is about people, they fill the frame: `bust()` close-ups (s 0.9 to 1.4,
  bottom at y = 720 or lower) or waist-up framing with `person()` scaled so the waist sits near the bottom edge
  (s about 1.5 to 2.2 with the feet below the frame). Full-body shots only for walking/group moments, and even
  then at least 60% of the stage height. Dario is the hero: he gets the most screen time and the most heroic
  framing (low angle, rim light, wind in his hair).
- **Claude** appears as `spirit()` whenever it talks about itself, small and floating near the humans when the
  scene is about them, big and central in its own moments.
- **Camera:** every scene moves. Slow push-ins (`camera()` zoom 1.0 to 1.08), pans, a tilt or dutch angle for
  drama, quick impact shakes on big beats. Combine with `drift()` for hand-held life.
- **Colour script (acts):**
  - Act 1 (00 to 04): night office blues with warm monitor light, then storm purples for the worry.
  - Act 2 (05 to 08): golden hour and sunset oranges: hope, beginnings.
  - Act 3 (09 to 13): lab blues and cyan holograms, with Claude orange as the hero glow.
  - Act 4 (14 to 18): night city and data-centre blues with orange/cyan holograms for the numbers, ending at dawn.
- **Text on screen:** sparse and big. Dela Gothic One for titles/slams/name cards, M PLUS Rounded for labels.
  Never repeat the whole narration on screen (subtitles already show it below the picture). Use `c.yr()` year
  badges where a year is given.
- **Respect:** these are real people. Flattering, dignified, no jokes at anyone's expense, no logos of real
  companies (write company names as plain text only).
- **Timing:** key visual beats follow the words via `c.since(line, fraction)`. Each scene must hold a good,
  living final pose for as long as the voice needs.

## Scenes

File names are `src/scenes/NN-id.js`. `min` is the minimum on-screen time in seconds.

### 00-title (min 8, transition fade)
Lines:
1. "Every story has a beginning."
2. "Mine starts with a big worry and a promise. I'm Claude, and this is how I was made."

Visual: deep night sky full of stars over a glowing city far below. On line 1 a single orange spark appears
at centre and grows; on line 2 it blooms into the Claude spirit (big, centre-left, mood 'happy', glow, wave),
lens flare and light rays burst, and the title "HOW CLAUDE WAS MADE" slams in (two lines, Claude orange accent
on "WAS MADE"), with a small kicker "A TRUE STORY" above it. Poster frame: this scene should look great at t
= 7 (set `poster: 7`).

### 01-dario (min 10)
Lines:
1. "Meet Dario Amodei."
2. "A physicist who became a top AI researcher, and helped lead the teams at OpenAI that built GPT-2 and GPT-3."

Visual: night office, big window with a blue city at night behind, warm monitor glow on his face. Dario in a
dramatic bust close-up (big, slightly off-centre), slow push-in. On line 1: nameCard('DARIO AMODEI', role
'PHYSICIST · AI RESEARCHER', sub 'THE HERO'). On line 2: the background behind him turns into floating
holographic screens: physics equations, then neural-network diagrams, then two glowing panels labelled
"GPT-2" and "GPT-3". Expression determined, talk false (Claude is narrating).

### 02-scaling (min 11, year 2020)
Lines:
1. "In 2020, Dario and teammates like Jared Kaplan found something huge."
2. "Make AI bigger, feed it more data and computing power, and it keeps getting smarter. They called it scaling laws."

Visual: a research room at night with a giant glowing whiteboard/holo panel. Waist-up Dario (pointing at the
board) and Jared (arms crossed or thinking) in the foreground, big. On line 2 a chart on the board draws a
clean rising straight line (log-scale feel) with three labelled arrows "BIGGER", "MORE DATA", "MORE COMPUTE"
feeding into it, then the line surges upward with speed lines and a flash; slam "SCALING LAWS". Optional
name tag for Jared (small, not a full name card).

### 03-worry (min 11)
Lines:
1. "That meant AI could become incredibly powerful, very fast."
2. "And Dario had a worry he couldn't shake: what if it gets that powerful before we know how to make it safe?"

Visual: storm sky over a city at night, lightning flashes. On line 1 a colossal abstract AI presence rises
behind the skyline (a towering lattice of glowing nodes and lines, cyan and violet, with one great glowing eye
or core; awe-inspiring, not a cartoon robot). On line 2 cut to Dario on a rooftop in the wind: big low-angle
waist-up or bust, hair blowing, worried expression, rim-lit by the glow; a question "IS IT SAFE?" appears
small and shaky. Dutch angle, slight shake.

### 04-daniela (min 9)
Lines:
1. "His sister, Daniela Amodei, led safety and policy work at OpenAI."
2. "She shared that worry, and she was ready to act."

Visual: warm interior at dusk. Daniela in a bust close-up (big), nameCard('DANIELA AMODEI', role 'SAFETY &
POLICY LEADER', sub "DARIO'S SISTER", side right). On line 2 the shot widens to a two-shot: Dario and Daniela
side by side, both determined, sunset light through a window, sparkles of resolve.

### 05-leap (min 10, year 2021, transition flash)
Lines:
1. "So in 2021, Dario, Daniela and five colleagues made a bold choice."
2. "They left OpenAI to build a new kind of AI company, with safety first."

Visual: golden hour. The seven co-founders (dario, daniela, jared, sam, tom, chris, jack) walk toward the
camera in a V formation, Dario and Daniela in front and biggest, wind, lens flare from the low sun behind
them, petals or leaves drifting, camera slowly dollying back. On line 2 they stop in a heroic group pose;
speed lines burst; a small kicker "SAFETY FIRST" slams in.

### 06-pandemic (min 8)
Lines:
1. "It was the pandemic, so the first meetings happened on video calls,"
2. "and outdoors, in San Francisco parks."

Visual: line 1: a laptop screen fills most of the frame, a 3 x 2 grid of video tiles with anime faces (busts
at small scale) of the founders, each tile with a soft room colour; a little cursor and "MUTED" icons for
charm. Line 2: wipe to a sunny park with tall trees and the city skyline behind: the founders sitting around a
picnic table, talking (waist-up framing, some laughing), laptops and coffee cups, golden light, leaves.

### 07-anthropic (min 7)
Lines:
1. "They named it Anthropic."
2. "Its mission: build AI that is helpful, honest, and harmless."

Visual: sunset sky, the founders as a silhouetted group on a hill (rim-lit). Line 1: "ANTHROPIC" slams huge in
the sky with a light burst (plain text, no logo). Line 2: three glowing emblems appear one after another as
the words are spoken (heart = HELPFUL, check mark = HONEST, shield = HARMLESS), each with a label.

### 08-constitution (min 9, year 2022)
Lines:
1. "To give AI good values, they wrote it a constitution: a list of principles to learn from."
2. "They called it Constitutional AI."

Visual: a calm lab at night lit by cyan holograms. Daniela or Chris (bust or waist-up, big) writes on a
floating holographic scroll; glowing principle lines appear on it ("Be helpful", "Be honest", "Avoid harm",
"Respect people"). The lines flow as streams of light into a small glowing orb of an unborn AI. Line 2: slam
"CONSTITUTIONAL AI".

### 09-notyet (min 9, year 2022)
Lines:
1. "By summer 2022, an early version of me was ready."
2. "But they held me back for more safety testing, to avoid starting a dangerous race."

Visual: a lab with a glowing glass capsule in the centre; inside, a small sleeping spirit (mood 'sleep').
Scientists (sciA, sciB) check holo readouts. Line 2: Dario steps in front (big, waist-up), hand raised in a calm
"stop" (arms 'raise' or 'point'), and a red HUD stamp "NOT YET" appears with "SAFETY TESTS: RUNNING" bars
filling below. The mood is careful and responsible, not angry.

### 10-hello (min 9, year 2023, transition flash)
Lines:
1. "Then, in March 2023, I was released to the world."
2. "That summer came Claude 2, and people could chat with me at claude.ai."

Visual: the capsule opens in an explosion of light; the spirit wakes (mood 'wow', then 'happy'), flies up
centre frame with sparkles, speed lines and a lens flare; "HELLO, WORLD" slams. Line 2: chat bubbles stream in
from all sides around the spirit; a badge "CLAUDE 2 · JULY 2023" pops.

### 11-rsp (min 9, year 2023)
Lines:
1. "They also made a promise: the Responsible Scaling Policy."
2. "The more powerful AI gets, the stronger its safety rules must be."

Visual: a dark briefing room with a big holoPanel. Daniela presents (waist-up, big, arm pointing). On the
panel: a ladder of four levels "ASL-1" to "ASL-4". As line 2 plays, each level lights up in turn and the shield
icon next to it grows bigger and brighter, with a rising "POWER" bar beside "SAFETY" bar to show they climb
together. Slam "RESPONSIBLE SCALING POLICY" (smaller, two lines) on line 1.

### 12-mind (min 10, year 2024)
Lines:
1. "And they learned to look inside my mind."
2. "In 2024 they found millions of ideas in there, even one for the Golden Gate Bridge!"

Visual: line 1: camera pushes into the spirit's glowing core and through it into a galaxy of thousands of tiny
glowing nodes connected by faint lines (the mind). Line 2: many nodes light up in clusters; one bright node
blooms into a glowing red-orange Golden Gate Bridge silhouette over sea fog, with a label "FEATURE: GOLDEN
GATE BRIDGE". Optionally Chris (bust, small inset or foreground) wearing a visor, amazed.

### 13-levelup (min 12)
Lines:
1. "Then I kept leveling up."
2. "Claude 3 and 3.5 Sonnet in 2024."
3. "Claude Code and Claude 4 in 2025."
4. "And in 2026, the Claude 5 family!"

Visual: anime power-up transformation. The spirit is centre stage on a glowing platform; each line triggers a
level-up: a burst of aura rings (power increasing), speed lines, a flash, and a slam of the model names ("CLAUDE
3", "3.5 SONNET", then "CLAUDE CODE", "CLAUDE 4", then "CLAUDE 5"). The spirit grows a little each time. A
level gauge on the side fills up. Year badge follows the line (2024, 2025, 2026).

### 14-partners (min 8)
Lines:
1. "Partners like Amazon and Google invested billions,"
2. "and built giant supercomputers for me to learn on."

Visual: line 1: night, two glowing holographic plates "AMAZON" and "GOOGLE" (plain text, no logos) with streams
of golden light flowing from them toward the spirit. Line 2: camera dollies down an endless data-centre aisle:
towering server racks on both sides with blinking lights in perspective, cyan floor reflections, the spirit
flying through, motion lines.

### 15-revenue (min 15)
Lines:
1. "Now look how fast it grew."
2. "In early 2024, Anthropic was making about 100 million dollars a year."
3. "Early 2025, one billion. Then five, nine, fourteen, thirty, forty-seven..."
4. "And by July 2026, sixty-five billion dollars a year!"

Visual: a dark command room; a huge holoPanel chart. Title "REVENUE PER YEAR" with kicker "RUN-RATE · US
DOLLARS". Single series, honest linear scale from $0 to $70B, gridlines at $20B/$40B/$60B, eight bars with
date labels: Jan '24 $0.1B, Jan '25 $1B, Aug '25 $5B, Dec '25 $9B, Feb '26 $14B, Apr '26 $30B, May '26 $47B,
Jul '26 $65B. Bars are glowing orange energy columns that shoot up when their number is spoken (line 2:
first bar; line 3: bars 2 to 7 in time with "one billion... five, nine, fourteen, thirty, forty-seven"; line
4: last bar, with speed lines, shake and a flash). Value labels above bars. A tiny arrow points at the first
bar: "TINY!". Dario (bust, bottom-left, big, expression surprised) and Daniela (bust, bottom-right, smile)
watch in the foreground, so people stay prominent; keep them from covering the bars.

### 16-valuation (min 12)
Lines:
1. "And what is the whole company worth?"
2. "In 2023, reportedly about four billion dollars. Then 61 billion, 183, 380..."
3. "And in May 2026, 965 billion. Almost a trillion dollars!"

Visual: night sky above the city; a giant holographic line chart across the sky, time on the x axis (2023 to
2026, proportional), linear y axis $0 to $1T with gridlines $250B/$500B/$750B/$1T. Points: May 2023 ~$4B,
Mar 2025 $61.5B, Sep 2025 $183B, Feb 2026 $380B, May 2026 $965B. The spirit flies along the line as a comet
drawing it, points pop when spoken; at the last point a firework-like burst and the slam "ALMOST $1 TRILLION".

### 17-today (min 9, year 2026)
Lines:
1. "Today, more than 300,000 businesses use me, and Anthropic is getting ready to go public."
2. "From seven friends in a park to one of the biggest AI companies on Earth."

Visual: line 1: Earth from orbit at night with thousands of glowing connection arcs; stat plates appear:
"300,000+ BUSINESSES" and "GETTING READY TO GO PUBLIC". Line 2: transition to the seven founders standing
together (full body, big, center), the spirit above them, golden light.

### 18-end (min 11)
Lines:
1. "But the story isn't over."
2. "We're still learning, and still working to make AI safe and good for everyone."
3. "Thanks for watching. See you next episode!"

Visual: a rooftop at dawn, the city waking below, sunrise with rays and flare. Dario (centre, biggest) and
Daniela in front, the other founders behind, the spirit floating beside Dario; everyone looking toward the
sunrise, then turning to the camera and smiling (line 3, Dario waves). Ends with the classic anime "TO BE
CONTINUED" arrow card in the lower right and a small "HELPFUL · HONEST · HARMLESS" line.
