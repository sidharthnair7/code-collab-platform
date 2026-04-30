import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';


const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080";

let stompClient = null;
let isConnected = false;

export function connectWebSocket(username,fileId, onMessageReceived) {
    console.log(' Attempting to connect to WebSocket...');

    stompClient = Stomp.over(()=> new SockJS(`${WS_BASE}/editor`));

    stompClient.debug = (str) => console.log('STOMP Debug:', str);

    stompClient.connect(
        {},
        (frame) => {
            console.log(' Connected to WebSocket:', frame);
            isConnected = true;

            console.log(' Sending username to session:', username);
            stompClient.send(
                '/app/chat.addUser',
                {},
                JSON.stringify({ sender: username, chatType: 'JOIN' })
            );

            console.log(' Subscribing to /topic/code');
            stompClient.subscribe(`/topic/code/${fileId}`, (message) => {
                const op = JSON.parse(message.body);
                onMessageReceived(op);
            });
        },
        (error) => {
            console.error(' WebSocket connection error:', error);
            isConnected = false;
        }
    );

}

export function sendCodeOperation(codeOperation) {
    if (!stompClient || !isConnected) {
        console.warn(' WebSocket not connected. Cannot send operation.');
        return;
    }

    stompClient.send('/app/code.operation', {}, JSON.stringify(codeOperation));
}

export function disconnectWebSocket() {
    if (stompClient && isConnected) {
        stompClient.disconnect(() => {
            console.log(' Disconnected from WebSocket');
            isConnected = false;
        });
    }
}
