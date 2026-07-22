import { HeroSection } from "./home/HeroSection";
import { ChallengeScene } from "./home/scenes/ChallengeScene";
import { ExploreScene } from "./home/scenes/ExploreScene";
import { LivingInterfaceScene } from "./home/scenes/LivingInterfaceScene";
import { MototypeScene } from "./home/scenes/MototypeScene";

export function Home() {
  return (
    <div className="mototype-home home">
      <HeroSection />
      <ChallengeScene />
      <LivingInterfaceScene />
      <MototypeScene />
      <ExploreScene />
    </div>
  );
}
