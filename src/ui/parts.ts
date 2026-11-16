import { addDays, diffDays } from '../domain/today.ts'
import type { CentreView } from '../domain/view-model.ts'
import type { IsoDate } from '../domain/types.ts'
import { fmtDate, lang, localLine, monthShort, t } from '../i18n.ts'
import { avatar, castFor, icon, spot, type Spot } from './art.ts'
import { kindOf, type Kind } from './kind.ts'

// Every piece of NEA text that reaches the page goes through this, names and remarks included.
export const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
export const short = (n: string) => n.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(Market and |Market & |Market\/)?(Cooked )?(Food Centre|Hawker Centre)\s*$/i, '').trim() || n
export const fmt = (d: string) => fmtDate(d)
export const kind = (c: CentreView): Kind => kindOf(c.status)
export const dist = (km: number) => (km < 1 ? `${Math.max(50, Math.round(km * 20) * 50)} m` : `${km.toFixed(1)} km`)
const day = (d: string) => fmtDate(d, false)

// The verdict in all four languages, shown under the chosen one. Unverified: a native speaker must review ms / zh / ta before launch.
type Four = { en: string; ms: string; zh: string; ta: string }
const PLACARD_TEXT: Record<'closed' | 'works' | Exclude<Kind, 'closed'>, Four> = {
  closed: { en: 'Closed today', ms: 'Tutup hari ini', zh: '今日休息', ta: 'இன்று விடுமுறை' },
  works: { en: 'Renovation', ms: 'Ubah suai', zh: '装修', ta: 'புதுப்பிப்பு பணி' },
  soon: { en: 'Closing', ms: 'Akan tutup', zh: '即将休息', ta: 'விரைவில் மூடப்படும்' },
  unknown: { en: 'Call first', ms: 'Telefon dahulu', zh: '请先致电', ta: 'முதலில் அழைக்கவும்' },
  open: { en: 'Open today', ms: 'Buka hari ini', zh: '今日营业', ta: 'இன்று திறந்திருக்கும்' },
}
function placard(c: CentreView): { k: Kind; four: Four; sub: string } {
  const s = c.status
  if (s.kind === 'closed') return { k: 'closed', four: PLACARD_TEXT[s.closure.kind === 'works' ? 'works' : 'closed'], sub: t('back')(fmt(s.reopensOn)) }
  if (s.kind === 'closing-soon') return { k: 'soon', four: PLACARD_TEXT.soon, sub: t('shutFrom')(fmt(s.closure.start)) }
  if (s.kind === 'unknown') return { k: 'unknown', four: PLACARD_TEXT.unknown, sub: t('notListed') }
  return { k: 'open', four: PLACARD_TEXT.open, sub: s.next ? t('next')(t('kindWord')[s.next.kind], fmt(s.next.start)) : t('noClosure') }
}

const stallsLine = (c: CentreView) => (c.foodStalls ? t('stalls')(c.foodStalls, c.marketStalls > 0) : t('stallsNA'))
const label = (c: CentreView, km?: number, choped?: boolean) =>
  `${esc(short(c.name))}, ${t('word')[kind(c)]}${km !== undefined ? `, ${dist(km)}` : ''}${choped ? `, ${t('choped')}` : ''}`
function when(c: CentreView) {
  const s = c.status
  if (s.kind === 'closed') return t('whenBack')(day(s.reopensOn))
  if (s.kind === 'closing-soon') return t('whenShuts')(day(s.closure.start))
  return s.kind === 'unknown' ? t('callFirst') : t('open')
}
const why = (c: CentreView) => ('closure' in c.status ? t('shut')[c.status.closure.kind] : stallsLine(c))
// English keeps the domain's own line; the other languages build theirs from the same status.
function line(c: CentreView) {
  const l = lang(), s = c.status
  if (l === 'en') return c.line
  return localLine(l, kind(c), short(c.name), s.kind === 'closed' ? fmt(s.reopensOn) : s.kind === 'closing-soon' ? fmt(s.closure.start) : '')
}
// The letters you searched for, marked in the centre's name.
function hl(s: string, q = '') {
  q = q.trim()
  const i = q ? s.toLowerCase().indexOf(q.toLowerCase()) : -1
  return i < 0 ? esc(s) : `${esc(s.slice(0, i))}<mark>${esc(s.slice(i, i + q.length))}</mark>${esc(s.slice(i + q.length))}`
}

