import { BiUser } from "react-icons/bi";
import { useEffect, useRef } from "react";
import type { StreamT } from "@/lib/Type";

const Player = ({
  stream,
  user,
  className,
  vdCls,
}: {
  stream: StreamT | null;
  user: string;
  className?: string;
  vdCls?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!stream) return;
    if (videoRef.current) videoRef.current.srcObject = stream.video;
    if (audioRef.current) audioRef.current.srcObject = stream.audio;
  }, [stream]);
  return (
    <figure className={`rounded-md relative overflow-hidden ${className}`}>
      {/* using the video and audio elements directly */}
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`size-full  rounded-md object-cover transform scale-x-[-1] ${vdCls}`}
          />
          {user !== "you" && <audio ref={audioRef} autoPlay />}
        </>
      ) : (
        <div className="size-[200px] rounded-md bg-orange-300 flex items-center justify-center">
          <BiUser className="icon-lg border-4 rounded-full" />
        </div>
      )}
      <p className="absolute bottom-0 m-2 font-bold ">{user}</p>
    </figure>
  );
};

export default Player;
