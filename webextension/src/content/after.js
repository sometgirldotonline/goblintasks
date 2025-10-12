// content script
let domains = [];
let unblocked = []
// Request initial domains
chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
  if (response) {
    domains = response.blocklist;
    unblocked = response.unblocked;
    console.log(domains, unblocked)
    handlePage();
  }
});

function handlePage() {
  const blocked = domains.filter(d => !unblocked.includes(d));

  console.log("Blocked domains:", blocked);
  const isBlocked = blocked.some(domain => {
    return location.hostname === domain || location.hostname.endsWith(`.${domain}`);
  });

  if (isBlocked) {
    console.log("Blocked:", location.hostname);

    const ytHosts = ["youtube.com", "youtube-nocookie.com"];
    if (ytHosts.some(h => location.hostname === h || location.hostname.endsWith(`.${h}`)) &&
        location.pathname.startsWith("/embed/")) {
      return;
    }

    chrome.runtime.sendMessage({
      type: "blockPage",
      blockedDomain: location.href,
      blockedTitle: document.title
    });
  }
}

