import VideoUpload from "../../components/Video/VideoUpload";

export default function Upload() {
  return (
    // Main container with dark background to match NehaStream theme
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Importing the functional Upload component */}
        <VideoUpload />
      </div>
    </div>
  );
}