document.addEventListener('DOMContentLoaded', function() {
  // Tab handling
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and tab contents
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      const tabName = tab.getAttribute('data-tab');
      tab.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
  
  // Load saved data
  loadUserData();
  loadOrgData();
  loadRecentFlags();
  
  // Add event listeners for adding new items
  document.getElementById('add-user').addEventListener('click', addUser);
  document.getElementById('add-org').addEventListener('click', addOrg);
  
  // Feature flag navigation event listeners
  document.getElementById('quick-go-to-flag').addEventListener('click', navigateToFlagQuick);
  document.getElementById('go-to-selected-flag').addEventListener('click', navigateToSelectedFlag);
  document.getElementById('clear-recent-flags').addEventListener('click', clearRecentFlags);
  
  // Handle double-click on recent flags list
  document.getElementById('recent-flags-select').addEventListener('dblclick', navigateToSelectedFlag);
  
  // Handle Enter key in input field
  document.getElementById('quick-flag-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      navigateToFlagQuick();
    }
  });
});

// Load user data from storage
function loadUserData() {
  chrome.storage.sync.get('users', function(data) {
    const users = data.users || [];
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    if (users.length === 0) {
      userList.innerHTML = '<p>No users added yet.</p>';
      return;
    }
    
    users.forEach((user, index) => {
      const userEntry = document.createElement('div');
      userEntry.className = 'entry';
      userEntry.innerHTML = `
        <div>
          <strong>${user.name}</strong> 
          <small>(${user.id})</small>
        </div>
        <div class="entry-buttons">
          <button class="apply-btn" data-id="${user.id}">Apply</button>
          <button class="delete-btn" data-index="${index}" data-type="user">Delete</button>
        </div>
      `;
      userList.appendChild(userEntry);
    });
    
    // Add event listeners for apply buttons
    document.querySelectorAll('#user-list .apply-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        applyId(id, 'user');
      });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('#user-list .delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        deleteUser(index);
      });
    });
  });
}

// Load organization data from storage
function loadOrgData() {
  chrome.storage.sync.get('orgs', function(data) {
    const orgs = data.orgs || [];
    const orgList = document.getElementById('org-list');
    orgList.innerHTML = '';
    
    if (orgs.length === 0) {
      orgList.innerHTML = '<p>No organizations added yet.</p>';
      return;
    }
    
    orgs.forEach((org, index) => {
      const orgEntry = document.createElement('div');
      orgEntry.className = 'entry';
      orgEntry.innerHTML = `
        <div>
          <strong>${org.name}</strong> 
          <small>(${org.id})</small>
        </div>
        <div class="entry-buttons">
          <button class="apply-btn" data-id="${org.id}">Apply</button>
          <button class="delete-btn" data-index="${index}" data-type="org">Delete</button>
        </div>
      `;
      orgList.appendChild(orgEntry);
    });
    
    // Add event listeners for apply buttons
    document.querySelectorAll('#org-list .apply-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        applyId(id, 'org');
      });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('#org-list .delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        deleteOrg(index);
      });
    });
  });
}

// Add a new user
function addUser() {
  const nameInput = document.getElementById('new-user-name');
  const idInput = document.getElementById('new-user-id');
  
  const name = nameInput.value.trim();
  const id = idInput.value.trim();
  
  if (!name || !id) {
    alert('Please enter both a name and ID');
    return;
  }
  
  chrome.storage.sync.get('users', function(data) {
    const users = data.users || [];
    users.push({ name, id });
    
    chrome.storage.sync.set({ users }, function() {
      // Clear inputs
      nameInput.value = '';
      idInput.value = '';
      
      // Reload the list
      loadUserData();
    });
  });
}

