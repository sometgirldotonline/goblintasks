serverURL = "https://localhost"
domains = []
thisDomain = null
document.querySelector(".blockedFavicon").src = `https://www.google.com/s2/favicons?domain=${new URL(decodeURIComponent(window.location.search.substring(1))).hostname}&sz=128`
document.querySelector(".blockedTitle").textContent = decodeURIComponent(window.location.hash.substring(1))
bUrl = new URL(decodeURIComponent(window.location.search.substring(1)))
if (bUrl.hostname.endsWith("youtube.com") && bUrl.pathname.includes("watch")) {
    document.querySelector(".distractFree").addEventListener("click", () => {
        const urlParams = new URLSearchParams(bUrl.search);
        const videoId = urlParams.get('v');
        const embedParams = new URLSearchParams({
            rel: '0',
            modestbranding: '1',
            controls: '1'
        });

        // Preserve time parameter if it exists
        if (urlParams.has('t')) {
            embedParams.set('start', urlParams.get('t').replace('s', ''));
        }

        location.href = `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`;
    })
}
else {
    document.querySelector(".distractFree").remove()
}

document.querySelector(".buyUnblock").onclick = function () {
    if (confirm(`Would you like to unblock ${thisDomain.domain} for 15 minutes? It will cost you $${thisDomain.unblockCost}`)) {
        chrome.runtime.sendMessage({ type: "purchaseUnblock", domain: thisDomain.domain }, (response) => {
            if (response) {
                console.log(response)
            }
        })
    }
}

chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
    if (response) {
        domains = response.blocklist;
        domains.forEach((domain) => {
            if (bUrl.hostname.includes(domain.domain)) {
                console.log("D")
                document.querySelector(".buyUnblock").innerText = `Purchase Unblock ($${domain.unblockCost})`
                thisDomain = domain
            }
        })
    }
});