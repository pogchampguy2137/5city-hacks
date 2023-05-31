import { VRect, CaptureScreenshot } from 'windows-ffi';
import { uIOhook } from 'uiohook-napi';
import { mouse, Point, straightTo } from '@nut-tree/nut-js';

let mouseX = 0,
	mouseY = 0,
	mouseReady = false;

console.log('Click on yellow dot.');
uIOhook.on('mousedown', (event) => {
	if (mouseReady) return;
	mouseX = event.x;
	mouseY = event.y;
	mouseReady = true;
	console.log('Looking for next yellow dot positions...');
});
uIOhook.start();

const SQUARE_SIZE = 100;

let ms = 0;
setInterval(async () => {
	if (!mouseReady) return;

	// const now = Date.now();
	// console.log(now - ms, 'ms');
	// ms = now;

	let squareX = 0,
		squareY = 0;

	squareX = mouseX - SQUARE_SIZE / 2;
	squareY = mouseY - SQUARE_SIZE / 2;

	const screenshot = CaptureScreenshot({
		rectToCapture: new VRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE),
	});

	let yellowX = 0,
		yellowY = 0,
		yellowFound = false;
	for (let x = 0; x < SQUARE_SIZE; x++) {
		for (let y = 0; y < SQUARE_SIZE; y++) {
			if (screenshot.GetPixel(x, y).ToHex_RGB() === 'ffff00') {
				yellowX = x;
				yellowY = y;
				yellowFound = true;
				break;
			}
		}
	}

	if (yellowFound) {
		mouseX = squareX + yellowX;
		mouseY = squareY + yellowY;

		mouse.setPosition(new Point(mouseX - 32, mouseY));
	}
}, 1);
