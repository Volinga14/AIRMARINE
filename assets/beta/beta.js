'use strict';
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('span').textContent = '+';
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('span').textContent = open ? '−' : '+';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu(); menuToggle.focus();
  }
});
window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
function initialiseTabs(selector) {
  const group = document.querySelector(selector);
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) target = (index + 1) % tabs.length;
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activate(tabs[target], true); }
    });
  });
}
initialiseTabs('.service-tabs');
initialiseTabs('.deliverable-tabs');
document.querySelectorAll('[data-pilot-service]').forEach(link => {
  link.addEventListener('click', () => { document.getElementById('service').value = link.dataset.pilotService; });
});
const form = document.getElementById('pilot-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const brief = [
    'AIR MARINE Drone Services | KEELCORE', 'PILOT DISCUSSION BRIEF — BETA', '',
    'Service line: ' + data.get('service'), 'Location or region: ' + data.get('location'),
    'Asset or operation: ' + data.get('asset'), '', 'Mission objective:', data.get('objective'), '',
    'Indicative timing: ' + (data.get('timing') || 'To be agreed'), 'Preferred output: ' + data.get('output'), '',
    'TO AGREE BEFORE THE PILOT', '- Scope, areas of interest and coverage',
    '- Pilot success criteria and reviewer', '- Permissions, access and operating conditions',
    '- Equipment, operator and technical partner requirements',
    '- Responsibilities, insurance and survey acceptance as applicable',
    '- Delivery format, metadata, image rights and retention', '- Commercial terms and mobilisation', '',
    'This is a preparation brief, not a submitted request or confirmed service.',
    'No class approval is claimed by AIR MARINE in this beta.'
  ].join('\n');
  const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url; download.download = 'AIR_MARINE_Pilot_Brief.txt';
  document.body.appendChild(download); download.click(); download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('form-status').textContent = 'Your discussion brief is ready. Nothing has been sent.';
});
document.getElementById('print-button').addEventListener('click', () => window.print());
form.querySelector('button[type="submit"]').disabled = false;
const conceptVideo = document.getElementById('concept-video');
const clipButtons = [...document.querySelectorAll('[data-video]')];
const clipLabels = ['a drone operator on deck', 'a vessel hull above the waterline', 'an offshore structure at sunset'];
clipButtons.forEach((button, index) => button.addEventListener('click', () => {
  conceptVideo.pause();
  conceptVideo.src = button.dataset.video;
  conceptVideo.poster = button.dataset.poster;
  conceptVideo.setAttribute('aria-label', 'Illustrative concept clip showing ' + clipLabels[index]);
  conceptVideo.load();
  clipButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('video-status').textContent = '';
}));
conceptVideo.addEventListener('error', () => {
  document.getElementById('video-status').textContent = 'The clip could not load. Please try another selection.';
});
