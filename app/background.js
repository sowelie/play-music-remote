var multicast = null;
var extensionId = "kkfgkpcagopobkplodednkpcijlimcoo";

console.log("Multicast!");

// set up the multicast socket
multicast = new MulticastSocket({ address: "224.1.1.1", port: 5010 });
multicast.onReceive = function(e) {
  console.log(decode(e.data));
  // send the message to the extension
  chrome.runtime.sendMessage(extensionId, decode(e.data), function(response) { });
};
multicast.connect(function() {});

chrome.runtime.onSuspend.addListener(function() {
  console.log("SUSPEND");
});

function decode(data) {
  var decoder = new TextDecoder('utf-8');

  return decoder.decode(new DataView(data));
}
