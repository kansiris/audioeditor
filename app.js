remote = require("electron").remote;
pixi = require("pixi.js");
ipc = require('electron').ipcRenderer;

const app = new PIXI.Application(window.innerWidth, window.innerHeight);

var BYTE = parseInt(remote.getGlobal("sampleByte"));
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
var useVideo = remote.getGlobal("videoMode");

var textureArr = [];

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
    alert('Something went wrong...');
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
		if (useVideo) {
			PIXI.loader
			.add("logo" + i, "usr/logo" +i+ ".png");
			
			textureArr[i] = PIXI.Texture.fromVideoUrl('usr/video' +i+ '.mp4');
		} else {
			PIXI.loader
			.add("logo" + i, "usr/logo" +i+ ".png")
			.add("back" + i, "usr/back" +i+ ".png");
		}
	}
	
	PIXI.loader.load(setup);
	
	window.addEventListener("keypress", keypress);
}

function setup() {
	
	if (useVideo) {
		back = new PIXI.Sprite(textureArr[1]);
	} else {
		back = new PIXI.Sprite(PIXI.loader.resources["back1"].texture);
	}
	
	if (useVideo) {
		for (j = 1; j < textureArr.length; j++) {
			textureArr[j].baseTexture.source.loop = "loop";
			textureArr[j].baseTexture.source.muted = true;
		}
	}

	logo = new PIXI.Sprite(PIXI.loader.resources["logo1"].texture);
	logo.anchor.set(0.5);
	
	back.anchor.set(0.5);
	
	app.stage.addChild(back);
	app.stage.addChild(logo);
	
	mainTicker = app.ticker.add( function(delta) {
		analyser.getByteFrequencyData(dataArray);
		logo.height = logo.width = SIZE + dataArray[BYTE];
	});
	
	updateTextures();
	resize();
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
	
	back.width = window.innerWidth;
	back.height = window.innerHeight;
}

function updateTextures() {
	
	
	if (useVideo) {
		back.texture = textureArr[currentLogo];
	} else {
		back.texture = PIXI.loader.resources["back" + currentLogo].texture;
	}
	
	logo.texture = PIXI.loader.resources["logo" + currentLogo].texture;
}

