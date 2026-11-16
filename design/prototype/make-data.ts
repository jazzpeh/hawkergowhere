import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseClosuresCsv } from '../../scripts/parse.ts'
import { toView } from '../../src/domain/view-model.ts'
import type { IsoDate } from '../../src/domain/types.ts'

const here = new URL('.', import.meta.url)
const centres = parseClosuresCsv(readFileSync(new URL('../../scripts/fixtures/closures-2026-10-20.csv', here), 'utf8'))
const description = new Map(centres.map(c => [c.id, c.description]))
const out: Record<string, unknown> = {}
for (const day of ['2026-10-20', '2026-12-07'] as IsoDate[]) {
  // The same view the app builds, plus the description the prototype still reads its market stall count from.
  out[day] = toView(centres, day, () => 0).map(v => ({ ...v, description: description.get(v.id) ?? '' }))
}
mkdirSync(new URL('out/', here), { recursive: true })
writeFileSync(new URL('out/data.js', here), 'window.DATA = ' + JSON.stringify(out) + ';')
for (const [d, list] of Object.entries(out)) {
  const k = (list as { status: { kind: string } }[]).reduce<Record<string, number>>((a, x) => ((a[x.status.kind] = (a[x.status.kind] ?? 0) + 1), a), {})
  console.log(d, JSON.stringify(k))
}
