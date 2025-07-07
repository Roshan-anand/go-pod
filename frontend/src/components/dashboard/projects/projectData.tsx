import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { FaVideo } from "react-icons/fa6";
import { FaPlus, FaShareSquare } from "react-icons/fa";
import { BiCut } from "react-icons/bi";
import { PiExportBold, PiLaptopThin } from "react-icons/pi";
import { IoMdDownload } from "react-icons/io";
import { CiCamera } from "react-icons/ci";
import type { RecordsData } from "@/lib/Type";

const DeviceInfo = ({
  device,
  className,
}: {
  device: string;
  className?: string;
}) => {
  return (
    <div className={`bg-btn-hover p-[2px] text-btn-sec size-full ${className}`}>
      {device === "cam" ? (
        <CiCamera className="size-full" />
      ) : (
        <PiLaptopThin className="size-full" />
      )}
    </div>
  );
};

const ProjectData = ({ data, path }: { data: RecordsData[]; path: string }) => {
  const [currentVideo, setCurrentVideo] = useState<RecordsData | null>(null);
  useEffect(() => {
    setCurrentVideo(data[0]);
  }, [data]);
  return (
    <main className="px-2 size-full flex flex-nowrap flex-col overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <header className="flex gap-3 mt-3 mb-24">
        <h3 className="grow">
          <input
            type="text"
            defaultValue={path}
            className="outline-none  hover:border-b-[1px] w-full"
          />
        </h3>
        <Button variant={"prime"}>share</Button>
        <Button variant={"action"} className="gap-2 ">
          <FaPlus className="inline" />
          <span>create</span>
        </Button>
      </header>
      {data.length > 0 ? (
        <>
          <section className="h-[40%] w-[65%] max-h-[550px] max-w-[600px]  bg-btn-prime rounded-md flex justify-center items-center relative">
            {currentVideo ? (
              <>
                <video
                  src={currentVideo.url}
                  className="size-full object-cover rounded-md"
                  controls
                />
                <div className="absolute w-[10%] -top-[2px] -right-[10px]">
                  <DeviceInfo
                    device={currentVideo.device}
                    className="rounded-lg"
                  />
                </div>
              </>
            ) : (
              <FaVideo className="icon-lg text-accent" />
            )}
          </section>
          {currentVideo && (
            <article className="px-2 w-[65%] max-w-[600px] flex justify-between items-center">
              <div>
                <p>{currentVideo.name}</p>
                <span className="opacity-80">
                  Created at {currentVideo.createdAt}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant={"prime"}>
                  <BiCut className="icon-sm" />
                  <span>cut</span>
                </Button>
                <Button variant={"prime"} className="gap-2">
                  <FaShareSquare className="icon-sm" />
                  <span>share</span>
                </Button>
              </div>
            </article>
          )}

          <header className=" mt-14 mb-2 flex justify-between items-center">
            <h3>Tracks</h3>
            <span>
              <Button variant={"prime"} className="gap-2">
                <span>Export all</span>
                <PiExportBold className="icon-sm" />
              </Button>
            </span>
          </header>
          <section className="flex flex-col gap-2 ">
            {data.map((item, index) => (
              <Button
                key={index}
                variant={"prime"}
                className="max-h-[85px] p-2 overflow-hidden gap-2"
                onClick={() => setCurrentVideo(item)}
              >
                <div className="relative w-[10%] h-full max-w-[85px]">
                  <video
                    src={item.url}
                    className="size-full object-cover object-top rounded-md"
                  ></video>
                  <div className="absolute size-[30%] -bottom-[2px] -right-[2px]">
                    <DeviceInfo device={item.device} className="rounded-full" />
                  </div>
                </div>
                <p>{item.name}</p>
                <p>{item.device}</p>
                <Button variant={"action"} className="ml-auto">
                  <IoMdDownload className="icon-sm" />
                </Button>
              </Button>
            ))}
          </section>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
};

export default ProjectData;
