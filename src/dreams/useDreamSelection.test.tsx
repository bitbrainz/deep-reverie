import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DREAMS } from "./data/dreams";
import { useDreamSelection } from "./useDreamSelection";

describe("useDreamSelection", () => {
  it("replaces the selected dream without retaining stale content", () => {
    const dreams = DREAMS.slice(0, 50);
    const { result } = renderHook(() => useDreamSelection(dreams));

    act(() => result.current.selectDream(dreams[0]));
    expect(result.current.selectedDream).toBe(dreams[0]);

    act(() => result.current.selectDream(dreams[17]));
    expect(result.current.selectedDream).toBe(dreams[17]);
    expect(result.current.selectedDream?.title).toBe(dreams[17].title);
  });
});
