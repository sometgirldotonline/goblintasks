var TaskHandler = {
    async updateTaskState(id, state) {
        if (state && document.body.parentElement.classList.contains("magic")) {
            spawnExplosion(document.querySelector(`#ckbx-${id}`))
        }
        else if (document.body.parentElement.classList.contains("magic")) {
            spawnExplosionReverse(document.querySelector(`#ckbx-${id}`))
        }
        console.log(`Updating task ID: ${id}, State: ${state}`)
        try {
            const resp = await fetch(`/api/updateTaskState`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id: id,
                    state: state ? "1" : "0",
                    moddate: Date.now()
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
    },

    async editTaskDialog(id) {
        console.log(`Editing task ID: ${id}`)
        try {
            const resp = await fetch(`/api/editTaskDialog`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id: id
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
    },

    async addTask(ev) {
        ev.preventDefault()
        console.log(ev.srcElement)
        try {
            const atFetch = await fetch("/api/addTask", {
                "body": new URLSearchParams({
                    taskName: ev.srcElement.taskName.value,
                    taskValue: ev.srcElement.taskValue.value,
                    dueBy: new Date(ev.srcElement.dueBy.value).getTime() / 1000,
                    description: ev.srcElement.description.value,
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
    },
    async addTaskDialog() {
        console.log(`Showing add task dialog`)
        try {
            const resp = await fetch(`/api/addTaskDialog`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
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
    },

    async editTask(ev) {
        try {
            const atFetch = await fetch("/api/editTask", {
                "body": new URLSearchParams({
                    taskName: ev.srcElement.taskName.value,
                    taskValue: ev.srcElement.taskValue.value,
                    description: ev.srcElement.description.value,
                    id: ev.srcElement.id.value,
                    moddate: Date.now(),
                    dueBy: new Date(ev.srcElement.dueBy.value).getTime() / 1000,
                    reoccurs: [...ev.srcElement.reoccurs.selectedOptions].map(e => e.value).join(","),
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
    },
    async deleteTask(id) {
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
    },
}

var siteHandler = {
    modAddSite: function (action, event) {
        if (action == "new") {
            siteHandler.addSite(event)
        }
        else if (action == "modify") {
            siteHandler.editSite(event)
        }
    },
    async editSiteDialog(id) {
        console.log(`Editing site ID: ${id}`)
        try {
            const resp = await fetch(`/api/editSiteDialog`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id: id
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
    },
    async addSiteDialog() {
        console.log(`Showing add site dialog`)
        try {
            const resp = await fetch(`/api/addSiteDialog`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
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
    },

    async deleteSite(id) {
        console.log(`removing site ID: ${id}`)
        try {
            const resp = await fetch(`/api/removeSite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id: id
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
    },

    async addSite(ev) {
        ev.preventDefault()
        console.log(ev.srcElement)
        try {
            const atFetch = await fetch("/api/addSite", {
                "body": new URLSearchParams({
                    domain: ev.srcElement.domain.value,
                    unblockCost: ev.srcElement.unblockCost.value,
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
    },

    async editSite(ev) {
        try {
            const atFetch = await fetch("/api/editSite", {
                "body": new URLSearchParams({
                    domain: ev.srcElement.domain.value,
                    unblockCost: ev.srcElement.unblockCost.value,
                    id: ev.srcElement.id.value,
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
    },
}


async function aboutDialog() {
    try {
        const resp = await fetch(`/api/aboutDialog`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
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


async function saveTheme(theme) {
    try {
        const resp = await fetch(`/api/setTheme`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                theme: theme
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
        try {
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
                case "setAttribute":
                    if (update.value.value == "pleaseRemoveThisAttrDaddyUWU") { // fuck me dude why am i like this :sob:
                        document.querySelector(update.selector).removeAttribute(update.value.name)
                    }
                    else {
                        document.querySelector(update.selector).setAttribute(update.value.name, update.value.value);
                    }
                    break;
                case "reload":
                    window.location.reload();
                    break;
                case "redirect":
                    window.location.href = update.value;
                    break;
                case "serverSentModal":
                    serverSentModal(update.value || {});
                    break;
                default:
                    console.warn(`Unknown update: ${JSON.stringify(update)}`)
            }
        } catch (error) {
            console.error(error)
        }
    })

    if (data.state.charAt(0) == 0) {
        alert(`The last action failed:
Error Code: ${data.state.split("$")[1]}`)
    }
    [...document.querySelectorAll(".task[reoccurs][moddate]")].forEach(el => {
  const reoc = el.getAttribute("reoccurs")?.trim().split(",") || [];
  var modd = new Date(Number(el.getAttribute("moddate")));
  if (reoc.length > 0) {
    // Calculate "day of year"
    const dayOfYear = date =>
      Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    const modDay = dayOfYear(modd);
    const todayDay = dayOfYear(new Date());
    console.log(modDay, todayDay)
    if (modDay !== todayDay && el.querySelector("input").checked) {
        TaskHandler.updateTaskState(Number(el.id.split("-")[1]), false)
    } else {
    }
  }
});

}
function serverSentModal(value) {
    // Create a maintenance overlay
    const overlay = document.querySelector("dialog")
    overlay.setAttribute("open", "open")
    overlay.innerHTML = `
    <span class=title>${!!value.title ? value.title : "No title supplied"}</span>
    <p>${!!value.message ? value.message : "No message supplied"}</p>
    ${!!value.reloadButton ? '<button onclick="window.location.reload()">Reload Page</button>' : "<form method=dialog><input type=submit value=Close></form>"}
    `;
}


async function pageturn(page) {
    // pageEl = document.querySelector(`section[pagename=${page}]`)
    // console.log(`
    //     Current Page: ${document.querySelector("section.maincontent.active").getAttribute("pagename")}
    //     Page to: ${page}
    //     New Page:`, pageEl, "\n\n")
    // if (pageEl.classList.contains("active")) {
    //     return "already active"
    // }
    document.querySelector(".sidebar button.active").classList.remove("active")
    document.querySelector(`button[pagename=${page}]`).classList.add("active")
    // document.querySelector("section.maincontent.active").classList.remove("active")
    try {
        const resp = await fetch(`/api/getPage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                page: page
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


async function configureAnaylitics(state, success, fromSettings = false) {
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
    catch (e) {
        alert(`Error occured: 
${e.message}.
Retry your action or check the developer console for more.`)
        return;
    }
    success()
}



const magicicons = [
    "https://em-content.zobj.net/source/joypixels/394/sparkles_2728.png",
    "https://em-content.zobj.net/source/animated-noto-color-emoji/427/fire_1f525.gif",
    "https://em-content.zobj.net/source/animated-noto-color-emoji/427/heart-on-fire_2764-fe0f-200d-1f525.gif",
    "https://em-content.zobj.net/source/animated-noto-color-emoji/427/coin_1fa99.gif",
    "https://em-content.zobj.net/source/animated-noto-color-emoji/427/coin_1fa99.gif",
    "https://em-content.zobj.net/source/animated-noto-color-emoji/427/coin_1fa99.gif",
    "https://em-content.zobj.net/source/google/439/money-mouth-face_1f911.png",
];
function spawnExplosion(el) {
    for (let i = 0; i < 25; i++) {
        const item = document.createElement("img");
        item.src = magicicons[Math.floor(Math.random() * magicicons.length)];
        item.className = "item";
        item.style.left = `${el.getBoundingClientRect().left}px`;
        item.style.top = `${el.getBoundingClientRect().top}px`;
        item.style.setProperty("--x", (Math.random() - 0.5) * 600);
        item.style.setProperty("--y", (Math.random() - 0.5) * 600);
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 2000);
    }
}
function spawnExplosionReverse(el) {
    for (let i = 0; i < 25; i++) {
        const item = document.createElement("img");
        item.src = magicicons[Math.floor(Math.random() * magicicons.length)];
        item.className = "itemReverse";
        item.style.left = `${el.getBoundingClientRect().left}px`;
        item.style.top = `${el.getBoundingClientRect().top}px`;
        item.style.setProperty("--x", (Math.random() - 0.5) * 600);
        item.style.setProperty("--y", (Math.random() - 0.5) * 600);
        document.body.appendChild(item);
        setTimeout(() => item.remove(), 790);
    }
}

window.addEventListener("mouseup", (e) => {
    const openDialog = document.querySelector("dialog[open]");
    if (e.target == document.body && openDialog) {
        openDialog.close();
    }
});



fetch("/api/justGimmeTheTasksBro").then(v=>{
    v.json().then(v=>{
        processUpdate(v)
    })
})