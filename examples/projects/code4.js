const BTN = P2;
const BUZZER = P3;

const button = require('@amperka/button').connect(BTN);
const buzzer = require('@amperka/buzzer').connect(BUZZER);
const kb = require('@amperka/usb-keyboard');

const SYMBOLS = {
	"·−": "a",
	"−···": "b",
	"−·−·": "c",
	"−··": "d",
	"·": "e",
	"··−·": "f",
	"−−·": "g",
	"····": "h",
	"··": "i",
	"·−−−": "j",
	"−·−": "k",
	"·−··": "l",
	"−−": "m",
	"−·": "n",
	"−−−": "o",
	"·−−·": "p",
	"−−·−": "q",
	"·−·": "r",
	"···": "s",
	"−": "t",
	"··−": "u",
	"···−": "v",
	"·−−": "w",
	"−··−": "x",
	"−·−−": "y",
	"−−··": "z",
	"−−−−−": "0",
	"·−−−−": "1",
	"··−−−": "2",
	"···−−": "3",
	"····−": "4",
	"·····": "5",
	"−····": "6",
	"−−···": "7",
	"−−−··": "8",
	"−−−−·": "9",
	"·−·−·−": ".",
	"−−··−−": ","
};


let message = [];
let timeout = null;
let click = null;

function check() {
	timeout = setTimeout(function () {
		timeout = null;
		message = message.join('');
		if (SYMBOLS.hasOwnProperty(message)) {
			message = SYMBOLS[message];
            kb.type(message);
		}

		message = [];
	}, 400);
}

button.on('press', function () {
	click = new Date();
	buzzer.turnOn();
	if (timeout !== null) {
		clearTimeout(timeout);
		timeout = null;
	}
});

button.on('release', function () {
	let diff = new Date() - click;
	click = null;
	if (diff > 200) {
		message.push('−');
	} else {
		message.push('·');
	}

	buzzer.turnOff();
	check();
});