import { Button } from "../ui/button";

const Nav = () => {
  return (
    <nav className="flex justify-between items-center">
      <h3>GO POD</h3>
      <ul className="flex gap-4">
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/settings">Settings</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
      </ul>
      <section className="flex gap-2">
        <Button>Login</Button>
        <Button variant="action">Sign Up</Button>
      </section>
    </nav>
  );
};

export default Nav;
