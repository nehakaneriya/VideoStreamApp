export default function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated base gradient */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #0b0b0d 0%, #16060b 35%, #200b12 62%, #0b0b0d 100%)",
        }}
      />

      {/* Floating red glow blobs */}
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-red-600/25 blur-[140px] animate-blob-1" />
      <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full bg-rose-500/20 blur-[140px] animate-blob-2" />
      <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full bg-red-700/15 blur-[150px] animate-blob-3" />

      {/* Subtle dot grid — nice texture */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
    </div>
  );
}