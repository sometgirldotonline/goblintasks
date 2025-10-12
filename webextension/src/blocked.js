document.querySelector(".blockedFavicon").src = `https://www.google.com/s2/favicons?domain=${new URL(decodeURIComponent(window.location.search.substring(1))).hostname}&sz=128`
document.querySelector(".blockedTitle").textContent = decodeURIComponent(window.location.hash.substring(1))
bUrl = new URL(decodeURIComponent(window.location.search.substring(1)))
if (bUrl.hostname.endsWith("youtube.com") && bUrl.pathname.includes("watch")){
    document.querySelector(".distractFree").addEventListener("click", ()=>{
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
else{
    document.querySelector(".distractFree").remove()
}