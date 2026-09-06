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
    let noMoreClick = false;

    // open full post text if "See more" button is visible
    let button = element.querySelector('div[role="button"]');
    if (button != null && !noMoreClick) {
        button.click();
        noMoreClick = true;

        function wait(e) {
            return new Promise((resolve) => {
                let alreadyResolvedLowk = false;

                const observer = new MutationObserver((mutations, obs) => {
                    if (alreadyResolvedLowk) return;

                    alreadyResolvedLowk = true;

                    obs.disconnect();
                    resolve();
                });

                const config = { 
                    attributes: true, 
                    childList: true, 
                    subtree: true 
                };

                observer.observe(e, config);

                // resolve if taking too long
                setTimeout(() => {
                    if (alreadyResolvedLowk) return;
                    alreadyResolvedLowk = true;
                    observer.disconnect();
                    resolve();
                }, 1500);

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

const alreadyProcessed = new Set();

function getId(header) {
    // secret post id method
    const pId = header.querySelector('a[role="link"][href*="/posts/"], a[role="link"][href*="story_fbid"], a[role="link"][href*="/videos/"], a[href*="/permalink/"]');

    // clean it up
    if (pId?.href) {
        return pId.href.split('?')[0];
    }

    // look for id
    const anyId = header.querySelector('a[role="link"][href]');

    if (anyId?.href) {
        const matchId = anyId.href.match(/\d{10,}/);
        if (matchId) return matchId[0];
    }

    return null;
}

// get post text
async function processPost(element) {
    const mainNode = element.parentNode;
    const mainMainNode = mainNode?.parentNode;
    const full = mainMainNode?.parentNode;
    const header = full?.childNodes?.[1];

    if (!header) return;

    const pId = getId(header);

    if (pId) {
        if (alreadyProcessed.has(pId)) return;
    } else {
        if (element.dataset.scanned) return;
    }

    const text = await readPostText(element);

    console.log("ELEMENT: " + element);
    console.log("POSITION: " + element.style.top);

    element.style.backgroundColor = "red";

    const qb = document.createElement('div');
    qb.textContent = "hi";
    qb.style.position = "absolute";

    header.querySelectorAll(['a[role="link"]']).forEach((link) => {
        console.log(link.textContent);
    });
    
    console.log("POST TEXT: " + text);

    if (pId) {
        alreadyProcessed.add(pId);
    }
}

const main = document.querySelector('div[role="main"]');

let checkTimer = null;

function scheduleUpdate() {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(runUpdate, 300);
}

async function runUpdate() {
    for (const element of document.querySelectorAll(['div[data-ad-rendering-role="story_message"]'])) {
        if (!element.dataset.watching) {
            element.dataset.watching = "true";
            visibilityObserver.observe(element);
        }
        // try {
        //     await processPost(element);
        // } catch (e) {
        //     console.error(e);
        // }
    }
}

const observer = new MutationObserver(async (mutations, obs) => {
    scheduleUpdate();
});

const visibilityObserver = new IntersectionObserver((entries, obs) => {
    for (const en of entries) {
        if (en.isIntersecting) {
            const element = en.target;
            obs.unobserve(element);
            processPost(element).catch((er) => console.error(er));
        }
    }
    }, {
        root: null,
        threshold: 0.1
    }
);

const config = { 
    attributes: true, 
    childList: true, 
    subtree: true 
};

observer.observe(main, config);


