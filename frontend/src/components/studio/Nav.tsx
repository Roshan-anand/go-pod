import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import { IoChevronBack } from "react-icons/io5";
import { MdOutlineHorizontalRule } from "react-icons/md";
import useStudio from "@/hooks/studio";
import { FaPodcast } from "react-icons/fa6";

export const StudioNav = () => {
  const { name } = useSelector((state: StateT) => state.user);
  const { leaveStudio } = useStudio();

  return (
    <nav className="flex items-center h-[10%] max-h-[5vh] ">
      <button onClick={leaveStudio}>
        <IoChevronBack className="icon-md" />
      </button>

      <FaPodcast className="icon-sm" />
      <span className="ml-1 ">GO POD</span>

      <MdOutlineHorizontalRule className="icon-md rotate-90" />
      <p>{name}'s studio</p>
    </nav>
  );
};
