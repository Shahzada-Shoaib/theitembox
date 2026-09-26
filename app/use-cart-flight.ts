"use client";

import { useCallback, useEffect, useRef } from "react";

const FLIGHT_DURATION = 1150;
const TRAIL_DELAYS = [108, 72, 36, 0];
const easeInOut = (t: number) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const smoothstep = (start: number, end: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

type MeshPoint = { x: number; y: number };

function drawTriangle(context: CanvasRenderingContext2D, texture: HTMLCanvasElement, source: [MeshPoint, MeshPoint, MeshPoint], target: [MeshPoint, MeshPoint, MeshPoint], shade: number) {
  const [a, b, c] = source;
  const [u, v, w] = target;
  const denominator = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
  if (Math.abs(denominator) < 0.01) return;
  const matrixA = (u.x * (b.y - c.y) + v.x * (c.y - a.y) + w.x * (a.y - b.y)) / denominator;
  const matrixC = (u.x * (c.x - b.x) + v.x * (a.x - c.x) + w.x * (b.x - a.x)) / denominator;
  const matrixE = (u.x * (b.x * c.y - c.x * b.y) + v.x * (c.x * a.y - a.x * c.y) + w.x * (a.x * b.y - b.x * a.y)) / denominator;
  const matrixB = (u.y * (b.y - c.y) + v.y * (c.y - a.y) + w.y * (a.y - b.y)) / denominator;
  const matrixD = (u.y * (c.x - b.x) + v.y * (a.x - c.x) + w.y * (b.x - a.x)) / denominator;
  const matrixF = (u.y * (b.x * c.y - c.x * b.y) + v.y * (c.x * a.y - a.x * c.y) + w.y * (a.x * b.y - b.x * a.y)) / denominator;

  context.save();
  context.beginPath();
  context.moveTo(u.x, u.y);
  context.lineTo(v.x, v.y);
  context.lineTo(w.x, w.y);
  context.closePath();
  context.clip();
  context.setTransform(matrixA, matrixB, matrixC, matrixD, matrixE, matrixF);
  context.drawImage(texture, 0, 0);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = Math.min(0.16, Math.abs(shade) * 0.2);
  context.fillStyle = shade > 0 ? "#ffffff" : "#10100e";
  context.fill();
  context.restore();
}

function drawCrumpledImage(context: CanvasRenderingContext2D, texture: HTMLCanvasElement, width: number, height: number, progress: number) {
  const columns = 10;
  const rows = 12;
  const crumple = smoothstep(0.28, 0.84, progress);
  const phase = progress * 15;
  const points: MeshPoint[][] = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, column) => {
      const x = column / columns;
      const y = row / rows;
      const noise = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
      const jitter = (noise - Math.floor(noise) - 0.5) * 2;
      const foldX = Math.sin(y * 34 + phase + jitter * 2) * 0.045 + Math.sin((x + y) * 49 - phase * 0.8) * 0.026;
      const foldY = Math.sin(x * 31 - phase * 1.2 + jitter) * 0.045 + Math.sin((y - x) * 43 + phase) * 0.026;
      return {
        x: width * (0.5 + (x - 0.5) * (1 - crumple * 0.8) + foldX * crumple),
        y: height * (0.5 + (y - 0.5) * (1 - crumple * 0.82) + foldY * crumple),
      };
    }),
  );

  context.clearRect(0, 0, width, height);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const sourceX = column / columns * width;
      const sourceY = row / rows * height;
      const sourceRight = (column + 1) / columns * width;
      const sourceBottom = (row + 1) / rows * height;
      const topLeft = points[row][column];
      const topRight = points[row][column + 1];
      const bottomLeft = points[row + 1][column];
      const bottomRight = points[row + 1][column + 1];
      const sourceTopLeft = { x: sourceX, y: sourceY };
      const sourceTopRight = { x: sourceRight, y: sourceY };
      const sourceBottomLeft = { x: sourceX, y: sourceBottom };
      const sourceBottomRight = { x: sourceRight, y: sourceBottom };
      const wrinkle = (Math.sin(column * 6.7 + row * 3.1 + phase) + Math.cos(row * 8.3 - column * 2.4)) * crumple * 0.34;

      if ((row + column) % 2 === 0) {
        drawTriangle(context, texture, [sourceTopLeft, sourceTopRight, sourceBottomRight], [topLeft, topRight, bottomRight], wrinkle);
        drawTriangle(context, texture, [sourceTopLeft, sourceBottomRight, sourceBottomLeft], [topLeft, bottomRight, bottomLeft], -wrinkle);
      } else {
        drawTriangle(context, texture, [sourceTopLeft, sourceTopRight, sourceBottomLeft], [topLeft, topRight, bottomLeft], -wrinkle);
        drawTriangle(context, texture, [sourceTopRight, sourceBottomRight, sourceBottomLeft], [topRight, bottomRight, bottomLeft], wrinkle);
      }
    }
  }
}

