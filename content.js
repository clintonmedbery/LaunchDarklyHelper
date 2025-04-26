// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "applyId") {
    applyIdToField(request.id, request.type);
  }
});

// Function to apply the ID to the appropriate field
function applyIdToField(id, type) {
  // First, try to click the Edit button
  const editButton = document.querySelector('button[data-test-id="edit-button"]');
  if (editButton) {
    editButton.click();
    
    // Give the UI a moment to update after clicking Edit
    setTimeout(() => {
      let inputSelector;
      
      // Choose the correct input selector based on type
      if (type === 'user') {
        inputSelector = 'input[aria-label="Search to find or add users"]';
      } else if (type === 'org') {
        inputSelector = 'input[aria-label="Search to find or add organizations"]';
      } else {
        console.error("LaunchDarkly Helper: Unknown ID type", type);
        return;
      }
      
      // Find the input field and populate it
      const input = document.querySelector(inputSelector);
      
      if (input) {
        // Focus the input
        input.focus();
        
        // Set the value
        input.value = id;
        
        // Dispatch events to trigger the input's change handlers
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Optional: press Enter to confirm selection
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      } else {
        console.error(`LaunchDarkly Helper: Cannot find the ${type} input field`);
      }
    }, 500); // 500ms delay to ensure the edit mode is active
  } else {
    console.error("LaunchDarkly Helper: Cannot find the edit button");
  }
}