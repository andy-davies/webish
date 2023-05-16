// Saves options to chrome.storage
const saveOptions = () => {
    const username = document.getElementById('username').value;

  
    chrome.storage.sync.set(
      { userName: username },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.sync.get(
      { userName: "" },
      (items) => {
        document.getElementById('username').value = items.userName;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);