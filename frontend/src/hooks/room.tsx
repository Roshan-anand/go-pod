import { useDispatch, useSelector } from "react-redux";
import type { StateT } from "../providers/redux/store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { setPodRole, setRoomDetails } from "../providers/redux/slice/room";
import { useNavigate } from "@tanstack/react-router";
import { useWsContext } from "@/providers/context/socket/config";
import type { WsData, wsEvent } from "@/lib/Type";

// const fallbackIce: RTCIceServer[] = [
//   { urls: "stun:stun.l.google.com:19302" },
//   { urls: "stun:stun1.l.google.com:19302" },
//   { urls: "stun:stun2.l.google.com:19302" },
//   { urls: "stun:stun3.l.google.com:19302" },
//   { urls: "stun:stun4.l.google.com:19302" },
// ];

//handles all the room emit and listen event's
const useRoomService = (offer: (config: RTCConfiguration) => Promise<void>) => {
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

    WsOn("room:created", ({ roomID, recName, iceInfo }: WsData) => {
      toast.success("Pod created successfully");
      dispatch(
        setRoomDetails({
          roomID,
          name,
          email,
          recName,
        })
      );

      const config: RTCConfiguration = {
        // iceServers: [iceInfo as RTCIceServer, ...fallbackIce],
        iceServers: [iceInfo as RTCIceServer],
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 10,
      };
      offer(config);
    });

    WsOn("room:joined", ({ roomID, name, email, recName, iceInfo }: WsData) => {
      toast.success("Pod joined successfully");
      dispatch(setRoomDetails({ roomID, name, email, recName }));

      const config: RTCConfiguration = {
        // iceServers: [iceInfo as RTCIceServer, ...fallbackIce],
        iceServers: [iceInfo as RTCIceServer],
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 10,
      };
      offer(config);
    });

    WsOn("room:checked", ({ exist, name }: WsData) => {
      if (exist) {
        dispatch(setPodRole("guest"));
        dispatch(
          setRoomDetails({ roomID: null, name, email: null, recName: null })
        );
      } else {
        toast.error("Invalid pod link");
        navigate({ to: "/" });
      }
    });

    WsOn("room:error", ({ msg }: WsData) => {
      toast.error(msg as string);
    });

    return () => {
      WsOff("room:created");
      WsOff("room:joined");
      WsOff("room:checked");
      WsOff("room:error");
    };
  }, [socket, WsOn, WsOff, dispatch, navigate, listeners, email, offer, name]);

  //to emit create room
  const create = (studioID: string, recName: string) => {
    if (!email || !name) return;
    const payload: wsEvent = {
      event: "create:room",
      data: {
        studioID,
        recName,
        email,
        name,
      },
    };
    WsEmit(payload);
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