export type RowOpts = { km?: number; choped?: boolean; q?: string }
export const boardRow = (c: CentreView, { km, choped, q }: RowOpts = {}) => `<li class="brow s-${kind(c)}" data-tile="${esc(c.id)}">
<button class="tile-hit" data-id="${esc(c.id)}" aria-label="${label(c, km, choped)}, ${esc(when(c))}">
<span class="bdot"></span><span><span class="bn"><span>${hl(short(c.name), q)}</span>${choped ? icon('tissueOn') : ''}</span><span class="bsub">${esc(why(c))}${km !== undefined ? ` · ${dist(km)}` : ''}</span></span><span class="bwhen">${esc(when(c))}</span>
</button></li>`

export const goSign = ({ label: l = t('goInstead'), name, meta, attr = '' }: { label?: string; name: string; meta: string; attr?: string }) =>
  `<button class="go-sign" ${attr}><span class="tx"><span class="gl">${esc(l)}</span><span class="nm">${esc(name)}</span><span class="mt">${esc(meta)}</span></span><span class="arr">${icon('arrow', 'i20')}</span></button>`

const altSign = (c: CentreView, attr: string) => (c.alt && kind(c) !== 'open'
  ? goSign({ label: t(kind(c) === 'soon' ? 'orGo' : 'goInstead'), name: short(c.alt.name), meta: t('openKm')(c.alt.km), attr })
  : '')
export const homeAlt = (c: CentreView) => (c.alt ? altSign(c, `data-go="${esc(c.alt.id)}"`) : '')
export const sheetAlt = (c: CentreView) => altSign(c, 'id="goalt"')

export const verdict = (c: CentreView, { km }: RowOpts = {}) => `<div class="verdict v-${kind(c)}" data-tile="${esc(c.id)}">
<button class="tile-hit" data-id="${esc(c.id)}" aria-label="${t('yourChope')}, ${label(c, km)}"><span class="vl">${icon('tissueOn', 'i20')}${t('yourChope')}</span><span class="vbig">${t('big')[kind(c)]}</span><span class="vnm">${esc(short(c.name))}</span><span class="vsub">${esc(placard(c).sub)}${km !== undefined ? ` · ${dist(km)}` : ''}</span><span class="vline">“${esc(line(c))}”</span></button>
${homeAlt(c)}</div>`

export function sheetVerdict(c: CentreView) {
  const p = placard(c), l = lang()
  const others = (['en', 'ms', 'zh', 'ta'] as const).filter(x => x !== l).map(x => `<span class="${x}" lang="${x}">${p.four[x]}</span>`).join('')
  return `<div class="verdict sv v-${p.k}"><span class="vl">${icon(p.k, 'i20')}${t('today')}</span><span class="vbig">${t('big')[p.k]}</span><span class="vsub">${esc(p.sub)}</span>
<span class="vlangs">${others}</span>
<span class="vsay">${avatar(castFor(c.id))}<span class="vline">“${esc(line(c))}”</span></span></div>`
}

const iso = (d: string) => d as IsoDate
const span = (n: number) => (n <= 14 ? t('span')(n, 'd') : n < 63 ? t('span')(Math.round(n / 7), 'w') : n < 730 ? t('span')(Math.round(n / 30.4), 'm') : t('span')(Math.round(n / 365), 'y'))
const quarterKey = (d: string) => `${d.slice(0, 4)}-${Math.ceil(Number(d.slice(5, 7)) / 3)}`

