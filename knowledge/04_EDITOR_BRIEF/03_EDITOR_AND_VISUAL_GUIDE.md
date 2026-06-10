---
title: "Editor and Visual Guide"
file: "03_EDITOR_AND_VISUAL_GUIDE.md"
role: canonical
canonical: true
version: "v2.5"
related: ["../00_SHARED_KB/LANGUAGE_AND_VOICE.md", "04_THUMBNAIL_DESIGN_SOP.md", "../00_SHARED_KB/FORMAT_LANES.md", "../00_SHARED_KB/VIRAL_SOCIAL_COMMENTARY.md", "../02_SCRIPT_CREATION/04_SCRIPT_DRAFTING_GUIDE.md"]
summary: "Canonical editing rules, post-recording delivery audit, audio mastering targets, captions, B-roll, graphics, and the mandatory quiet beat."
keywords: ["editing", "visual", "delivery audit", "audio mastering", "LUFS", "captions", "B-roll", "graphics", "quiet beat", "pacing"]
---

# Editor and Visual Guide

Canonical source for editing, delivery audit, caption style, audio, B-roll, graphics, and visual pacing.

## Aesthetic Target

Visual restraint, scaled for Shorts and Reels. Clean, considered, identity-first. Cuts only when a new beat lands. Captions selectively highlighted, not on every cut. One visual element at a time. Not documentary slow; not hype-channel loud.

This means:
- Clean, considered, alive
- The content does the work, but the edit keeps the curiosity ladder visible
- Editing supports rather than competes
- Premium feel through precise choices, not muted pacing or added noise

## Delivery Audit (Post-Recording)

Run this audit on every recording before locking the edit. It tests the host's delivery against the channel's identity-bearing close — not the script's structure.

**Signature mannerism — prosodic close:**

- **Half-second pause before the payoff line.** A clear beat of silence between the Reveal/Mechanism (Beat 4) end and the Payoff (Beat 6) opener. The pause says "land this."
- **Slight pitch drop on the payoff line.** Not a raised "this is the big finish" intonation — a settled, declarative intonation. The line lands because the voice trusts it.
- **No catchphrase, no recurring hand gesture, no recurring filler word** ("you know," "right," "matlab"). Identity comes from prosody, not from a verbal tic.

**How to audit:**

- Play the recording with **eyes closed**. Was there a clear beat of silence before the payoff? If no, mark as a delivery miss — re-record the close or edit the audio for a pause.
- Listen specifically for raised pitch on the payoff line ("isn't that crazy?!" energy). If present, mark as hype-channel drift and re-record.
- Listen for any phrase that repeats across 3+ Shorts as a verbal tic. If found, flag for next recording session — strip it before it becomes a signature.

**This anchor applies only after the host has recorded.** Writers and script auditors cannot test this from text. The provisional anchor description lives in `../00_SHARED_KB/LANGUAGE_AND_VOICE.md` § Provisional Anchors, but the actual test belongs here.

## Pacing

- Deliberate, not frantic
- Visual changes happen because the content shifts, not to fight attention loss
- Trust the writing
- Aim for 10–14 meaningful visual beats per 90–120 second Anchor script
- Every meaningful hook contrast, assumption reversal, key number, mechanism turn, and payoff should have visible support. Adjacent lines may share one visual idea; cuts follow story beats, not line count.
- Avoid dead zones longer than 8–10 seconds with no visual change, except the mandatory quiet beat or solemn topics where stillness is intentional
- Hold on the host's face during key reveals

## Visual Curiosity Ladder

The edit should mirror the script's retention structure. Do not wait for the payoff to become visually interesting.

For each script, identify:

1. **Hook stack visual:** first 0–5 seconds; one clean visual idea that makes the assumption reversal instantly legible.
2. **Setup anchor:** the first concrete name, number, place, object, or source.
3. **Mechanism turns:** each "wait, what?" turn gets a new visual beat.
4. **Payoff lock:** the repeatable line gets a pause or impact-text moment.
5. **Identity close:** solemn or emotional close gets a cleaner frame, not a louder effect.

Use restraint inside each beat, but do not let the full Short feel static. Premium does not mean visually sleepy.

## Music

- One continuous lo-fi or ambient track per video
- Set at -22dB throughout (or -25dB during the quiet beat)
- No musical swells at reveals
- No genre changes mid-video
- Music should be felt, not consciously heard
- For serious topics, reduce to near-silence or single sustained note
- Sources: YouTube Audio Library, Pixabay Music, Epidemic Sound

## Audio Mastering Specifics

The host's voice is the most important audio element.

### Voice EQ

- High-pass filter at 80Hz to remove room rumble
- Slight cut around 200-300Hz if voice sounds muddy
- Slight boost around 3-5kHz for clarity (no more than +2dB)
- Slight cut around 5-7kHz to reduce harshness
- De-esser to control sibilance (around 5-7kHz, light threshold)

### Noise Reduction

- Spectral noise reduction if background noise is consistent
- Apply gently — over-reduction creates underwater voice quality
- Target: -55dB to -60dB noise floor between sentences

### Compression

- 3:1 ratio compression on voice
- Threshold to catch louder phrases without squashing dynamics
- Make-up gain to bring average level up to -16 to -14 LUFS

### Target Loudness

- Final master target: -14 LUFS integrated
- Peak should not exceed -1 dBFS
- The mandatory quiet beat: voice at normal level, music drops to -25dB

### What to Avoid

- Heavy compression that flattens vocal dynamics
- Excessive de-essing that removes natural sibilance entirely
- Pitch correction
- Reverb on the voice
- Vocal stacking or doubling effects

