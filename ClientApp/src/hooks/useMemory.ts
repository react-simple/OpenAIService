import { useEffect, useState } from "react";
import { getMemory } from "services";
import { getStoredMemory } from "functions";

export interface UseMemoryReturn {
  memory: string;
  setMemory: React.Dispatch<React.SetStateAction<string>>;
}

export function useMemory(): UseMemoryReturn {
  const [memory, setMemory] = useState(() => getStoredMemory());

  useEffect(() => {
    getMemory()
      .then((data) => {
        if (data.content !== null)
          setMemory(data.content);
      })
      .catch(() => {});
  }, []);

  return { memory, setMemory };
}
