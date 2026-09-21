import "./App.css";
import { lazy, Suspense } from "react";
import { Home } from "./pages/Home";
import Gallery from "./pages/Gallery";
import { Routes, Route } from "react-router";

const AR = lazy(() =>
  import("./pages/AR").then((module) => ({ default: module.AR })),
);

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route
        path="/ar"
        element={
          <Suspense
            fallback={
              <div className="grid min-h-screen place-items-center bg-gray-950 text-white">
                Loading AR experience…
              </div>
            }
          >
            <AR />
          </Suspense>
        }
      />
    </Routes>
  );
};
