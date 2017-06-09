const QUAD_CS = P10;
const THERM = A2;
const BTN = P2;

PrimaryI2C.setup({sda: SDA, scl: SCL});
SPI2.setup({mosi:B15, sck:B13, miso:B14});

const rtc = require('@amperka/rtc').connect(PrimaryI2C);
const quad = require('quad').connect(QUAD_CS, SPI2);

const thermometer = require('@amperka/thermometer').connect(THERM);
const button = require('@amperka/button').connect(BTN);

let showTime = true;
let interval = null;

function show(){
  if(showTime) {
    let time = rtc.getTime('unixtime');
    time = new Date((time + 3*60*60)*1000);
    quad.writeTime(time);
  } else {
    quad.writeTemp(thermometer.read('C'));
  }
}

function setup() {
  if(interval) clearInterval(interval);
  show();
  interval = setInterval(show, 1000);
}

setup();

button.on('click', function(){
  showTime = !showTime;
  setup();
});