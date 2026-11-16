// Every drawing the app uses, as SVG strings: icons, the spinner's food stickers and the cast.
let uid = 0
const INK = '#1E1B18', WHITE = '#FFFFFF', KAYA = '#F6C343', TEH = '#B5713E', TEAL = '#2BA6A0', GROUND = '#EDD8B0'
const M = 'fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"'
const LINE = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"'
const cut = (shape: string, holes: string) => {
  const id = `m${++uid}`
  return `<mask id="${id}"><rect width="24" height="24" fill="#fff"/>${holes}</mask><g mask="url(#${id})">${shape}</g>`
}
const disc = '<circle cx="12" cy="12" r="10"/>'
const TISSUE = 'M9.4 13.5C8.3 10.6 8.2 7.4 9.3 4.4c1 .9 1.9 1.3 2.8 1.2.9-.1 1.8-.8 2.6-1.9 1.2 3.2 1.1 6.6-.1 9.8z'
const ICONS = {
  globe: () => `<circle cx="12" cy="12" r="9" ${LINE}/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" ${LINE}/>`,
  pin: () => '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/>',
  search: () => `<circle cx="10.5" cy="10.5" r="6.25" ${LINE}/><path d="M15.2 15.2L20 20" ${LINE}/>`,
  close: () => `<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" ${LINE}/>`,
  arrow: () => `<path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" ${LINE}/>`,
  back: () => `<path d="M19.5 12h-14M11 6.5L5.5 12l5.5 5.5" ${LINE}/>`,
  share: () => `<path d="M12 14.5V3.5M7.8 7.5L12 3.3l4.2 4.2" ${LINE}/><path d="M8.5 10.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5" ${LINE}/>`,
  info: () => cut(disc, `<path d="M12 11v5.5" ${M}/><circle cx="12" cy="7.6" r="1.5" fill="#000"/>`),
  open: () => cut(disc, `<path d="M7.8 12.3l2.8 2.8 5.6-5.8" ${M}/>`),
  soon: () => cut(disc, `<path d="M12 7v5l3.2 2" ${M}/>`),
  unknown: () => cut(disc, `<path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.4v.4" ${M}/><circle cx="12" cy="17" r="1.45" fill="#000"/>`),
  closed: () => cut('<rect x="2.5" y="3" width="19" height="18" rx="3"/>', '<path d="M6.5 8.5h11M6.5 12.5h11M6.5 16.5h11" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>'),
  susan: () => cut('<ellipse cx="12" cy="15" rx="10" ry="6"/>', '<ellipse cx="7.6" cy="15" rx="2.4" ry="1.5" fill="#000"/><ellipse cx="16.4" cy="15" rx="2.4" ry="1.5" fill="#000"/><ellipse cx="12" cy="18" rx="2.4" ry="1.5" fill="#000"/><ellipse cx="12" cy="12.2" rx="2" ry="1.2" fill="#000"/>') + `<path d="M6 6.2C7.7 5 9.7 4.4 12 4.4s4.3.6 6 1.8" ${LINE}/><path d="M18.9 3.4l.2 3.5-3.4.6" ${LINE}/>`,
  tissue: () => `<rect x="3" y="11" width="18" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="${TISSUE}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  tissueOn: () => cut('<rect x="3" y="11" width="18" height="10" rx="3"/>', `<path d="${TISSUE}" fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round"/>`) + `<path d="${TISSUE}"/>`,
}
export type IconName = keyof typeof ICONS
export const icon = (n: IconName, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]()}</svg>`

/* food stickers for the spinner, 48px grid, flat fills with ink outline */
const O = 'stroke="#1E1B18" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'
const plate = (cy = 38) => `<ellipse cx="24" cy="${cy}" rx="21" ry="6" fill="#fff" ${O}/>`
const bowl = (band?: string) => `<path d="M4 22h40c0 10-9 18-20 18S4 32 4 22z" fill="#fff" ${O}/>${band ? `<path d="M8.5 31h31" stroke="${band}" stroke-width="3.5"/>` : ''}<rect x="16" y="39" width="16" height="4" rx="2" fill="${INK}"/>`
export const FOOD = {
  chickenRice: () => plate() + `<path d="M5 37a10.5 10.5 0 0 1 21 0z" fill="#fff" ${O}/>`
    + [0, 1, 2].map(n => `<g transform="rotate(-14 ${31 + n * 3} ${24 + n * 5})"><rect x="${21 + n * 3}" y="${20 + n * 5}" width="21" height="8" rx="3" fill="#F8E2B5" ${O}/><path d="M${23 + n * 3} ${21.6 + n * 5}h17" stroke="#D9963F" stroke-width="2.6" stroke-linecap="round"/></g>`).join('')
    + `<circle cx="9" cy="41" r="2.6" fill="#8CC56D" ${O}/>`,
  laksa: () => bowl(TEAL) + `<ellipse cx="24" cy="22" rx="20" ry="4.5" fill="#E8772E" ${O}/><path d="M10 22q2.5-2.5 5 0t5 0 5 0 5 0" fill="none" stroke="#F6C343" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="M29 19c-1-7 8-11 12-6s0 10-5 9" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M29 19c-1-7 8-11 12-6s0 10-5 9" fill="none" stroke="#F4846A" stroke-width="5" stroke-linecap="round"/><path d="M36 22l-5 4.5 6.5 1z" fill="#F4846A" ${O}/>`,
  satay: () => `<g transform="rotate(-32 24 24)">${[14, 24, 34].map(y => `<path d="M3 ${y}H45" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M3 ${y}H45" stroke="#D9A066" stroke-width="2" stroke-linecap="round"/>${[11, 20, 29].map(x => `<rect x="${x}" y="${y - 4}" width="8" height="8" rx="2.5" fill="#A0562A" ${O}/>`).join('')}`).join('')}</g>`,
  nasiLemak: () => `<path d="M2 32C6 14 30 6 46 12C43 32 22 44 2 32z" fill="#1F8A5B" ${O}/><path d="M7 30C18 22 32 16 42 14" fill="none" stroke="#6FBF8E" stroke-width="1.6"/>`
    + `<path d="M7 33a9.5 9.5 0 0 1 19 0z" fill="#fff" ${O}/><ellipse cx="33" cy="20" rx="7.5" ry="6.5" fill="#fff" ${O}/><circle cx="33" cy="20" r="3.2" fill="#F6C343"/>`
    + `<path d="M28 31c2-3.5 9-3.5 11 0s-2.5 5.5-5.5 5.5S26 34.5 28 31z" fill="#D22A1D" ${O}/>`,
  prata: () => plate(39) + `<path d="M4 37C4 23 17 14 31 17L28 38z" fill="#E8B05A" ${O}/><path d="M9 38C11 28 20 23 29 25L28 38z" fill="#F7D28E" ${O}/>`
    + '<circle cx="14" cy="27" r="1.5" fill="#B5713E"/><circle cx="21" cy="21" r="1.5" fill="#B5713E"/><circle cx="18" cy="33" r="1.5" fill="#B5713E"/>'
    + `<path d="M31 31h15c0 5.5-3.4 9-7.5 9S31 36.5 31 31z" fill="#fff" ${O}/><ellipse cx="38.5" cy="31" rx="7.5" ry="2.2" fill="#C8641E" ${O}/>`,
  thosai: () => `<ellipse cx="24" cy="35" rx="22" ry="8" fill="#D6CEC0" ${O}/><path d="M4 31L40 19.5c3-1 5.5 6.5 2.5 7.8L6 37c-3 .6-4.6-4.6-2-6z" fill="#E2A04A" ${O}/>`
    + `<ellipse cx="41.8" cy="23.4" rx="2.4" ry="4.2" transform="rotate(-18 41.8 23.4)" fill="#B5713E" ${O}/><path d="M15 28l1.5 5M23 25.5l1.5 5M31 23l1.5 5" stroke="#B5713E" stroke-width="1.6" stroke-linecap="round"/>`
    + `<circle cx="11" cy="41" r="3.6" fill="#fff" ${O}/><circle cx="20" cy="42" r="3.6" fill="#E8772E" ${O}/>`,
  kayaToast: () => [[30, 6], [16, 2]].map(([y = 0, x = 0]) => `<rect x="${x + 4}" y="${y + 7}" width="34" height="8" rx="3" fill="#F2C77E" stroke="#8A5530" stroke-width="2"/><rect x="${x + 6}" y="${y + 3.5}" width="30" height="4.5" rx="1.5" fill="#6FA84A" ${O}/><rect x="${x + 16}" y="${y}" width="9" height="4.5" rx="1" fill="#FFF0A0" ${O}/><rect x="${x + 4}" y="${y - 5}" width="34" height="8" rx="3" fill="#F2C77E" stroke="#8A5530" stroke-width="2"/>`).join(''),
  iceKachang: () => {
    const id = `ik${++uid}`, d = 'M7 33C7 17 15 9 24 9s17 8 17 24z'
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})"><rect width="48" height="48" fill="#E23B2E"/><path d="M0 20L48 12V20L0 28z" fill="#F28FAD"/><path d="M0 28L48 20V27L0 35z" fill="#F6C343"/><path d="M0 35L48 27V40H0z" fill="#3FA06B"/></g><path d="${d}" fill="none" ${O}/>`
      + `<path d="M8 33h32l-4 9.5a2 2 0 0 1-1.9 1.3H13.9a2 2 0 0 1-1.9-1.3z" fill="#fff" ${O}/><circle cx="24" cy="8" r="3.6" fill="#D22A1D" ${O}/>`
  },
  meeRebus: () => bowl('#F28FAD') + `<ellipse cx="24" cy="22" rx="20" ry="4.5" fill="#A9652F" ${O}/><path d="M9 23q2.5-2.5 5 0t5 0M28 23q2.5-2.5 5 0t5 0" fill="none" stroke="#F6C343" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="M17 21a7 7 0 0 1 14 0z" fill="#fff" ${O}/><path d="M20.5 21a3.5 3.5 0 0 1 7 0z" fill="#F6C343"/><circle cx="36.5" cy="16.5" r="3.6" fill="#9CCB5A" ${O}/>`,
  tehTarik: () => `<g transform="rotate(-28 36 9)"><path d="M28 3h15l-1.6 11a2 2 0 0 1-2 1.7h-7.8a2 2 0 0 1-2-1.7z" fill="#fff" ${O}/></g>`
    + '<path d="M29.5 14C25 18 24 21 24 26" fill="none" stroke="#B5713E" stroke-width="3" stroke-linecap="round"/>'
    + `<path d="M13 25h22l-2.6 17.5a2 2 0 0 1-2 1.7H17.6a2 2 0 0 1-2-1.7z" fill="#D49A5E" ${O}/><path d="M13.6 25.5h20.8l-.7 4.5H14.3z" fill="#F7EBD3"/><path d="M13 25h22l-2.6 17.5a2 2 0 0 1-2 1.7H17.6a2 2 0 0 1-2-1.7z" fill="none" ${O}/>`,
}
export type Dish = keyof typeof FOOD

