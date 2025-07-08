class WebRTCChatbot {
    constructor() {
        this.config = window.WEBRTC_CONFIG;
        this.sessionId = this.generateUUID();
        this.peerConnection = null;
        this.dataChannel = null;
        this.signalingClient = null;
        this.isConnected = false;
        
        this.initializeAWS();
        this.setupEventListeners();
        this.updateStatus('Ready');
    }
    
    initializeAWS() {
        AWS.config.region = this.config.AWS_REGION;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: this.config.IDENTITY_POOL_ID
        });
    }
    
    setupEventListeners() {
        document.getElementById('startCallButton').addEventListener('click', () => this.startCall());
        document.getElementById('endCallButton').addEventListener('click', () => this.endCall());
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    updateStatus(status) {
        document.getElementById('connectionStatus').textContent = `Status: ${status}`;
        document.getElementById('sessionInfo').textContent = `Session: ${this.sessionId.substring(0, 8)}...`;
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Placeholder methods - will be implemented in next steps
    async startCall() {
        this.updateStatus('Starting call...');
        // WebRTC implementation will go here
    }
    
    endCall() {
        this.updateStatus('Call ended');
        // Cleanup implementation will go here
    }
    
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message) return;
        
        this.addChatMessage('You', message);
        input.value = '';
        
        // Send via WebRTC data channel or fallback to API
        // Implementation will go here
    }
    
    addChatMessage(speaker, message, citations = null) {
        const chatDisplay = document.getElementById('chatDisplay');
        const timestamp = new Date().toLocaleTimeString();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `<strong>[${timestamp}] ${speaker}:</strong> ${message}`;
        
        if (citations && document.getElementById('showCitations').checked) {
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
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new WebRTCChatbot();
});
