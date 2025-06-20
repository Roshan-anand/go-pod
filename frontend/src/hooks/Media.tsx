import { useWrtcContext } from "@/providers/context/wRTC/config";

const useMedia = () => {
  const { setMyStream, setAudioOpt, setVideoOpt } = useWrtcContext();

  //to access user's media stream
  const getMedia = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const device = await navigator.mediaDevices.enumerateDevices();
    const audios: MediaDeviceInfo[] = [];
    const videos: MediaDeviceInfo[] = [];
    device.map((d) => {
      if (d.kind === "audioinput") audios.push(d);
      if (d.kind === "videoinput") videos.push(d);
    });
    setAudioOpt(audios);
    setVideoOpt(videos);

    navigator.mediaDevices.ondevicechange = () => {
      console.log("device changed");
    };

    setMyStream({
      audio: new MediaStream([media.getAudioTracks()[0]]),
      video: new MediaStream([media.getVideoTracks()[0]]),
    });
  };

  return {
    getMedia,
  };
};
export default useMedia;
