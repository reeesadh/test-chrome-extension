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

async function readPostText(element) {
    let text = "";
    // open full post text if "See more" button is visible
    let button = element.querySelector('div[role="button"]');
    if (button != null) {
        button.click();

        function wait(e) {
            return new Promise((resolve) => {
                const observer = new MutationObserver((mutations, obs) => {
                    obs.disconnect();
                    resolve();
                });
                const config = { 
                    attributes: true, 
                    childList: true, 
                    subtree: true 
                };
                observer.observe(e, config);
            });
        }
        await wait(element);

        const cloned = element.cloneNode(true);
        cloned.querySelector('div[role="button"]').remove();
        text = cloned.textContent;
    } else {
        text = element.textContent;
    }
    return text;
}

const main = document.querySelector('div[role="main"]');
const observer = new MutationObserver(async (mutations, obs) => {
    for (const element of document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])) {
        const full = element.parentElement.parentElement.parentElement;
        const header = element.childNodes[1];
        const content = element.childNodes[2];

        const text = await readPostText(element);
        header.querySelectorAll(['a[role="link"]']).forEach((link) => {
            console.log(link.textContent);
        });
        console.log(text);
    }
});
const config = { 
    attributes: true, 
    childList: true, 
    subtree: true 
};
observer.observe(main, config);


