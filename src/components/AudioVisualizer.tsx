import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying?: boolean;
  isRecording?: boolean;
  audioElement?: HTMLAudioElement | null;
  mediaStream?: MediaStream | null;
  height?: number;
  barColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying = false,
  isRecording = false,
  audioElement = null,
  mediaStream = null,
  height = 70,
  barColor = '#3b82f6',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAnalyser: AnalyserNode | null = null;

    if (isRecording && mediaStream) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        localAnalyser = analyser;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        sourceRef.current = source;
      } catch (err) {
        console.warn('AudioContext mic init:', err);
      }
    }

    const draw = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const currentHeight = canvas.height;

      ctx.clearRect(0, 0, width, currentHeight);

      if (localAnalyser && (isRecording || isPlaying)) {
        const bufferLength = localAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        localAnalyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * currentHeight * 0.9 + 4;

          const gradient = ctx.createLinearGradient(0, currentHeight, 0, 0);
          gradient.addColorStop(0, '#1d4ed8');
          gradient.addColorStop(0.5, barColor);
          gradient.addColorStop(1, '#60a5fa');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, currentHeight - barHeight, barWidth - 2, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
      } else if (isPlaying) {
        // Simulated harmonic wave if element node is cross-origin or playing
        const time = Date.now() * 0.005;
        const bars = 48;
        const barWidth = width / bars;

        for (let i = 0; i < bars; i++) {
          const wave = Math.sin(time + i * 0.3) * 0.5 + 0.5;
          const wave2 = Math.cos(time * 0.7 + i * 0.15) * 0.5 + 0.5;
          const barHeight = Math.max(6, (wave * 0.6 + wave2 * 0.4) * currentHeight * 0.85);

          const gradient = ctx.createLinearGradient(0, currentHeight, 0, 0);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#34d399');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(i * barWidth, currentHeight - barHeight, barWidth - 3, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else {
        // Idle ambient bars
        const bars = 40;
        const barWidth = width / bars;
        ctx.fillStyle = '#1e293b';
        for (let i = 0; i < bars; i++) {
          const staticHeight = 4 + (i % 3) * 3;
          ctx.beginPath();
          ctx.roundRect(i * barWidth, currentHeight - staticHeight, barWidth - 3, staticHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isPlaying, isRecording, mediaStream, barColor]);

  return (
    <div className="w-full bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 shadow-inner">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-auto block rounded-lg"
      />
    </div>
  );
};