// Add a new organization
function addOrg() {
  const nameInput = document.getElementById('new-org-name');
  const idInput = document.getElementById('new-org-id');
  
  const name = nameInput.value.trim();
  const id = idInput.value.trim();
  
  if (!name || !id) {
    alert('Please enter both a name and ID');
    return;
  }
  
  chrome.storage.sync.get('orgs', function(data) {
    const orgs = data.orgs || [];
    orgs.push({ name, id });
    
    chrome.storage.sync.set({ orgs }, function() {
      // Clear inputs
      nameInput.value = '';
      idInput.value = '';
      
      // Reload the list
      loadOrgData();
    });
  });
}

// Delete a user
function deleteUser(index) {
  chrome.storage.sync.get('users', function(data) {
    const users = data.users || [];
    users.splice(index, 1);
    
    chrome.storage.sync.set({ users }, function() {
      loadUserData();
    });
  });
}

// Delete an organization
function deleteOrg(index) {
  chrome.storage.sync.get('orgs', function(data) {
    const orgs = data.orgs || [];
    orgs.splice(index, 1);
    
    chrome.storage.sync.set({ orgs }, function() {
      loadOrgData();
    });
  });
}

// Apply the ID to the LaunchDarkly page
function applyId(id, type) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyId", id: id, type: type });
  });
}

// Load recent flags from storage
function loadRecentFlags() {
  chrome.storage.sync.get('recentFlags', function(data) {
    const recentFlags = data.recentFlags || [];
    const selectElement = document.getElementById('recent-flags-select');
    selectElement.innerHTML = '';
    
    if (recentFlags.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'No recent flags';
      option.disabled = true;
      selectElement.appendChild(option);
      return;
    }
    
    recentFlags.forEach(flag => {
      const option = document.createElement('option');
      option.value = flag;
      option.textContent = flag;
      selectElement.appendChild(option);
    });
  });
}


// Quick navigation to feature flag
function navigateToFlagQuick() {
  const quickFlagInput = document.getElementById('quick-flag-input');
  const rawFlagName = quickFlagInput.value.trim();
  
  if (!rawFlagName) {
    alert('Please enter a feature flag name');
    return;
  }
  
  // Clean the flag name - remove any query parameters or trailing slashes
  const flagName = rawFlagName.split('?')[0].split('/')[0].trim();
  
  // Add to recent flags
  addToRecentFlags(flagName);
  
  // Navigate to flag page
  const url = `https://app.launchdarkly.com/projects/default/flags/${flagName}`;
  chrome.tabs.create({ url: url });
  
  // Clear the input
  quickFlagInput.value = '';
}

// Navigate to the selected flag from the dropdown
function navigateToSelectedFlag() {
  const selectElement = document.getElementById('recent-flags-select');
  const selectedFlag = selectElement.value;
  
  if (!selectedFlag) {
    alert('Please select a feature flag');
    return;
  }
  
  // Navigate to flag page
  const url = `https://app.launchdarkly.com/projects/default/flags/${selectedFlag}`;
  chrome.tabs.create({ url: url });
}

// Add a flag to the recent flags list
function addToRecentFlags(flagName) {
  // Clean the flag name - remove any query parameters or trailing slashes
  const cleanFlagName = flagName.split('?')[0].split('/')[0].trim();
  
  if (!cleanFlagName) return;
  
  chrome.storage.sync.get('recentFlags', function(data) {
    let recentFlags = data.recentFlags || [];
    
    // Remove the flag if it already exists to avoid duplicates
    recentFlags = recentFlags.filter(flag => flag !== cleanFlagName);
    
    // Add the new flag at the beginning
    recentFlags.unshift(cleanFlagName);
    
    // Limit to 30 recent flags
    if (recentFlags.length > 30) {
      recentFlags = recentFlags.slice(0, 30);
    }
    
    // Save the updated list
    chrome.storage.sync.set({ recentFlags }, function() {
      // Reload the list
      loadRecentFlags();
    });
  });
}

// Clear the recent flags list
function clearRecentFlags() {
  if (confirm('Are you sure you want to clear your flag history?')) {
    chrome.storage.sync.set({ recentFlags: [] }, function() {
      loadRecentFlags();
    });
  }
}