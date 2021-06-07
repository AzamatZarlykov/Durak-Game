let ws : any 
let serverurl : string = "ws://localhost:5000"

// Initiate WebSocket connection
function connect(url: string) : void { 
    ws = new WebSocket(url);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = onError;
    ws.onclose = onClose;
}

function onOpen (event: any) : void {
    console.log("connected");
}

function onMessage(event: any) : void {

}

function onError(event: any) : void {

}

function onClose(event: any) : void  {

}

connect(serverurl);