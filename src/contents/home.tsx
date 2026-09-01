import { HeroSection } from "./home/HeroSection";
import { BalanceScene } from "./home/scenes/BalanceScene";
import { DiseaseScene } from "./home/scenes/DiseaseScene";
import { ExploreScene } from "./home/scenes/ExploreScene";
import { MechanismScene } from "./home/scenes/MechanismScene";
import { RecoveryScene } from "./home/scenes/RecoveryScene";
import { TurningPointScene } from "./home/scenes/TurningPointScene";

export function Home() {
  return (
    <div className="mototype-home home">
      <HeroSection />
      <BalanceScene />
      <DiseaseScene />
      <TurningPointScene />
      <MechanismScene />
      <RecoveryScene />
      <ExploreScene />
    </div>
  );
}
