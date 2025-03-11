import { useEffect, useState, useRef } from "react";

export const Camera = ({ videoRef }: { videoRef: any }) => {
  const [isCameraActive, setIsCameraActive] = useState(false); // State to track camera activation

  // Start the camera when the user clicks a button
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment", // Use rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false, // No audio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
        videoRef.current.setAttribute("webkit-playsinline", "true"); // Older Safari support
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    // Clean up camera on component unmount
    return () => stopCamera();
  }, []);

  return (
    <div>
      {/* Button to start the camera */}
      {!isCameraActive && (
        <button
          className="m-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={startCamera}
        >
          Start AR Experience
        </button>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};
