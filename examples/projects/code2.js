const SERVO = P13;
const POT = A0;

const servo = require('@amperka/servo').connect(SERVO);
const pot = require('@amperka/pot').connect(POT);

setInterval(() => {
  let angle = 180*pot.read();

  servo.write(angle);
}, 20);