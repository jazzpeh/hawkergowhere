import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import '@fontsource/plus-jakarta-sans/latin-800.css'
import '@fontsource/noto-sans-tamil/tamil-400.css'
import '@fontsource/noto-sans-tamil/tamil-600.css'
import '@fontsource/noto-sans-tamil/tamil-700.css'
import './style.css'
import { distanceKm } from './domain/status.ts'
import { todayInSingapore } from './domain/today.ts'
import type { IsoDate, Snapshot } from './domain/types.ts'
import { toView, type CentreView } from './domain/view-model.ts'
import { DISHES, LANGS, LOCALE, isLang, lang, setLang, setThisYear, t, type Lang } from './i18n.ts'
import { FOOD, icon, type Dish } from './ui/art.ts'
import type { Kind } from './ui/kind.ts'
import { boardRow, dayAnswer, dist, esc, fmt, goSign, kind, quiet, schedule, sheetAlt, sheetVerdict, short, shot, spotFig, stateCard, verdict } from './ui/parts.ts'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} is missing from index.html`)
  return el as T
}
const store = {
  get: (k: string) => { try { return localStorage.getItem(`hgw-${k}`) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(`hgw-${k}`, v) } catch { /* private mode: keep it for this visit only */ } },
}
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches
const NEAR = 6, PER_GROUP = 5, MATCHES = 8
const GROUPS: Kind[] = ['closed', 'soon', 'unknown', 'open']
const RANK: Record<Kind, number> = { closed: 0, soon: 1, unknown: 2, open: 3 }
const PICKS = ['maxwell-food-centre-kim-hua-market', 'old-airport-road-blk-51-51-old-airport-road-food-centre-and-shopping-mall', 'tiong-bahru-market']

type Point = { lat: number; lng: number }
const S = {
  today: todayInSingapore(),
  list: [] as CentreView[],
  here: null as Point | null,
  near: false,
  geo: 'idle' as 'idle' | 'locating' | 'ok' | 'far' | 'off',
  chope: new Set<string>(),
  filter: '',
  status: null as Kind | null,
  view: 'home' as 'home' | 'wall',
  rot: 0,
}
try {
  const v: unknown = JSON.parse(store.get('chope') ?? '[]')
  if (Array.isArray(v)) S.chope = new Set(v.filter((x): x is string => typeof x === 'string'))
} catch { /* a broken saved list starts empty */ }
const saveChope = () => store.set('chope', JSON.stringify([...S.chope]))

const byId = (id: string) => S.list.find(c => c.id === id)
const km = (c: Point) => (S.here ? distanceKm(S.here, c) : 0)
const nearest = (n: number) => [...S.list].sort((a, b) => km(a) - km(b)).slice(0, n)
function matches(q: string) {
  q = q.trim().toLowerCase()
  if (!q) return []
  return S.list.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q))
    .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q) || RANK[kind(a)] - RANK[kind(b)])
}
const count = (k: Kind) => S.list.filter(c => kind(c) === k).length
const inSG = (p: Point) => p.lat >= 1.15 && p.lat <= 1.48 && p.lng >= 103.6 && p.lng <= 104.1
const pickName = (c: CentreView) => short(c.name).replace(/ Blk.*$/, '').replace(/ (Food Centre|Market).*$/, '')

let toastT = 0
function toast(msg: string) {
  const el = $('toast')
  el.textContent = msg
  el.hidden = false
  clearTimeout(toastT)
  toastT = window.setTimeout(() => { el.hidden = true }, 2600)
}

/* location */
function getPos(): Promise<Point> {
  return new Promise((res, rej) => {
    if (!('geolocation' in navigator)) return rej(new Error('unavailable'))
    navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), rej, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 })
  })
}
async function findNear() {
  if (S.here) { S.near = true; renderHead(); renderBody(); return }
  S.geo = 'locating'; renderHead(); renderBody()
  try {
    const pos = await getPos()
    if (inSG(pos)) { S.here = pos; S.geo = 'ok'; S.near = true } else { S.here = null; S.geo = 'far'; S.near = false }
  } catch {
    S.geo = 'off'
  }
  S.filter = ''
  setView('home')
}

/* share + chope */
function shareText(c: CentreView) {
  const n = short(c.name), say = t('shareText'), s = c.status
  if (s.kind === 'closed') return say.closed(n, c.alt ? short(c.alt.name) : '')
  if (s.kind === 'closing-soon') return say.soon(n, fmt(s.closure.start))
  return s.kind === 'open' ? say.open(n) : say.unknown(n)
}
const centreLink = (c: CentreView) => `${location.origin}${location.pathname}#/c/${encodeURIComponent(c.id)}`
function tellKakis(c: CentreView) {
  const txt = `${shareText(c)} ${centreLink(c)}`
  const fallback = () => {
    const box = $('sh-copy'), ta = box.querySelector('textarea')
    if (!ta) return
    box.hidden = false; ta.value = txt; ta.focus(); ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { /* older browsers: the text stays selected */ }
    toast(t(ok ? 'copied' : 'selected'))
  }
  if (!navigator.clipboard) return fallback()
  navigator.clipboard.writeText(txt).then(() => toast(t('copied')), fallback)
}
function toggleChope(id: string) {
  if (S.chope.has(id)) S.chope.delete(id); else S.chope.add(id)
  saveChope()
  toast(t(S.chope.has(id) ? 'chopedToast' : 'unchoped'))
  renderBody()
}

