import Join from "../components/studio/Join";
import { useSelector } from "react-redux";
import Pod from "../components/studio/Pod";
import type { StateT } from "../providers/redux/store";
import useAuth from "@/hooks/auth";
import Loading from "@/Loading";
import { StudioNav } from "@/components/studio/Nav";
import useSocket from "@/hooks/socket";
import { useState } from "react";
import useWrtcService from "@/hooks/wRTC";

const Studio = () => {
  useAuth();

  const { roomID } = useSelector((state: StateT) => state.room);
  const { name, email } = useSelector((state: StateT) => state.user);
  const [isConnected, setIsConnected] = useState(false);

  useSocket(setIsConnected);
  const { initOffer } = useWrtcService();

  if (!email || !name) return <Loading />;

  return (
    <main className="bg-bg-prime h-screen flex flex-col">
      <StudioNav />
      {isConnected ? (
        <>{roomID ? <Pod /> : <Join offer={initOffer} />}</>
      ) : (
        <Loading />
      )}
    </main>
  );
};

export default Studio;
