'use strict';
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('navigation');
function closeMenu(restoreFocus = false) {
  menu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '+';
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMenu(); });

const tabGroup = document.querySelector('.sample-tabs');
if (tabGroup) {
  const tabs = [...tabGroup.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) target = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activate(tabs[target], true); }
    });
  });
}

const form = document.getElementById('enquiry-form');
if (form) {
  const service = document.getElementById('service');
  const output = document.getElementById('output');
  const review = document.getElementById('brief-review');
  const status = document.getElementById('brief-status');
  const labels = { inspection: 'Vessel and asset inspection', operations: 'Operations and MWS support', imagery: 'Commercial and project imagery', other: 'Help me define the scope' };
  const outputLabels = { inspection: 'Visual evidence package', operations: 'Operation record and timeline', imagery: 'Commercial photography and video', other: 'To be agreed' };
  function setOutput() { if (outputLabels[service.value]) output.value = outputLabels[service.value]; }
  const selected = new URLSearchParams(window.location.search).get('service');
  if (Object.hasOwn(labels, selected)) { service.value = selected; setOutput(); }
  service.addEventListener('change', setOutput);
  let brief = '';
  form.querySelector('button[type="submit"]').disabled = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = key => String(data.get(key) || '').trim();
    if (!value('location') || !value('asset') || !value('objective')) {
      for (const key of ['location', 'asset', 'objective']) {
        const field = document.getElementById(key);
        field.setCustomValidity(value(key) ? '' : 'Please enter a short description.');
        if (!value(key)) { field.reportValidity(); field.focus(); break; }
      }
      return;
    }
    brief = [
      'AIR MARINE Drone Services | KEELCORE', 'PROJECT DISCUSSION BRIEF', '',
      'Service: ' + labels[value('service')],
      'Location or region: ' + value('location'),
      'Asset or operation: ' + value('asset'), '',
      'OBJECTIVE', value('objective'), '',
      'Indicative timing: ' + (value('timing') || 'To be agreed'),
      'Preferred output: ' + value('output'),
      'Intended reviewer or audience: ' + (value('reviewer') || 'To be agreed'), '',
      'TO AGREE BEFORE THE MISSION',
      '- Scope, areas of interest and coverage',
      '- Pilot success criteria and intended reviewer',
      '- Access, permissions and operating conditions',
      '- Equipment, personnel, specialist partners and approvals as applicable',
      '- Responsibilities, output format, usage rights and retention',
      '- Mobilisation, schedule and commercial terms', '',
      'Prepared using the AIR MARINE beta website.',
      'This is a local preparation document, not a submitted request or confirmed service.'
    ].join('\n');
    document.getElementById('brief-content').textContent = brief;
    form.hidden = true;
    review.hidden = false;
    status.textContent = '';
    document.getElementById('review-title').focus();
    review.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  ['location', 'asset', 'objective'].forEach(id => document.getElementById(id).addEventListener('input', event => event.target.setCustomValidity('')));
  document.getElementById('edit-brief').addEventListener('click', () => {
    review.hidden = true; form.hidden = false; service.focus();
  });
  document.getElementById('download-brief').addEventListener('click', () => {
    if (!brief) return;
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'AIR_MARINE_Project_Brief.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Your brief is ready to download. Nothing has been sent.';
  });
  document.getElementById('copy-brief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brief);
      status.textContent = 'Brief copied. You can paste it into your preferred message or document.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('brief-content'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Text selected. Use your device copy command, or download the brief.';
    }
  });
}
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
