// Background script for LaunchDarkly Helper

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with empty arrays if needed
  chrome.storage.sync.get(['users', 'orgs', 'recentFlags'], function(data) {
    if (!data.users) {
      chrome.storage.sync.set({ users: [] });
    }
    if (!data.orgs) {
      chrome.storage.sync.set({ orgs: [] });
    }
    if (!data.recentFlags) {
      chrome.storage.sync.set({ recentFlags: [] });
    }
  });
});

// Listen for navigation to LaunchDarkly flag pages to auto-capture flag names
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const match = tab.url.match(/https:\/\/app\.launchdarkly\.com\/projects\/[^\/]+\/flags\/([^\/\?]+)/);
    if (match && match[1]) {
      const flagName = match[1];
      
      // Add to recent flags
      chrome.storage.sync.get('recentFlags', function(data) {
        let recentFlags = data.recentFlags || [];
        
        // Remove the flag if it already exists to avoid duplicates
        recentFlags = recentFlags.filter(flag => flag !== flagName);
        
        // Add the new flag at the beginning
        recentFlags.unshift(flagName);
        
        // Limit to 30 recent flags
        if (recentFlags.length > 30) {
          recentFlags = recentFlags.slice(0, 30);
        }
        
        // Save the updated list
        chrome.storage.sync.set({ recentFlags });
      });
    }
  }
});