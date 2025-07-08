class WebRTCChatbot {
    constructor() {
        this.config = window.WEBRTC_CONFIG;
        this.sessionId = this.generateUUID();
        this.localStream = null;
        this.peerConnection = null;
        
        this.setupEventListeners();
        this.addWebRTCControls();
        console.log('WebRTC Chatbot initialized');
    }
    
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
        });
        
        if (document.readyState !== 'loading') {
            this.attachEventListeners();
        }
    }
    
    attachEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        
        if (sendButton && messageInput) {
            // Remove existing listeners by cloning elements
            const newSendButton = sendButton.cloneNode(true);
            const newMessageInput = messageInput.cloneNode(true);
            
            sendButton.parentNode.replaceChild(newSendButton, sendButton);
            messageInput.parentNode.replaceChild(newMessageInput, messageInput);
            
            // Attach single event listeners
            newSendButton.onclick = () => this.sendMessage();
            newMessageInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.sendMessage();
            };
            
            console.log('Chat event listeners attached');
        }
    }
    
    addWebRTCControls() {
        // Add WebRTC controls if they don't exist
        if (!document.getElementById('startVideoButton')) {
            const webrtcControls = document.createElement('div');
            webrtcControls.innerHTML = `
                <div style="margin: 20px 0; padding: 15px; border: 2px solid #007bff; border-radius: 10px; background-color: #f8f9fa;">
                    <h3 style="color: #007bff;">🎥 WebRTC Video Call</h3>
                    <button id="startVideoButton" style="margin: 5px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px;">Start Video</button>
                    <button id="endVideoButton" style="margin: 5px; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 5px;" disabled>End Video</button>
                    <div style="display: flex; gap: 10px; margin: 10px 0;">
                        <video id="localVideo" width="200" height="150" autoplay muted style="border: 2px solid #007bff; border-radius: 5px;"></video>
                        <video id="remoteVideo" width="200" height="150" autoplay style="border: 2px solid #6c757d; border-radius: 5px;"></video>
                    </div>
                    <div id="webrtcStatus" style="font-weight: bold; color: #007bff;">Status: Ready</div>
                </div>
            `;
            
            document.body.insertBefore(webrtcControls, document.body.firstChild);
            
            // Attach WebRTC event listeners
            document.getElementById('startVideoButton').onclick = () => this.startVideo();
            document.getElementById('endVideoButton').onclick = () => this.endVideo();
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input ? input.value.trim() : '';
        
        if (!message) return;
        
        this.addChatMessage('You', message);
        input.value = '';
        
        try {
            const response = await fetch(`${this.config.API_GATEWAY_URL}/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    text: message,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            this.addChatMessage('Bot', data.message || 'No response');
            
        } catch (error) {
            this.addChatMessage('System', `Error: ${error.message}`);
        }
    }
    
    async startVideo() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true, audio: true
            });
            
            document.getElementById('localVideo').srcObject = this.localStream;
            document.getElementById('startVideoButton').disabled = true;
            document.getElementById('endVideoButton').disabled = false;
            document.getElementById('webrtcStatus').textContent = 'Status: Video Active';
            
            this.addChatMessage('System', '🎥 Video call started');
            
        } catch (error) {
            document.getElementById('webrtcStatus').textContent = 'Error: ' + error.message;
            this.addChatMessage('System', 'Video error: ' + error.message);
        }
    }
    
    endVideo() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        document.getElementById('localVideo').srcObject = null;
        document.getElementById('startVideoButton').disabled = false;
        document.getElementById('endVideoButton').disabled = true;
        document.getElementById('webrtcStatus').textContent = 'Status: Ready';
        
        this.addChatMessage('System', '🛑 Video call ended');
    }
    
    addChatMessage(speaker, message) {
        const chatDisplay = document.getElementById('chatDisplay');
        if (!chatDisplay) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `<strong>[${timestamp}] ${speaker}:</strong> ${message}`;
        messageDiv.style.marginBottom = '10px';
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new WebRTCChatbot();
});
