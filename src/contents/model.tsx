import { lazy, Suspense } from "react";

const DryLabPage = lazy(() => import("./drylab/DryLabPage"));

export function Model() {
  return (
    <Suspense
      fallback={
        <main className="container py-5" role="status">
          Preparing the dry lab…
        </main>
      }
    >
      <DryLabPage />
    </Suspense>
  );
}
