let ws;
let serverurl = "ws://localhost:5000";
// Initiate WebSocket connection
function connect(url) {
    ws = new WebSocket(url);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
}
function onOpen(event) {
    console.log("connected");
}
function onMessage(event) {
}
function onError(event) {
}
function onClose(event) {
}
connect(serverurl);
