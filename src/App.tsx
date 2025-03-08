import "./App.css";
import { useRef } from "react";
import { Home } from "./pages/Home";
import Gallery from "./pages/Gallery";
import { Routes, Route } from "react-router";
import { Debug } from "./pages/Debug";
import { AR } from "./pages/AR";
import { PredictionProvider } from "./prediction/PredictionContext";

export const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <PredictionProvider videoRef={videoRef}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/debug" element={<Debug videoRef={videoRef} />} />
        <Route path="/ar" element={<AR videoRef={videoRef} />} />
      </Routes>
    </PredictionProvider>
  );
};
