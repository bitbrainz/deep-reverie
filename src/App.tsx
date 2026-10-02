import "./App.css";
import { lazy, Suspense } from "react";
import { Home } from "./pages/Home";
import { Routes, Route } from "react-router";

const Gallery = lazy(() => import("./pages/Gallery"));
const AR = lazy(() => import("./pages/AR"));
const Debug = lazy(() => import("./pages/Debug"));
const DreamExperience = lazy(() => import("./pages/DreamExperience"));
const About = lazy(() => import("./pages/About"));

export const App = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/ar" element={<AR />} />
        <Route path="/app" element={<DreamExperience />} />
      </Routes>
    </Suspense>
  );
};
