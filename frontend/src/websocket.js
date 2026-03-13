import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;
let isConnected = false;

export function connectWebSocket(username,fileId, onMessageReceived) {
    console.log('🔵 Attempting to connect to WebSocket...');

    const socket = new SockJS('http://localhost:8080/editor');
    stompClient = Stomp.over(socket);

    stompClient.debug = (str) => console.log('STOMP Debug:', str);

    stompClient.connect(
        {},
        (frame) => {
            console.log('✅ Connected to WebSocket:', frame);
            isConnected = true;

            console.log('📤 Sending username to session:', username);
            stompClient.send(
                '/app/chat.addUser',
                {},
                JSON.stringify({ sender: username, chatType: 'JOIN' })
            );

            console.log('📥 Subscribing to /topic/code');
            stompClient.subscribe(`/topic/code/${fileId}`, (message) => {
                const op = JSON.parse(message.body);
                onMessageReceived(op);
            });
        },
        (error) => {
            console.error('❌ WebSocket connection error:', error);
            isConnected = false;

            setTimeout(() => {
                console.log('🔄 Attempting to reconnect...');
                connectWebSocket(username, fileId, onMessageReceived);
            }, 5000);
        }
    );

    socket.onclose = () => {
        console.log('🔌 Socket closed');
        isConnected = false;
    };
}

export function sendCodeOperation(codeOperation) {
    if (!stompClient || !isConnected) {
        console.warn('⚠️ WebSocket not connected. Cannot send operation.');
        return;
    }

    stompClient.send('/app/code.operation', {}, JSON.stringify(codeOperation));
}

export function disconnectWebSocket() {
    if (stompClient && isConnected) {
        stompClient.disconnect(() => {
            console.log('👋 Disconnected from WebSocket');
            isConnected = false;
        });
    }
}