export function useCartFlight() {
  const activeFlights = useRef(new Set<() => void>());

  useEffect(() => {
    const flights = activeFlights.current;
    const clear = () => flights.forEach(cancel => cancel());
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", clear);
    motion.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("resize", clear);
      motion.removeEventListener("change", clear);
    };
  }, []);

  return useCallback((source: HTMLElement | null, destination: HTMLElement | null) => {
    const sourceImage = source?.querySelector("img");
    if (!source || !sourceImage?.complete || !sourceImage.naturalWidth || !destination ||
      matchMedia("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) return;

    const rect = source.getBoundingClientRect();
    const target = destination.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight) return;

    // Keep rapid additions responsive without accumulating expensive blurred layers.
    if (activeFlights.current.size >= 3) activeFlights.current.values().next().value?.();

    const layer = document.createElement("div");
    layer.className = "cart-flight-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.inert = true;
    document.body.append(layer);
    // A manual popover keeps the ghost above the product dialog's top layer.
    if (typeof layer.showPopover === "function") {
      layer.setAttribute("popover", "manual");
      layer.showPopover();
    }

    const start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const end = { x: target.left + target.width / 2, y: target.top + target.height / 2 };
    const dx = end.x - start.x;
    const distance = Math.hypot(dx, end.y - start.y);
    const direction = dx >= 0 ? 1 : -1;
    const lift = Math.min(180, Math.max(90, distance * 0.3));
    const control1 = { x: start.x - direction * Math.min(65, distance * 0.12), y: start.y - lift };
    const control2 = { x: end.x - direction * Math.max(80, Math.abs(dx) * 0.28), y: Math.max(28, Math.min(start.y, end.y) - lift * 0.45) };

    // Follow a lifted cubic arc while keeping each echo at the product's original size.
    const path: Keyframe[] = Array.from({ length: 81 }, (_, index) => {
      const offset = index / 80;
      const t = easeInOut(offset);
      const u = 1 - t;
      const x = u ** 3 * start.x + 3 * u ** 2 * t * control1.x + 3 * u * t ** 2 * control2.x + t ** 3 * end.x;
      const y = u ** 3 * start.y + 3 * u ** 2 * t * control1.y + 3 * u * t ** 2 * control2.y + t ** 3 * end.y;
      return { offset, transform: `translate3d(${x - rect.width / 2}px, ${y - rect.height / 2}px, 0)` };
    });

    const imageStyle = getComputedStyle(sourceImage);
    const animations: Animation[] = [];
    let arrivalTimer = 0;
    let cleanupTimer = 0;
    let renderFrame = 0;
    const cancel = () => {
      clearTimeout(arrivalTimer);
      clearTimeout(cleanupTimer);
      cancelAnimationFrame(renderFrame);
      animations.forEach(animation => animation.cancel());
      layer.remove();
      activeFlights.current.delete(cancel);
    };
    activeFlights.current.add(cancel);

    for (const [index, delay] of TRAIL_DELAYS.entries()) {
      const isLead = delay === 0;
      const ghost = document.createElement("div");
      ghost.className = `cart-flight-ghost ${isLead ? "cart-flight-lead" : "cart-flight-trail"}`;
      Object.assign(ghost.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        filter: isLead ? "none" : `blur(${5 - index * 1.5}px)`,
      });
      if (isLead) {
        const canvas = document.createElement("canvas");
        const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
        const width = Math.round(rect.width * pixelRatio);
        const height = Math.round(rect.height * pixelRatio);
        canvas.width = width;
        canvas.height = height;
        Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%" });
        const context = canvas.getContext("2d");
        const texture = document.createElement("canvas");
        texture.width = width;
        texture.height = height;
        const textureContext = texture.getContext("2d");
        if (context && textureContext) {
          const fit = imageStyle.objectFit === "contain" ? Math.min(width / sourceImage.naturalWidth, height / sourceImage.naturalHeight) : Math.max(width / sourceImage.naturalWidth, height / sourceImage.naturalHeight);
          const cropWidth = width / fit;
          const cropHeight = height / fit;
          const [positionX = "50%", positionY = "50%"] = imageStyle.objectPosition.split(" ");
          const offsetX = (sourceImage.naturalWidth - cropWidth) * (Number.parseFloat(positionX) / 100 || 0.5);
          const offsetY = (sourceImage.naturalHeight - cropHeight) * (Number.parseFloat(positionY) / 100 || 0.5);
          textureContext.drawImage(sourceImage, offsetX, offsetY, cropWidth, cropHeight, 0, 0, width, height);
          ghost.append(canvas);
          const flightStart = performance.now();
          const render = (now: number) => {
            const progress = Math.min(1, (now - flightStart) / FLIGHT_DURATION);
            drawCrumpledImage(context, texture, width, height, progress);
            if (progress < 1) renderFrame = requestAnimationFrame(render);
          };
          renderFrame = requestAnimationFrame(render);
        }
      } else {
        const image = new window.Image();
        image.src = sourceImage.currentSrc || sourceImage.src;
        image.alt = "";
        image.draggable = false;
        Object.assign(image.style, {
          objectFit: imageStyle.objectFit,
          objectPosition: imageStyle.objectPosition,
          transform: imageStyle.transform,
          transformOrigin: imageStyle.transformOrigin,
        });
        ghost.append(image);
      }
      layer.append(ghost);

      const timing = { duration: FLIGHT_DURATION, delay, fill: "both" as const, easing: "linear" };
      const peak = isLead ? 0.78 : 0.055 + index * 0.04;
      animations.push(
        ghost.animate(path, timing),
        ghost.animate([
          { opacity: 0, offset: 0 },
          { opacity: peak, offset: 0.085 },
          { opacity: peak * 0.98, offset: isLead ? 0.76 : 0.55 },
          { opacity: peak * (isLead ? 0.84 : 0.52), offset: isLead ? 0.88 : 0.8 },
          { opacity: 0, offset: 1 },
        ], timing),
      );
      animations.push(ghost.animate([
        { clipPath: "inset(0% round 10px)", offset: 0 },
        { clipPath: "inset(0% round 10px)", offset: 0.8 },
        { clipPath: "inset(47% round 12px)", offset: 1 },
      ], timing));
    }

    arrivalTimer = window.setTimeout(() => {
      if (!destination.isConnected) return;
      const button = destination.closest("button");
      if (button) animations.push(button.animate([
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(-3px) scale(1.045)", offset: 0.3 },
        { transform: "translateY(1px) scale(0.985)", offset: 0.65 },
        { transform: "translateY(0) scale(1)" },
      ], { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" }));
      animations.push(destination.animate([
        { boxShadow: "0 0 0 0 #b7ff0066", color: "#b7ff00" },
        { boxShadow: "0 0 0 18px #b7ff0000", color: "#b7ff00", offset: 0.7 },
        { boxShadow: "0 0 0 22px #b7ff0000", color: "inherit" },
      ], { duration: 650, easing: "ease-out" }));
    }, FLIGHT_DURATION * 0.9);
    cleanupTimer = window.setTimeout(cancel, FLIGHT_DURATION + 700);
  }, []);
}
