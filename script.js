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

    //element.style.backgroundColor = "red";

    const qb = document.createElement('div');
    qb.textContent = "?";
    qb.style.fontSize = "50px";
    qb.style.color = "blue";
    qb.style.position = "fixed";

    const baseInstructions = `Infer the main claims of the following post, and determine the overall factual accuracy of the post.

Research the claims using reliable sources. Distinguish between:

1. Claims that are demonstrably false
2. Claims that are misleading or unsupported
3. Claims that are factual
4. Claims

Then give an extremely concise summary of your reasoning in under 100 words, and with enough simplicity for middle school comprehension. List any sources you used to reach your conclusion (this may fall beyond the word limit)
Respond with exactly one JSON object of the following format: 
{
"summary": the summary of your reasoning,
"sources": [the titles of your sources],
"accuracy": your estimated accuracy of the post
} 
"accuracy" should be a number between 0 and 1, where 1 means all significant factual claims are accurate and 0 means none are accurate.

Post:
`
    


    function inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton() {
        const rect = full.getBoundingClientRect();
        qb.style.top = (rect.top + 10) + "px";
        qb.style.left = (rect.right + 8) + "px";
    }

    inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton();

    qb.style.zIndex = "2147483646";

    window.addEventListener('scroll', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton, {passive: true});
    window.addEventListener('resize', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton);

    qb.addEventListener('click', async () => {
        const extractedText = baseInstructions + text;

        let result = await chrome.runtime.sendMessage({
        type: "OPENROUTER_REQUEST",
        prompt: extractedText
        });

        function parseRes(content) {
            let cleaned = content.trim();
        
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
            return JSON.parse(cleaned)
        }

        console.log(result.content);

        result = result.success ? parseRes(result.content) : null;
        if (result == null) console.log("ah hell naw");

        const qbox = document.createElement('div');
        qbox.textContent = result.summary;
        qbox.style.fontSize = "20px";
        qbox.style.backgroundColor = "#c8d1d9";
        qbox.style.width = "260px";
        qbox.style.height = "400px";
        qbox.style.borderRadius = "14px";
        qbox.style.color = "gray";
        qbox.style.padding = "6px";
        qbox.style.position = "fixed";
        qbox.style.zIndex = "2147483647";

        const img = document.createElement('img');
        img.src = "https://snoopy.basil.moe/logo.png";
        img.alt = "question"
        img.style.zIndex = "2147483647";
        img.style.width = "200px";
        img.style.height = "100px";
        qbox.appendChild(img);

        function inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton() {
            const rect = full.getBoundingClientRect();
            qbox.style.top = (rect.top + -2) + "px";
            qbox.style.left = (rect.right + 8) + "px";
        }

        inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton();

        full.style.position = "relative";
        full.appendChild(qbox);

        window.addEventListener('scroll', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton, {passive: true});
        window.addEventListener('resize', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton);
    });

    full.style.position = "relative";
    full.appendChild(qb);

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


