import { CiHome } from "react-icons/ci";
import { IoFolderOpenOutline } from "react-icons/io5";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import type { StateT } from "@/providers/redux/store";
import { FaPodcast, FaUser } from "react-icons/fa";
import { useNavigate } from "@tanstack/react-router";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard/home/",
    icon: <CiHome className="icon-md" />,
  },
  {
    label: "Projects",
    href: "/dashboard/projects/",
    icon: <IoFolderOpenOutline className="icon-md" />,
  },
];

export const Logo = ({ ...props }) => {
  return (
    <div
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
      {...props}
    >
      <FaPodcast className="icon-md text-btn-sec" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        GO POD
      </motion.span>
    </div>
  );
};
export const LogoIcon = ({ ...props }) => {
  return (
    <div
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
      {...props}
    >
      <FaPodcast className="icon-md text-btn-sec" />
    </div>
  );
};

const SideBar = () => {
  const navigate = useNavigate();
  const { name, pic } = useSelector((state: StateT) => state.user);
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? (
            <Logo onClick={() => navigate({ to: "/" })} />
          ) : (
            <LogoIcon onClick={() => navigate({ to: "/" })} />
          )}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
              />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: name!,
              href: "#",
              icon: (
                <div className="icon-md shrink-0 rounded-full">
                  {pic ? (
                    <img src={pic} className="size-full" alt="Avatar" />
                  ) : (
                    <FaUser className="size-full" />
                  )}
                </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export default SideBar;
