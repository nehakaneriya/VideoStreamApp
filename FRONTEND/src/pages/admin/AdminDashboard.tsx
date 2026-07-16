import { useEffect, useState } from "react";
import { getDashboardStats, getAllVideosAdmin } from "@/service/Adminservice";
import { Users, Video, Shield, Upload, TrendingUp } from "lucide-react";
import type { Video as VideoType } from "@/models/Video";

interface Stats {
  totalUsers: number;
  totalVideos: number;
  adminsCount?: number;
}

interface TopUploader {
  email: string;
  name: string;
  videoCount: number;
}

export default function Dashboard() {

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVideos: 0,
    adminsCount: 0
  });

  const [recentVideos, setRecentVideos] = useState<VideoType[]>([]);
  const [topUploaders, setTopUploaders] = useState<TopUploader[]>([]);

  useEffect(() => {
    // Stats fetch karo
    getDashboardStats().then(setStats).catch(console.error);

    // Videos se recent uploads aur top uploaders nikalo
    getAllVideosAdmin().then((videos) => {

      // Recent 5 videos — createdAt se sort karo
      const sorted = [...videos].sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setRecentVideos(sorted.slice(0, 5));

      // Top uploaders — email se group karo aur count karo
      const uploaderMap = new Map<string, TopUploader>();
      videos.forEach((v) => {
        if (!v.userEmail) return;
        if (uploaderMap.has(v.userEmail)) {
          uploaderMap.get(v.userEmail)!.videoCount++;
        } else {
          uploaderMap.set(v.userEmail, {
            email: v.userEmail,
            name: v.userName || v.userEmail,
            videoCount: 1,
          });
        }
      });

      const top = Array.from(uploaderMap.values())
        .sort((a, b) => b.videoCount - a.videoCount)
        .slice(0, 5);
      setTopUploaders(top);

    }).catch(console.error);
  }, []);

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-red-600">Admin</span> Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Total Users */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-red-600 hover:scale-[1.02] transition-all">
          <div>
            <p className="text-gray-400 text-sm">Total Users</p>
            <h2 className="text-4xl font-bold mt-1">{stats.totalUsers}</h2>
          </div>
          <div className="bg-red-600/10 p-3 rounded-full">
            <Users size={36} className="text-red-600" />
          </div>
        </div>

        {/* Total Videos */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-red-600 hover:scale-[1.02] transition-all">
          <div>
            <p className="text-gray-400 text-sm">Total Videos</p>
            <h2 className="text-4xl font-bold mt-1">{stats.totalVideos}</h2>
          </div>
          <div className="bg-red-600/10 p-3 rounded-full">
            <Video size={36} className="text-red-600" />
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-red-600 hover:scale-[1.02] transition-all">
          <div>
            <p className="text-gray-400 text-sm">Total Admins</p>
            <h2 className="text-4xl font-bold mt-1">{stats.adminsCount}</h2>
          </div>
          <div className="bg-red-600/10 p-3 rounded-full">
            <Shield size={36} className="text-red-600" />
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Uploads */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold">Recent Uploads</h2>
          </div>

          {recentVideos.length === 0 ? (
            <p className="text-gray-500 text-sm">No videos yet</p>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div
                  key={video.videoId}
                  className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-3 border border-gray-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Uploader avatar */}
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(video.userName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-gray-500 text-xs">{video.userName || "Unknown"}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs flex-shrink-0 ml-2">
                    {video.createdAt
                      ? new Date(video.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Uploaders */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold">Top Uploaders</h2>
          </div>

          {topUploaders.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topUploaders.map((uploader, index) => (
                <div
                  key={uploader.email}
                  className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-3 border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-5 ${
                      index === 0 ? "text-yellow-400" :
                      index === 1 ? "text-gray-400" :
                      index === 2 ? "text-orange-400" :
                      "text-gray-600"
                    }`}>
                      #{index + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {uploader.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{uploader.name}</p>
                      <p className="text-gray-500 text-xs">{uploader.email}</p>
                    </div>
                  </div>
                  <div className="bg-red-600/10 px-3 py-1 rounded-full">
                    <span className="text-red-500 text-sm font-semibold">
                      {uploader.videoCount} videos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
