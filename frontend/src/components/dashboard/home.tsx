import { SiPodcastindex } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { generateStudioID } from "@/lib/utils";
import type { StateT } from "@/providers/redux/store";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const { email } = useSelector((state: StateT) => state.user);

  const handleStudioNav = () => {
    if (!email) return;
    const stdID = generateStudioID(email);
    navigate({ to: `/studio/${stdID}` });
  };
  return (
    <>
      <figure className="size-full flex justify-center items-center">
        <Button
          variant={"action"}
          className="flex gap-1"
          onClick={handleStudioNav}
        >
          <SiPodcastindex className="icon-sm " />
          <span>Start</span>
        </Button>
      </figure>
    </>
  );
};

export default Home;
