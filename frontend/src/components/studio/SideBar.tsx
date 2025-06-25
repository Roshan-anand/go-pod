import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import { IoPersonAddSharp } from "react-icons/io5";

const SideBar = () => {
  const { roomID } = useSelector((state: StateT) => state.room);

  //to copy invite link to clipboard
  const handleCopy = async () => {
    const currUrl = window.location.origin + window.location.pathname;
    const cpLink = currUrl + "?rID=" + roomID;
    await navigator.clipboard.writeText(cpLink);
    toast.success("Link copied to clipboard!");
  };
  return (
    <aside className="bg-bg-sec w-1/4 max-w-[200px] m-2 py-2 rounded-md flex justify-center ">
      <Button
        variant={"prime"}
        onClick={handleCopy}
        className="p-2 h-fit w-1/2"
      >
        <IoPersonAddSharp className="icon-md" />
      </Button>
    </aside>
  );
};

export default SideBar;
