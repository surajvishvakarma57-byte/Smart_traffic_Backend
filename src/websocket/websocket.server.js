import { v4 as uuidv4 } from 'uuid';

const clients = new Map();
let trafficService = null; // Will be set by initWebSocketServer
let broadcastFunc = null; // Export for use in routes

export function initWebSocketServer(wss, trafficServiceInstance) {
  console.log('🔌 Initializing WebSocket server...');

  // Use the same trafficService instance from server.js
  trafficService = trafficServiceInstance;

  wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    clients.set(clientId, ws);

    console.log(`✅ Client connected: ${clientId} (Total: ${clients.size})`);

    // Send initial data
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Smart Traffic real-time updates',
      clientId: clientId,
      timestamp: new Date().toISOString()
    }));

    // Send initial traffic data
    const initialData = trafficService.getAllLocations();
    ws.send(JSON.stringify({
      type: 'initial_data',
      data: initialData,
      timestamp: new Date().toISOString()
    }));

    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(ws, clientId, data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`❌ Client disconnected: ${clientId} (Total: ${clients.size})`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  });

  // Start broadcasting traffic updates
  startTrafficBroadcast();

  // Start broadcasting analytics updates
  startAnalyticsBroadcast();

  // Return broadcast function
  return broadcast;
}

function handleClientMessage(ws, clientId, data) {
  console.log(`📨 Message from ${clientId}:`, data.type);

  switch (data.type) {
    case 'subscribe_location':
      // Client wants updates for specific location
      ws.send(JSON.stringify({
        type: 'location_subscribed',
        locationId: data.locationId,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'request_data':
      // Client requests immediate data update
      const trafficData = trafficService.getAllLocations();
      ws.send(JSON.stringify({
        type: 'traffic_update',
        data: trafficData,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'ping':
      // Keep-alive ping
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
}

function startTrafficBroadcast() {
  const updateInterval = parseInt(process.env.TRAFFIC_UPDATE_INTERVAL) || 5000;

  setInterval(() => {
    if (clients.size === 0) return;

    // Update traffic data
    trafficService.updateTrafficConditions();
    const trafficData = trafficService.getAllLocations();

    // Broadcast to all connected clients
    broadcast({
      type: 'traffic_update',
      data: trafficData,
      timestamp: new Date().toISOString()
    });

    console.log(`📡 Broadcasted traffic update to ${clients.size} clients`);
  }, updateInterval);
}

function startAnalyticsBroadcast() {
  const updateInterval = parseInt(process.env.GRAPH_UPDATE_INTERVAL) || 10000;

  setInterval(() => {
    if (clients.size === 0) return;

    const analyticsData = trafficService.getAnalytics();

    broadcast({
      type: 'analytics_update',
      data: analyticsData,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 Broadcasted analytics update to ${clients.size} clients`);
  }, updateInterval);
}

// 🔥 EXPORT THIS - Used by routes to broadcast immediately
export function broadcast(message) {
  const messageStr = JSON.stringify(message);
  let sentCount = 0;

  clients.forEach((client, clientId) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(messageStr);
        sentCount++;
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        clients.delete(clientId);
      }
    }
  });

  return sentCount;
}

// Export client count for health checks
export function getClientCount() {
  return clients.size;
}