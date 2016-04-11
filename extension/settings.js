function init() {
  chrome.storage.local.get({device_name: 'My Device'}, function(items) {
    document.getElementById('device_name').value = items.device_name;
  });
}

function save() {
  var device_name = document.getElementById('device_name').value;

  chrome.storage.local.set({ device_name: device_name }, function() {
    document.getElementById('status').innerHTML = 'Saved!';

    setTimeout(function() {
      document.getElementById('status').innerHTML = '';
    }, 5000);
  });
}

document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', save);