/* home and See all */
const opts = (c: CentreView, near: boolean) => ({ ...(near ? { km: km(c) } : {}), choped: S.chope.has(c.id), q: S.filter })
const board = (rows: CentreView[], near = false) => (rows.length ? `<ol class="board">${rows.map(c => boardRow(c, opts(c, near))).join('')}</ol>` : '')
// A header per status, so no count hides behind a link; a long group ends in its own "See all".
const group = (k: Kind | 'chope', rows: CentreView[], n = rows.length) => `<h3 class="shelf-h bgrp"><span class="tag tag-${k}"></span>${esc(t('groups')[k])}<span class="n">${rows.length}</span></h3>${board(rows.slice(0, n))}`
  + (rows.length > n && k !== 'chope' ? `<button class="see-all" data-fk="${k}">${t('seeAllN')(rows.length)}${icon('arrow', 'i20')}</button>` : '')
const seeAll = (label: string) => `<button class="see-all" data-all>${label}${icon('arrow', 'i20')}</button>`

function renderHead() {
  const top = S.geo === 'locating' ? `<button class="btn btn-primary" disabled><span class="kl"></span>${t('finding')}</button>`
    : S.near && S.here ? `<div class="nearon">${icon('pin', 'i20')}<span>${t('showingNear')(NEAR)}</span><button class="btn btn-text" data-unnear>${t('reset')}</button></div>`
      : `<button class="btn btn-primary" data-near>${icon('pin', 'i20')}${t('near')}</button>`
  const closed = count('closed'), soon = count('soon')
  const name = LANGS.find(l => l[0] === lang())?.[1] ?? ''
  $('ahead').innerHTML = `<header class="top"><span class="lockup">${$('mark').innerHTML}<span class="wm">Hawker<b>GoWhere</b></span></span><button class="langbtn" data-langs aria-label="Language: ${name}">${icon('globe', 'i20')}${t('langBtn')}</button></header>`
    + `<div class="dayrow"><p class="today">${fmt(S.today)}</p><button class="langbtn tsbtn" data-ts aria-label="${t('textSize')}"><small>A</small>A+</button></div>`
    + `<p class="headline">${!closed && !soon ? t('nothing') : t('headline')(closed, soon, closed > 10)}</p>` + top
    + `<div class="search${S.filter ? ' filled' : ''}" id="asearch">${icon('search', 'i20')}<input id="aq" type="search" placeholder="${t('search')}" autocomplete="off" aria-label="${t('search')}" value="${esc(S.filter)}"><button class="clr" id="aclr" aria-label="${t('clear')}"><span>${icon('close')}</span></button>`
    + `<div class="sugg" id="asugg" hidden><b>${t('try')}</b><div class="chips">${PICKS.flatMap(id => { const c = byId(id); return c ? [`<button class="chip" data-open="${esc(c.id)}">${esc(pickName(c))}</button>`] : [] }).join('')}</div></div></div>`
  const q = $<HTMLInputElement>('aq'), sg = $('asugg')
  const syncSugg = () => { sg.hidden = !(document.activeElement === q && !q.value) }
  q.addEventListener('focus', syncSugg)
  q.addEventListener('blur', () => setTimeout(syncSugg, 150))
  q.addEventListener('input', () => { S.filter = q.value; $('asearch').classList.toggle('filled', !!S.filter); syncSugg(); renderBody() })
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const r = matches(q.value)[0]; if (r) { q.blur(); openInList(r) } }
    if (e.key === 'Escape') q.blur()
  })
  $('aclr').addEventListener('click', () => { q.value = ''; S.filter = ''; $('asearch').classList.remove('filled'); renderBody(); q.focus() })
}

