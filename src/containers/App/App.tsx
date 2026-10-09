import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./wikiVisual.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { getPathMapping, stringToSlug } from "../../utils";
import { useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { ResearchPageShell } from "../../components/ResearchPageShell";
import { NotFound } from "../../components/NotFound";
import { Footer } from "../../components/Footer";

const App = () => {
  const route = useLocation();
  const pathMapping = getPathMapping();
  const currentPath =
    route.pathname
      .split(`${stringToSlug(import.meta.env.VITE_TEAM_NAME)}`)
      .pop() || "/";

  // Set Page Title
  const title =
    currentPath in pathMapping ? pathMapping[currentPath].title : "Not Found";

  useEffect(() => {
    document.title = `${title || ""} | ${import.meta.env.VITE_TEAM_NAME} - iGEM ${import.meta.env.VITE_TEAM_YEAR}`;
  }, [title]);
  useEffect(() => {
    document.body.style.overflow = "";
    if (route.hash) {
      const id = decodeURIComponent(route.hash.slice(1));
      if (id === "laboratory" && route.pathname === "/") return;
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView(),
      );
    } else window.scrollTo({ top: 0, behavior: "instant" });
  }, [route.pathname, route.hash]);

  return (
    <>
      {/* Navigation */}
      <Navbar />

      {/* Header and PageContent */}
      <Routes>
        {Object.entries(pathMapping).map(
          ([path, { title, lead, component: Component }]) => (
            <Route
              key={path}
              path={path}
              element={
                path === "/" || path === "/team" || path === "/model" || path === "/software" ? (
                  <Component />
                ) : (
                  <ResearchPageShell
                    key={path}
                    title={title || ""}
                    eyebrow={
                      ["/experiments", "/notebook", "/measurement", "/alternative-platform", "/safety-and-security"].includes(path)
                        ? "WET LAB / " + (title || "").toUpperCase()
                        : path === "/hardware"
                          ? "DRY LAB / HARDWARE"
                          : "SYPHU-CHINA / " + (title || "").toUpperCase()
                    }
                    description={lead || ""}
                  >
                    <div className="wiki-template-content">
                      <Component />
                    </div>
                  </ResearchPageShell>
                )
              }
            />
          ),
        )}
        <Route
          path="*"
          element={
            <ResearchPageShell
                title="Not Found"
                description="The requested URL was not found on this server."
                contents={[]}
            >
              <NotFound />
            </ResearchPageShell>
          }
        />
      </Routes>

      {/* Footer */}
      {/* MUST mention license AND have a link to team wiki's repository on gitlab.igem.org */}
      <Footer compact={currentPath === "/team"} />
    </>
  );
};

export default App;
