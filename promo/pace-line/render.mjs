// Renders the promo to MP4 from prototype.html: every frame is a seek on the page's own timeline,
// the soundtrack is the page's Web Audio graph rendered offline. What you reviewed is what ships.
//   node render.mjs [--lang vi|en] [--format 16x9|9x16|both] [--fps 30]
import { spawn, execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d }
const lang = arg('lang', 'vi'), fps = Number(arg('fps', 30)), which = arg('format', 'both')
const require = createRequire(import.meta.url)
const { chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))

const FORMATS = { '16x9': { w: 1280, h: 720, portrait: false }, '9x16': { w: 720, h: 1280, portrait: true } }
const SCALE = 1.5 // 1280×720 stage → 1920×1080 video
const outDir = join(here, 'out')
mkdirSync(outDir, { recursive: true })

const run = (cmd, args, input) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'inherit'] })
  p.on('error', rej); p.on('close', c => c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`)))
  if (input) input(p.stdin)
})

const browser = await chromium.launch()
for (const name of which === 'both' ? Object.keys(FORMATS) : [which]) {
  const f = FORMATS[name]
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: SCALE })
  await page.goto(pathToFileURL(join(here, 'prototype.html')).href)
  await page.addStyleTag({ content: `
    body { padding: 0 !important; margin: 0 }
    header, .controls, .chips, section, .poster { display: none !important }
    .frame { position: fixed !important; inset: 0; width: ${f.w}px !important; max-width: none !important; border: 0 !important; border-radius: 0 !important }` })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(o => window.__pace.setup(o), { lang, portrait: f.portrait })
  const duration = await page.evaluate(() => window.__pace.duration)

  const wav = join(outDir, `audio-${lang}.wav`)
  writeFileSync(wav, Buffer.from(await page.evaluate(() => window.__pace.audio()), 'base64'))

  const mp4 = join(outDir, `pace-line-promo-${lang}-${name}.mp4`)
  const frames = Math.round(duration * fps)
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', mp4], async stdin => {
    for (let i = 0; i < frames; i++) {
      await page.evaluate(t => window.__pace.seek(t), i / fps)
      const png = await page.screenshot({ clip: { x: 0, y: 0, width: f.w, height: f.h } })
      if (!stdin.write(png)) await new Promise(r => stdin.once('drain', r))
      if (i % (fps * 10) === 0) process.stdout.write(`${name} ${Math.round(i / fps)}s/${duration}s\n`)
    }
    stdin.end()
  })
  rmSync(wav)
  // Poster for the README: the scene 4 reveal, band zoomed with all four callouts.
  await page.evaluate(() => window.__pace.seek(42.4))
  await page.screenshot({ path: join(outDir, `poster-${lang}-${name}.png`), clip: { x: 0, y: 0, width: f.w, height: f.h } })
  console.log(`wrote ${mp4}`)
  await page.close()
}
await browser.close()
