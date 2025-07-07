import { CiFolderOn } from "react-icons/ci";
import { Button } from "../../ui/button";
import { podStore } from "@/config/s3client";
import type { StateT } from "@/providers/redux/store";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import React, { useEffect, useRef, useState, type SetStateAction } from "react";
import { useSelector } from "react-redux";

const ProjectFolders = ({
  setPath,
  getProjects,
}: {
  setPath: React.Dispatch<SetStateAction<string>>;
  getProjects: (path: string) => Promise<void>;
}) => {
  const { email, name } = useSelector((state: StateT) => state.user);
  const Bucket = import.meta.env.VITE_S3_BUCKET_NAME as string;

  const [dataAvailable, setDataAvailable] = useState(false);

  const projectFolder = useRef<Record<string, Date>>({});

  // to get the all projects folder details
  // if the user has not created any project, then it will return empty array
  useEffect(() => {
    if (!email || dataAvailable) return;
    const getProjectsList = async () => {
      const cmd = new ListObjectsV2Command({
        Bucket,
        Prefix: `${email}/`,
      });

      try {
        const { Contents } = await podStore.send(cmd);
        if (Contents) {
          Contents.forEach((item) => {
            const name = item.Key?.split("/")[1];
            if (!name) return;
            if (!projectFolder.current[name])
              projectFolder.current[name] = item.LastModified || new Date();
          });
        }
        setDataAvailable(true);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setDataAvailable(false);
        return;
      }
    };

    getProjectsList();
  }, [email, Bucket, dataAvailable, setDataAvailable, name]);

  return (
    <figure className="flex size-full gap-3">
      {projectFolder.current &&
        Object.entries(projectFolder.current).map(([name, date]) => (
          <Button
            onClick={() => {
              getProjects(name);
              setPath(name);
            }}
            variant={"prime"}
            key={name}
            className="w-1/3 max-w-[180px] relative flex flex-col h-fit"
          >
            <CiFolderOn className="size-full" />
            <h6 className="absolute top-1/2 left-1/2 -translate-1/2 text-[0.8rem]">
              {name}
            </h6>
            <p className="text-center font-bold">{`${date.getDate()} / ${
              date.getMonth() + 1
            } / ${date.getFullYear()}`}</p>
          </Button>
        ))}
    </figure>
  );
};

export default ProjectFolders;
