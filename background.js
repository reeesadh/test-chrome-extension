const OPENROUTER_API_KEY=""
const SE_SECRET=""
const SE_USER=""

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
        const params = new URLSearchParams({
          url: message.image,
          models: "genai",
          api_user: SE_USER,
          api_secret: SE_SECRET
        })
        const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`,
        
      )

      
      const returnData = await res.json();
      if (!res.ok) {
        throw new Error(
          returnData.error?.message || `Sight engine returned ${res.status}`
        );
      }
        sendResponse({
          success: true,
          content: returnData.type.ai_generated * 100
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
  else {
    return;
  }

  return true;
});
