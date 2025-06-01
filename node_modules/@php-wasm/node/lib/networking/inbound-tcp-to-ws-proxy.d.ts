import { WebSocketServer } from 'ws';
export declare function addTCPServerToWebSocketServerClass(wsListenPort: number, WSServer: typeof WebSocketServer): any;
export interface InboundTcpToWsProxyOptions {
    tcpListenPort: number;
    wsConnectHost?: string;
    wsConnectPort: number;
}
export declare function listenTCPToWSProxy(options: InboundTcpToWsProxyOptions): void;
