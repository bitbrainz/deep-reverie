import "./App.css";
import { Home } from "./pages/Home";
import Gallery from "./pages/Gallery";
import { Routes, Route } from "react-router";
import { Debug } from "./pages/Debug";
import { AR } from "./pages/AR";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/debug" element={<Debug />} />
      <Route path="/ar" element={<AR />} />
    </Routes>
  );
};
