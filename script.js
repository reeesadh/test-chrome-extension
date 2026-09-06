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
                let resolved = false;

                const observer = new MutationObserver((mutations, obs) => {
                    if (resolved) return;
                    resolved = true;
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
                    if (resolved) return;
                    resolved = true;
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

    const qb = document.createElement('button');
    qb.textContent = "?";
    qb.style.fontSize = "2rem";
    qb.style.display = "flex";
    qb.style.flexDirection = "column";
    qb.style.justifyContent = "center";
    qb.style.textAlign = "center";
    qb.style.width = "3rem";
    qb.style.height = "3rem";
    qb.style.color = "#65686C";
    qb.style.position = "fixed";
    qb.style.backgroundColor = "white";
    qb.style.borderRadius = "0.75rem";
    qb.style.boxShadow = "0px 1px 2px rgba(0, 0, 0, 0.25)";
    qb.style.outline = "none";
    qb.style.border = "none";

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
        qb.style.top = rect.top + "px";
        qb.style.left = (rect.right + 12) + "px";
    }

    inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton();

    qb.style.zIndex = "2147483646";

    window.addEventListener('scroll', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton, {passive: true});
    window.addEventListener('resize', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton);

    qb.addEventListener('click', async () => {
        qb.textContent = "Loading...";

        const text = await readPostText(element);
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

        result = result.success ? parseRes(result.content) : {
            summary: "API request failed!",
            sources: [],
            accuracy: 0.0,
        };

        let SEResult = await chrome.runtime.sendMessage({
            type: "SE_REQUEST",
            image: "https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/792137854_10234952994352161_5810988319788608012_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=104&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=g4JbvRQJ6igQ7kNvwEtqrka&_nc_oc=Adrq839s5DHfwSQ1g0FGQTJYBTibxuMMvPzrSk9MtbSZ1P8qOx0zPFsXKWcTPgf9ZyE&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=6GHqQhiPo-hj6osbM0bhNw&_nc_ss=7b2a8&oh=00_AQKrW4NI6q3vTLLi690ogzDCcIi17hJqMEHJM32iH3LMYw&oe=6AA27F77"
        })

        console.log(SEResult)

        const qbox = document.createElement('div');
        qbox.textContent = result.summary;
        qbox.style.backgroundColor = "white";
        qbox.style.fontSize = "0.9375rem";
        qbox.style.width = "16rem";
        qbox.style.borderRadius = "0.75rem";
        qbox.style.color = "black";
        qbox.style.boxShadow = "0px 1px 2px rgba(0, 0, 0, 0.25)";
        qbox.style.padding = "0.5rem";
        qbox.style.position = "fixed";
        qbox.style.zIndex = "2147483647";

        const APB = document.createElement('div');
        APB.style.fontSize = "50px";
        APB.style.zIndex = "2147483647";
        APB.style.backgroundColor = "gray";
        APB.style.width = "200px";
        APB.style.height = "50px";
        APB.style.position = "absolute";

        const AP = document.createElement('div');
        AP.textContent = result.accuracy * 100 + "%";
        AP.style.fontSize = "50px";
        AP.style.zIndex = "2147483647";
        AP.style.backgroundColor = "red";
        AP.style.width = 200*result.accuracy + "px";
        AP.style.height = "50px";
        AP.style.position = "relative";

        qbox.appendChild(APB);
        qbox.appendChild(AP);

        const img = document.createElement('img');
        img.src = "https://snoopy.basil.moe/logo.png";
        img.alt = "question"
        img.style.zIndex = "2147483647";
        img.style.width = "200px";
        img.style.height = "100px";
        qbox.appendChild(img);

        function inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton() {
            const rect = full.getBoundingClientRect();
            qbox.style.top = rect.top + "px";
            qbox.style.left = (rect.right + 12) + "px";
        }

        inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton();

        full.style.position = "relative";
        full.appendChild(qbox);
        qb.remove();

        window.addEventListener('scroll', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton, {passive: true});
        window.addEventListener('resize', inDaClubStraightUpPositioningItAndByItLetsJustrSayMyButton);
    }, { once: true });

    full.style.position = "relative";
    full.appendChild(qb);

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


