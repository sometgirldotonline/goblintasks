// background.js
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "blockPage" && sender.tab?.id) {
    const url = chrome.runtime.getURL("src/blocked.html") + `?${encodeURIComponent(msg.blockedDomain)}#${encodeURIComponent(msg.blockedTitle)}`;
    chrome.tabs.update(sender.tab.id, { url });
  }
});
