import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "react-router-dom";
import VideoCard from "../../components/Video/VideoCard";
import type { Video } from "../../models/Video";
import { getAllVideos } from "../../service/VideoService";

export default function Home() {

  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [scrollId, setScrollId] = useState<string | undefined>();
  const [hasNext, setHasNext] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  // First Page
  const fetchFirstPage = async () => {

    try {

      setLoading(true);

      const response = await getAllVideos(
        search,
        undefined,
        12
      );

      setVideos(response.content);

      setScrollId(response.scrollId ?? undefined);

      setHasNext(response.hasNext);

      setError("");

    } catch (err) {

      console.error(err);

      setError("Unable to fetch videos.");

    } finally {

      setLoading(false);

    }

  };

  // Next Page
  const loadMore = async () => {

    if (loading) return;

    if (!hasNext) return;

    try {

      setLoading(true);

      const response = await getAllVideos(
        search,
        scrollId,
        12
      );

      setVideos(prev => [...prev, ...response.content]);

      setScrollId(response.scrollId ?? undefined);

      setHasNext(response.hasNext);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    setVideos([]);

    setScrollId(undefined);

    setHasNext(true);

    fetchFirstPage();

  }, [search]);

  // Infinite Scroll
  const lastVideoRef = useCallback(

    (node: HTMLDivElement | null) => {

      if (loading) return;

      if (observer.current) {

        observer.current.disconnect();

      }

      observer.current = new IntersectionObserver(entries => {

        if (
          entries[0].isIntersecting &&
          hasNext
        ) {

          loadMore();

        }

      });

      if (node) {

        observer.current.observe(node);

      }

    },

    [loading, hasNext, scrollId]

  );

  return (

    <div className="p-6 bg-[#0f0f0f] min-h-screen text-white">

      <h2 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4 uppercase">

        {search
          ? `Search Results : "${search}"`
          : "Explore Videos"}

      </h2>

      {error && (

        <p className="text-center text-red-500">

          {error}

        </p>

      )}

      {videos.length === 0 && !loading && (

        <p className="text-center text-gray-400">

          No videos found.

        </p>

      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

        {videos.map((video, index) => {

          if (index === videos.length - 1) {

            return (

              <div
                key={video.videoId}
                ref={lastVideoRef}
              >

                <VideoCard
                  videoId={video.videoId}
                  title={video.title}
                  description={video.description}
                  userName={video.userName}
                  contentType={video.contentType}
                  createdAt={video.createdAt}
                />

              </div>

            );

          }

          return (

            <VideoCard
              key={video.videoId}
              videoId={video.videoId}
              title={video.title}
              description={video.description}
              userName={video.userName}
              contentType={video.contentType}
              createdAt={video.createdAt}
            />

          );

        })}

      </div>

      {loading && videos.length > 0 && (

        <p className="text-center mt-8 text-gray-400 animate-pulse">

          Loading more videos...

        </p>

      )}

      {!hasNext && videos.length > 0 && (

        <p className="text-center mt-8 text-gray-500">

          No more videos.

        </p>

      )}

    </div>

  );

}