import { useWsContext } from "@/providers/context/socket/config";
import { useEffect, type Dispatch, type SetStateAction } from "react";

const useSocket = (conn: Dispatch<SetStateAction<boolean>>) => {
  const { setSocket } = useWsContext();

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    //to connect ws
    const connectWS = () => {
      ws = new WebSocket(import.meta.env.VITE_BACKEND_WS_URL as string);
      ws.addEventListener("open", wsOpen);
      ws.addEventListener("close", wsClose);
      ws.addEventListener("error", wsError);
    };

    const wsOpen = () => {
      console.log("socket is connected");
      conn(true);
      setSocket(ws);
    };

    const wsClose = () => {
      console.log("socket is disconnected");
      conn(false);
      ws.close();
      reconnectTimer = setTimeout(connectWS, 4000);
    };

    const wsError = (err: Event) => {
      conn(false);
      console.log("socket error", err);
    };

    connectWS();
    //clean up
    return () => {
      ws.removeEventListener("open", wsOpen);
      ws.removeEventListener("close", wsClose);
      ws.removeEventListener("error", wsError);
      ws.close();

      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [setSocket, conn]);
};

export default useSocket;
