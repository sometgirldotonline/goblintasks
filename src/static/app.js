

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
        processUpdate(await resp.json())
    }
    catch (error) {
        alert(error)
        console.error(error)
    }
}

function processUpdate(data) {
    data.pageUpdates.forEach((update) => {
        switch (update.action) {
            case "innerHTML":
                document.querySelector(update.selector).innerHTML = update.value;
                break;
            case "innerText":
                document.querySelector(update.selector).innerText = update.value;
                break;
            case "outerHTML":
                document.querySelector(update.selector).outerHTML = update.value;
                break;
            case "reload":
                window.location.reload();
                break;
            case "redirect":
                window.location.href = update.value;
                break;
            case "serverSentModal":
                serverSentModal(update.value|| {});
                break;
            default:
                console.warn(`Unknown update: ${JSON.stringify(update)}`)
        }
    })

    if (data.state.charAt(0) == 0) {
        alert(`The last action failed:
Error Code: ${data.state.split("$")[1]}`)
    }
}
function serverSentModal(value) {
    // Create a maintenance overlay
    const overlay = document.querySelector("dialog")
    overlay.setAttribute("open","open")
    overlay.innerHTML = `
                <span class=title>${!!value.title ? value.title : "No title supplied"}</span>
                <p>${!!value.message ? value.message :  "No message supplied"}</p>
                ${!!value.reloadButton ? '<button onclick="window.location.reload()">Reload Page</button>' : "<form method=dialog><input type=submit value=Close></form>"}
    `;
}
async function addTask(ev) {
    ev.preventDefault()
    console.log(ev.srcElement)
    try {
        const atFetch = await fetch("/api/addTask", {
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
        processUpdate(await atFetch.json())

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
            processUpdate(await resp.json())

        }
        catch (error) {
            alert(error)
            console.error(error)
        }
    }
}

function pageturn(page) {
    pageEl = document.querySelector(`section[pagename=${page}]`)
    console.log(`
        Current Page: ${document.querySelector("section.maincontent.active").getAttribute("pagename")}
        Page to: ${page}
        New Page:`, pageEl, "\n\n")
    if (pageEl.classList.contains("active")) {
        return "already active"
    }
    document.querySelector(".sidebar button.active").classList.remove("active")
    document.querySelector(`button[pagename=${page}]`).classList.add("active")
    document.querySelector("section.maincontent.active").classList.remove("active")
    pageEl.classList.add("active")
    if (window.innerWidth < 667) {
        document.querySelector("#navtoggle").checked = true
    }
}
function deleteaccount() {
    conf = confirm(`Byeee! Maybe we will meet again someday.
        
Are you sure you want to delete your account?

(we wont miss you, we literally wont remember you, your privacy matters.)`)
    if (conf) {
        alert("Goodbye.")
        window.location.href = "/api/deleteaccount"
    }
}


async function configureAnaylitics(state, success, fromSettings = false){
    try {
        var res = await fetch("/api/configureAnaylitics", {
            method: "POST",
            body: new URLSearchParams({
                state: state,
                modifiedInSettings: fromSettings
            })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }
    catch (e){
        alert(`Error occured: 
${e.message}.
Retry your action or check the developer console for more.`)
return;
    }
    success()
}