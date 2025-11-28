const http = require('http');
const healthRoutes = require('./src/routes/health.routes');
const { startWorker } = require('./worker');

const app = express();
const PORT = process.env.PORT || 3000;

// Start the worker in the background
startWorker().catch(err => console.error("Worker startup failed:", err));

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})