function renderHomeBody() {
  const b = $('abody'), near = !!(S.near && S.here)
  if (S.filter) {
    const r = matches(S.filter)
    b.innerHTML = r.length ? board(r.slice(0, MATCHES)) + (r.length > MATCHES ? seeAll(t('seeAllMatches')(r.length)) : '') : spotFig('empty', `<p>${t('emptyHint')}</p>`)
    return
  }
  if (S.geo === 'locating') { b.innerHTML = spotFig('loading'); return }
  const ch = [...S.chope].flatMap(id => { const c = byId(id); return c ? [c] : [] })
  const [first, ...rest] = ch
  const top = first ? verdict(first, opts(first, near)) + board(rest, near) : `<p class="bhint">${t('chopeHint')}</p>`
  const tail = seeAll(t('seeAllCentres')(S.list.length)) + `<button class="btn btn-soft eat" data-eat>${icon('susan', 'i20')}${t('eat')}</button>`
  const geo = S.geo === 'far' ? stateCard('far', t('farSub')) : S.geo === 'off' ? `<p class="bhint" role="status">${t('geoOff')}</p>` : ''
  if (near) {
    const rows = nearest(NEAR + ch.length).filter(c => !S.chope.has(c.id)).slice(0, NEAR)
    b.innerHTML = top + `<h3 class="shelf-h bgrp">${icon('pin', 'i20')}${t('nearest')}</h3>` + board(rows, true) + tail
    return
  }
  const shut = GROUPS.slice(0, 2).map(k => [k, S.list.filter(c => kind(c) === k && !S.chope.has(c.id)).sort((a, c) => a.name.localeCompare(c.name))] as const).filter(g => g[1].length)
  b.innerHTML = top + geo + (shut.length ? shut.map(([k, r]) => group(k, r, PER_GROUP)).join('') : spotFig('good')) + tail
}

