import { useState, useCallback } from "react";

export type SfnMode = "simple" | "extended";

const STORAGE_KEY = "zt-sfn-mode";

export function useSfnMode() {
  const [sfnMode, setSfnModeState] = useState<SfnMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "extended" ? "extended" : "simple";
  });

  const setSfnMode = useCallback((mode: SfnMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setSfnModeState(mode);
  }, []);

  return { sfnMode, setSfnMode } as const;
}
