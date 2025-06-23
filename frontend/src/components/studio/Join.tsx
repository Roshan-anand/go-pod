import { useEffect } from "react";
import useRoomService from "../../service/room";
import { useWrtcContext } from "../../providers/context/wRTC/config";
import Player from "./Player";
import { Button } from "../ui/button";
import { SetupMedia } from "./MediaUtils";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { CheckStudioID } from "@/lib/utils";
import { setPodRole, setStudioId } from "@/providers/redux/slice/room";
import { useDispatch, useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import Loading from "@/Loading";
import useMedia from "@/hooks/Media";

const Join = ({ offer }: { offer: () => Promise<void> }) => {
  //context call
  const { myStream } = useWrtcContext();

  //redux call
  const { email, name } = useSelector((state: StateT) => state.user);
  const { role } = useSelector((state: StateT) => state.room);

  //hooks call
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { create, join, checkRoom } = useRoomService(offer);
  const { getMedia } = useMedia();

  //to validate client's authorization in the pod
  const { studioID } = useParams({ from: "/studio/$studioID" });
  const { rID } = useSearch({ from: "/studio/$studioID" }) as { rID: string };
  useEffect(() => {
    if (!email) return;

    if (CheckStudioID(studioID, email)) {
      dispatch(setStudioId(studioID));
      dispatch(setPodRole("host"));
    } else if (rID) checkRoom(rID, studioID);
    else navigate({ to: "/" });
  }, [studioID, checkRoom, email, dispatch, navigate, rID]);

  return (
    <section className="grow flex justify-center items-center gap-3 px-3">
      {role ? (
        <>
          <figure className="flex flex-col gap-3 px-3 w-1/2 max-w-[350px]">
            <p className="text-txt-sec">your about to join the users's pod</p>
            <h3>Just one step away</h3>
            <p className="flex justify-between items-center py-2 px-3 gap-3 bg-bg-sec rounded-md">
              {name}
              <span className="bg-btn-hover px-2 rounded-md">{role}</span>
            </p>
            {myStream ? (
              <Button
                variant={"action"}
                onClick={() => {
                  if (role == "host") create(studioID);
                  else join(rID);
                }}
              >
                {role == "host" ? "create " : "join "} pod
              </Button>
            ) : (
              <Button variant={"prime"} onClick={getMedia}>
                Allow access
              </Button>
            )}
          </figure>
          {myStream ? (
            <figure className="bg-btn-hover rounded-md p-2 w-1/2 max-w-[350px]">
              <Player stream={myStream} user="you" />
              <SetupMedia stream={myStream} />
            </figure>
          ) : (
            <p className="text-center w-1/2 max-w-[100px]">camera setup</p>
          )}
        </>
      ) : (
        <Loading />
      )}
    </section>
  );
};

export default Join;
