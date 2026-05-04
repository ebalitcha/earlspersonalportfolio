"use client";

import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {OrbitControls, Grid} from "@react-three/drei";
import {useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import {Manrope} from "next/font/google";
import ContactFormButton from "./contact-form-button";
import Image from "next/image";

const manrope = Manrope({subsets: ["latin"]});

/** --- Small utility: get breakpoint so we can tweak camera + layout --- */
function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) return setBp("mobile"); // < sm
      if (w < 1024) return setBp("tablet"); // < lg
      return setBp("desktop"); // ≥ lg
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return bp;
}

/** --- Animated box --- */
function AnimatedBox({
  initialPosition,
}: {
  initialPosition: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [targetPosition, setTargetPosition] = useState(
    new THREE.Vector3(...initialPosition),
  );
  const currentPosition = useRef(new THREE.Vector3(...initialPosition));

  const getAdjacentIntersection = (current: THREE.Vector3) => {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const [dx, dz] = directions[Math.floor(Math.random() * directions.length)];
    return new THREE.Vector3(current.x + dx * 3, 0.5, current.z + dz * 3);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newPosition = getAdjacentIntersection(currentPosition.current);
      newPosition.x = Math.max(-15, Math.min(15, newPosition.x));
      newPosition.z = Math.max(-15, Math.min(15, newPosition.z));
      setTargetPosition(newPosition);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      currentPosition.current.lerp(targetPosition, 0.1);
      meshRef.current.position.copy(currentPosition.current);
    }
  });

  return (
    <mesh ref={meshRef} position={initialPosition}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" opacity={0.9} transparent />
      <lineSegments>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.BoxGeometry(1, 1, 1)]}
        />
        <lineBasicMaterial attach="material" color="#000000" linewidth={2} />
      </lineSegments>
    </mesh>
  );
}

/** --- Scene --- */
function Scene() {
  const initialPositions: [number, number, number][] = [
    [-9, 0.5, -9],
    [-3, 0.5, -3],
    [0, 0.5, 0],
    [3, 0.5, 3],
    [9, 0.5, 9],
    [-6, 0.5, 6],
    [6, 0.5, -6],
    [-12, 0.5, 0],
    [12, 0.5, 0],
    [0, 0.5, 12],
  ];

  return (
    <>
      {/* Keep desktop behavior (no zoom) */}
      <OrbitControls enableZoom={false} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Grid
        renderOrder={-1}
        position={[0, 0, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        sectionSize={3}
        sectionThickness={1}
        sectionColor={new THREE.Color(0.55, 0.55, 0.8)}
        fadeDistance={50}
      />
      {initialPositions.map((position, index) => (
        <AnimatedBox key={index} initialPosition={position} />
      ))}
    </>
  );
}

/** --- Responsive camera that preserves desktop defaults --- */
function ResponsiveCamera() {
  const bp = useBreakpoint();
  const {camera} = useThree();

  useEffect(() => {
    // Desktop: original values (unchanged)
    let position: [number, number, number] = [20, 5, 10];
    let fov = 50;

    if (bp === "tablet") {
      position = [18, 6, 12];
      fov = 52;
    } else if (bp === "mobile") {
      position = [14, 7, 14];
      fov = 56;
    }

    camera.position.set(...position);
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }, [bp, camera]);

  return null;
}

export default function Component() {
  const bp = useBreakpoint();

  return (
    <div
      className={`relative w-full min-h-screen h-[100svh] text-white overflow-hidden ${manrope.className}`}>
      {/* Header placeholder retained */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4"></header>
      <div
        className={[
          "absolute left-1/2 -translate-x-1/2 z-10 text-center",
          "top-1/3 -translate-y-1/2",
          "md:top-1/3 md:-translate-y-1/2",
          "sm:top-[38%] sm:-translate-y-1/2",
          "xs:top-[42%] xs:-translate-y-1/2",
        ].join(" ")}>
        <div className="mx-4 sm:mx-6 md:mx-8 px-5 py-6 sm:px-6 sm:py-7 md:p-8 rounded-2xl shadow-[0_0_10px_#a168d6] group transition-all duration-300 hover:shadow-[0_0_20px_#a168d6] bg-white/10 backdrop-blur-md border border-white/20 w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] lg:w-auto lg:max-w-4xl">
          <h1 className="text-black dark:text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 md:mb-5 max-w-[90%] md:max-w-3xl lg:max-w-4xl mx-auto leading-tight">
            Hi, I&apos;m
            <span className="block font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#7A7FEE] to-[#140c55] glitch animate-float">
              Earl Balitcha
            </span>
          </h1>

          <h2 className="text-black dark:text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 md:mb-10 px-1 sm:px-2">
            wink
          </h2>

          <div className="flex justify-center">
            <ContactFormButton />
          </div>
        </div>
      </div>

      {/* Canvas: DPR clamped for mobile perf; camera adjusts via ResponsiveCamera */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{position: [20, 5, 10], fov: 50}} // desktop defaults preserved
        className="absolute inset-0">
        <ResponsiveCamera />
        <Scene />
      </Canvas>
    </div>
  );
}
