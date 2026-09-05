async function highlightTweets() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.tabs.sendMessage(tab.id, { cmd: "highlight" }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Error or script not loaded yet:", chrome.runtime.lastError.message);
      return;
    }
    console.log("Received response from script.js:", response.reply);
  });
}