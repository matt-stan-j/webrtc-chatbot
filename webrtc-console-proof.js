/**
 * WebRTC Console Connection Proof
 * Add this script to your existing setup to prove WebRTC connection in browser console
 */

class WebRTCConsoleProof {
    constructor() {
        this.localPeer = null;
        this.remotePeer = null;
        this.localStream = null;
        this.connectionProved = false;
        
        console.log('%c🚀 WebRTC Console Proof Initialized', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
        console.log('%cRun: webrtcProof.testConnection() to start proof', 'color: #2196F3; font-weight: bold;');
    }

    async testConnection() {
        console.log('%c═══════════════════════════════════════', 'color: #FF9800; font-weight: bold;');
        console.log('%c🔗 STARTING WEBRTC CONNECTION PROOF', 'color: #FF9800; font-weight: bold; font-size: 18px;');
        console.log('%c═══════════════════════════════════════', 'color: #FF9800; font-weight: bold;');
        
        try {
            await this.step1_CheckSupport();
            await this.step2_GetUserMedia();
            await this.step3_CreatePeerConnections();
            await this.step4_SetupHandlers();
            await this.step5_ExchangeSDP();
            await this.step6_WaitForConnection();
            
            this.displayProofResult();
            
        } catch (error) {
            console.error('%c❌ PROOF FAILED:', 'color: #F44336; font-weight: bold;', error.message);
            console.log('%c═══════════════════════════════════════', 'color: #F44336; font-weight: bold;');
        }
    }

    async step1_CheckSupport() {
        console.log('%c📋 Step 1: Checking WebRTC Support', 'color: #2196F3; font-weight: bold;');
        
        const checks = [
            { name: 'RTCPeerConnection', available: !!window.RTCPeerConnection },
            { name: 'getUserMedia', available: !!(navigator.mediaDevices?.getUserMedia) },
            { name: 'RTCDataChannel', available: !!window.RTCDataChannel }
        ];
        
        checks.forEach(check => {
            console.log(`  ${check.available ? '✅' : '❌'} ${check.name}: ${check.available ? 'Supported' : 'Not Supported'}`);
        });
        
        if (!checks.every(c => c.available)) {
            throw new Error('WebRTC not fully supported');
        }
        
        console.log('%c✅ WebRTC Support Verified', 'color: #4CAF50; font-weight: bold;');
    }

    async step2_GetUserMedia() {
        console.log('%c📹 Step 2: Getting User Media', 'color: #2196F3; font-weight: bold;');
        
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            console.log(`  ✅ Got ${this.localStream.getTracks().length} media tracks`);
            this.localStream.getTracks().forEach(track => {
                console.log(`    📡 ${track.kind} track: ${track.label}`);
            });
            
        } catch (error) {
            console.log('  ⚠️ Media access denied, continuing without media');
        }
    }

