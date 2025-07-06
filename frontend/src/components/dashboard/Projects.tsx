import { useState } from "react";
import ProjectFolders from "../projects/folders";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { podStore } from "@/config/s3client";
import ProjectData from "../projects/projectData";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";

const Projects = () => {
  const { email } = useSelector((state: StateT) => state.user);

  const [projectPath, setProjectPath] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string[]>([]);

  const Bucket = import.meta.env.VITE_S3_BUCKET_NAME as string;

  const getProjects = async (path: string) => {
    console.log(path, email);
    const cmd = new ListObjectsV2Command({
      Bucket,
      Prefix: `${email}/${path}/`,
    });

    try {
      const { Contents } = await podStore.send(cmd);
      if (Contents) {
        setStreamUrl([]);
        Contents.forEach((item) => {
          const cmd = new GetObjectCommand({
            Bucket,
            Key: item.Key,
          });

          podStore.send(cmd).then(async (data) => {
            const stream = data.Body as ReadableStream<Uint8Array>;
            const blob = await new Response(stream).blob();
            const blobUrl = URL.createObjectURL(blob);
            console.log(blobUrl);
            setStreamUrl((prevUrls) => [...prevUrls, blobUrl]);
          });
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      return;
    }
  };

  return (
    <section className="p-3 grow flex flex-col">
      <nav className="flex items-center font-bold gap-2">
        <button
          onClick={() => setProjectPath("")}
          className="hover:underline underline-offset-2"
        >
          Projects
        </button>
        {projectPath !== "" && ` > ${projectPath}`}
      </nav>
      {projectPath === "" ? (
        <ProjectFolders setPath={setProjectPath} getProjects={getProjects} />
      ) : (
        <ProjectData urls={streamUrl} />
      )}
    </section>
  );
};

export default Projects;
