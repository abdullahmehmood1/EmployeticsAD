import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  phase: number;
  opacity: number;
}

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Smooth GPU-accelerated liquid aurora shader (executes natively on NVIDIA EGL/WebGL)
const FRAG_SRC = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(0.17, 0.23);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * vec2(1.7778, 1.0);
  float t = u_time * 0.14;

  // Domain-warped organic liquid light flow
  vec2 q = vec2(
    fbm(p * 1.35 + vec2(t * 0.55, -t * 0.35)),
    fbm(p * 1.35 + vec2(-t * 0.42 + 4.2, t * 0.48 + 1.9))
  );
  float f = fbm(p * 1.6 + q * 1.55 + vec2(t * 0.28, -t * 0.22));

  // Deep obsidian night base
  vec3 base = mix(vec3(0.015, 0.024, 0.055), vec3(0.035, 0.055, 0.115), uv.y);

  // Volumetric aurora ribbons
  float ribbon1 = smoothstep(0.32, 0.86, f);
  float ribbon2 = smoothstep(0.45, 0.92, length(q));
  float centerGlow = exp(-dot(p * vec2(0.85, 1.1), p * vec2(0.85, 1.1)) * 1.35);

  vec3 col = base;
  col += u_color1 * ribbon1 * 0.34;
  col += u_color2 * ribbon2 * 0.26;
  col += u_color3 * centerGlow * (0.14 + 0.14 * f);

  // Subtle fine studio film grain to prevent banding
  float grain = (hash(uv * 980.0 + u_time) - 0.5) * 0.014;
  col += grain;

  // Soft optical vignette
  float vig = smoothstep(1.38, 0.25, length(p));
  col *= mix(0.42, 1.0, vig);

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function hexToRgbNorm(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function parseRgbString(rgb: string): [number, number, number] {
  const m = rgb.match(/[\d.]+/g);
  if (!m || m.length < 3) return [0.39, 0.4, 0.95];
  return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
}

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glStateRef = useRef<{
    gl: WebGLRenderingContext;
    uTime: WebGLUniformLocation | null;
    uC1: WebGLUniformLocation | null;
    uC2: WebGLUniformLocation | null;
    uC3: WebGLUniformLocation | null;
  } | null>(null);

  // Smooth narrative color palette across the 40-second arc
  const c1Css = interpolateColors(
    frame,
    [0, 480, 600, 960, 1440, 1860, 2060, 2160, 2400],
    [
      "#F43F5E",
      "#E11D48",
      "#6366F1",
      "#4F46E5",
      "#06B6D4",
      "#10B981",
      "#34D399",
      "#6366F1",
      "#4F46E5",
    ]
  );

  const c2Css = interpolateColors(
    frame,
    [0, 500, 620, 1020, 1440, 1860, 2120, 2400],
    [
      "#6366F1",
      "#F59E0B",
      "#06B6D4",
      "#F43F5E",
      "#8B5CF6",
      "#06B6D4",
      "#22D3EE",
      "#8B5CF6",
    ]
  );

  const c3Css = interpolateColors(
    frame,
    [0, 540, 960, 1440, 1860, 2100, 2400],
    ["#881337", "#312E81", "#7C2D12", "#164E63", "#065F46", "#1E1B4B", "#164E63"]
  );

  // Initialize WebGL shader once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    glStateRef.current = {
      gl,
      uTime: gl.getUniformLocation(prog, "u_time"),
      uC1: gl.getUniformLocation(prog, "u_color1"),
      uC2: gl.getUniformLocation(prog, "u_color2"),
      uC3: gl.getUniformLocation(prog, "u_color3"),
    };
  }, []);

  // Draw deterministic frame-accurate GPU aurora every frame
  useEffect(() => {
    const state = glStateRef.current;
    if (!state) return;
    const { gl, uTime, uC1, uC2, uC3 } = state;
    const rgb1 = c1Css.startsWith("#") ? hexToRgbNorm(c1Css) : parseRgbString(c1Css);
    const rgb2 = c2Css.startsWith("#") ? hexToRgbNorm(c2Css) : parseRgbString(c2Css);
    const rgb3 = c3Css.startsWith("#") ? hexToRgbNorm(c3Css) : parseRgbString(c3Css);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(uTime, frame / 60.0);
    gl.uniform3f(uC1, rgb1[0], rgb1[1], rgb1[2]);
    gl.uniform3f(uC2, rgb2[0], rgb2[1], rgb2[2]);
    gl.uniform3f(uC3, rgb3[0], rgb3[1], rgb3[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [frame, c1Css, c2Css, c3Css]);

  const gridOffsetX = (frame * 0.42) % 48;
  const gridOffsetY = (frame * 0.24) % 48;

  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    for (let i = 0; i < 48; i++) {
      const seed = (i + 1) * 137.508;
      list.push({
        id: i,
        x: (Math.sin(seed) * 0.5 + 0.5) * 1920,
        y: (Math.cos(seed * 1.7) * 0.5 + 0.5) * 1080,
        size: 1.3 + (i % 4) * 0.85,
        speedY: -0.32 - (i % 5) * 0.14,
        speedX: ((i % 3) - 1) * 0.14,
        phase: i * 0.7,
        opacity: 0.14 + (i % 4) * 0.08,
      });
    }
    return list;
  }, []);

  const gridOpacity = interpolate(frame, [0, 60, 2100, 2220], [0.2, 0.28, 0.25, 0.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        overflow: "hidden",
      }}
    >
      {/* Fallback CSS gradient underneath WebGL canvas */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 110% 85% at 50% 0%, #0F172A 0%, #060916 58%, #03050C 100%)",
        }}
      />

      {/* Real-time GPU WebGL Liquid Aurora Shader */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      {/* Precision technical dot-grid with smooth parallax */}
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "radial-gradient(rgba(148, 163, 184, 0.30) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
          maskImage:
            "radial-gradient(ellipse 82% 78% at 50% 50%, black 22%, transparent 94%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 82% 78% at 50% 50%, black 22%, transparent 94%)",
        }}
      />

      {/* Floating ambient telemetry motes */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {particles.map((p) => {
          const px = (((p.x + frame * p.speedX) % 1920) + 1920) % 1920;
          const py = (((p.y + frame * p.speedY) % 1080) + 1080) % 1080;
          const twinkle = 0.6 + 0.4 * Math.sin(frame * 0.045 + p.phase);
          return (
            <circle
              key={p.id}
              cx={px}
              cy={py}
              r={p.size}
              fill={p.id % 3 === 0 ? "#22D3EE" : p.id % 3 === 1 ? "#A5B4FC" : "#F8FAFC"}
              opacity={p.opacity * twinkle}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
