# CLAUDE.md

Notes for Claude Code sessions in this repository.

## Voice / text-to-speech notes (Higgsfield video & audio generation)

- **Dr. Ali Hashemian's surname must always be spelled phonetically as `Hah-shem-ee-an` in any text-to-speech or spoken-line prompt** (e.g. "I'm Dr. Ali Hah-shem-ee-an at Brain Wellness Center"). This is the user-approved pronunciation; writing "Hashemian" literally causes TTS engines to mispronounce it. Never put bracketed pronunciation guides inside the quoted spoken line — the model will read them aloud.
- Spell **"FDA" as `F-D-A`** in spoken-line text so the letters are enunciated separately and don't merge into the following word (e.g. "F-D-A cleared", not "FDA-cleared").
- His cloned voice element in Higgsfield: **"Dr-Hashemian-Voice-"** — `voice_id 9d417047-f0ec-4a24-a628-16c32f984b40`, `voice_type element` (use with `seed_audio`).
- Reference elements in Higgsfield: character **"Dr.-Ali-Hashemian"** (`b8fcedd6-b787-4018-91fd-cb77b1da673e`), environment **"Brain-Wellness-Cetner-Office"** (`60805714-aaf7-4217-885c-7561d80adaab`).
- Marketing videos for Brain Wellness Center must **not end with a call to action** — no "call us", no phone number, no website mention.
