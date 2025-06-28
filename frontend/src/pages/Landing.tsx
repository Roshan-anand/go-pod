import HeroSection from "@/components/landing/hero-section";
// import Nav from "@/components/landing/nav";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "@tanstack/react-router";

const Landing = () => {
  // const navigate = useNavigate();
  return (
    <div className="bg-[#0B0909]">
      <HeroSection />
      {/* <Nav />
      <main>
        <h3>go to dashboard</h3>
        <Button
        variant={"action"}
        onClick={() => {
          navigate({ to: "/dashboard" });
        }}
      >
        Go to Dashboard
      </Button>
      </main> */}
    </div>
  );
};

export default Landing;
