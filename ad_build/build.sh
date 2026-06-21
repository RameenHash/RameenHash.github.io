#!/usr/bin/env bash
# Brain Wellness Center — qpTMS 30s ad assembly
# Builds a 30s 16:9 master + 9:16 vertical from Higgsfield clips, beats 4/5/6/6/5/4.
# Requires: ffmpeg + ffprobe + curl.
#
# Usage:
#   ./build.sh            # download sources + build silent masters
#   VO=/path/to/vo.wav ./build.sh   # also lay the voiceover under both masters
#
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p src out
CDN="https://d8j0ntlcm91z4.cloudfront.net/user_31uC42U37hhrLF3jeTNneVOvPaO"

# --- Source assets (Higgsfield job -> CDN file) -----------------------------
# 16:9 seedance_2_0 clips
declare -A H16=(
  [01_hook]="$CDN/hf_20260621_212809_44d97d1e-362a-4a8f-9452-d5062b9c44dc.mp4"          # 44d97d1e hook
  [02_pivot]="$CDN/hf_20260621_212844_8dcc08c3-4845-4818-a2d7-80e6e6982210.mp4"         # 8dcc08c3 pivot
  [03_science]="$CDN/hf_20260621_212811_e7e5be39-6d31-4cdd-8333-adb8f5447d9b.mp4"       # e7e5be39 science
  [04_treatment]="$CDN/hf_20260621_212842_6bfb3e8c-3c1a-4c3f-9a98-df335b9e55bd.mp4"     # 6bfb3e8c treatment
  [05_transformation]="$CDN/hf_20260621_212847_c0849c0c-7243-4bf9-8cf2-74c0b00aec37.mp4" # c0849c0c transformation
)
# 9:16 Higgsfield Reframe renders of the same clips
declare -A H9=(
  [01_hook_916]="$CDN/hf_20260621_213654_0b2eb24c-c889-4f72-b62d-4277e160e667.mp4"         # reframe of 44d97d1e
  [02_pivot_916]="$CDN/hf_20260621_213738_e34ad6d8-fb0d-42a1-9ea1-f28f5242422e.mp4"        # reframe of 8dcc08c3
  [03_science_916]="$CDN/hf_20260621_213702_f8cd4eb6-4baf-43f5-9a3f-66ee4e3d5771.mp4"      # reframe of e7e5be39
  [04_treatment_916]="$CDN/hf_20260621_213710_559b7f51-2eaf-4439-bb94-12293fa6edaf.mp4"    # reframe of 6bfb3e8c
  [05_transformation_916]="$CDN/hf_20260621_213720_ac125e4f-13c7-4354-a508-b8e0d60f4f18.mp4" # reframe of c0849c0c
)
CTA="$CDN/hf_20260621_212928_07ce8618-0a67-43f7-9c7b-37093ca0a5c5.png"                    # 07ce8618 end card (2752x1536)

echo ">> downloading sources..."
for k in "${!H16[@]}"; do [ -f "src/$k.mp4" ] || curl -sS -L -o "src/$k.mp4" "${H16[$k]}"; done
for k in "${!H9[@]}";  do [ -f "src/$k.mp4" ] || curl -sS -L -o "src/$k.mp4" "${H9[$k]}";  done
[ -f src/cta_card.png ] || curl -sS -L -o src/cta_card.png "$CTA"

# Per-segment normalizer: trim to beat, fit/pad to WxH, 24fps, square pixels, yuv420p
norm() { local i="$1" d="$2" W="$3" H="$4" l="$5"
  echo "[$i:v]trim=0:$d,setpts=PTS-STARTPTS,fps=24,scale=$W:$H:force_original_aspect_ratio=decrease,pad=$W:$H:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,format=yuv420p[$l];"; }

build() { # build <W> <H> <cta_filter> <out> <s1> <s2> <s3> <s4> <s5>
  local W="$1" H="$2" CTAF="$3" OUT="$4"; shift 4
  local fc=""
  fc+=$(norm 0 4 "$W" "$H" v0); fc+=$(norm 1 5 "$W" "$H" v1); fc+=$(norm 2 6 "$W" "$H" v2)
  fc+=$(norm 3 6 "$W" "$H" v3); fc+=$(norm 4 5 "$W" "$H" v4)
  fc+="[5:v]$CTAF[v5];[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[outv]"
  ffmpeg -y -hide_banner -loglevel error \
    -i "src/$1.mp4" -i "src/$2.mp4" -i "src/$3.mp4" -i "src/$4.mp4" -i "src/$5.mp4" \
    -loop 1 -t 4 -i src/cta_card.png \
    -filter_complex "$fc" -map "[outv]" -r 24 \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart "$OUT"
  echo ">> built $OUT ($(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT")s)"
}

echo ">> building silent masters..."
build 1920 1080 \
  "fps=24,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,format=yuv420p" \
  out/16x9_master_silent.mp4 01_hook 02_pivot 03_science 04_treatment 05_transformation
build 1080 1920 \
  "fps=24,crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920,setsar=1,format=yuv420p" \
  out/9x16_master_silent.mp4 01_hook_916 02_pivot_916 03_science_916 04_treatment_916 05_transformation_916

# --- Lay the voiceover under both masters (optional) ------------------------
if [ -n "${VO:-}" ] && [ -f "$VO" ]; then
  echo ">> muxing voiceover: $VO"
  for r in 16x9 9x16; do
    ffmpeg -y -hide_banner -loglevel error -i "out/${r}_master_silent.mp4" -i "$VO" \
      -filter_complex "[1:a]aresample=48000,loudnorm=I=-16:TP=-1.5:LRA=11,apad[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
      "out/${r}_master_final.mp4"
    echo ">> built out/${r}_master_final.mp4"
  done
else
  echo ">> VO not provided (set VO=/path/to/vo.wav). Silent masters only."
fi
