chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message from popup:", message);

    if (message.cmd === "highlight") {
        const fontStuff = document.createElement('link');
        fontStuff.href = "https://fonts.googleapis.com/css2?family=Aldrich&display=swap";
        fontStuff.rel = "stylesheet";
        document.head.appendChild(fontStuff);
        const tweets = document.querySelectorAll(["article[data-testid='tweet']"]);
        tweets.forEach(tweet => {
            tweet.style.position = "relative";
            sendResponse({ reply: "Daughter :sob: :sob: :sob:"});
            const secretButton = document.createElement('div');
            secretButton.style.position = "absolute";
            secretButton.textContent = "?";
            secretButton.style.fontSize = "24px";
            secretButton.style.fontFamily = "Aldrich";
            secretButton.style.fontWeight = "bold";
            secretButton.style.color = "#1f27cc";
            secretButton.style.top = "1%";
            secretButton.style.left = "85%";
            secretButton.addEventListener('click', () => {
                alert("say wallahi bro");
            });
            tweet.appendChild(secretButton);
        });
      
    }

    return true; 
});


