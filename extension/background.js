var contentScriptTabId = null;

// handle messages from the app
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log(request);

  // pass the message to the content script
  chrome.tabs.sendMessage(contentScriptTabId, { type: 'remote_request', data: request }, function(response) {
    console.log("Recieved response from remote request", response);
    sendResponse(response);
  });

  return true;
});

// handle messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(sender);

  if (message.type == 'init') {
    // keep the tab id so that messages can be sent to the content script
    contentScriptTabId = sender.tab.id;
  }
});