function renderWall() {
  let rows = S.filter ? matches(S.filter) : [...S.list]
  if (S.status) rows = rows.filter(c => kind(c) === S.status)
  const near = !!(S.near && S.here)
  if (near) rows.sort((a, b) => km(a) - km(b))
  else if (!S.filter) rows.sort((a, b) => Number(S.chope.has(b.id)) - Number(S.chope.has(a.id)) || RANK[kind(a)] - RANK[kind(b)] || a.name.localeCompare(b.name))
  const word = S.status ? t('word')[S.status] : ''
  $('wallhead').innerHTML = `<button class="xbtn" data-home aria-label="${t('backHome')}">${icon('back', 'i20')}</button><h2>${S.status ? t('countWord')(rows.length, word) : S.filter ? t('matches')(rows.length) : t('all')(rows.length)}</h2>`
  $('wallchip').innerHTML = S.status ? `<button class="showing" data-unfilter aria-label="${t('clearFilter')(word)}">${t('showing')(word)}<span class="x">${icon('close')}</span></button>` : ''
  const grouped = !near && !S.filter && !S.status
  const groups = [['chope', rows.filter(c => S.chope.has(c.id))] as const, ...GROUPS.map(k => [k, rows.filter(c => kind(c) === k && !S.chope.has(c.id))] as const)]
  $('wall').innerHTML = (grouped ? groups.filter(g => g[1].length).map(([k, r]) => group(k, r)).join('') : board(rows, near)) || spotFig('good')
}
const renderBody = () => (S.view === 'wall' ? renderWall() : renderHomeBody())
function setView(v: 'home' | 'wall') {
  S.view = v
  $('ahome').hidden = v !== 'home'
  $('awall').hidden = v !== 'wall'
  if (v === 'home') { S.status = null; renderHead() }
  renderBody()
  window.scrollTo(0, 0)
}

const replay = (el: Element | null, cls: string) => {
  if (REDUCED || !el) return
  el.classList.remove(cls)
  void (el as HTMLElement).offsetWidth
  el.classList.add(cls)
}
const tileOf = (id: string) => [...document.querySelectorAll<HTMLElement>('[data-tile]')].find(el => el.dataset.tile === id && el.offsetParent)
function openInList(c: CentreView) {
  const el = tileOf(c.id)
  el?.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' })
  setTimeout(() => openSheet(c), REDUCED || !el ? 0 : 350)
}
// "Go here" scrolls to the other centre's row, opening "See all" if home does not list it, then flashes and focuses it.
function goTo(c: CentreView) {
  let el = tileOf(c.id)
  if (!el) { S.filter = ''; S.status = null; setView('wall'); el = tileOf(c.id) }
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' })
  const target = el
  setTimeout(() => { replay(target, 'flash'); target.querySelector<HTMLElement>('.tile-hit')?.focus({ preventScroll: true }) }, REDUCED ? 0 : 400)
}

