# pace-line promo

The pace-line promo video and the animatic it is rendered from.

| File | What it is |
|---|---|
| `prototype.html` | The animatic: timeline, captions (EN and VI), sound, 16:9 and 9:16 layouts. Open it in a browser to review. |
| `render.mjs` | Renders `prototype.html` to MP4: seeks the page frame by frame and renders its Web Audio soundtrack offline. |
| `out/` | Render output. Only the README poster is committed; MP4s are git-ignored and published as GitHub release assets. |

## Render

Needs Node, Playwright with Chromium, and `ffmpeg` with `libx264`.

```bash
node promo/pace-line/render.mjs --lang vi --format both
```

`--lang` is `vi` or `en`; `--format` is `16x9`, `9x16` or `both`; `--fps` defaults to 30. A 63-second render takes about 5 minutes per format.

Change the video in `prototype.html`, review it in the browser, then render. The MP4 frames come from the same `render()` function as the preview, so what you review is what ships.

## Publish

The videos live on a GitHub release, not in git, so plugin installs and clones stay small. Upload a new render under a new tag and point the links in [`mods/pace-line/README.md`](../../mods/pace-line/README.md) at it:

```bash
gh release create pace-line-promo-vi-v2 --latest=false --title "pace-line promo (Vietnamese) v2" \
  --notes "pace-line promo video, Vietnamese captions." \
  promo/pace-line/out/pace-line-promo-vi-16x9.mp4 promo/pace-line/out/pace-line-promo-vi-9x16.mp4
```
