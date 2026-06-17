import { useEffect, type RefObject } from "react";

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: Event ) => void,
  isActive: boolean = true,
) {
  useEffect(() => {
    if (!isActive) return;

    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("pointerdown", listener);

    return () => {
      document.removeEventListener("pointerdown", listener);
    };
  }, [ref, handler, isActive]);
}