// Five weeks from this Monday. Only drawn when a closure lands in part of them; otherwise one line says when the next one is.
export function schedule(c: CentreView, today: IsoDate) {
  const from = addDays(today, -((new Date(today).getUTCDay() + 6) % 7)), to = addDays(from, 34)
  const days = Array.from({ length: 35 }, (_, i) => addDays(from, i))
  const shutOn = (d: string) => c.shut.some(s => s.start <= d && d <= s.end)
  const inView = c.shut.some(s => s.start <= to && s.end >= from)
  // A calendar that is all red says less than the one row under it.
  const allShut = c.shut.some(s => s.start <= from && s.end >= to)
  const cells = days.map((d, i) => {
    const [, m = 1, n = 1] = d.split('-').map(Number)
    const cls = ['cal-d', shutOn(d) && 'shut', !shutOn(d) && !c.known.includes(quarterKey(d)) && 'tbc', d < today && 'past', d === today && 'now', (i === 0 || n === 1) && 'm'].filter(Boolean).join(' ')
    const face = `${i === 0 || n === 1 ? `<b>${monthShort(m)}</b>` : ''}${n}`
    return d < today ? `<span class="${cls}" aria-hidden="true">${face}</span>` : `<button class="${cls}" data-day="${d}" aria-pressed="false" aria-label="${esc(fmt(d))}">${face}</button>`
  }).join('')
  const notOut = c.known.length && days.some(d => !c.known.includes(quarterKey(d))) ? `<span><i class="tbc"></i>${t('notOut')}</span>` : ''
  const cal = !inView || allShut ? '' : `<div class="cal">${[...t('dow')].map(d => `<span class="cal-h" aria-hidden="true">${d}</span>`).join('')}${cells}</div>`
    + `<p class="cal-key"><span><i></i>${t('shutKey')}</span><span><i class="now"></i>${t('today')}</span>${notOut}</p><p class="cal-ans" id="cal-ans" aria-live="polite">${t('tapDay')}</p>`
  const rows = c.shut.map(s => {
    const now = s.start <= today, back = addDays(s.end, 1)
    const sub = now ? t('since')(fmt(s.start), fmt(back)) : t('range')(fmt(s.start), fmt(s.end))
    const right = now ? t('more')(span(diffDays(back, today))) : span(diffDays(s.end, s.start) + 1)
    return `<li class="brow s-closed"><span class="bline"><span class="bdot"></span><span><span class="bn"><span>${t('shut')[s.kind]}</span></span><span class="bsub">${esc(sub)}</span></span><span class="bwhen">${esc(right)}</span></span></li>`
  }).join('')
  // A quarter already inside a long closure has nothing to confirm.
  const y = today.slice(0, 4), q = Math.ceil(Number(today.slice(5, 7)) / 3)
  const qSpan = (n: number) => [`${y}-${String(n * 3 - 2).padStart(2, '0')}-01`, `${y}-${['03-31', '06-30', '09-30', '12-31'][n - 1]}`] as const
  const tbc = c.tbc.filter(n => n >= q && !c.shut.some(s => s.start <= qSpan(n)[0] && s.end >= qSpan(n)[1]))
  const tbcLine = tbc.length ? `<p class="bhint">${esc(t('tbc')(tbc.map(n => `Q${n}`), y))}</p>` : ''
  const none = c.shut.length ? (inView ? '' : `<p class="bhint">${t('noneSoon')}</p>`) : `<p class="bhint">${t('noneAfter')}</p>`
  return `<section class="sched"><h3 class="sec">${t('whenShutsH')}</h3>${cal}${none}${rows ? `<ol class="board">${rows}</ol>` : ''}${tbcLine}</section>`
}

// Open only where that quarter's cleaning dates are published; beyond them Uncle cannot say.
export function dayAnswer(c: CentreView, d: string): { k: 'ok' | 'no' | 'tbc'; text: string } {
  const s = c.shut.find(x => x.start <= d && d <= x.end)
  if (s) return { k: 'no', text: t('dayShut')(fmt(d), t('kindWord')[s.kind]) }
  return c.known.includes(quarterKey(iso(d))) ? { k: 'ok', text: t('dayOpen')(fmt(d)) } : { k: 'tbc', text: t('dayUnsure')(fmt(d)) }
}

// NEA's own photo, loaded from nea.gov.sg with a credit; nothing shows when a centre has none.
export const shot = (c: CentreView) => (c.photoUrl
  ? `<figure class="shot"><img src="${esc(c.photoUrl)}" alt="${esc(t('photoAlt')(c.name))}" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>${t('photo')}</figcaption></figure>`
  : '')

export function quiet(c: CentreView) {
  const r = c.remarks[0]
  const head = `${icon('info', 'i20')}<span class="qt">${esc(stallsLine(c))}${r && r.length <= 34 ? ` · ${esc(r)}` : ''}</span>`
  if (!r || r.length <= 34) return `<div class="quiet">${head}</div>`
  return `<details class="quiet"><summary>${head}<span class="more">${t('notice')}</span></summary><p>${esc(r)}</p></details>`
}

export const spotFig = (state: Spot, extra = '') => `<figure class="spot-fig">${spot(state)}<figcaption>${t('spots')[state]}</figcaption>${extra}</figure>`
export const stateCard = (state: Spot, sub: string) => `<div class="statecard">${spot(state)}<div>${t('spots')[state]}<p>${esc(sub)}</p></div></div>`
