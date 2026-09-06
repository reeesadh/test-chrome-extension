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
//get visual length of alt text
function getVisualLength(str) {
  const segmenter = new Intl.Segmenter();
  return [...segmenter.segment(str)].length;
}

// get post text
async function processPost(element) {
    const mainNode = element.parentNode;
    const mainMainNode = mainNode?.parentNode;
    const full = mainMainNode?.parentNode;
    const header = full?.childNodes?.[1];
    
    let images = Array.from(mainMainNode?.childNodes?.[1].querySelectorAll('img'));
    let filteredImages= []
    if (images) {
        filteredImages = images.filter((image) => {
        const altText = image.alt;
        const len = getVisualLength(altText)
        
        if (!altText || len > 1) {
            return true
        }
        return false
        });
    }
    
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
    qb.style.minWidth = "3rem";
    qb.style.height = "3rem";
    qb.style.color = "#65686C";
    qb.style.position = "fixed";
    qb.style.backgroundColor = "white";
    qb.style.borderRadius = "0.75rem";
    qb.style.boxShadow = "0px 1px 2px rgba(0, 0, 0, 0.25)";
    qb.style.outline = "none";
    qb.style.border = "none";

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
        qb.textContent = "Snooping...";

        const text = await readPostText(element);

        let AITotal = 0
        for (const imageObj of filteredImages) {
            let SEResult = await chrome.runtime.sendMessage({
                type: "SE_REQUEST",
                image: imageObj.src
            });
            let parsedAIPercent = parseInt(SEResult.content);
            AITotal += parsedAIPercent;
        }
        const AIPercent = AITotal / filteredImages.length;

        function cleanURL(url) {
            let dirty = new URL(url);
            dirty.search = '';
            return dirty.toString();
        }

        const profile_elem_upper_div = header.querySelector('div[data-ad-rendering-role="profile_name"]');
        const profile_elem = profile_elem_upper_div.querySelector('a');
        let profile_name = profile_elem.textContent;
        let profile_link = cleanURL(profile_elem.href);

        const other_links_upper_div = profile_elem_upper_div?.parentNode?.parentNode?.parentNode?.childNodes?.[1];
        const other_links = other_links_upper_div.querySelectorAll('a');
        const maybe_profile = other_links[0];
        
        let group_name = '';
        let group_link = '';
        if (profile_link.indexOf('groups') !== -1) {
            group_name = profile_name;
            group_link = profile_link;
            profile_name = maybe_profile.textContent;
            profile_link = cleanURL(maybe_profile.href);
        }

        let prompt = `Infer the main claims of the following post, and determine the overall factual accuracy of the post.

Research the claims using reliable sources. Distinguish between:

1. Claims that are demonstrably false
2. Claims that are misleading or unsupported
3. Claims that are factual
4. Claims

Then give an extremely concise summary of your reasoning in under 50 words, and with enough simplicity for middle school comprehension. List any sources you used to reach your conclusion (this may fall beyond the word limit). Also provide a percentage likelihood if the post is a scam as a number between 0 and 1, where 0 is not a scam at all and 1 is definitely a scam, and then a 10 word maximum statement of why if applicable.
Respond with exactly one JSON object of the following format: 
{
"summary": the summary of your reasoning,
"sources": [the titles of your sources],
"accuracy": your estimated accuracy of the post,
"scamlikelypercent": your estimated scam likelihood of the post,
"scamreason": why the post is a scam if applicable
"backgroundcheck": the person's profession and if they are actually licensed for what they are talking about in 20 words or less, if you cant find accurate info then just say "n/a"
} 
"accuracy" should be a number between 0 and 1, where 1 means all significant factual claims are accurate and 0 means none are accurate.

Post: ${text}

User Name: ${profile_name}

User Link: ${profile_link}
`

        if (group_name !== '') {
            prompt += `
Group Name: ${group_name}

Group Link: ${group_link}
`
        }

        if (filteredImages.length > 0) {
            prompt += `
${filteredImages.length} image(s) were attached, with average ${AIPercent}% likelihood of being AI-generated. You should also be able to view these yourself.`
        }

        if (explicit_ai) {
            prompt += `
Post was tagged as AI explicitly.
`;
        }

        console.log(prompt);

        images = filteredImages.map((img) => img.src);
        let result = await chrome.runtime.sendMessage({
            type: "OPENROUTER_REQUEST",
            prompt,
            images,
        });

        function parseRes(content) {
            let cleaned = content.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
            return JSON.parse(cleaned);
        }

        result = result.success ? parseRes(result.content) : {
            summary: "API request failed!",
            sources: [],
            accuracy: 0.0,
            scamlikelypercent: 0.0,
            scamlikelyreason: "n/a",
            backgroundcheck: "n/a",
        };

        const qbox = document.createElement('div');
        qbox.style.backgroundColor = "white";
        qbox.style.fontSize = "0.9375rem";
        qbox.style.width = "16rem";
        qbox.style.borderRadius = "0.75rem";
        qbox.style.color = "black";
        qbox.style.boxShadow = "0px 1px 2px rgba(0, 0, 0, 0.25)";
        qbox.style.padding = "0.5rem";
        qbox.style.position = "fixed";
        qbox.style.zIndex = "2147483647";
        qbox.style.display = "flex";
        qbox.style.flexDirection = "column";
        qbox.style.gap = "0.5rem";

        const qbtext = document.createElement('div');
        qbtext.textContent = result.summary;

        const img = document.createElement('img');
        img.src = "https://snoopy.basil.moe/logo.png";
        img.alt = "question"
        img.style.zIndex = "2147483647";
        img.style.width = "100%";
        img.style.margin = "-1rem 0";

        const APB = document.createElement('div');
        APB.style.fontSize = "3rem";
        APB.style.zIndex = "2147483647";
        APB.style.backgroundColor = "#89a9cc";
        APB.style.width = "240px";
        APB.style.height = "40px";
        APB.style.borderRadius = "10px";
        APB.style.position = "relative";

        const AP = document.createElement('div');
        AP.textContent = result.accuracy * 100 + "%";
        AP.style.textAlign = "center";
        AP.style.fontSize = "20px";
        AP.style.zIndex = "2147483647";
        AP.style.borderRadius = "10px";
        AP.style.backgroundColor = "#0064D1";
        AP.style.width = 240*result.accuracy + "px";
        AP.style.height = "40px";
        AP.style.position = "absolute";

        if (result.accuracy >= 0.50) {
            APB.style.backgroundColor = "#abc9a9";
            AP.style.backgroundColor = "#4dbf45";
        } else {
            APB.style.backgroundColor = "#bd9d9d";
            AP.style.backgroundColor = "#bf4545";
        }

        qbox.appendChild(img);

        const st = document.createElement('div');
        st.textContent = "Post Accuracy Overview:";
        st.style.zIndex = "2147483647";
        st.style.fontWeight = "bold";
        qbox.appendChild(st);

        qbox.appendChild(qbtext);

        qbox.appendChild(APB);
        APB.appendChild(AP);
        //qbox.appendChild(AP);

        if (result.scamlikelypercent >= 0.6) {
            const st = document.createElement('div');
            st.textContent = "STOP! THIS POST MAY BE A SCAM: " + result.scamreason;
            st.style.zIndex = "2147483647";
            st.style.color = "red";
            qbox.appendChild(st);
        }

        const st1 = document.createElement('div');
        st1.textContent = "Account Credibility:";
        st1.style.zIndex = "2147483647";
        st1.style.fontWeight = "bold";
        qbox.appendChild(st1);

        const bgc = document.createElement('div');
        bgc.textContent = result.backgroundcheck;
        bgc.style.zIndex = "2147483647";
        qbox.appendChild(bgc);

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


