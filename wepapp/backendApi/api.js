import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Bull from 'bull';
import runLilypad from './Lilypad.js';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3050;

app.use(express.json());

// Replace with your Redis configuration
const myQueue = new Bull('lilypad_queue', {
  redis: { host: '127.0.0.1', port: 6379 }
});

io.on('connection', (socket) => {
  console.log('User connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.id);
  });

  // No global event listeners are needed here unless you want to listen for global events
});

app.post('/api/run-lilypad', async (req, res) => {
  const { code, version, description } = req.body;

  if (!code || !version || !description) {
    console.log('Job creation failed: Missing parameters');
    return res.status(400).send('Missing parameters');
  }

  console.log('Received job with:', { code, version, description });

  // Create a job and add it to the job queue
  const job = await myQueue.add({ code, version, description });

  console.log('Job created with ID:', job.id);
  
  // Await the job completion here and then proceed
  job.finished().then(async (result) => {
    console.log('Job completed with result:', result);

    // Extract the base URL from the result and append the specific path for the image
    let imageURL = `${result}/outputs/image-0.png`;

    console.log('Sending response to client:', imageURL);
    res.json({ message: 'Job completed', imageUrl: imageURL });
  }).catch((err) => {
    console.error('Job failed:', err);
    res.status(500).send('Job failed');
  });
});

myQueue.process(async (job) => {
  try {
    console.log('Processing job ID:', job.id);

    const { code, version, description } = job.data;
    const result = await runLilypad(code, version, description);

    console.log('runLilypad function returned:', result);
    
    // assuming result is the URL: "https://ipfs.io/ipfs/QmW9PtifZzXCuJi8pxStEoFxKPxp8fPU8NhweRjaW38j5d"
    return result; // this result will be passed to the 'finished' event
  } catch (error) {
    console.error('Error processing job:', error);
    throw new Error('Job processing failed'); // this will trigger the 'failed' event on the job
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
