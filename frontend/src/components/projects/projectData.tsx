import { useState } from "react";
import { Button } from "../ui/button";
import { FaVideo } from "react-icons/fa6";
const ProjectData = ({ urls }: { urls: string[] }) => {
  const [currentVideo, setCurrentVideo] = useState<string>("");
  return (
    <figure className="grow flex">
      {urls.length > 0 ? (
        <>
          <section className="h-full flex flex-col gap-2 p-2">
            {urls.map((url, index) => (
              <Button
                key={index}
                variant={"prime"}
                className="size-fit"
                onClick={() => setCurrentVideo(url)}
              >
                <video src={url} className="size-[80px] rounded-md" />
              </Button>
            ))}
          </section>
          <section className="p-2 grow bg-btn-prime rounded-md flex justify-center items-center">
            {currentVideo ? (
              <video
                src={currentVideo}
                className="size-full object-cover rounded-md"
                controls
              />
            ) : (
              <FaVideo className="icon-lg text-accent"/>
            )}
          </section>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </figure>
  );
};

export default ProjectData;
