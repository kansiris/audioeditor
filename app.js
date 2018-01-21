remote = require("electron").remote;
pixi = require("pixi.js");
ipc = require('electron').ipcRenderer;

const app = new PIXI.Application(window.innerWidth, window.innerHeight);

var BYTE = 8;
var SIZE = 100;
var freeze = false;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var source, bufferLength, dataArray;

var lastValue = 0;

var width = window.innerWidth;
var logo;
var back;
var currentLogo = 1;

var loadNumber = parseInt(remote.getGlobal("loadNumber"));

try {
    navigator.mediaDevices.getUserMedia(
    {
        audio: {
          echoCancellation: { exact: false }
        },
    })
    .then(gotStream)
    .catch(didntGetStream);
} catch (e) {
    alert('getUserMedia threw exception :' + e);
}

function didntGetStream(err) {
    alert('Stream generation failed');
    console.log(err);
}

function gotStream(stream) {
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);
	document.body.appendChild(app.view);
	
	for (i=1; i < (loadNumber+1); i++) {
		PIXI.loader
		.add("logo" + i, "usr/logo" +i+ ".png")
		.add("back" + i, "usr/back" +i+ ".png");
	}
	
	PIXI.loader.load(setup);
	
	window.addEventListener("keypress", keypress);
}

function setup() {
	logo = new PIXI.Sprite(PIXI.loader.resources["logo1"].texture);
	logo.anchor.set(0.5);
	logo.x = app.screen.width / 2;
	logo.y = app.screen.height / 2;
	
	back = new PIXI.Sprite(PIXI.loader.resources["back1"].texture);
	back.anchor.set(0.5);
	back.x = app.screen.width / 2;
	back.y = app.screen.height / 2;
	
	app.stage.addChild(back);
	app.stage.addChild(logo);
	
	mainTicker = app.ticker.add( function(delta) {
		analyser.getByteFrequencyData(dataArray);
		logo.height = logo.width = SIZE + dataArray[BYTE];
	});
}

function keypress(e) {
	switch (e.code) {
		case "KeyK": 
			currentLogo++;
			updateTextures();
			break;
		case "KeyJ": 
			currentLogo--;
			updateTextures();
			break;
		case "KeyF":
			remote.getCurrentWindow().setFullScreen(true);
			break;
		case "KeyR":
			resize();
			break;
		case "KeyE":
			remote.getCurrentWindow().setFullScreen(false);
			break;
		case "KeyO":
			ipc.send("openAppFolder");
			break;
		case "KeyM":
			SIZE += 10;
			break;
		case "KeyN":
			SIZE -= 10;
			break;
		case "KeyC":
			freeze = !freeze;
			if (freeze) {
				mainTicker.stop()
			} else {
				mainTicker.start()
			}
			break;
	}
}

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
	logo.x = app.screen.width / 2;
	logo.y = app.screen.height / 2;
	back.x = app.screen.width / 2;
	back.y = app.screen.height / 2;
}

function updateTextures() {
	logo.texture = PIXI.loader.resources["logo" + currentLogo].texture;
	back.texture = PIXI.loader.resources["back" + currentLogo].texture;
}

