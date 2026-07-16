import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: "16:9",
        sources: [{ src, type: "application/x-mpegURL" }],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        controlBar: {
          downloadButton: false,
          skipButtons: {
            forward: 10,
            backward: 10,
          },
        },
        userActions: {
          hotkeys: true,
        },
      });

      videoElement.addEventListener("contextmenu", (e) => e.preventDefault());

    } else {
      playerRef.current.src({ src, type: "application/x-mpegURL" });
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div
      className="w-full mx-auto overflow-hidden rounded-xl shadow-2xl border border-gray-800 bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </div>
  );
}
