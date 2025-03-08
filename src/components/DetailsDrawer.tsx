import { PropsWithChildren, useState, useEffect } from "react";
import { Drawer } from "vaul";
import { Dream } from "../dreams/data/dreams";

const snapPoints = ["150px", "550px", 1];

export const DetailsDrawer = ({
  children,
  dream,
  open,
  onClose,
}: PropsWithChildren<{
  dream: Dream | null | undefined;
  open: boolean;
  onClose?: () => void;
}>) => {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[1]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    if (snap === snapPoints[0]) {
      if (scrollTop + clientHeight >= scrollHeight) {
        setSnap(snapPoints[1]);
      }
      if (scrollTop === 0 && onClose) {
        onClose();
      }
    }

    if (snap === snapPoints[1]) {
      if (scrollTop + clientHeight >= scrollHeight) {
        setSnap(snapPoints[2]);
      }
      if (scrollTop === 0) {
        onClose();
      }
    }

    if (snap === snapPoints[2]) {
      if (scrollTop === 0) {
        setSnap(snapPoints[1]);
      }
    }
  };

  return (
    <Drawer.Root
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
      open={open}
      onClose={onClose}
    >
      {children}
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%]"
        >
          <Drawer.Handle className="m-2" />
          {dream ? (
            <div
              onScroll={handleScroll}
              className="p-4 bg-gray-100 overflow-y-auto"
              style={{ height: typeof snap === "string" ? snap : "97%" }}
            >
              <div className="relative">
                <img
                  src={`/images/saturated/${dream.fileName}`}
                  alt={dream.title}
                  className="w-full max-w-[500px] m-auto"
                />
                <Drawer.Title className="absolute text-xl top-0 left-0 bg-black bg-opacity-50 text-white p-2">
                  {dream.title}
                </Drawer.Title>
                <div className="absolute text-l top-10 left-0 bg-black bg-opacity-50 text-white p-2">
                  {dream.tagline}
                </div>
                <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  ▶️ PLAY
                </div>
              </div>
              <h2 className="text-lg font-semibold mt-4">Explanation</h2>
              <p className="text-sm text-gray-700">{dream.explanation}</p>

              <h2 className="text-lg font-semibold mt-4">Importance</h2>
              <p className="text-sm text-gray-700">{dream.importance}</p>

              <h2 className="text-lg font-semibold mt-4">AI Role</h2>
              <p className="text-sm text-gray-700">{dream.aiRole}</p>

              <h2 className="text-lg font-semibold mt-4">Image Description</h2>
              <p className="text-sm text-gray-700">{dream.imageDescription}</p>
            </div>
          ) : (
            <div>Click on a tile to select a dream</div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
