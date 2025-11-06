const toggle = document.getElementById('toggle');
const showAll = document.getElementById('show-all');
const status = document.getElementById('status');

// Load saved state
chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
  toggle.checked = enabled;
  status.textContent = `Status: ${enabled ? 'Active' : 'Inactive'}`;
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ enabled });
  status.textContent = `Status: ${enabled ? 'Active' : 'Inactive'}`;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: enabled ? 'START' : 'STOP' });
  });
});

showAll.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'SHOW_ALL' });
  });
});
