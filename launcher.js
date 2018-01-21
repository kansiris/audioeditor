const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require("electron").remote;
const path = require('path');
const ipc = require('electron').ipcRenderer;

var launchButton = document.getElementById('launch');
var folderButton = document.getElementById('folder');
var loadNumInput = document.getElementById('loadNumber');

ipc.send("setLoadNumber", loadNumInput.value);
	
launchButton.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, '/app.html')
  let win = new BrowserWindow({ width: 800, height: 600 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()
});

folderButton.addEventListener('click', function() {
	ipc.send("openAppFolder");
});

loadNumInput.addEventListener('change', function() {
	ipc.send("setLoadNumber", loadNumInput.value);
})
