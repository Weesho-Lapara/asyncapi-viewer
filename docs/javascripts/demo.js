// The live demo's document picker (docs/demo.md): one viewer, one snippet per document. Choosing
// a document shows its snippet and swaps the viewer's attributes in place; the viewer reloads
// because src changes. ?spec=<value> selects a document and is kept in the address bar.
function initDemo() {
  const select = document.getElementById('demo-spec');
  const viewer = document.getElementById('demo-viewer');
  if (!select || !viewer) return;
  // The build resolved src relative to this page ("../examples/orders-v3.yaml"); keep its folder.
  const initial = viewer.getAttribute('src');
  const folder = initial.slice(0, initial.lastIndexOf('/') + 1);
  let applied = JSON.parse(select.options[select.selectedIndex].dataset.attrs);

  function show(value) {
    const option = [...select.options].find((o) => o.value === value);
    if (!option) return;
    select.value = value;
    for (const block of document.querySelectorAll('[data-demo-spec]')) block.hidden = block.dataset.demoSpec !== value;
    const attrs = JSON.parse(option.dataset.attrs);
    for (const name of Object.keys(applied)) viewer.removeAttribute(name);
    for (const [name, v] of Object.entries(attrs)) viewer.setAttribute(name, v);
    viewer.setAttribute('src', folder + option.dataset.src);
    applied = attrs;
  }

  select.addEventListener('change', () => {
    show(select.value);
    const url = new URL(location.href);
    url.searchParams.set('spec', select.value);
    history.replaceState(history.state, '', url);
  });
  const requested = new URLSearchParams(location.search).get('spec');
  if (requested && requested !== select.value) show(requested);
}

// Material's instant navigation swaps pages without reloading scripts; document$ fires per page.
if (typeof document$ !== 'undefined') document$.subscribe(initDemo);
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDemo);
else initDemo();
