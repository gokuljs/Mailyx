"use client";
import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: any) => {
    await loadStarsPreset(engine);
  }, []);
  const particlesOptions = {
    preset: "stars",
    background: {
      color: {
        value: "transparent", // very important to keep your background visible
      },
    },
    fullScreen: {
      enable: false, // very important! we manually control the area
    },
    particles: {
      color: {
        value: ["#ffffff"], // white, gold, cyan
      },
      size: {
        value: { min: 0.3, max: 1.2 }, // smaller stars
      },
      opacity: {
        value: 1,
      },
    },
  };
  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0"
    />
  );
};

export default ParticlesBackground;
