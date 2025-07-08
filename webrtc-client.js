class WebRTCChatbot {
    constructor() {
        this.config = window.WEBRTC_CONFIG;
        this.sessionId = this.generateUUID();
        this.setupEventListeners();
        
        console.log('WebRTC Chatbot initialized');
        console.log('Config:', this.config);
        console.log('Session ID:', this.sessionId);
    }
    
    setupEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
        
        console.log('Event listeners set up');
    }
    
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        console.log('Send message called with:', message);
        
        if (!message) {
            console.log('Empty message, returning');
            return;
        }
        
        // Show user message
        this.addChatMessage('You', message);
        input.value = '';
        
        // Disable send button
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
        
        try {
            const url = `${this.config.API_GATEWAY_URL}/chat`;
            console.log('Sending request to:', url);
            
            const requestBody = {
                text: message,
                session_id: this.sessionId
            };
            console.log('Request body:', requestBody);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            // Handle the response
            const botMessage = data.message || 'No response received';
            this.addChatMessage('Bot', botMessage);
            
        } catch (error) {
            console.error('Send message error:', error);
            this.addChatMessage('System', `Error: ${error.message}`);
        } finally {
            // Re-enable send button
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
        }
    }
    
    addChatMessage(speaker, message) {
        const chatDisplay = document.getElementById('chatDisplay');
        const timestamp = new Date().toLocaleTimeString();
        
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<strong>[${timestamp}] ${speaker}:</strong> ${message}`;
        messageDiv.style.marginBottom = '10px';
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        
        console.log('Added message:', speaker, message);
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chatbot');
    window.chatbot = new WebRTCChatbot();
});
