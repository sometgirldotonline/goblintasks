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


let hBox = document.querySelector("#hours");
let mBox = document.querySelector("#mins");

function updateWpStat() {
    chrome.storage.local.get(["wpEnd"]).then((result) => {
        const wpEnd = result.wpEnd;

        const statusEl = document.querySelector(".wpStat");

        if (!wpEnd || Date.now() > wpEnd) {
            statusEl.innerText = `Not active.`;
            document.body.setAttribute("class", "wpStopped");
        } else {
            document.body.setAttribute("class", "wpRunning");

            const remainingMs = wpEnd - Date.now();
            const remainingMins = Math.floor(remainingMs / 60000);
            const hours = Math.floor(remainingMins / 60);
            const minutes = remainingMins % 60;

            statusEl.innerText = `Active. ${hours}h ${minutes}m remain.`;
        }
    });
}

document.querySelector(".startBtn").addEventListener("click", () => {
    const hours = parseInt(hBox.value) || 0;
    const minutes = parseInt(mBox.value) || 0;

    const totalSeconds = (hours * 3600) + (minutes * 60);
    const totalMs = totalSeconds * 1000;
    const endTime = Date.now() + totalMs;

    alert(`Hours: ${hours}
Minutes: ${minutes}
Seconds Total: ${totalSeconds}
Current Timestamp: ${Date.now()}
Ends Timestamp: ${endTime}`);

    chrome.storage.local.set({ wpEnd: endTime }, updateWpStat);
});

document.querySelector(".stopBtn").addEventListener("click", async () => {
    if (confirm("Are you sure you'd like to stop the Work period early? This will cost 10 coins.")) {
        try {
            console.log("Fetching token...");
            let token = await fetchWithSession("/api/generateShortLivedVerytrustableToken");
            token = token.token;
            console.log("Token received, making purchase request...");
            let purchaseReq = await fetchWithSession(`/api/makePurchase?token=${token}&name=Early End of Work Period&type=1&cost=-10`);
            console.log("Purchase request completed:", purchaseReq);
            if (purchaseReq.success == 1) {
                alert("Payment successful")
                chrome.storage.local.remove(["wpEnd"])
                updateWpStat()
            }
            else {
                alert(purchaseReq.why || "An unknown error occured")
            }
        }
        catch (error) {
            console.error("Error in purchaseEarlyEnd:", error);
            alert(error)
        }

    }
})


updateWpStat();