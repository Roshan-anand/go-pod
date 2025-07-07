import { Button } from "@/components/ui/button";
import { CgExport } from "react-icons/cg";

const ProjectNavbar = () => {
  return (
    <nav className="bg-btn-prim w-full flex justify-end p-2">
      <Button variant={"action"} className="bg-transparent text-txt-prime">
        <CgExport className="icon-md"/>
      </Button>
    </nav>
  );
};

export default ProjectNavbar;