// content script
let domains = [];
let unblocked = []
// Request initial domains
chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
  if (response) {
    domains = response.blocklist;
    unblocked = response.unblocked;
    console.log(domains, unblocked)
    chrome.runtime.sendMessage({ type: "getEndOfWP" }, (response) => {
      const wpEnd = response;
      if(wpEnd == null){

      }
      else if (!wpEnd || Date.now() > wpEnd) {
      } else {
        handlePage();
      }
    })
  }
});

function handlePage() {
  let blockedPatterns = [];
  console.log(domains);
  domains.forEach((domain) => {
    console.log(unblocked.includes(domain.domain))
    if (unblocked.includes(domain.domain)) {
    }
    else {
      blockedPatterns.push(new RegExp(`(^|\\.)${domain.domain.replace(/\./g, '\\.')}$`))
    }
  })
  console.log(blockedPatterns)
  if (blockedPatterns.some(r => r.test(location.hostname))) {
    console.log("WOOP WOOP DATS DA SOUND OF DA POLICE YOU NEED TO WORK")
    // let people listen to music broo
    if (location.hostname == "music.youtube.com") {
      return
    }
    // Allow YouTube embeds
    if ([/youtube\.com/, /youtube-nocookie\.com/].some(r => r.test(location.href)) &&
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