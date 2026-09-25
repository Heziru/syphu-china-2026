import { lazy, Suspense } from "react";
const LaboratoryHome = lazy(() =>
  import("./home/LaboratoryHome").then((module) => ({
    default: module.LaboratoryHome,
  })),
);

export function Home() {
  return (
    <Suspense
      fallback={
        <div
          className="wiki-world-loading"
          role="status"
          aria-label="Loading the world"
        >
          <span>LBP–MOTOTYPE</span>
          <i />
        </div>
      }
    >
      <LaboratoryHome />
    </Suspense>
  );
}
