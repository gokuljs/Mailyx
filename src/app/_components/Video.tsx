"use client";
import React, { useState, useRef, useEffect } from "react";

const Video = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const togglePlay = async () => {
    if (videoRef.current) {
      setIsLoading(true);
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error playing video:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative mx-auto my-8 mt-40 w-full px-4 sm:px-6 lg:px-8">
      {/* Video Container */}
      <div
        className="group hover:shadow-3xl relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl ring-1 ring-white/10 transition-all duration-500 hover:ring-white/20"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            src="https://d2sntr9e5s2ucj.cloudfront.net/4klatestProductVideo.mp4"
            poster="/videobanner.png"
            playsInline
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Main Play/Pause Button */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="group/btn relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/30 active:scale-95 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            >
              {/* Button Background Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />

              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-8 sm:w-8" />
              ) : isPlaying ? (
                <svg
                  className="h-6 w-6 text-white transition-transform duration-200 group-hover/btn:scale-110 sm:h-8 sm:w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="ml-1 h-6 w-6 text-white transition-transform duration-200 group-hover/btn:scale-110 sm:h-8 sm:w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div
            className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            {/* Progress Bar */}
            <div
              className="mb-3 h-1 w-full cursor-pointer rounded-full bg-white/20 transition-all duration-200 hover:h-1.5"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-200 hover:bg-white/30"
                >
                  {isPlaying ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="ml-0.5 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all duration-200 hover:bg-white/30">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