    async step3_CreatePeerConnections() {
        console.log('%c🔧 Step 3: Creating Peer Connections', 'color: #2196F3; font-weight: bold;');
        
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.localPeer = new RTCPeerConnection(config);
        this.remotePeer = new RTCPeerConnection(config);
        
        console.log('  ✅ Local peer connection created');
        console.log('  ✅ Remote peer connection created');
        
        // Add media tracks if available
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.localPeer.addTrack(track, this.localStream);
            });
            console.log('  ✅ Media tracks added to local peer');
        }
    }

    async step4_SetupHandlers() {
        console.log('%c⚙️ Step 4: Setting Up Connection Handlers', 'color: #2196F3; font-weight: bold;');
        
        let iceCandidatesExchanged = 0;
        
        // ICE candidate exchange
        this.localPeer.onicecandidate = (event) => {
            if (event.candidate) {
                this.remotePeer.addIceCandidate(event.candidate);
                iceCandidatesExchanged++;
                console.log(`  🧊 ICE candidate exchanged (${iceCandidatesExchanged})`);
            }
        };
        
        this.remotePeer.onicecandidate = (event) => {
            if (event.candidate) {
                this.localPeer.addIceCandidate(event.candidate);
                iceCandidatesExchanged++;
                console.log(`  🧊 ICE candidate exchanged (${iceCandidatesExchanged})`);
            }
        };
        
        // Connection state monitoring
        this.localPeer.onconnectionstatechange = () => {
            console.log(`  🔗 Local connection state: ${this.localPeer.connectionState}`);
        };
        
        this.remotePeer.onconnectionstatechange = () => {
            console.log(`  🔗 Remote connection state: ${this.remotePeer.connectionState}`);
        };
        
        // ICE connection state
        this.localPeer.oniceconnectionstatechange = () => {
            const state = this.localPeer.iceConnectionState;
            console.log(`  ❄️ ICE connection state: ${state}`);
            
            if (state === 'connected' || state === 'completed') {
                this.connectionProved = true;
                console.log('%c🎉 CONNECTION ESTABLISHED!', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
            }
        };
        
        console.log('  ✅ Connection handlers configured');
    }

    async step5_ExchangeSDP() {
        console.log('%c📝 Step 5: SDP Exchange (Offer/Answer)', 'color: #2196F3; font-weight: bold;');
        
        // Create and set offer
        const offer = await this.localPeer.createOffer();
        console.log('  ✅ Offer created');
        
        await this.localPeer.setLocalDescription(offer);
        console.log('  ✅ Local description set on local peer');
        
        await this.remotePeer.setRemoteDescription(offer);
        console.log('  ✅ Remote description set on remote peer');
        
        // Create and set answer
        const answer = await this.remotePeer.createAnswer();
        console.log('  ✅ Answer created');
        
        await this.remotePeer.setLocalDescription(answer);
        console.log('  ✅ Local description set on remote peer');
        
        await this.localPeer.setRemoteDescription(answer);
        console.log('  ✅ Remote description set on local peer');
        
        console.log('%c✅ SDP Exchange Complete', 'color: #4CAF50; font-weight: bold;');
    }

    async step6_WaitForConnection() {
        console.log('%c⏳ Step 6: Waiting for Connection Establishment', 'color: #2196F3; font-weight: bold;');
        
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds
            
            const checkConnection = () => {
                attempts++;
                const localState = this.localPeer.connectionState;
                const iceState = this.localPeer.iceConnectionState;
                
                if (this.connectionProved || localState === 'connected' || iceState === 'connected') {
                    console.log(`  ✅ Connection established after ${attempts * 100}ms`);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.log('  ⚠️ Connection timeout, but handshake completed');
                    resolve(false);
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
    }

    displayProofResult() {
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold;');
        console.log('%c🏆 WEBRTC CONNECTION PROOF COMPLETE', 'color: #4CAF50; font-weight: bold; font-size: 18px;');
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold;');
        
        const proofData = {
            connectionEstablished: this.connectionProved,
            localConnectionState: this.localPeer?.connectionState,
            remoteConnectionState: this.remotePeer?.connectionState,
            iceConnectionState: this.localPeer?.iceConnectionState,
            mediaTracksCount: this.localStream?.getTracks().length || 0,
            timestamp: new Date().toISOString()
        };
        
        console.log('%cPROOF SUMMARY:', 'color: #FF9800; font-weight: bold;');
        console.table(proofData);
        
        if (this.connectionProved || this.localPeer?.connectionState === 'connected') {
            console.log('%c✅ PROOF: WebRTC peer-to-peer connection successfully established!', 
                       'color: #4CAF50; font-weight: bold; font-size: 16px; background: #E8F5E8; padding: 5px;');
        } else {
            console.log('%c⚠️ PROOF: WebRTC handshake completed but connection pending', 
                       'color: #FF9800; font-weight: bold; font-size: 16px; background: #FFF3E0; padding: 5px;');
        }
        
        console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold;');
        console.log('%cTo run again: webrtcProof.testConnection()', 'color: #2196F3; font-weight: bold;');
        console.log('%cTo cleanup: webrtcProof.cleanup()', 'color: #2196F3; font-weight: bold;');
    }

    cleanup() {
        console.log('%c🧹 Cleaning up WebRTC connections...', 'color: #FF9800; font-weight: bold;');
        
        if (this.localPeer) {
            this.localPeer.close();
            this.localPeer = null;
        }
        
        if (this.remotePeer) {
            this.remotePeer.close();
            this.remotePeer = null;
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        this.connectionProved = false;
        console.log('%c✅ Cleanup complete', 'color: #4CAF50; font-weight: bold;');
    }
}

// Auto-initialize when script loads
window.addEventListener('load', () => {
    window.webrtcProof = new WebRTCConsoleProof();
    
    // Auto-run test after 2 seconds
    setTimeout(() => {
        console.log('%c🚀 Auto-starting WebRTC connection proof...', 'color: #9C27B0; font-weight: bold;');
        window.webrtcProof.testConnection();
    }, 2000);
});

// Also make it available immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    window.webrtcProof = new WebRTCConsoleProof();
}