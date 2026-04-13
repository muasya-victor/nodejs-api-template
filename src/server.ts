import http from "http";
import app from "./app.js";
import { initializeWebSocket } from "./websocket/index.js";

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket (this attaches to the server)
initializeWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is ready`);
});
