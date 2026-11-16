import type { Status } from '../domain/types.ts'

// The four answers the screens draw, in the order they matter.
export type Kind = 'closed' | 'soon' | 'unknown' | 'open'
const KIND: Record<Status['kind'], Kind> = { closed: 'closed', 'closing-soon': 'soon', unknown: 'unknown', open: 'open' }
export const kindOf = (s: Status): Kind => KIND[s.kind]
