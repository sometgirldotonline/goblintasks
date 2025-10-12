// this code will bind the modifyDOM function to the btnShowOrangeDiv click event
document.getElementById('btnShowOrangeDiv').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: modifyDOM
    });
  });
});

// this code will be executed when the button btnShowOrangeDiv is clicked
function modifyDOM() {
  const version = chrome.runtime.getManifest().version;

}
