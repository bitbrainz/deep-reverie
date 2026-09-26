declare module "mind-ar/dist/controller-mGt1s8dJ.js" {
  export type MindARUpdate =
    | {
        type: "updateMatrix";
        targetIndex: number;
        worldMatrix: number[] | null;
      }
    | { type: "processDone" };

  class Controller {
    constructor(options: {
      inputWidth: number;
      inputHeight: number;
      maxTrack?: number;
      warmupTolerance?: number;
      missTolerance?: number;
      onUpdate?: (update: MindARUpdate) => void;
    });
    addImageTargets(fileUrl: string): Promise<{
      dimensions: [number, number][];
    }>;
    addImageTargetsFromBuffer(buffer: ArrayBuffer): {
      dimensions: [number, number][];
    };
    dummyRun(input: HTMLVideoElement): Promise<void> | void;
    processVideo(input: HTMLVideoElement): void;
    stopProcessVideo(): void;
    dispose(): void;
  }

  export { Controller as C };
}
