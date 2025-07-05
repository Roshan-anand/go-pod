import type { StateT } from "@/providers/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useWrtcContext } from "@/providers/context/wRTC/config";
import { useNavigate } from "@tanstack/react-router";
import { setRoomDetails } from "@/providers/redux/slice/room";

const useStudio = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomID } = useSelector((state: StateT) => state.room);
  const { myScreen, myStream, setMyStream, setMyScreen } = useWrtcContext();

  const leaveStudio = () => {
    if (roomID)
      dispatch(setRoomDetails({ roomID: null, host: null, recName: null }));

    //stop the local stream
    if (myStream) {
      myStream.audio.getTracks().forEach((track) => {
        track.stop();
      });
      myStream.video.getTracks().forEach((track) => {
        track.stop();
      });
      setMyStream(null);

      //disconnect all the peers
    }

    //disconnect the screen share
    if (myScreen) {
      myScreen.audio.getTracks().forEach((track) => {
        track.stop();
      });
      myScreen.video.getTracks().forEach((track) => {
        track.stop();
      });
      setMyScreen(null);
    }
    navigate({ to: "/dashboard" });
  };

  return { leaveStudio };
};
export default useStudio;
