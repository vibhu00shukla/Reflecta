const http = require('http');
const app = require('./src/app');
const { startWorker } = require('./worker');

const PORT = process.env.PORT || 3000;

// Start the worker in the background
startWorker().catch(err => console.error("Worker startup failed:", err));

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})