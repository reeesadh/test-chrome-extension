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


function readPost(id) {
    let element = document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])[id];
    // open full post text if "See more" button is visible
    let button = element.querySelector('div[role="button"]');
    if (button != null) {
        button.click();
        element = document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])[id];
        button = element.querySelector('div[role="button"]');
        button.click();
    }
    const cloned = element.cloneNode(true);
    // remove button before getting text
    if (button != null) button.remove();

    return element.textContent;
}

function readPost2(id) {
    let element = document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])[id];
    let text = "";
    // open full post text if "See more" button is visible
    let button = element.querySelector('div[role="button"]');
    if (button != null) {
        const old_button_text = button.textContent;
        button.click();
        while (button.textContent == old_button_text) {
            element = document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])[id];
            button = element.querySelector('div[role="button"]');
        }
        const cloned = element.cloneNode(true);
        cloned.querySelector('div[role="button"]').remove();
        text = cloned.textContent;
        button.click();
    } else {
        text = element.textContent;
    }
    return text;
}


