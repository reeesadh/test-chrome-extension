const OPENROUTER_API_KEY = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "OPENROUTER_REQUEST") {
    return;
  }

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

  return true;
});
