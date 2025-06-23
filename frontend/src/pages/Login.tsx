import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { setDetails } from "@/providers/redux/slice/user";
import { toast } from "react-toastify";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search: { redirect: string } = useSearch({
    from: "/login",
  });
  const nameInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInp.current?.value;
    const email = emailInp.current?.value;
    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, email }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    dispatch(setDetails({ name, email }));
    const redirectTO = search.redirect || "/";
    navigate({ to: redirectTO });
  };

  return (
    <main className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 min-w-[300px]"
      >
        <header>
          <h1 className="text-2xl font-bold mb-2">Login</h1>
        </header>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          ref={emailInp}
          required
          className="border rounded px-2 py-1"
        />
        <label htmlFor="name">Username</label>
        <input
          id="name"
          type="text"
          ref={nameInp}
          required
          className="border rounded px-2 py-1"
        />
        <footer>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </footer>
      </form>
    </main>
  );
};

export default Login;
