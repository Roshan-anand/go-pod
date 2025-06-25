import { useSelector } from "react-redux";
import type { StateT } from "../../providers/redux/store";
import { useWrtcContext } from "../../providers/context/wRTC/config";
import Player from "./Player";
import {
  ControlerCamera,
  ControlerMic,
  ControlerRecord,
  ControlerScreenShare,
  ControlerSpeaker,
} from "./MediaUtils";
import { Button } from "../ui/button";
import useStudio from "@/hooks/studio";
import { FcEndCall } from "react-icons/fc";
import clsx from "clsx";
import SideBar from "./SideBar";
import useMediaChange from "@/hooks/MediaChange";
import useRecordingService from "@/hooks/Recording";

const Pod = () => {
  const { name } = useSelector((state: StateT) => state.user);
  const { remoteStreams, remoteScreens, myStream, myScreen } = useWrtcContext();
  const { leaveStudio } = useStudio();
  useMediaChange();
  useRecordingService();

  const count = remoteStreams.size + 1;
  const columns = count == 1 ? 1 : count <= 3 ? 2 : Math.ceil(count / 2);
  const gridCols = clsx({
    "grid-cols-1": columns === 1,
    "grid-cols-2": columns === 2,
    "grid-cols-3": columns === 3,
    "grid-cols-4": columns >= 4,
    "grid-cols-5": columns >= 5,
    "grid-cols-6": columns >= 6,
    "grid-cols-7": columns >= 7,
    "grid-cols-8": columns >= 8,
  });

  return (
    <main className="grow max-h-[95vh] flex px-2 ">
      <section className="grow flex flex-col gap-2">
        <figure className={`grow max-h-[90%] p-5 grid  gap-1 ${gridCols}`}>
          <Player
            stream={myStream}
            user={"you"}
            className={`${
              count % 2 !== 0 ? "row-span-2" : ""
            } border-2 border-accent`}
          />
          {myScreen && (
            <Player
              stream={myScreen}
              vdCls="scale-x-[1]"
              user={`${name} (screen)`}
            />
          )}
          {Array.from(remoteStreams.entries()).map(([email, stream]) => (
            <Player stream={stream} user={email} key={email} />
          ))}
          {Array.from(remoteScreens.entries()).map(([email, stream]) => (
            <Player stream={stream} user={email} key={email} />
          ))}
        </figure>
        <figure className="h-[10%] mx-auto rounded-md mb-2 flex gap-3 items-center [&>*]:rounded-full [&>*]:p-3">
          {myStream && (
            <>
              <ControlerRecord />
              <ControlerScreenShare />
              <ControlerCamera
                stream={myStream.video}
                className="bg-btn-hover"
              />
              <ControlerMic stream={myStream.audio} className="bg-btn-hover" />
              <ControlerSpeaker />
              <Button variant={"prime"} onClick={leaveStudio}>
                <FcEndCall className="icon-md" />
              </Button>
            </>
          )}
        </figure>
      </section>
      <SideBar />
    </main>
  );
};

export default Pod;
