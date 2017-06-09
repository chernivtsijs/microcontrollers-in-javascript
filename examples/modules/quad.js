const Quad = function (pin, spi) {
	this._pin = pin;
	this._spi = spi;
	this._text = [];
};

Quad.prototype._size = 4;

Quad.prototype.SYMBOLS = {
	' ': 0b11111111,
	'-': 0b01111111,
	'_': 0b11101111,
	'0': 0b10000001,
	'1': 0b11110011,
	'2': 0b01001001,
	'3': 0b01100001,
	'4': 0b00110011,
	'5': 0b00100101,
	'6': 0b00000101,
	'7': 0b11110001,
	'8': 0b00000001,
	'9': 0b00100001,
	'C': 0b10001101,
	'°': 0b00111001
};

exports.connect = function (pin, spi) {
	return new Quad(pin, spi);
};

if (!String.prototype.repeat) {
	String.prototype.repeat = function (count) {
		'use strict';
		if (this === null) {
			throw new TypeError('can\'t convert ' + this + ' to object');
		}
		let str = '' + this;
		count = +count;
		if (count != count) {
			count = 0;
		}
		if (count < 0) {
			throw new RangeError('repeat count must be non-negative');
		}
		if (count == Infinity) {
			throw new RangeError('repeat count must be less than infinity');
		}
		count = Math.floor(count);
		if (str.length == 0 || count == 0) {
			return '';
		}
		if (str.length * count >= 1 << 28) {
			throw new RangeError('repeat count must not overflow maximum string size');
		}
		let rpt = '';
		for (; ;) {
			if ((count & 1) == 1) {
				rpt += str;
			}
			count >>>= 1;
			if (count === 0) {
				break;
			}
			str += str;
		}
		return rpt;
	};
}

if (typeof Object.assign != 'function') {
	(function () {
		Object.assign = function (target) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var output = Object(target);
			for (var index = 1; index < arguments.length; index++) {
				var source = arguments[index];
				if (source !== undefined && source !== null) {
					for (var nextKey in source) {
						if (source.hasOwnProperty(nextKey)) {
							output[nextKey] = source[nextKey];
						}
					}
				}
			}
			return output;
		};
	})();
}

const cache = [
	'',
	' ',
	'  ',
	'   ',
	'    ',
	'     ',
	'      ',
	'       ',
	'        ',
	'         '
];

function leftPad(str, len, ch) {
	// convert `str` to `string`
	str = str + '';
	// `len` is the `pad`'s length now
	len = len - str.length;
	// doesn't need to pad
	if (len <= 0) return str;
	// `ch` defaults to `' '`
	if (!ch && ch !== 0) ch = ' ';
	// convert `ch` to `string`
	ch = ch + '';
	// cache common use cases
	if (ch === ' ' && len < 10) return cache[len] + str;
	// `pad` starts with an empty string
	let pad = '';
	// loop
	while (true) {
		// add `ch` to `pad` if `len` is odd
		if (len & 1) pad += ch;
		// divide `len` by 2, ditch the remainder
		len >>= 1;
		// "double" the `ch` so this operation count grows logarithmically on `len`
		// each time `ch` is "doubled", the `len` would need to be "doubled" too
		// similar to finding a value in binary search tree, hence O(log(n))
		if (len) ch += ch;
		// `len` is 0, exit the loop
		else break;
	}
	// pad `str`!
	return pad + str;
}

Quad.prototype._convertText = function (text) {
	text = text.toString();
	if (text.length > this._size) text = '----';
	text = leftPad(text, this._size, ' ');
	text = text.split('');
	this._text = text.map(function (a) {
		return this.SYMBOLS[a];
	}.bind(this));
};

Quad.prototype._sendText = function () {
	this._spi.write(this._text, this._pin);
};


Quad.prototype.writeFloat = function (float, precision) {
	if (!precision) precision = 0;
	float *= Math.pow(10, precision);
	float = float.toFixed(0);

	this._convertText(float);
	this._toggleDot(precision);
	this._sendText();
};

Quad.prototype._toggleDot = function (position) {
	position = this._size - position - 1;
	this._text[position] &= 0b11111110;
};

Quad.prototype.writeTemp = function (temp, precise) {
	if (!precise && temp >= 0 && temp < 100) {
		temp = temp.toFixed(0) + '°C';
	} else {
		return this.writeFloat(temp, (temp > 100 || temp < 0) ? 1 : 2);
	}

	this._convertText(temp);
	this._sendText();
};

Quad.prototype.writeTime = function (date) {
	let time = leftPad(date.getHours(), 2, "0") + leftPad(date.getMinutes(), 2, "0");
	this._convertText(time);
	this._sendText();

	setTimeout(function () {
		this._toggleDot(2);
		this._sendText();
	}.bind(this), 600);
};