import HeroSection from "../components/HeroSection";
import Header from "../components/Header";
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Header />
      <HeroSection />
    </div>
  );
};

export default Home;
