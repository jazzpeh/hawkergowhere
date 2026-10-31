import pathlib

here = pathlib.Path(__file__).resolve().parent
out = here / 'out'
tpl = (here / 'page.html').read_text()
data = (out / 'data.js').read_text().strip()
assert data.startswith('window.DATA = '), 'run make-data.ts first'
i18n = (here / 'i18n.js').read_text().strip()
mark = (here.parent / 'brand' / 'mark.svg').read_text().strip()
mark = mark.replace(' xmlns="http://www.w3.org/2000/svg"', '').replace(' role="img" aria-label="HawkerGoWhere"', ' aria-hidden="true"')
page = tpl.replace('/*@DATA@*/', data).replace('/*@I18N@*/', i18n).replace('<!--@MARK@-->', mark)
assert '@DATA@' not in page and '@I18N@' not in page and '@MARK@' not in page
(out / 'uncle-says-closed.html').write_text(page)
# Local preview needs a document skeleton; the artifact host adds its own.
(out / 'preview.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + page + '</body></html>')
print(out / 'uncle-says-closed.html', len(page.encode()))
