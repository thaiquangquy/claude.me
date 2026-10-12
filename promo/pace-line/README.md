# pace-line promo

The pace-line promo video and the animatic it is rendered from.

| File | What it is |
|---|---|
| `prototype.html` | The animatic: timeline, captions (EN and VI), sound, 16:9 and 9:16 layouts. Open it in a browser to review. |
| `render.mjs` | Renders `prototype.html` to MP4: seeks the page frame by frame and renders its Web Audio soundtrack offline. |
| `out/` | Render output (MP4s and a poster frame). Git-ignored; the video is hosted as a GitHub attachment. |

## Render

Needs Node, Playwright with Chromium, and `ffmpeg` with `libx264`.

```bash
node promo/pace-line/render.mjs --format both
```

`--lang` is `en` (default) or `vi`; `--format` is `16x9`, `9x16` or `both`; `--fps` defaults to 30. A 63-second render takes about 5 minutes per format.

Change the video in `prototype.html`, review it in the browser, then render. The MP4 frames come from the same `render()` function as the preview, so what you review is what ships.

## Attach to the README

GitHub plays a video inline only when it is hosted as a GitHub attachment; an MP4 committed to the repo shows as a plain link. To publish a new render:

1. Open any comment box on [thaiquangquy/claude.me](https://github.com/thaiquangquy/claude.me), for example a new issue (no need to submit it).
2. Drag `out/pace-line-promo-en-16x9.mp4` in and wait for the upload.
3. Copy the inserted `https://github.com/user-attachments/assets/<id>` URL.
4. Replace the URL in the **🎬 Video** section of [`mods/pace-line/README.md`](../../mods/pace-line/README.md). Keep it on its own line, which is what makes GitHub render the player.
