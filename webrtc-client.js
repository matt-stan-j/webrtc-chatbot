class WebRTCChatbot {
    constructor() {
        this.config = window.WEBRTC_CONFIG;
        this.sessionId = this.generateUUID();
        this.peerConnection = null;
        this.dataChannel = null;
        this.signalingClient = null;
        this.isConnected = false;
        
        this.setupEventListeners();
        this.updateStatus('Ready');
        console.log('WebRTC Chatbot initialized');
    }
    
    setupEventListeners() {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
        });
        
        // If DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachEventListeners();
            });
        } else {
            this.attachEventListeners();
        }
    }
    
    attachEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        
        console.log('Attaching event listeners...');
        console.log('Send button:', sendButton);
        console.log('Message input:', messageInput);
        
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                console.log('Send button clicked');
                this.sendMessage();
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed');
                    this.sendMessage();
                }
            });
        }
    }
    
    async sendMessage() {
        console.log('=== SEND MESSAGE CALLED ===');
        
        const input = document.getElementById('messageInput');
        const message = input ? input.value.trim() : '';
        
        console.log('Input element:', input);
        console.log('Message:', message);
        
        if (!message) {
            console.log('Empty message, returning');
            return;
        }
        
        // Show user message
        this.addChatMessage('You', message);
        input.value = '';
        
        // Disable send button
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.textContent = 'Sending...';
        }
        
        try {
            const url = `${this.config.API_GATEWAY_URL}/chat`;
            console.log('Sending request to:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    session_id: this.sessionId,
                    webrtc_enabled: this.isConnected
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            const botMessage = data.message || 'No response received';
            const citations = data.citations || [];
            
            this.addChatMessage('Bot', botMessage, citations);
            
        } catch (error) {
            console.error('Send message error:', error);
            this.addChatMessage('System', `Error: ${error.message}`);
        } finally {
            // Re-enable send button
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
            }
        }
    }
    
    addChatMessage(speaker, message, citations = null) {
        const chatDisplay = document.getElementById('chatDisplay');
        if (!chatDisplay) {
            console.error('Chat display not found');
            return;
        }
        
        const timestamp = new Date().toLocaleTimeString();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `<strong>[${timestamp}] ${speaker}:</strong> ${message}`;
        
        if (citations && citations.length > 0 && document.getElementById('showCitations')?.checked) {
            const citationsDiv = document.createElement('div');
            citationsDiv.className = 'citations';
            citationsDiv.innerHTML = '<strong>📚 Sources:</strong><br>' + 
                citations.slice(0, 3).map((c, i) => 
                    `${i+1}. ${c.source.split('/').pop()} (relevance: ${c.score.toFixed(2)})`
                ).join('<br>');
            messageDiv.appendChild(citationsDiv);
        }
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
        
        console.log('Added message:', speaker, message);
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = `Status: ${status}`;
        }
        
        const sessionElement = document.getElementById('sessionInfo');
        if (sessionElement) {
            sessionElement.textContent = `Session: ${this.sessionId.substring(0, 8)}...`;
        }
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

