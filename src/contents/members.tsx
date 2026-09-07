import { lazy, Suspense } from "react";

const TeamPage = lazy(() =>
  import("./team/TeamPage").then((module) => ({ default: module.TeamPage })),
);

export function Members() {
  return (
    <Suspense
      fallback={
        <main className="wiki-world-loading" aria-label="Loading the team">
          <span>MEET THE TEAM.</span>
        </main>
      }
    >
      <TeamPage />
    </Suspense>
  );
}
