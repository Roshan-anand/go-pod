import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { setDetails } from "@/providers/redux/slice/user";
import { toast } from "react-toastify";
import "@/styles/login.css";

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
        className="flex flex-col items-center gap-4 min-w-[300px] max-w-[600px] w-1/2"
      >
        <header className="w-full">
          <h1 className="text-2xl font-bold mb-2">Login.</h1>
        </header>

        <div className="textInputWrapper">
          <input
            id="email"
            type="email"
            ref={emailInp}
            placeholder="Email"
            required
            className="textInput"
          />
        </div>

        <div className="textInputWrapper">
          <input
            id="name"
            type="text"
            ref={nameInp}
            placeholder="Username"
            required
            className="textInput"
          />
        </div>
        <button type="submit" className="anime">
          Login
        </button>
      </form>
    </main>
  );
};

export default Login;
