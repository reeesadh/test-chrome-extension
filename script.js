chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message from popup:", message);

    if (message.cmd === "highlight") {
        const tweets = document.querySelectorAll(["article[data-testid='tweet']"]);
        tweets[0].style.backgroundColor = '#FF0000';
        sendResponse({ reply: "Daughter :sob: :sob: :sob:"});
    }

    return true; 
});


