import Jimp from 'jimp';

/*
    Obramówka: #545454
    Tło: #0e0e0e

*/

const COLORS = {
	BACKGROUND: -1,
};

export const format = async (url) => {
	return new Promise((resolve, reject) => {
		Jimp.read(url, (error, image) => {
			if (error) return reject();
			let start = Date.now();

			let boxId = 0;
			let boxWidth = -1;

			let ignoreY = -1;
			let ignoreX = -1;

			const boxes = [];

			COLORS.BACKGROUND = intToHex(image.getPixelColor(0, 0));
			console.log('Background color is:', COLORS.BACKGROUND);

			for (let y = 0; y < image.getHeight(); y++) {
				if (ignoreY !== -1 && y <= ignoreY) continue;
				ignoreY = -1;
				ignoreX = -1;
				for (let x = 0; x < image.getWidth(); x++) {
					if (ignoreX !== -1 && x <= ignoreX) continue;

					const pixelColor = intToHex(image.getPixelColor(x, y));
					if (pixelColor !== COLORS.BACKGROUND) {
						if (
							intToHex(image.getPixelColor(x + 1, y)) !== COLORS.BACKGROUND &&
							intToHex(image.getPixelColor(x, y + 1)) !== COLORS.BACKGROUND
						) {
							if (boxWidth === -1) {
								console.log('Calculating box size.');
								let nextColor = '';
								do {
									boxWidth++;
									nextColor = intToHex(image.getPixelColor(x + boxWidth, y));
								} while (nextColor !== COLORS.BACKGROUND);
								console.log(`Found end of the box. The size is ${boxWidth} pixels!`);
							}

							boxes.push({
								id: boxId++,
								x,
								y,
								pixels: [],
							});
							ignoreX = x + boxWidth + 1;
							ignoreY = y + boxWidth + 1;
						}
					}
				}
			}
			console.log(`Found ${boxes.length} boxes with size of ${boxWidth}px.`);

			console.info('Reading pixels...');
			for (const box of boxes) {
				for (let y = box.y; y < box.y + boxWidth; y++) {
					for (let x = box.x; x < box.x + boxWidth; x++) {
						box.pixels.push(intToHex(image.getPixelColor(x, y)));
					}
				}
			}
			console.info('Reading done.');

			console.info('Looking for duplicates...');

			const duplicates = findDuplicates(boxes);

			console.log(`Found ${duplicates.length} duplicates.`);

			for (const duplicate of duplicates) {
				console.log(`${duplicate.first.x}, ${duplicate.first.y} is ${duplicate.second.x}, ${duplicate.second.y}`);
				const color = getRandomColor();

				for (let x = 0; x < 10; x++) {
					for (let y = 0; y < 40; y++) {
						image.setPixelColor(Jimp.cssColorToHex(color), duplicate.first.x + x, duplicate.first.y + y);
						image.setPixelColor(Jimp.cssColorToHex(color), duplicate.second.x + x, duplicate.second.y + y);
					}
				}
			}
			console.info(`This proccess took ${Date.now() - start}ms.`);

			image
				.getBase64Async(image.getMIME())
				.then((data) => resolve({ duplicates: duplicates.length, boxes: boxes.length, img: data }));
		});
	});
};

// export const isSame = (pixelsA, pixelsB) => {
// 	let same = 0;
// 	for (let i = 0; i < pixelsA.length; i++) {
// 		if (pixelsA[i] === pixelsB[i]) same++;
// 	}
// };

export const isSame = (pixelsA, pixelsB) => {
	let same = 0;
	for (let i = 0; i < pixelsA.length; i++) {
		if (pixelsA[i] === pixelsB[i]) same++;
	}
	return (same / pixelsA.length) * 100;
};
export const intToHex = (int) => {
	const rgb = Jimp.intToRGBA(int);
	return '#' + ((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b).toString(16).slice(1);
};

export const findDuplicates = (boxes) => {
	const found = [];
	const duplicates = [];

	for (const box of boxes) {
		if (found.includes(box.id)) continue;
		for (const compareBox of boxes) {
			if (box.id === compareBox.id) continue;
			if (found.includes(compareBox.id)) continue;
			if (isSame(box.pixels, compareBox.pixels) > 97) {
				duplicates.push({
					first: box,
					second: compareBox,
				});
				found.push(box.id);
				found.push(compareBox.id);
			}
			if (found.includes(compareBox.id)) continue;
			if (box.pixels.join('') === compareBox.pixels.join('')) {
				duplicates.push({
					first: box,
					second: compareBox,
				});
				found.push(box.id);
				found.push(compareBox.id);
			}
		}
	}

	return duplicates;
};

Object.defineProperty(Array.prototype, 'chunk', {
	value: function (chunkSize) {
		var R = [];
		for (var i = 0; i < this.length; i += chunkSize) R.push(this.slice(i, i + chunkSize));
		return R;
	},
});

// export const saveImage = (size, pixels, name) => {
// 	new Jimp(size, size, (error, image) => {
// 		const chunks = pixels.chunk(size);
// 		for (let y = 0; y < chunks.length; y++) {
// 			const chunk = chunks[y];
// 			for (let x = 0; x < chunk.length; x++) {
// 				image.setPixelColor(Jimp.cssColorToHex(chunk[x]), x, y);
// 			}
// 		}
// 		image.write(`./boxes/${name}.png`);
// 	});
// };

export const getRandomColor = () => {
	return Math.floor(Math.random() * 16777215).toString(16);
};
