import { sampleFigure } from './figure'

/** Sampling ~60k points takes about a second: done here while the hero plays. */
self.onmessage = (e: MessageEvent<{ count: number }>) => {
  const f = sampleFigure(e.data.count)
  const out = { position: f.position.slice(), scatter: f.scatter.slice(), seed: f.seed.slice(), shell: f.shell.slice() }
  ;(self as unknown as Worker).postMessage(out, [out.position.buffer, out.scatter.buffer, out.seed.buffer, out.shell.buffer])
}
