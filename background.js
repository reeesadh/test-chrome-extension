const OPENROUTER_API_KEY = "";
const SE_SECRET = "";
const SE_USER = ""

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == "OPENROUTER_REQUEST") {
    (async () => {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
              model: "minimax/minimax-m3:free:online",
              messages: [
                {
                  role: "user",
                  content: message.prompt
                }
              ],
              response_format: {
                type: "json_object"
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || `OpenRouter returned ${response.status}`
          );
        }

        sendResponse({
          success: true,
          content: data.choices[0].message.content
        });

      } catch (error) {
        console.error(error);

        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
  }

  else if (message.type == "SE_REQUEST") {
    (async () => {
      try {
        const res = await fetch("https://api.sightengine.com/1.0/check.json",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              url: "https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/792137854_10234952994352161_5810988319788608012_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=104&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=g4JbvRQJ6igQ7kNvwEtqrka&_nc_oc=Adrq839s5DHfwSQ1g0FGQTJYBTibxuMMvPzrSk9MtbSZ1P8qOx0zPFsXKWcTPgf9ZyE&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=6GHqQhiPo-hj6osbM0bhNw&_nc_ss=7b2a8&oh=00_AQKrW4NI6q3vTLLi690ogzDCcIi17hJqMEHJM32iH3LMYw&oe=6AA27F77",
              models: "genai",
              api_user: SE_USER,
              api_secret: SE_SECRET
            })
          }
        )

        const returnData = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error?.message || `Sight engine returned ${res.status}`
          );
        }

        sendResponse({
          success: true,
          content: returnData.data.type.ai_generated
        });
      }

      catch (error) {
        console.error(error);

        sendResponse({
          success: false,
          error: error.message
        });
      }
    })()
  }

  return true;
});
