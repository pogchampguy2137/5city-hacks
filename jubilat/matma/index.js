const oblicz = () => {
	const first = {
		top: parseInt(document.querySelector('#top1').value),
		bottom: parseInt(document.querySelector('#bottom1').value),
	};
	const second = {
		top: parseInt(document.querySelector('#top2').value),
		bottom: parseInt(document.querySelector('#bottom2').value),
	};

	const wynik = {
		top: -1,
		bottom: -1,
	};

	first.top = first.top * second.bottom;
	second.top = second.top * first.bottom;

	const dzialanie = document.querySelector('#dzialanie').value;

	wynik.bottom = first.bottom * second.bottom;
	wynik.top = eval(`${first.top} ${dzialanie} ${second.top}`);

	console.log(`${first.top} ${dzialanie} ${second.top}`);

	display(wynik);
};

const display = (wynik) => {
	document.querySelector('#topWynik').value = wynik.top;
	document.querySelector('#bottomWynik').value = wynik.bottom;
};
