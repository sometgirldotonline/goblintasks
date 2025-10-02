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