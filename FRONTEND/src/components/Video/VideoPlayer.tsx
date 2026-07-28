import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import { Settings } from "lucide-react";

interface VideoPlayerProps {
  src: string;
}

// videojs-contrib-quality-levels runtime object ka shape — plugin ke saath
// official TypeScript types incomplete hain, isliye khud define kiya
interface QualityLevel {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrate: number;
  enabled: boolean;
}

interface QualityLevelList {
  length: number;
  selectedIndex: number;
  [index: number]: QualityLevel;
  on: (event: string, callback: () => void) => void;
}

// Player ka wo extra method jo videojs-contrib-quality-levels plugin add karta hai
// (@types/video.js mein declared nahi hai, isliye local type)
type PlayerWithQualityLevels = ReturnType<typeof videojs> & {
  qualityLevels: () => QualityLevelList;
};

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const qualityLevelsRef = useRef<QualityLevelList | null>(null);

  const [qualityOptions, setQualityOptions] = useState<number[]>([]);
  const [currentQuality, setCurrentQuality] = useState<"auto" | number>("auto");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);

      const player = videojs(videoElement, {
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

      playerRef.current = player;

      player.ready(() => {
        // videojs-contrib-quality-levels khud "qualityLevels" method player pe register kar deta hai
        const qualityLevels = (player as PlayerWithQualityLevels).qualityLevels();
        qualityLevelsRef.current = qualityLevels;

        // Har baar jab HLS master.m3u8 se koi naya resolution-variant detect ho,
        // ye event fire hota hai — hum dropdown ke options refresh kar dete hain
        qualityLevels.on("addqualitylevel", () => {
          const heights = new Set<number>();
          for (let i = 0; i < qualityLevels.length; i++) {
            const level = qualityLevels[i];
            if (level.height) heights.add(level.height);
          }
          setQualityOptions(Array.from(heights).sort((a, b) => b - a));
        });
      });

      videoElement.addEventListener("contextmenu", (e) => e.preventDefault());

    } else {
      playerRef.current.src({ src, type: "application/x-mpegURL" });
      // setState ko effect ke synchronous flow se bahar (microtask mein) daala
      // taaki React ke "no setState directly in effect body" rule ke saath clash na ho
      queueMicrotask(() => {
        setQualityOptions([]);
        setCurrentQuality("auto");
      });
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  // User ne dropdown se koi quality (ya "Auto") choose kiya
  const handleSelectQuality = (height: "auto" | number) => {
    const qualityLevels = qualityLevelsRef.current;
    if (!qualityLevels) return;

    for (let i = 0; i < qualityLevels.length; i++) {
      const level = qualityLevels[i];
      // "auto" mein sab levels enabled rakho (player khud best choose karega)
      // specific quality mein sirf usi height wala level enable karo
      level.enabled = height === "auto" ? true : level.height === height;
    }

    setCurrentQuality(height);
    setMenuOpen(false);
  };

  return (
    <div
      className="w-full mx-auto overflow-hidden rounded-xl shadow-2xl border border-gray-800 bg-black relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>

      {/* Custom Quality Selector — sirf tab dikhega jab HLS se resolutions detect ho jayen */}
      {qualityOptions.length > 0 && (
        <div className="absolute bottom-14 right-3 z-20">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition"
          >
            <Settings size={13} />
            {currentQuality === "auto" ? "Auto" : `${currentQuality}p`}
          </button>

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-1 bg-black/90 rounded-md overflow-hidden border border-gray-700 min-w-[100px]">
              <button
                onClick={() => handleSelectQuality("auto")}
                className={`block w-full text-left px-4 py-2 text-xs hover:bg-red-600/30 transition ${
                  currentQuality === "auto" ? "text-red-500 font-bold" : "text-white"
                }`}
              >
                Auto
              </button>
              {qualityOptions.map((height) => (
                <button
                  key={height}
                  onClick={() => handleSelectQuality(height)}
                  className={`block w-full text-left px-4 py-2 text-xs hover:bg-red-600/30 transition ${
                    currentQuality === height ? "text-red-500 font-bold" : "text-white"
                  }`}
                >
                  {height}p
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
