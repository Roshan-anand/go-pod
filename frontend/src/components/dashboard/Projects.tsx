import { useState } from "react";
import ProjectFolders from "./projects/folders";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { podStore } from "@/config/s3client";
import ProjectData from "./projects/projectData";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import type { RecordsData } from "@/lib/Type";

const Projects = () => {
  const { email } = useSelector((state: StateT) => state.user);

  const [projectPath, setProjectPath] = useState<string>("");
  const [recordDatas, setRecordDatas] = useState<RecordsData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");

  const Bucket = import.meta.env.VITE_S3_BUCKET_NAME as string;

  const getProjects = async (path: string) => {
    const cmd = new ListObjectsV2Command({
      Bucket,
      Prefix: `${email}/${path}/`,
    });

    try {
      const { Contents } = await podStore.send(cmd);
      if (Contents) {
        setCurrentPath(path);
        setRecordDatas([]);
        Contents.forEach((item) => {
          const cmd = new GetObjectCommand({
            Bucket,
            Key: item.Key,
          });

          podStore.send(cmd).then(async (data) => {
            const stream = data.Body as ReadableStream<Uint8Array>;
            const blob = await new Response(stream).blob();
            const blobUrl = URL.createObjectURL(blob);
            const date = `${item.LastModified?.getDate()} / ${item.LastModified?.getMonth()} / ${item.LastModified?.getFullYear()}`;

            const user = item.Key!.split("/")[2].split(".webm")[0].split("-");

            const recordData: RecordsData = {
              url: blobUrl,
              createdAt: date,
              name: user[1],
              device: user[2],
            };

            setRecordDatas((prevUrls) => [...prevUrls, recordData]);
          });
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      return;
    }
  };

  return (
    <section className="size-full lx:px-[50px] flex flex-col items-center gap-3">
      <nav className="flex items-center font-bold gap-2 w-full">
        <button
          onClick={() => setProjectPath("")}
          className="opacity-60 hover:opacity-100 "
        >
          Projects
        </button>
        <h6 className="opacity-60">
          {projectPath !== "" && ` > ${projectPath}`}
        </h6>
      </nav>

      <figure className="grow  lx:w-[95%] w-full mx-[20px] min-h-0 ">
        {projectPath === "" ? (
          <ProjectFolders setPath={setProjectPath} getProjects={getProjects} />
        ) : (
          <ProjectData data={recordDatas} path={currentPath} />
        )}
      </figure>
    </section>
  );
};

export default Projects;
