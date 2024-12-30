

export default class CreateWebSocket {
    constructor(url) {
      this.heartbeatInterval = 30000; // 心跳间隔时间，单位为毫秒
      this.heartbeatTimer = null;
      this.url =  url
      this.sendBack =  ()=>{}
    }
    connection(sendBack){
      this.websocketInstance =  new WebSocket(this.url);
      this.sendBack =  sendBack
    }
    send(data) {
        this.websocketInstance.send(data);
    }
    close() {
        this.websocketInstance.close();
    }
    onopen(callback) {
        this.websocketInstance.onopen = callback;
        this.heartbeat()
    }
    onmessage(callback) {
        this.websocketInstance.onmessage = callback;
    }
    //创建心跳链接
    heartbeat() {
      this.heartbeatTimer = setInterval(() => {
        if (this.websocketInstance.readyState === WebSocket.OPEN) {
         this.sendBack()
        } else {
          console.log('WebSocket 连接已关闭，停止发送心跳包');
          this.stopHeartbeat();
        }
      }, this.heartbeatInterval);
    }
    onerror(callback) {
        this.websocketInstance.onerror = callback;
    }
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }


}