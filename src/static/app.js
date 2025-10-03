async function updateTaskState(id, state) {
    console.log(`Updating task ID: ${id}, State: ${state}`)
    try {
        const resp = await fetch(`/api/updateTaskState`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                id: id,
                state: state ? "1" : "0"
            })
        });
        if (!resp.ok) {
            throw new Error(`Server Sent Error: ${resp.status}`)
        }
        // this parser was rewritten by GPT because i have no clue
        var result = await resp.text();
        var [stateLine, selectorLine, coinsbalance, ...htmlLines] = result.split("\n");
        var stateString = stateLine.replace("$1$", "");
        var selector = selectorLine.replace("$", "");
        var innerHTML = htmlLines.join("\n");
        document.querySelector("#coinsBalanceValue").textContent = coinsbalance
        if (stateString) {
            document.querySelector(selector).innerHTML = innerHTML;
        }

        console.log('Update response:', result)
    }
    catch (error) {
        alert(error)
        console.error(error)
    }
}

async function addTask(ev) {
    ev.preventDefault()
    console.log(ev.srcElement)
    try {
        const atFetch = await fetch("https://gt.sometgirl.online/api/addTask", {
            "body": new URLSearchParams({
                taskName: ev.srcElement.taskName.value,
                taskValue: ev.srcElement.taskValue.value,
                dueBy: new Date(ev.srcElement.dueBy.value).getTime() / 1000,
            }),
            "method": "POST"
        });
        if (!atFetch.ok) {
            throw new Error(`Server Sent Error: ${atFetch.status}`)
        }
        // this parser was rewritten by GPT because i have no clue
        var result = await atFetch.text();
        var [stateLine, selectorLine, coinsbalance, ...htmlLines] = result.split("\n");
        var stateString = stateLine.replace("$1$", "");
        var selector = selectorLine.replace("$", "");
        var innerHTML = htmlLines.join("\n");
        document.querySelector("#coinsBalanceValue").textContent = coinsbalance
        if (stateString) {
            document.querySelector(selector).innerHTML = innerHTML;
        }

        console.log('Update response:', result)
    }
    catch (error) {
        alert(error)
        console.error(error)
    }
}

document.querySelector(".addTaskForm").addEventListener("submit", addTask)

async function deleteTask(id) {
    console.log(id)
    if (confirm(`Are you sure you want to delete:"${document.querySelector(`#task-${id} .tasktitle`).textContent}"?`)) {
        console.log(`Deletiing task ID: ${id}`)
        try {
            const resp = await fetch(`/api/deleteTask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id: id,
                })
            });
            if (!resp.ok) {
                throw new Error(`Server Sent Error: ${resp.status}`)
            }
            // this parser was rewritten by GPT because i have no clue
            var result = await resp.text();
            var [stateLine, selectorLine, coinsbalance, ...htmlLines] = result.split("\n");
            var stateString = stateLine.replace("$1$", "");
            var selector = selectorLine.replace("$", "");
            var innerHTML = htmlLines.join("\n");
            document.querySelector("#coinsBalanceValue").textContent = coinsbalance
            if (stateString) {
                document.querySelector(selector).innerHTML = innerHTML;
            }

            console.log('Update response:', result)
        }
        catch (error) {
            alert(error)
            console.error(error)
        }
    }
}

function pageturn(page){
    pageEl = document.querySelector(`section[pagename=${page}]`)
    console.log(`
        Current Page: ${document.querySelector("section.maincontent.active").getAttribute("pagename")}
        Page to: ${page}
        New Page:`, pageEl, "\n\n")
    if(pageEl.classList.contains("active")){
        return "already active"
    }
    document.querySelector(".sidebar button.active").classList.remove("active")
    document.querySelector(`button[pagename=${page}]`).classList.add("active")
    document.querySelector("section.maincontent.active").classList.remove("active")
    pageEl.classList.add("active")
    if(window.innerWidth < 667){
        document.querySelector("#navtoggle").checked = true
    }
}
function deleteaccount(){
    conf = confirm(`Byeee! Maybe we will meet again someday.
        
Are you sure you want to delete your account?

(we wont miss you, we literally wont remember you, your privacy matters.)`)
    if(conf){
        alert("Goodbye.")
        window.location.href = "/api/deleteaccount"
    }
}