## On-Screen Text

**Two text types only:**

1. **Custom impact text** (Poppins ExtraBold 90-200pt) for hook moments, big numbers, payoff lines, and mental-model/framework reveals when shown. Maximum 2-3 uses per video.

2. **Auto-captions** (Inter Bold 65pt, white with 2pt black stroke, position 65% from top) for spoken content. Highlight 3-5 keywords per video in mustard.

**Banned text styles:**
- Multiple competing fonts
- Rainbow or multi-color text
- Outline-only text without fill
- Decorative scripts or display fonts
- 3D extruded text
- Glow effects on text

## Format Signature Text Events

Recurring format lanes from `../00_SHARED_KB/FORMAT_LANES.md` may use a small, consistent on-screen label at the reveal or payoff beat:

- `REAL REASON ->`
- `HIDDEN INDIA ->`
- `SMART MONEY ->` / `SMART BUSINESS ->`
- `SCIENCE LITE ->`
- `BOTH ARE TRUE ->` / `THE CONTRADICTION ->`
- `THE DEBATE ->` / `NOW YOU DECIDE`

Rules:

- Use visually only; the host should not speak these as catchphrases.
- Keep the label small enough that it supports the payoff rather than becoming the payoff.
- Use the same navy/mustard/white system.
- Do not add a label if the frame is already carrying a number, source, or key visual.

## B-Roll

- Use only when it adds understanding
- Maximum 1-2 second B-roll cutaways within Shorts. Diagrams, maps, comparison frames, and source cards may hold 4-5 seconds when the viewer needs time to understand them.
- Always mute B-roll audio
- Apply consistent color grade: saturation -10, temperature +5, vignette 30%
- 1080p minimum resolution
- Sources: Pexels, Pixabay, Coverr, Mixkit, Mazwai, archive.org, Wikimedia, NASA

## Source Visuals, Screenshots, and Text Cards

Use source visuals deliberately. The editor brief must decide where the viewer sees a source and where the source information is recreated in the Curious Chappal visual system.

- Use article/blog/YouTube/source screenshots only when the headline, source identity, or public framing is part of the story.
- Show source screenshots briefly in setup or reveal beats; do not park a full article page under narration.
- Recreate source facts as clean navy/mustard/white text cards when a screenshot would be cluttered, copyrighted, paywalled, low-resolution, misleading out of context, or include personal data.
- For Viral Social Commentary, preserve the receipt visually: job-listing quotes, rate-card wording, app copy, or public terms can be recreated as clean quote cards when the wording itself is the debate evidence. Do not hide the conflict behind generic "worker pay question" cards.
- For YouTube or creator sources, avoid reusing clips unless licensing is clear. Use the source as a lead, then recreate the information as text, chart, map, or host explanation.
- Label attribution needs in the editor brief. Do not imply that archive, article, YouTube, social, or stock assets are safe to use without permission or license checks.

## Graphics

- Information design, not decoration
- One visual element at a time
- Clean line-art illustrations over photo collages
- Simple diagrams over complex infographics
- Numbers should appear as plain text, large and clean

## Use of Pauses

- After a major reveal: 1-2 seconds of silence is correct
- The mandatory quiet beat — 1.5-2 seconds in the second half of every video — must contain:
  - Clean frame (no overlays)
  - Host face
  - Music dropped to -25dB
  - No SFX
  - No new visual elements

## How to Make Videos Feel Premium

- Restraint > addition
- One strong visual element > five competing ones
- Confident host framing > tiny host with massive graphics
- Continuous subtle music > swelling dramatic score
- Hard cuts > transition effects
- Clean typography > decorative fonts
- Specific numbers and named institutions on screen > vague claims
- Silence at the right moment > constant audio

## How to Avoid Cheap Shorts Energy

Do not:
- Bounce/zoom on host's face every 2 seconds
- Add screen shake on emphasis words
- Use cartoon SFX
- Stack multiple text overlays simultaneously
- Use particle effects, sparkles, or stars
- Add glitch or chromatic aberration effects
- Insert stock motion-graphics templates
- Use lens flares
- Add countdown timers or "wait for it" graphics

## Treating Serious Topics

For serious historical/tragic content:
- Minimal graphic intervention
- No SFX emphasis on tragic beats
- Host face in clean frame for most of the duration
- Music either absent or single sustained note
- Allow pauses to extend longer than feels comfortable
- No animations on text overlays

## Treating Science Topics

For science-driven content:
- One clean illustration of the mechanism is essential
- Hold mechanism diagrams for 4-5 seconds
- Slight warmth in editing
- B-roll of macro imagery where useful

## Treating Current Affairs

For current-event content:
- News-graphic restraint — clean text cards, no "BREAKING" banners
- Map graphics when illustrating geographic priority
- Cool color temperature
- Slightly faster pacing on setup, slower on the payoff and on the mental model/framework when it is explicitly voiced or shown

## Treating Historical Stories

For historical content:
- Period-appropriate B-roll (archival footage, historical photos, Wikimedia sources)
- Sepia-toned color grading for archival material
- Wider shot of host during emotional moments
- Slower pacing throughout

## What Must Never Be Done Visually

- Logo intros at the start
- Channel name spoken in the video
- "Hey everyone" greeting frames
- Reaction-shot thumbnails
- Subscribe bell animations mid-video
- Comment-bait pop-ups during the video
- Multiple text overlays competing at once
- Music that swells at reveals
- Performance-style energy from the host
- Fast-zoom pattern interrupts
