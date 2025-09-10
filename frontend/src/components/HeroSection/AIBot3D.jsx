// src/components/AIBot3D.jsx
import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import greetmessage from "./audio/greetmessage.mp3";

// BotModel component to load and render the 3D model
function BotModel({ rotateSpring, ...props }) {
  const { scene } = useGLTF("/bot/arguide_bot.glb");
  const AnimatedPrimitive = animated.primitive;

  return (
    <AnimatedPrimitive
      object={scene}
      rotation-x={rotateSpring.rotateX}
      rotation-y={rotateSpring.rotateY}
      {...props}
    />
  );
}

export default function AIBot3D() {
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const [spring, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  // 🎵 Play audio only after user interacts (better for autoplay policies)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() =>
          console.warn("Audio blocked, user interaction required")
        );
      }
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("mousemove", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("mousemove", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("mousemove", handleUserInteraction);
    };
  }, []);

  // Handle mouse move for 3D rotation effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / rect.height) * 0.5;
    const rotateY = (x / rect.width) * 0.5;

    api.start({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    api.start({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      className="flex items-center justify-center  "
    //   className="flex border items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-96 h-96">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} className="cursor-pointer">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Environment preset="city" />

          {/* Bot Model - scale down a bit */}
          <BotModel rotateSpring={spring} scale={4} />

          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Greeting audio */}
      <audio ref={audioRef} src={greetmessage} preload="auto" />
    </div>
  );
}

useGLTF.preload("/bot/arguide_bot.glb");
