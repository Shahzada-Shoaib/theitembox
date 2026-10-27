"use client";

import { useEffect } from "react";

function hasNestedScrollRoom(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;

  let element: Element | null = target;
  while (element && element !== document.documentElement) {
    if (element instanceof HTMLElement) {
      const overflowY = getComputedStyle(element).overflowY;
      const canScroll = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight;
      if (canScroll) {
        const hasRoom = deltaY > 0
          ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
          : element.scrollTop > 1;
        if (hasRoom) return true;
      }
    }
    element = element.parentElement;
  }
  return false;
}

export function useInertialScroll(disabled = false) {
  useEffect(() => {
    if (disabled || !window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    let frame = 0;
    let renderedY = window.scrollY;
    let targetY = renderedY;

    const maxScrollY = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const stop = () => {
      frame = 0;
      delete root.dataset.inertialScroll;
    };
    const render = () => {
      const distance = targetY - renderedY;
      if (Math.abs(distance) < 0.2) {
        renderedY = targetY;
        window.scrollTo(0, renderedY);
        stop();
        return;
      }

      renderedY += distance * 0.065;
      window.scrollTo(0, renderedY);
      frame = requestAnimationFrame(render);
    };
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || hasNestedScrollRoom(event.target, event.deltaY)) return;

      event.preventDefault();
      if (!frame) {
        renderedY = window.scrollY;
        targetY = renderedY;
        root.dataset.inertialScroll = "true";
      }

      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
      const delta = Math.max(-180, Math.min(180, event.deltaY * unit));
      targetY = Math.max(0, Math.min(maxScrollY(), targetY + delta));
      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      delete root.dataset.inertialScroll;
    };
  }, [disabled]);
}
