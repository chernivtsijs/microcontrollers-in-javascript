const LED = P3;
const BTN = P2;

let state = true;
setWatch((data) => {
  if(!data.state) return;
  state = !state;
  digitalWrite(LED, state);
  //analogWrite(LED, 0.02*state);
}, BTN, {
  repeat: true,
  //debounce: 60
});