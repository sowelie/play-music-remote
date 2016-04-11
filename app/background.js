var multicast = null;
var extensionId = "kkfgkpcagopobkplodednkpcijlimcoo";

console.log("Play Music Remote App is active");

chrome.app.runtime.onLaunched.addListener(function() {
  // Tell your app what to launch and how.
});

// set up the multicast socket
multicast = new MulticastSocket({ address: "224.1.1.1", port: 5010 });
multicast.onReceive = function(e) {
  console.log(decode(e.data));
  // send the message to the extension
  chrome.runtime.sendMessage(extensionId, decode(e.data), function(response) {
    if (response) {
      console.log('Recieved response from extension: ', response);
      // if a response is returned, send it out via multicast
      multicast.sendDiagram(JSON.stringify(response));
    }
  });
};
multicast.connect(function() {});

chrome.runtime.onSuspend.addListener(function() {
  console.log("SUSPEND");
});

function decode(data) {
  var decoder = new TextDecoder('utf-8');

  return JSON.parse(decoder.decode(new DataView(data)));
}
