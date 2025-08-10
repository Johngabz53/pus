// Simple server implementation for cross-device communication
// This would be deployed to a real server in a production environment

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root directory

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Store messages in memory (would use a database in production)
let messages = [];
let typingStatus = {
    admin: false,
    client: false
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    // Send all existing messages to newly connected client
    ws.send(JSON.stringify({
        type: 'allMessages',
        data: messages
    }));
    
    // Send current typing status
    ws.send(JSON.stringify({
        type: 'typingStatus',
        data: typingStatus
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'newMessage') {
            // Add new message
            messages.push(data.data);
            
            // Broadcast to all clients
            broadcastToAll({
                type: 'newMessage',
                data: data.data
            });
        } else if (data.type === 'typing') {
            // Update typing status
            typingStatus[data.user] = data.isTyping;
            
            // Broadcast typing status
            broadcastToAll({
                type: 'typingStatus',
                data: typingStatus
            });
        }
    });
});

// Broadcast message to all connected clients
function broadcastToAll(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// REST API endpoints for non-WebSocket communication
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.post('/api/messages', (req, res) => {
    const message = req.body;
    messages.push(message);
    
    // Broadcast to WebSocket clients
    broadcastToAll({
        type: 'newMessage',
        data: message
    });
    
    res.status(201).json(message);
});

app.get('/api/typing', (req, res) => {
    res.json(typingStatus);
});

app.post('/api/typing', (req, res) => {
    const { user, isTyping } = req.body;
    typingStatus[user] = isTyping;
    
    // Broadcast to WebSocket clients
    broadcastToAll({
        type: 'typingStatus',
        data: typingStatus
    });
    
    res.status(200).json(typingStatus);
});

// Define routes for main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});