"use client";
import React, { useState, useRef, useEffect } from "react";

const Video = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const startVideo = async () => {
    setIsLoading(true);
    try {
      setHasStarted(true);
      // Small delay to ensure video element is mounted
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (videoRef.current) {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing video:", error);
      // Reset states if video fails to play
      setHasStarted(false);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

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

  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("Picture-in-Picture not supported or failed:", error);
      }
    }
  };

  const toggleFullscreen = async () => {
    const videoContainer = videoRef.current?.parentElement?.parentElement;
    if (videoContainer) {
      try {
        if (!document.fullscreenElement) {
          await videoContainer.requestFullscreen();
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch (error) {
        console.error("Fullscreen not supported or failed:", error);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative mx-auto mb-8 w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
      {/* Video Container with Rotating Border */}
      <div className="relative">
        {!hasStarted ? (
          // Video Placeholder
          <div
            className="group hover:shadow-4xl relative cursor-pointer overflow-hidden rounded-3xl bg-transparent transition-all duration-700"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={startVideo}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-transparent">
              {/* Poster Image */}
              <img
                src="/videobanner.png"
                alt="Video Preview"
                className="h-full w-full object-contain transition-all duration-1000"
              />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Pulsing Ring Animation */}
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"></div>

                  <button
                    onClick={startVideo}
                    disabled={isLoading}
                    className="group/btn relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white/20 active:scale-95 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                  >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 transition-all duration-300 group-hover/btn:animate-pulse group-hover/btn:opacity-100"></div>

                    {isLoading ? (
                      <div className="relative">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-8 sm:w-8 sm:border-3"></div>
                        <div
                          className="absolute inset-0 h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-blue-400 sm:h-8 sm:w-8 sm:border-3"
                          style={{ animationDirection: "reverse" }}
                        ></div>
                      </div>
                    ) : (
                      <svg
                        className="ml-1 h-6 w-6 text-white transition-all duration-300 group-hover/btn:scale-110 sm:h-8 sm:w-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Actual Video Player
          <div
            className="group hover:shadow-4xl relative overflow-hidden rounded-3xl border-2 border-gray-900 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl transition-all duration-700"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              if (isPlaying) setShowControls(false);
            }}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-transparent">
              <video
                ref={videoRef}
                className="h-full w-full bg-transparent object-contain transition-all duration-300"
                src="https://d1jclefe6buo6d.cloudfront.net/soundVideo.mp4"
                playsInline
                controls={false}
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadStart={() => setIsLoading(false)}
              >
                Your browser does not support the video tag.
              </video>

              {/* Animated Gradient Overlays */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
              ></div>

              {/* Main Play/Pause Button */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  !isPlaying || (isHovered && showControls)
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <div className="relative">
                  {/* Pulsing Ring Animation - Only show when paused */}
                  {!isPlaying && (
                    <>
                      <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>
                      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"></div>
                    </>
                  )}

                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={`group/btn relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 sm:h-20 sm:w-20 lg:h-24 lg:w-24 ${
                      isPlaying
                        ? "bg-black/20 hover:bg-black/40"
                        : "bg-white/10 backdrop-blur-xl hover:bg-white/20"
                    }`}
                  >
                    {/* Button Glow Effect - Only show when paused */}
                    {!isPlaying && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 transition-all duration-300 group-hover/btn:animate-pulse group-hover/btn:opacity-100"></div>
                    )}

                    {isLoading ? (
                      <div className="relative">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-8 sm:w-8 sm:border-3"></div>
                        <div
                          className="absolute inset-0 h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-blue-400 sm:h-8 sm:w-8 sm:border-3"
                          style={{ animationDirection: "reverse" }}
                        ></div>
                      </div>
                    ) : isPlaying ? (
                      <svg
                        className="h-6 w-6 text-white opacity-80 transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:opacity-100 sm:h-8 sm:w-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="ml-1 h-6 w-6 text-white transition-all duration-300 group-hover/btn:scale-110 sm:h-8 sm:w-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Enhanced Bottom Controls */}
              <div
                className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 transition-all duration-500 sm:p-6 ${showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
              >
                {/* Progress Bar */}
                <div
                  className="group/progress mb-1.5 h-0.5 w-full cursor-pointer rounded-full bg-white/20 transition-all duration-300 hover:h-1 sm:mb-4 sm:h-1.5 sm:hover:h-2"
                  onClick={handleProgressClick}
                >
                  <div className="relative h-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover/progress:shadow-lg group-hover/progress:shadow-blue-500/50"
                      style={{ width: `${progress}%` }}
                    />
                    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>

                {/* Control Bar */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <button
                      onClick={togglePlay}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:h-10 sm:w-10"
                    >
                      {isPlaying ? (
                        <svg
                          className="h-3 w-3 sm:h-5 sm:w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg
                          className="ml-0.5 h-3 w-3 sm:h-5 sm:w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <div className="text-[10px] font-medium sm:text-sm">
                      <span className="text-blue-400">
                        {formatTime(currentTime)}
                      </span>
                      <span className="mx-0.5 text-gray-400 sm:mx-2">/</span>
                      <span className="text-gray-300">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-3">
                    <button
                      onClick={togglePictureInPicture}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:h-10 sm:w-10"
                      title="Picture in Picture"
                    >
                      <svg
                        className="h-3 w-3 sm:h-5 sm:w-5"
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
                    <button
                      onClick={toggleFullscreen}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:h-10 sm:w-10"
                      title={
                        isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                      }
                    >
                      <svg
                        className="h-3 w-3 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isFullscreen
                              ? "M9 9l6 6m0-6l-6 6M21 3l-6 6m0-6l6 6M3 21l6-6m0 6l-6-6"
                              : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          }
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;
