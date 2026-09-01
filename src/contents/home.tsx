import { NocturneSplash } from "./home/NocturneSplash";
import { BalanceScene } from "./home/scenes/BalanceScene";
import { DiseaseScene } from "./home/scenes/DiseaseScene";
import { ExploreScene } from "./home/scenes/ExploreScene";
import { MechanismScene } from "./home/scenes/MechanismScene";
import { RecoveryScene } from "./home/scenes/RecoveryScene";
import { TurningPointScene } from "./home/scenes/TurningPointScene";

export function Home() {
  return (
    <div className="nc-home">
      <NocturneSplash />
      <div id="home-story" className="nc-home__story">
        <BalanceScene />
        <DiseaseScene />
        <TurningPointScene />
        <MechanismScene />
        <RecoveryScene />
        <ExploreScene />
      </div>
    </div>
  );
}
