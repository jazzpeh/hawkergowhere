import { nearestOpen, statusOn } from './status.ts'
import { uncleSays } from './uncle.ts'
import type { Centre, IsoDate, Quarter, Status } from './types.ts'

// What the screens need for one centre on one day: today's status plus the rest of its schedule.
export type CentreView = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  foodStalls: number
  marketStalls: number
  photoUrl?: string
  status: Status
  line: string
  remarks: string[]
  // Dated closures that end today or later, earliest first.
  shut: Array<{ kind: 'cleaning' | 'works'; start: IsoDate; end: IsoDate }>
  // Quarters whose cleaning dates NEA has not published yet.
  tbc: Quarter[]
  // Quarters whose cleaning dates are out, as '2026-4'. A day outside them cannot be called open.
  known: string[]
  alt?: { id: string; name: string; km: number }
}

export function toView(centres: Centre[], today: IsoDate, pick?: (n: number) => number): CentreView[] {
  return centres.map(c => {
    const status = statusOn(c, today)
    const alt = status.kind === 'open' ? undefined : nearestOpen(centres, c, today, c.id)
    return {
      id: c.id,
      name: c.name,
      address: c.address,
      lat: c.lat,
      lng: c.lng,
      foodStalls: c.foodStalls,
      marketStalls: c.marketStalls,
      ...(c.photoUrl ? { photoUrl: c.photoUrl } : {}),
      status,
      line: uncleSays(status, c, pick),
      remarks: c.closures.flatMap(x => ('remarks' in x && x.remarks ? [x.remarks] : [])),
      shut: c.closures
        .flatMap(x => (x.kind !== 'tbc' && x.end >= today ? [{ kind: x.kind, start: x.start, end: x.end }] : []))
        .sort((a, b) => a.start.localeCompare(b.start)),
      tbc: c.closures.flatMap(x => (x.kind === 'tbc' ? [x.quarter] : [])),
      known: [...new Set(c.closures.flatMap(x => (x.kind === 'cleaning' ? [`${x.start.slice(0, 4)}-${x.quarter}`] : [])))],
      ...(alt ? { alt: { id: alt.centre.id, name: alt.centre.name, km: Math.round(alt.km * 10) / 10 } } : {}),
    }
  })
}