/* sheet: one centre in full, linked as #/c/<id> so it can be shared and the back button closes it */
const sheet = $('sheet')
const panel = sheet.querySelector<HTMLElement>('.panel') as HTMLElement
let sheetC: CentreView | null = null
let lastFocus: Element | null = null
const restoreFocus = () => { if (lastFocus instanceof HTMLElement && lastFocus.isConnected) lastFocus.focus({ preventScroll: true }) }
const centreHash = (c: CentreView) => `#/c/${encodeURIComponent(c.id)}`
function openSheet(c: CentreView, quietly = false) {
  if (!quietly) lastFocus = document.activeElement
  sheetC = c
  $('sh-name').textContent = c.name
  const addr = c.remarks.includes(c.address) ? '' : c.address
  const sub = $('sh-addr')
  sub.textContent = [addr, S.here ? t('fromYou')(dist(km(c))) : ''].filter(Boolean).join(' · ')
  sub.hidden = !sub.textContent
  $('sh-hero').innerHTML = sheetVerdict(c) + (c.alt && byId(c.alt.id) ? sheetAlt(c) : '')
  $('sh-note').innerHTML = schedule(c, S.today)
  $('sh-rem').innerHTML = quiet(c) + shot(c)
  const ch = $('sh-chope'), on = S.chope.has(c.id)
  ch.setAttribute('aria-pressed', String(on))
  ch.innerHTML = icon(on ? 'tissueOn' : 'tissue', 'i20') + esc(t(on ? 'chopedBtn' : 'chope'))
  if (quietly) return
  $('sh-copy').hidden = true
  sheet.hidden = false
  panel.scrollTop = 0
  panel.focus({ preventScroll: true })
  if (location.hash !== centreHash(c)) history.pushState(null, '', centreHash(c))
}
function closeSheet() {
  if (sheet.hidden) return
  sheet.hidden = true
  if (location.hash.startsWith('#/c/')) history.replaceState(null, '', `${location.pathname}${location.search}`)
  restoreFocus()
}
function route() {
  const id = decodeURIComponent(location.hash.match(/^#\/c\/(.+)$/)?.[1] ?? '')
  const c = id ? byId(id) : undefined
  if (c) openSheet(c)
  else if (!sheet.hidden) { sheet.hidden = true; restoreFocus() }
}
window.addEventListener('popstate', route)

sheet.addEventListener('click', e => {
  const target = e.target as Element
  if (!sheetC) return
  if (target.closest('[data-close]')) { closeSheet(); return }
  if (target.closest('#goalt')) { const alt = sheetC.alt && byId(sheetC.alt.id); closeSheet(); if (alt) goTo(alt); return }
  if (target.closest('#sh-chope')) {
    toggleChope(sheetC.id); openSheet(sheetC, true); replay($('sh-chope'), 'pop')
    try { navigator.vibrate?.(12) } catch { /* not every phone allows it */ }
    return
  }
  const dayBtn = target.closest<HTMLElement>('[data-day]')
  if (dayBtn?.dataset.day) {
    const a = dayAnswer(sheetC, dayBtn.dataset.day), ans = $('cal-ans')
    sheet.querySelectorAll('[data-day][aria-pressed=true]').forEach(b => b.setAttribute('aria-pressed', 'false'))
    dayBtn.setAttribute('aria-pressed', 'true')
    ans.textContent = a.text
    ans.className = `cal-ans ${a.k}`
    return
  }
  if (target.closest('#sh-share')) tellKakis(sheetC)
})
// Drag the sheet down by its handle or header to close it, as on a phone.
let pull: { y: number; id: number; dy: number } | null = null
panel.addEventListener('pointerdown', e => {
  const target = e.target as Element
  if (panel.scrollTop > 0 || !target.closest('.handle, .sh-head') || target.closest('button')) return
  pull = { y: e.clientY, id: e.pointerId, dy: 0 }
  panel.setPointerCapture(e.pointerId)
  panel.style.transition = 'none'
})
panel.addEventListener('pointermove', e => {
  if (!pull || e.pointerId !== pull.id) return
  pull.dy = Math.max(0, e.clientY - pull.y)
  panel.style.transform = `translateY(${pull.dy}px)`
})
const endPull = (e: PointerEvent) => {
  if (!pull || e.pointerId !== pull.id) return
  const close = pull.dy > 90
  pull = null
  panel.style.transition = REDUCED ? 'none' : 'transform .2s ease-out'
  panel.style.transform = close ? 'translateY(100%)' : ''
  if (close) setTimeout(() => { closeSheet(); panel.style.transform = ''; panel.style.transition = '' }, REDUCED ? 0 : 200)
}
panel.addEventListener('pointerup', endPull)
panel.addEventListener('pointercancel', endPull)

/* Eat where ah? */
const WHEEL: Dish[] = ['chickenRice', 'laksa', 'satay', 'nasiLemak', 'prata', 'thosai', 'kayaToast', 'iceKachang', 'meeRebus']
const STEP = 360 / WHEEL.length
const susan = $('susan') as unknown as SVGSVGElement
susan.innerHTML = '<circle cx="120" cy="120" r="120" class="f-soft2"/>' + WHEEL.map((f, i) => `<g transform="rotate(${i * STEP} 120 120)"><circle cx="120" cy="33" r="27" class="f-paper"/><svg x="98" y="11" width="44" height="44" viewBox="0 0 48 48">${FOOD[f]()}</svg></g>`).join('')
  + `<circle cx="120" cy="120" r="34" class="f-soft"/><svg x="96" y="96" width="48" height="48" viewBox="0 0 48 48">${FOOD.tehTarik()}</svg>`
const angleNow = () => {
  const m = getComputedStyle(susan).transform
  if (!m || m === 'none') return 0
  const v = new DOMMatrixReadOnly(m)
  return (Math.atan2(v.b, v.a) * 180) / Math.PI
}
const setRot = (deg: number, ms: number, ease = 'cubic-bezier(.15,.6,.25,1)') => {
  susan.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none'
  susan.style.transform = `rotate(${deg}deg)`
}
const closeModal = (id: string) => { $(id).hidden = true; restoreFocus() }
function eatWhere() {
  lastFocus = document.activeElement
  const spin = $('spin'), act = $('spinact')
  let pool = S.list.filter(c => c.status.kind === 'open')
  pool = S.here ? [...pool].sort((a, b) => km(a) - km(b)).slice(0, 8) : [...pool].sort(() => Math.random() - 0.5).slice(0, 12)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  if (!pick) return
  let done = false, to = 0
  const land = () => {
    if (done) return
    done = true; clearTimeout(to)
    const a = REDUCED ? -Math.floor(Math.random() * WHEEL.length) * STEP : angleNow()
    const i = ((Math.round(-a / STEP) % WHEEL.length) + WHEEL.length) % WHEEL.length
    const off = ((((-(i * STEP) - a) % 360) + 540) % 360) - 180
    setRot(a, 0); void susan.getBoundingClientRect()
    S.rot = a + off; setRot(S.rot, REDUCED ? 0 : 260, 'ease-out')
    const dish = $('dish')
    dish.textContent = t('craving')(DISHES[lang()][i] ?? '')
    if (!REDUCED) dish.animate([{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)' })
    const quips = t('quips')
    $('quip').textContent = quips[Math.floor(Math.random() * quips.length)] ?? ''
    act.innerHTML = goSign({ label: t('hunt'), name: short(pick.name), meta: `${t('openToday')}${S.here ? ` · ${dist(km(pick))}` : ''}`, attr: 'data-act="show"' })
      + `<div class="acts"><button class="btn btn-soft" data-act="again">${icon('susan', 'i20')}${t('again')}</button><button class="btn btn-soft" data-act="close">${t('close')}</button></div>`
    act.hidden = false
    act.querySelector<HTMLElement>('.go-sign')?.focus({ preventScroll: true })
  }
  spin.hidden = false; act.hidden = true; $('dish').textContent = ''; $('quip').textContent = t('tapStop')
  spin.onclick = e => {
    e.stopPropagation()
    if (!done) { land(); return }
    const b = (e.target as Element).closest<HTMLElement>('[data-act]')
    if (!b) { if (e.target === spin) closeModal('spin'); return }
    if (b.dataset.act === 'again') eatWhere()
    else { spin.hidden = true; if (b.dataset.act === 'show') openInList(pick); else closeModal('spin') }
  }
  if (REDUCED) { land(); return }
  setRot(S.rot, 0); void susan.getBoundingClientRect()
  setRot(S.rot + 900 + Math.random() * 360, 1500)
  to = window.setTimeout(land, 1550)
}

/* language: chosen once on first open, kept on the phone, changed from the header button */
let langChosen = false
function applyStatic() {
  document.documentElement.lang = LOCALE[lang()]
  $('sh-share').innerHTML = icon('share', 'i20') + esc(t('share'))
  $('disclaim').textContent = t('disclaimer')
  $('sh-copy-l').textContent = t('copyLabel')
  $('sh-x').setAttribute('aria-label', t('close'))
  $('spinh').textContent = t('eatTitle')
  const loading = document.getElementById('loading')
  if (loading) loading.textContent = t('loading')
}
function openLangs() {
  lastFocus = document.activeElement
  $('lang-list').innerHTML = LANGS.map(([l, n]) => `<button class="lang-opt" data-lang="${l}" lang="${l}" aria-current="${l === lang()}">${n}${icon('open')}</button>`).join('')
  $('langs').hidden = false
  $('lang-list').querySelector<HTMLElement>('[aria-current=true]')?.focus()
}
function chooseLang(l: Lang) {
  setLang(l); langChosen = true; store.set('lang', l)
  applyStatic()
  $('langs').hidden = true
  if (!S.list.length) return
  if (S.view === 'wall') renderHead()
  setView(S.view)
  if (!sheet.hidden && sheetC) openSheet(sheetC, true)
  renderFooter()
}
$('langs').addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('[data-lang]')
  if (b && isLang(b.dataset.lang)) chooseLang(b.dataset.lang)
})

/* text size: A+ steps through three sizes, kept on the phone */
const TS = ['A', 'A+', 'A++']
let ts = Math.min(2, Math.max(0, Number(store.get('ts')) || 0))
const applyTs = () => { document.documentElement.dataset.textSize = String(ts) }

document.addEventListener('click', e => {
  const target = e.target as Element
  if (target.closest('[data-langs]')) { openLangs(); return }
  if (target.closest('[data-ts]')) {
    ts = (ts + 1) % 3; applyTs(); store.set('ts', String(ts))
    toast(`${t('textSize')}: ${TS[ts]}`)
    return
  }
  if (target.closest('[data-eat]')) { eatWhere(); return }
  if (!target.closest('.app')) return
  const open = target.closest<HTMLElement>('[data-open]')
  if (open?.dataset.open) { const c = byId(open.dataset.open); if (c) openInList(c); return }
  const go = target.closest<HTMLElement>('[data-go]')
  if (go?.dataset.go) { const c = byId(go.dataset.go); if (c) goTo(c); return }
  if (target.closest('[data-near]')) { void findNear(); return }
  const fk = target.closest<HTMLElement>('[data-fk]')
  if (fk?.dataset.fk && (GROUPS as string[]).includes(fk.dataset.fk)) { S.status = fk.dataset.fk as Kind; setView('wall'); return }
  if (target.closest('[data-all]')) { S.status = null; setView('wall'); return }
  if (target.closest('[data-home]')) { S.filter = ''; setView('home'); return }
  if (target.closest('[data-unfilter]')) { S.status = null; renderBody(); return }
  if (target.closest('[data-unnear]')) { S.near = false; renderHead(); renderBody(); return }
  const row = target.closest<HTMLElement>('.tile-hit')
  if (row?.dataset.id) { const c = byId(row.dataset.id); if (c) openSheet(c) }
})
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return
  if (!$('langs').hidden) { if (langChosen) closeModal('langs') }
  else if (!$('spin').hidden) closeModal('spin')
  else closeSheet()
})

let fetchedAt = ''
function renderFooter() {
  const sgTime = new Intl.DateTimeFormat(LOCALE[lang()], { timeZone: 'Asia/Singapore', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  $('asof').textContent = fetchedAt ? t('asOf')(sgTime.format(new Date(fetchedAt))) : ''
}

async function loadSnapshot(): Promise<Snapshot> {
  const res = await fetch('./data/centres.json', { cache: 'no-cache' })
  if (!res.ok) throw new Error(`centres.json: HTTP ${res.status}`)
  return (await res.json()) as Snapshot
}

const saved = store.get('lang')
if (isLang(saved)) { setLang(saved); langChosen = true }
applyTs()
applyStatic()
if (!langChosen) openLangs()
try {
  const snapshot = await loadSnapshot()
  setThisYear(Number(S.today.slice(0, 4)))
  S.list = toView(snapshot.centres, S.today as IsoDate)
  fetchedAt = snapshot.fetchedAt
  renderFooter()
  setView('home')
  route()
} catch (err) {
  console.error(err)
  const box = $('error')
  box.hidden = false
  box.textContent = t('loadFail')
} finally {
  $('loading').remove()
}
