setTimeout(()=>{// content script
const blockedPatterns = [/facebook\.com/, /youtube\.com/, /youtube-nocookie\.com/];

if (blockedPatterns.some(r => r.test(location.href))) {
  if([/youtube\.com/, /youtube-nocookie\.com/].some(r => r.test(location.href)) && location.pathname.startsWith("/embed/")){
    return
  }
  chrome.runtime.sendMessage({ type: "blockPage", blockedDomain: location.href, blockedTitle: document.title });
}
}, 0)