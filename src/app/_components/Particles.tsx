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
  };
  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0 -z-10"
    />
  );
};

export default ParticlesBackground;
