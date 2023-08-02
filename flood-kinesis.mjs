import Kinesis from 'aws-sdk/clients/kinesis.js';
import { emitKeypressEvents } from 'node:readline'

const kinesis = new Kinesis({ region: 'eu-west-1' });
emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let byteCount = 0;
process.stdin.on('keypress', async (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    // generate a bunch of noisey data as a uint8array
    const noise = new Uint8Array(1000000);
    for (let i = 0; i < noise.length; i++) {
      noise[i] = Math.random() * 256;
    }
    byteCount += noise.length;
    await kinesis.putRecord({
      Data: noise,
      PartitionKey: '1',
      StreamName: 'poke-search-stream-prod'
    }).promise().catch(console.error);

    console.log(`Sent ${byteCount} to kinesis`)
  }
});
console.log('Press any key...');