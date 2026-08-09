import { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  /** Live microphone stream to analyse. */
  stream?: MediaStream | null;
  /** Audio element playing the assistant reply. */
  audioElement?: HTMLAudioElement | null;
  /** Animate without a real audio source (thinking / processing states). */
  simulated?: boolean;
  size?: number;
  className?: string;
  /** CSS color used for the rings. */
  color?: string;
}

/**
 * Animated circular audio visualizer: concentric rings that pulse with the
 * current audio level. Falls back to a smooth simulated pulse when no audio
 * source is available.
 */
export const VoiceVisualizer = ({
  stream,
  audioElement,
  simulated = false,
  size = 128,
  className = "",
  color = "hsl(var(--primary))",
}: VoiceVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
    let data: Uint8Array | null = null;

    const setupAnalyser = () => {
      try {
        const AudioCtor: typeof AudioContext =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return;
        if (stream) {
          audioCtx = new AudioCtor();
          source = audioCtx.createMediaStreamSource(stream);
        } else if (audioElement) {
          audioCtx = new AudioCtor();
          source = audioCtx.createMediaElementSource(audioElement);
        } else {
          return;
        }
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        if (audioElement && audioCtx) analyser.connect(audioCtx.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        analyser = null;
      }
    };

    setupAnalyser();

    const center = size / 2;
    const baseRadius = size * 0.24;
    let smoothed = 0;
    const start = performance.now();

    const draw = (now: number) => {
      let level = 0;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) sum += data[i];
        level = sum / data.length / 255;
      } else if (simulated) {
        const t = (now - start) / 700;
        level = 0.18 + Math.abs(Math.sin(t)) * 0.22;
      }
      smoothed += (level - smoothed) * 0.2;

      ctx.clearRect(0, 0, size, size);

      // Outer pulsing rings
      for (let ring = 3; ring >= 1; ring -= 1) {
        const radius = baseRadius + ring * (size * 0.06) + smoothed * size * 0.22 * ring * 0.55;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0, 0.28 - ring * 0.07 + smoothed * 0.25);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Core circle
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(center, center, baseRadius + smoothed * size * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.14 + smoothed * 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      try {
        source?.disconnect();
        analyser?.disconnect();
      } catch {
        /* noop */
      }
      if (audioCtx && !audioElement) void audioCtx.close();
    };
  }, [stream, audioElement, simulated, size, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
