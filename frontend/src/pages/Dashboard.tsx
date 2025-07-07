import { Outlet } from "@tanstack/react-router";
import useAuth from "@/hooks/auth";
import SideBar from "@/components/dashboard/SideBar";

const Dashboard = () => {
  useAuth();

  return (
    <main className="flex">
      <SideBar />
      <section className="grow rounded-t-md bg-bg-prime mx-2 mt-[2.5rem] mb-1 p-2 flex flex-col h-[95vh]">
        <header className="text-txt-sec text-center border-b-2 py-2">
          Experience the storm of knowledge by starting your
          <span className="text-accent font-bold"> podcast!</span>
        </header>
        <div className="grow min-h-0">
          <Outlet />
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
