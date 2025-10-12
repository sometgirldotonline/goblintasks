serverURL = "https://localhost"
async function fetchWithSession(path) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({
      url: serverURL,
      name: "session"
    }, async (cookie) => {
      if (!cookie) {
        resolve("No session cookie found");
        return;
      }

      try {
        const res = await fetch(`${serverURL}${path}`, {
          method: "GET", // or "POST"
          headers: {
            "X-Session-Cookie": cookie.value,
            "Content-Type": "application/json"
          }
        });
        const data = await res.json();
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg)
  if (msg.type === "blockPage" && sender.tab?.id) {
    const url = chrome.runtime.getURL("src/blocked.html") +
      `?${encodeURIComponent(msg.blockedDomain)}#${encodeURIComponent(msg.blockedTitle)}`;
    chrome.tabs.update(sender.tab.id, { url });
  }
  else if (msg.type === "getDomains") {
    (async () => {
      try {
        const data = await fetchWithSession("/api/getBlockedSiteData");
        console.log(data);
        sendResponse({blocklist: data, unblocked: await fetchWithSession("/api/getUnblockedSitesNow")});
      } catch (error) {
        console.error(error);
        sendResponse({ error: error.message });
      }
    })();
    return true; // <-- Keep port open for async sendResponse
  }
  else if (msg.type === "purchaseUnblock") {
    console.log("Purchase unblock message received:", msg);
    (async () => {
      try {
        console.log("Fetching token...");
        let token = await fetchWithSession("/api/generateShortLivedVerytrustableToken");
        token = token.token;
        console.log("Token received, making purchase request...");
        let purchaseReq = await fetchWithSession(`/api/purchaseSiteUnblock?token=${token}&domain=${msg.domain}`);
        console.log("Purchase request completed:", purchaseReq);
        sendResponse(purchaseReq);
      }
      catch(error) {
        console.error("Error in purchaseUnblock:", error);
        sendResponse({"success":0,"why":"idfk man fuck meee"});
      }
    })();
    return true;
  }
});
