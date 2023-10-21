import pty from 'node-pty';
import dotenv from 'dotenv';

dotenv.config();

async function runLilypad(module, version, argument) {
  return new Promise((resolve, reject) => {
    const command = 'lilypad';
    const args = ['run', `${module}:${version}`, `${argument}`];

    const ptyProcess = pty.spawn(command, args, {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env,
    });

    let fullOutput = ''; // We'll capture all the output

    ptyProcess.on('data', (data) => {
      console.log(data); // log the output for debugging
      fullOutput += data; // append data to full output
    });

    ptyProcess.on('exit', (exitCode) => {
      console.log(`Process exited with code ${exitCode}`);
      if (exitCode === 0) {
        const match = fullOutput.match(/https:\/\/ipfs\.io\/ipfs\/[a-zA-Z0-9]{46}/); // This regex may need adjustment
        if (match) {
          resolve(match[0]); // resolve with the URL
        } else {
          reject('URL not found in the process output.');
        }
      } else {
        reject(`Process exited with code ${exitCode}`);
      }
    });
  });
}

export default runLilypad;
