import { Outlet } from "@tanstack/react-router";
import useAuth from "@/hooks/auth";
import SideBar from "@/components/dashboard/SideBar";

const Dashboard = () => {
  useAuth();

  return (
    <main className="flex h-screen">
      <SideBar />
      <section className="grow rounded-t-md bg-bg-prime mx-2 mt-2 p-2 flex flex-col">
        <header className="text-txt-sec text-center border-b-2 py-2">
          Experience the storm of knowledge by starting your
          <span className="text-accent font-bold"> podcast!</span>
        </header>
        <Outlet />
      </section>
    </main>
  );
};

export default Dashboard;
