console.log('Play Music Remote is active.');

// on startup, let the background script know the content script is alive
chrome.extension.sendMessage({ type: 'init' });

// listen for messages from the background page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(message);

  // check the message type
  if (message.type == "remote_request") {
    // play / pause action
    if (message.data.action == "play_pause") {
      $("#player-bar-play-pause").click();
    } else if (message.data.action == "query") {
      chrome.storage.local.get({ device_name: 'My Device' }, function(items) {
        console.log("Recieved query request, response: ", items.device_name);
        // send a response with the device name, include the request
        sendResponse({ request: message, device: items.device_name });
      })

      return true;
    }
  }
});
