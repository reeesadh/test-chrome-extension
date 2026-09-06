
import { OpenRouter } from "@openrouter/sdk"
import dotenv from "dotenv"
dotenv.config()

const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_SECRET2
})

const prompt = `Infer the main claims of the following post, and determine the overall factual accuracy of the post.

Research the claims using reliable sources. Distinguish between:

1. Claims that are demonstrably false
2. Claims that are misleading or unsupported
3. Claims that are factual
4. Claims

Then give a concise summary of your reasoning in under 200 words, and with enough simplicity for middle school comprehension. List any sources you used to reach your conclusion (this may fall beyond the word limit)
Respond with exactly one JSON object of the following format: 
{
"summary": the summary of your reasoning,
"sources": [the titles of your sources],
"accuracy": your estimated accuracy of the post
} 
"accuracy" should be a number between 0 and 1, where 1 means all significant factual claims are accurate and 0 means none are accurate.

Post:
`
const testPost = `NASA is an absolute joke!! If you can’t see that any of this stuff is fake, you need glasses. There’s no reason they need to be using green screens, harnesses, and hairspray if they’re really up in space on the ISS. It’s quite clear that they’re not. Why would you choose to still believe them and all their rubbish they send out, including this stuff, fake moon landings, fake footage of the earth from the “ISS”? It’s beyond me. Give it up, let it go! Why do you want to continually defend these massive frauds that steal billions of taxpayers’ money to produce terrible green screen footage and cartoons?`
const testPost2 = `Today, March 15, 2025 marks 3000 days on a carnivore diet! Typically around 3lbs of red meat daily, will occasionally add some eggs, sea food and dairy! Very rarely do I deviate from this! I of course exercise regularly and generally take care of my health! I’m 58 years old, 6’5” and around 250lbs! I’ve never taken TRT or other steroids and honestly am glad I never did! I generally can outperform most folks decades younger than me and certainly don’t have scurvy! Those that tell you red meat is bad for you are simply ignorant, misinformed or perhaps evil!`
const testPost3 = `#news About 800,000 people in New York City weren't weren't born when 9/11 hit, didn't see the islamic t*rrorist crash planes into the Twin Towers, so they showed up to vote for a man who used the slogan “globalize the intifada"  into office.  
#newyorkcity 
New York City elected its first m*slim mayor in Zohran Mamdani the same year that the country is heading into the 25th anniversary of the islamic t*rror attacks that killed 2,977 people.  
Voters who have no memory of 911, had a 41.9% turnout in the mayoral election - lifting Mamdani to victory in the primary by 129K votes - meaning about 2 % of New Yorkers lifted Mamdani into office.  
Critics are saying Americans are losing their country to a m*slim, islamic takeover simply because they are not showing up to vote and not speaking out a local meeting.  
Mamdani refused multiple times during the primary to condemn the phrase “globalize the intifada" saying instead the phrase is  
“a desperate desire for equality and equal rights.”  
Mamdani has spent years minimizing the m*rder of the 3,000 Americans who were k*lld by islamic t*rrorists that day and instead has focused on giving sympathy to the m*slm t*rrorists who were tracked down and k*lled by the US in retaliation for the 9/11 attacks.  
#muslim 
The families of 9/11 victims have started a petition, that already has tens of thousands of signatures, demanding Mamdani stay away from the Ground Zero ceremony.  
Mamdani will not respect the wishes of the victims and will attend.  
Should a m*slim mayor whose campaign treated “globalize the intifada” as protected speech stand at Ground Zero on the 25th anniversary of 9/11? 
#chistinaaguayonews`
const outlierTest = `A controversial neuroscience theory proposes that human intelligence was turbocharged 50,000 years ago when our brains first tuned into a different dimension.
For centuries, science has viewed the human brain as a biological computer that generates thoughts internally. However, a radical new hypothesis called Neural Transduction Theory (NTT), championed by research psychologist Robert Epstein, proposes a staggering alternative: the brain is actually an antenna, or "transducer," designed to receive and process consciousness from another dimension. According to Epstein, this hidden realm—dubbed "the Other Side"—streams information to our brains, explaining mysteries like dreams, genius, and near-death experiences. While mainstream neuroscience continues to search for the physical origin of consciousness within neural pathways, NTT suggests we are looking in the wrong place entirely, pointing to a cosmic broadcast instead of localized chemical reactions.
This theory could also solve one of anthropology's greatest mysteries: the sudden explosion of human creativity and language around 50,000 years ago. Though anatomically modern humans had walked the Earth for millennia, their cognitive capabilities remained relatively basic until a sudden cultural and intellectual revolution occurred. Epstein posits that this "cognitive leap" was triggered when a human infant was born with a brain uniquely capable of forming an optimal connection to this higher dimension, essentially upgrading human intelligence forever. While critics and skeptics at a recent San Diego gathering point to a lack of concrete mathematical modeling or direct evidence, researchers are actively discussing how modern brain-scanning technology might be used to put this mind-bending hypothesis to the test.
source: Dimitropoulos, S. (2026). Our Brains Connected to Another Dimension 50,000 Years Ago—And Turbocharged Our Intelligence, Radical New Theory Says. Popular Mechanics.`

const res = await openRouter.chat.send({
    chatRequest: {
        model: "minimax/minimax-m3:free:online",
        messages: [
            {
                role: "user",
                content: `${prompt}${testPost2}`
            }
        ],
        response_format: {
            type: "json_object"
        }
    }
})

const resContent = res.choices[0].message.content

function parseRes(content) {
    let cleaned = content.trim();

    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
    return JSON.parse(cleaned)
}
console.log(parseRes(resContent))

// LEGACY: code for finding image AI chance
// const res  = await axios.get("https://api.sightengine.com/1.0/check.json", {
//     params: {
//         "url": "https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/792137854_10234952994352161_5810988319788608012_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=104&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=g4JbvRQJ6igQ7kNvwEtqrka&_nc_oc=Adrq839s5DHfwSQ1g0FGQTJYBTibxuMMvPzrSk9MtbSZ1P8qOx0zPFsXKWcTPgf9ZyE&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=6GHqQhiPo-hj6osbM0bhNw&_nc_ss=7b2a8&oh=00_AQKrW4NI6q3vTLLi690ogzDCcIi17hJqMEHJM32iH3LMYw&oe=6AA27F77",
//         "models": "genai",
//         "api_user": `${process.env.SE_USER}`,
//         "api_secret": `${process.env.SE_SECRET}`
//     }
// })
// console.log(res.data.type.ai_generated * 100)