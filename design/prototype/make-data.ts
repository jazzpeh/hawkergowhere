import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseClosuresCsv } from '../../scripts/parse.ts'
import { statusOn, nearestOpen } from '../../src/domain/status.ts'
import { uncleSays } from '../../src/domain/uncle.ts'
import type { IsoDate } from '../../src/domain/types.ts'

const here = new URL('.', import.meta.url)
const centres = parseClosuresCsv(readFileSync(new URL('../../scripts/fixtures/closures-2026-10-20.csv', here), 'utf8'))
const out: Record<string, unknown> = {}
for (const day of ['2026-10-20', '2026-12-07'] as IsoDate[]) {
  out[day] = centres.map(c => {
    const status = statusOn(c, day)
    const alt = status.kind === 'open' ? undefined : nearestOpen(centres, c, day, c.id)
    const remarks = c.closures.flatMap(x => ('remarks' in x && x.remarks ? [x.remarks] : []))
    // The rest of the schedule from today, for the Board sheet's calendar.
    const shut = c.closures.flatMap(x => (x.kind !== 'tbc' && x.end >= day ? [{ kind: x.kind, start: x.start, end: x.end }] : []))
      .sort((a, b) => a.start.localeCompare(b.start))
    const tbc = c.closures.flatMap(x => (x.kind === 'tbc' ? [x.quarter] : []))
    // Quarters whose cleaning dates are out, as '2026-4'. A day outside them cannot be called open.
    const known = [...new Set(c.closures.flatMap(x => (x.kind === 'cleaning' ? [`${x.start.slice(0, 4)}-${x.quarter}`] : [])))]
    return { id: c.id, name: c.name, address: c.address, lat: c.lat, lng: c.lng, foodStalls: c.foodStalls, description: c.description,
      status, line: uncleSays(status, c, () => 0), remarks, shut, tbc, known,
      alt: alt && { id: alt.centre.id, name: alt.centre.name, km: Math.round(alt.km * 10) / 10 } }
  })
}
mkdirSync(new URL('out/', here), { recursive: true })
writeFileSync(new URL('out/data.js', here), 'window.DATA = ' + JSON.stringify(out) + ';')
for (const [d, list] of Object.entries(out)) {
  const k = (list as { status: { kind: string } }[]).reduce<Record<string, number>>((a, x) => ((a[x.status.kind] = (a[x.status.kind] ?? 0) + 1), a), {})
  console.log(d, JSON.stringify(k))
}
