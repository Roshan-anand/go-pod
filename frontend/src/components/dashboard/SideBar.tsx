import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { CiHome } from "react-icons/ci";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaPodcast } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const SideBar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const button = (name: string) => {
    return (
      <Button
        className={`flex ${isCollapsed && "flex-col"} gap-2 rounded-sm `}
        style={{
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
        variant={
          window.location.pathname.split("/")[2] === name ? "prime" : "default"
        }
        onClick={() => navigate({ to: `/dashboard/${name}/` })}
      >
        {React.createElement(
          name === "projects" ? IoFolderOpenOutline : CiHome,
          { className: isCollapsed ? "icon-md" : "icon-sm" }
        )}

        {!isCollapsed ? (
          <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
        ) : (
          <h6 className="text-[0.7rem] opacity-80">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </h6>
        )}
      </Button>
    );
  };

  return (
    <aside className={`min-w-[70px] flex flex-col gap-4`}>
      <header className="mt-3 px-2 flex justify-evenly items-center">
        {!isCollapsed && (
          <>
            <FaPodcast className="icon-sm" />
            <span className="ml-1 mr-auto">GO POD</span>
          </>
        )}
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? (
            <GoSidebarCollapse className="icon-md" />
          ) : (
            <GoSidebarExpand className="icon-sm" />
          )}
        </Button>
      </header>
      <main className="px-1 py-3 flex flex-col gap-3">
        {button("home")}
        {button("projects")}
      </main>
    </aside>
  );
};

export default SideBar;
