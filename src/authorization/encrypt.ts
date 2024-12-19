import { aes256gcm } from './secret';
import readline from 'readline';
import { Writable } from 'stream';

const cipher = aes256gcm(Buffer.alloc(32));

class MutableStdout extends Writable {
  muted: boolean = false;

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
}

const mutableStdout = new MutableStdout();

const input = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true,
});

input.question('Text: ', (password: string) => {
  console.log('\nSecret: ' + cipher.encrypt(password));
  console.log('\nDecrypt: ' + cipher.decrypt(cipher.encrypt(password)));
  input.close();
});

mutableStdout.muted = true;
