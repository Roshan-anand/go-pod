import { useDispatch, useSelector } from "react-redux";
import type { StateT } from "../providers/redux/store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { setPodRole, setRoomId } from "../providers/redux/slice/room";
import { useNavigate } from "@tanstack/react-router";
import { useWsContext } from "@/providers/context/socket/config";
import type { WsData, wsEvent } from "@/lib/Type";

//handles all the room emit and listen event's
const useRoomService = (offer: () => Promise<void>) => {
  //hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket, WsEmit, WsOn, WsOff, listeners } = useWsContext();

  //redux state
  const { email, name } = useSelector((state: StateT) => state.user);

  //to listen to all room events
  useEffect(() => {
    if (!socket) return;
    if (listeners.has("room:created")) return;

    WsOn("room:created", (data: WsData) => {
      const { roomID } = data;
      toast.success("Pod created successfully");
      dispatch(setRoomId(roomID));
    });

    WsOn("room:joined", (data: WsData) => {
      const { roomID } = data;
      toast.success("Pod joined successfully");
      dispatch(setRoomId(roomID));
    });

    WsOn("room:checked", ({ exist }: WsData) => {
      if (exist) {
        toast.success("You are one step closer to join the pod");
        dispatch(setPodRole("guest"));
      } else {
        toast.error("Invalid pod link");
        navigate({ to: "/" });
      }
    });

    return () => {
      WsOff("room:created");
      WsOff("room:joined");
      WsOff("room:checked");
    };
  }, [socket, WsOn, WsOff, dispatch, navigate, listeners]);

  //to emit create room
  const create = (studioID: string) => {
    if (!email || !name) return;
    const payload: wsEvent = {
      event: "create:room",
      data: {
        studioID,
        email,
        name,
      },
    };
    WsEmit(payload);
    offer();
  };

  //to emit join room
  const join = (roomID: string) => {
    if (!email || !name) return;
    const payload: wsEvent = {
      event: "join:room",
      data: {
        roomID,
        email,
        name,
      },
    };
    WsEmit(payload);
    offer();
  };

  //to emit check room
  const checkRoom = (roomID: string, studioID: string) => {
    const payload: wsEvent = {
      event: "check:room",
      data: {
        roomID,
        studioID,
      },
    };
    WsEmit(payload);
  };

  return { create, join, checkRoom };
};

export default useRoomService;
