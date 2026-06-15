export default function AuroraBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
      {/* Blob 1 — top-left, Emerald, 20s cycle */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: "-10%",
          left: "-10%",
          background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
          filter: "blur(90px)",
          opacity: 0.18,
          animation: "aurora-1 20s ease-in-out infinite",
        }}
      />

      {/* Blob 2 — bottom-right, Teal, 16s cycle offset */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          bottom: "-20%",
          right: "-10%",
          background: "radial-gradient(circle, #14B8A6 0%, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.15,
          animation: "aurora-2 16s ease-in-out infinite",
          animationDelay: "-6s",
        }}
      />

      {/* Blob 3 — centre, Cyan, 24s cycle offset */}
      <div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          top: "40%",
          left: "30%",
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.12,
          animation: "aurora-3 24s ease-in-out infinite",
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}
