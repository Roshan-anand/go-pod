import type { WsData, wsEvent } from "@/lib/Type";
import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

type contextT = {
  socket: WebSocket | null;
  setSocket: Dispatch<SetStateAction<WebSocket | null>>;
  WsEmit: (data: wsEvent) => void;
  WsOn: (ev: string, cb: (data: WsData) => void) => void;
  WsOff: (ev: string) => void;
  listeners: Map<string, (data: WsData) => void>;
};

export const WsContext = createContext<contextT | null>(null);

export const useWsContext = () => {
  const context = useContext(WsContext);
  if (!context) {
    throw new Error("inter error");
  }
  return context;
};
