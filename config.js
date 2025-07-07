const CONFIG = {
    AWS_REGION: 'ap-southeast-1',
    IDENTITY_POOL_ID: 'ap-southeast-1:092548d2-2bf2-40b1-9553-aeaa5955e588', // From Step 1
    SIGNALING_CHANNEL_NAME: 'webrtc-test-channel',
    API_GATEWAY_URL: 'https://w8zrcxr2ya.execute-api.ap-southeast-1.amazonaws.com/prod', // From Step 4
    ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' }
    ],
    VIDEO_CONSTRAINTS: {
        video: { width: 640, height: 480 },
        audio: true
    }
};

window.WEBRTC_CONFIG = CONFIG;
