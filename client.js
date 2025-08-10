// Client Side JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageContainer = document.getElementById('messageContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Generate a unique device ID to identify this client
    const deviceId = getOrCreateDeviceId();
    const clientType = 'client';
    
    // API endpoint (simulated with localStorage for this demo)
    // In a real app, this would be a real server API endpoint
    const SYNC_INTERVAL = 1000; // 1 second
    
    // Load previous messages
    loadMessages();
    
    // Check for typing indicator from admin
    checkTypingStatus();
    
    // Set up interval to check for new messages and typing status
    setInterval(() => {
        loadMessages();
        checkTypingStatus();
    }, SYNC_INTERVAL);
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', function() {
        // Enable or disable send button based on input
        sendButton.disabled = messageInput.value.trim() === '';
    });
    
    // Initialize button state
    sendButton.disabled = true;
    
    // Functions
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;
        
        // Create timestamp
        const timestamp = new Date().toISOString();
        const messageId = generateUniqueId();
        
        // Create message object
        const messageObj = {
            id: messageId,
            content: message,
            sender: clientType,
            timestamp: timestamp,
            deviceId: deviceId
        };
        
        // Save message to synchronized storage
        saveMessageToSyncedStorage(messageObj);
        
        // Clear input
        messageInput.value = '';
        sendButton.disabled = true;
        
        // Update UI
        displayMessages();
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    function loadMessages() {
        displayMessages();
    }
    
    function displayMessages() {
        // Get all messages
        const messages = getAllMessages();
        
        // Clear previous messages
        messageContainer.innerHTML = '';
        
        // Display messages
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = msg.sender === 'client' ? 'message sent' : 'message received';
            
            const messageContent = document.createElement('span');
            messageContent.textContent = msg.content;
            messageDiv.appendChild(messageContent);
            
            const timeElement = document.createElement('span');
            timeElement.className = 'message-time';
            timeElement.textContent = formatTime(new Date(msg.timestamp));
            messageDiv.appendChild(timeElement);
            
            messageContainer.appendChild(messageDiv);
        });
        
        // Scroll to bottom on initial load
        scrollToBottom();
    }
    
    function checkTypingStatus() {
        // Check if admin is typing
        const typingStatus = getTypingStatus('admin');
        if (typingStatus === 'true') {
            typingIndicator.classList.remove('hidden');
        } else {
            typingIndicator.classList.add('hidden');
        }
    }
    
    function scrollToBottom() {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Synchronization functions
    function getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = generateUniqueId();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
    
    function generateUniqueId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    function saveMessageToSyncedStorage(messageObj) {
        // Get existing messages
        const messages = getAllMessages();
        
        // Add new message
        messages.push(messageObj);
        
        // Save back to storage
        localStorage.setItem('instagramMessages', JSON.stringify(messages));
        
        // In a real app, you would send this to a server API endpoint
        // To allow real-time sync between devices
        syncWithServer('saveMessage', messageObj);
    }
    
    function getAllMessages() {
        // In a real app, you would fetch this from a server API
        const storedMessages = localStorage.getItem('instagramMessages');
        return storedMessages ? JSON.parse(storedMessages) : [];
    }
    
    function getTypingStatus(userType) {
        // In a real app, this would come from a server
        return localStorage.getItem(`${userType}Typing`);
    }
    
    function syncWithServer(action, data) {
        // This is a mock function that simulates API calls
        // In a real app, this would be actual API calls to a server
        
        // For this demo, we're using localStorage, but in reality
        // you would use fetch() or WebSockets to communicate with a server
        
        // console.log(`API Call: ${action}`, data);
        
        // Using sessionStorage to simulate cross-device communication
        // In a real app, this would be handled by the server
        sessionStorage.setItem('lastSync', JSON.stringify({
            action: action,
            data: data,
            timestamp: new Date().toISOString()
        }));
    }
});