/* the cast, rotated per centre so no one community fronts the app */
type CastKey = 'chUncle' | 'inUncle' | 'makcik' | 'auntie'
type Member = { name: string; skin: string; top: 'singlet' | 'baju' | 'tee'; cloth?: string }
const CAST: Record<CastKey, Member> = {
  chUncle: { name: 'Uncle', skin: '#E7B47E', top: 'singlet' },
  inUncle: { name: 'Uncle', skin: '#8A5A3C', top: 'singlet' },
  makcik: { name: 'Makcik', skin: '#D9A577', top: 'baju', cloth: TEAL },
  auntie: { name: 'Auntie', skin: '#EBC08F', top: 'tee', cloth: KAYA },
}
const CAST_ORDER: CastKey[] = ['chUncle', 'makcik', 'inUncle', 'auntie']
const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
export const castFor = (id: string): CastKey => CAST_ORDER[hash(id) % CAST_ORDER.length] ?? 'chUncle'
const eyes = `<circle cx="20.2" cy="22" r="1.3" fill="${INK}"/><circle cx="27.8" cy="22" r="1.3" fill="${INK}"/>`
const smile = `<path d="M21 26.8c1.7 1.4 4.3 1.4 6 0" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`
function head(k: CastKey) {
  const c = CAST[k]
  if (k === 'chUncle') return `<circle cx="24" cy="21.5" r="10.5" fill="${c.skin}"/><path d="M13.6 22.5c-.9-3.6-.2-6.4 1.9-8 0 2.6.4 4.9 1.2 7zM34.4 22.5c.9-3.6.2-6.4-1.9-8 0 2.6-.4 4.9-1.2 7z" fill="${INK}"/><path d="M18.5 12.8c3.4-1.9 7.6-2 11 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/><g fill="none" stroke="${INK}" stroke-width="1.6"><circle cx="19.8" cy="21.5" r="3"/><circle cx="28.2" cy="21.5" r="3"/><path d="M22.8 21.2h2.4"/></g><path d="M18.8 27.8c1.9-1.6 3.7-1.7 5.2-.6 1.5-1.1 3.3-1 5.2.6-1.8.8-3.6.7-5.2-.3-1.6 1-3.4 1.1-5.2.3z" fill="${INK}"/>`
  if (k === 'inUncle') return `<circle cx="24" cy="21.5" r="10.5" fill="${c.skin}"/><path d="M13.4 20.5c-.4-6.8 4.2-11 10.6-11s11 4.2 10.6 11c-1.2-2.8-3.6-4.6-7-5.2-2.6 1.5-6.4 2.1-10.4 2-1.8.8-3 1.8-3.8 3.2z" fill="${INK}"/>${eyes}<path d="M18.4 27.6c2-1.6 4-1.7 5.6-.5 1.6-1.2 3.6-1.1 5.6.5-1.5 1.7-3.7 2-5.6.9-1.9 1.1-4.1.8-5.6-.9z" fill="${INK}"/>`
  if (k === 'makcik') return `<path d="M24 8c-8.4 0-14.2 6.4-14.2 14.6 0 5 1.8 9.2 4.6 12.2h19.2c2.8-3 4.6-7.2 4.6-12.2C38.2 14.4 32.4 8 24 8z" fill="${c.cloth}"/><ellipse cx="24" cy="22.6" rx="8.4" ry="9.4" fill="${c.skin}"/>${eyes}${smile}`
  return `<circle cx="24" cy="9.5" r="4.5" fill="${INK}"/><circle cx="24" cy="21.5" r="10.5" fill="${c.skin}"/><path d="M13.5 21c-.3-6.6 4.3-10.8 10.5-10.8S34.8 14.4 34.5 21c-2-3.5-5.6-5.2-10.5-5.2S15.5 17.5 13.5 21z" fill="${INK}"/>${eyes}${smile}`
}
export function avatar(k: CastKey) {
  const c = CAST[k]
  const shoulders = c.top === 'singlet'
    ? `<path d="M4.5 48c1.2-8 8.8-12 19.5-12s18.3 4 19.5 12z" fill="${c.skin}"/><path d="M12.5 48V38.2c3.2 2.2 7 3.3 11.5 3.3s8.3-1.1 11.5-3.3V48z" fill="${WHITE}"/>`
    : `<path d="M4.5 48c1.2-8 8.8-12 19.5-12s18.3 4 19.5 12z" fill="${c.cloth}"/>`
  return `<svg class="ava" viewBox="0 0 48 48" role="img" aria-label="${c.name}"><circle cx="24" cy="24" r="24" fill="${GROUND}"/>${shoulders}${head(k)}</svg>`
}
const arm = (k: CastKey, d: string) => `<path d="${d}" fill="none" stroke="${CAST[k].top === 'baju' ? CAST[k].cloth : CAST[k].skin}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
const hand = (k: CastKey, x: number, y: number, r = 6.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CAST[k].skin}"/>`
function body(k: CastKey) {
  const c = CAST[k]
  if (c.top === 'singlet') return `<rect x="72" y="50" width="16" height="14" fill="${c.skin}"/><path d="M50 78c0-10 12-16 30-16s30 6 30 16v10H50z" fill="${c.skin}"/><path d="M60 68c4 6 11 9 20 9s16-3 20-9c4 2 6 6 6 10v36H54V78c0-4 2-8 6-10z" fill="${WHITE}"/><path d="M54 112h52v18c0 2-2 4-4 4H84l-4-10-4 10H58c-2 0-4-2-4-4z" fill="${INK}"/><rect x="62" y="132" width="10" height="18" rx="4" fill="${c.skin}"/><rect x="88" y="132" width="10" height="18" rx="4" fill="${c.skin}"/><rect x="57" y="148" width="19" height="6" rx="3" fill="${INK}"/><rect x="84" y="148" width="19" height="6" rx="3" fill="${INK}"/>`
  if (c.top === 'baju') return `<path d="M50 78c0-10 12-16 30-16s30 6 30 16v70H50z" fill="${c.cloth}"/><rect x="57" y="148" width="19" height="6" rx="3" fill="${INK}"/><rect x="84" y="148" width="19" height="6" rx="3" fill="${INK}"/>`
  return `<rect x="72" y="50" width="16" height="14" fill="${c.skin}"/><path d="M50 78c0-10 12-16 30-16s30 6 30 16v36H50z" fill="${c.cloth}"/><path d="M54 112h52v36H85l-5-20-5 20H54z" fill="${INK}"/><rect x="55" y="148" width="21" height="6" rx="3" fill="${INK}"/><rect x="84" y="148" width="21" height="6" rx="3" fill="${INK}"/>`
}
const sleeves = (k: CastKey) => CAST[k].top === 'tee' ? `<circle cx="56" cy="76" r="9" fill="${CAST[k].cloth}"/><circle cx="104" cy="76" r="9" fill="${CAST[k].cloth}"/>` : ''
const HEAD = (k: CastKey) => `<g transform="translate(32 -6) scale(2)">${head(k)}</g>`
const star = (x: number, y: number) => `<path d="M${x} ${y - 8}l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5z" fill="${KAYA}"/>`
const SPOTS = {
  empty: { cast: 'makcik', draw: (k: CastKey) => body(k) + arm(k, 'M57 80L40 98L31 82') + arm(k, 'M103 80L120 98L129 82') + sleeves(k) + hand(k, 30, 78) + hand(k, 130, 78) + HEAD(k) },
  loading: { cast: 'auntie', draw: (k: CastKey) => body(k) + arm(k, 'M103 80L122 62L128 40') + arm(k, 'M57 80L74 106L120 118') + sleeves(k) + hand(k, 128, 36) + hand(k, 122, 118) + HEAD(k) + `<path class="stream" d="M147 30C150 60 141 88 137 112" fill="none" stroke="${TEH}" stroke-width="5" stroke-linecap="round"/><rect x="117" y="14" width="24" height="24" rx="4" fill="${INK}"/><path d="M140 20l9 5-9 5z" fill="${INK}"/><path d="M126 110h24l-2 18a3 3 0 0 1-3 3h-14a3 3 0 0 1-3-3z" fill="${INK}"/>` },
  far: { cast: 'makcik', draw: (k: CastKey) => body(k) + `<rect x="104" y="108" width="44" height="42" rx="6" fill="${TEH}"/><rect x="115" y="108" width="3.5" height="42" fill="${INK}"/><rect x="133.5" y="108" width="3.5" height="42" fill="${INK}"/><path d="M118 108v-7h16v7" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>` + arm(k, 'M57 80L40 62L38 42') + arm(k, 'M103 80L118 94L124 99') + sleeves(k) + hand(k, 38, 38) + hand(k, 126, 100) + HEAD(k) },
  good: { cast: 'auntie', draw: (k: CastKey) => body(k) + arm(k, 'M57 80L50 106') + arm(k, 'M103 80L124 88L126 66') + sleeves(k) + hand(k, 49, 110) + `<rect x="121.5" y="40" width="7" height="16" rx="3.5" fill="${CAST[k].skin}"/>` + hand(k, 126, 60, 8) + HEAD(k) + star(146, 40) + star(26, 52) },
} satisfies Record<string, { cast: CastKey; draw: (k: CastKey) => string }>
export type Spot = keyof typeof SPOTS
export const spot = (state: Spot) => `<svg class="spot" viewBox="0 0 160 160" aria-hidden="true">${SPOTS[state].draw(SPOTS[state].cast as CastKey)}</svg>`
