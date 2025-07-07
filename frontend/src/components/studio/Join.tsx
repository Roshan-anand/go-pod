import { useEffect, useRef } from "react";
import { useWrtcContext } from "../../providers/context/wRTC/config";
import Player from "./Player";
import { Button } from "../ui/button";
import { SetupMedia } from "./MediaUtils";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { CheckStudioID } from "@/lib/utils";
import {
  setPodRole,
  setRoomDetails,
  setStudioId,
} from "@/providers/redux/slice/room";
import { useDispatch, useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import Loading from "@/Loading";
import useMedia from "@/hooks/Media";
import useRoomService from "@/hooks/room";
import { toast } from "react-toastify";

const Join = ({
  offer,
}: {
  offer: (config: RTCConfiguration) => Promise<void>;
}) => {
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
      dispatch(setRoomDetails({ roomID: null, recName: null, name, email }));
    } else if (rID) checkRoom(rID, studioID);
    else navigate({ to: "/" });
  }, [studioID, checkRoom, email, dispatch, navigate, rID, name]);

  const inpRef = useRef<HTMLInputElement>(null);

  return (
    <section className="grow flex justify-center items-center gap-3 lx:gap-10 px-3 ">
      {role ? (
        <>
          <figure className="flex flex-col gap-3 px-3 w-fit">
            <p className="text-txt-sec">your about to join the users's pod</p>
            <h3 className="border-b-2">Just one step away</h3>
            <p className="flex justify-between items-center py-2 px-3 gap-3 bg-bg-sec rounded-md">
              {name}
              <span className="bg-btn-hover px-2 rounded-md">{role}</span>
            </p>
            {role == "host" && (
              <input
                ref={inpRef}
                type="text"
                placeholder="recording name"
                className="px-2 py-1 border border-btn-hover rounded-md outline-none"
              />
            )}
            {myStream ? (
              <Button
                variant={"action"}
                onClick={() => {
                  if (role == "host") {
                    const name = inpRef.current?.value;
                    if (!name) {
                      toast.error("Please enter a recording name");
                      return;
                    }
                    create(studioID, name);
                  } else join(rID);
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
          <figure
            className={`${
              myStream && "bg-btn-hover"
            } rounded-md p-2 w-1/2 max-w-[350px]`}
          >
            {myStream ? (
              <>
                <Player stream={myStream} />
                <SetupMedia stream={myStream} />
              </>
            ) : (
              <p className="w-fit mx-auto max-w-[100px]">camera setup</p>
            )}
          </figure>
        </>
      ) : (
        <Loading />
      )}
    </section>
  );
};

export default Join;
