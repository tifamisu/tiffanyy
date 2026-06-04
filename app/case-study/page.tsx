"use client";
import { motion } from "framer-motion";

export default function CaseStudy() {
  const hearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    size: 12 + Math.random() * 20,
  }));

  return (
    <main style={{ background:"#1a1a1a", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", fontFamily:"'Press Start 2P',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
      `}</style>

      {/* Floating pixel hearts */}
      {hearts.map(h => (
        <motion.div
          key={h.id}
          animate={{
            y: [0, -800],
            scale: [0.5, 1.2, 0.6, 1, 0.8],
            opacity: [0, 0.7, 0.9, 0.7, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            bottom: -40,
            left: `${h.x}%`,
            pointerEvents: "none",
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 20 20" style={{ imageRendering:"pixelated" }}>
            <rect x="3" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="6" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="7" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="9" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="11" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="12" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="1" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="2" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="3" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="4" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="4" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="5" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="5" width="1" height="1" fill="#ff2d78"/>
            <rect x="2" y="6" width="1" height="1" fill="#ff2d78"/>
            <rect x="16" y="6" width="1" height="1" fill="#ff2d78"/>
            <rect x="3" y="7" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="7" width="1" height="1" fill="#ff2d78"/>
            <rect x="3" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="15" y="8" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="9" width="1" height="1" fill="#ff2d78"/>
            <rect x="4" y="10" width="1" height="1" fill="#ff2d78"/>
            <rect x="14" y="10" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="11" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="11" width="1" height="1" fill="#ff2d78"/>
            <rect x="5" y="12" width="1" height="1" fill="#ff2d78"/>
            <rect x="13" y="12" width="1" height="1" fill="#ff2d78"/>
            <rect x="6" y="13" width="1" height="1" fill="#ff2d78"/>
            <rect x="12" y="13" width="1" height="1" fill="#ff2d78"/>
            <rect x="7" y="14" width="1" height="1" fill="#ff2d78"/>
            <rect x="11" y="14" width="1" height="1" fill="#ff2d78"/>
            <rect x="8" y="15" width="1" height="1" fill="#ff2d78"/>
            <rect x="10" y="15" width="1" height="1" fill="#ff2d78"/>
            <rect x="9" y="16" width="1" height="1" fill="#ff2d78"/>
          </svg>
        </motion.div>
      ))}

      {/* Floating bunny */}
      <motion.img
        src="/mochi-bunny.png"
        alt="Mochi Bunny"
        animate={{ y: [0, -15, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 240,
          height: "auto",
          filter: "drop-shadow(0 0 8px rgba(255,45,120,0.4)) drop-shadow(0 0 20px rgba(255,45,120,0.2))",
          marginBottom: 40,
          zIndex: 1,
        }}
      />

      {/* Coming soon text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ textAlign: "center", zIndex: 1 }}
      >
        <p style={{ fontSize: "24px", color: "#ff2d78", letterSpacing: "3px", marginBottom: 16 }}>
          COMING SOON
        </p>
        <p style={{ fontSize: "8px", color: "#666", letterSpacing: "1px", lineHeight: 2 }}>
          MOCHI BUNNY CASE STUDY
        </p>
        <p style={{ fontSize: "7px", color: "#555", letterSpacing: "1px", marginTop: 12, lineHeight: 2 }}>
          market research / user personas / product strategy
        </p>

        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: "inline-block",
            marginTop: 32,
            fontFamily: "'Press Start 2P',monospace",
            fontSize: "8px",
            color: "white",
            background: "#ff2d78",
            padding: "10px 20px",
            border: "2px solid #111",
            boxShadow: "3px 3px 0 #111",
            textDecoration: "none",
            letterSpacing: "0.5px",
          }}
        >
          BACK TO PORTFOLIO
        </motion.a>
      </motion.div>

      {/* Sparkle decorations */}
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ position: "absolute", top: "20%", left: "15%", fontSize: "16px", color: "#ff2d78", zIndex: 1 }}
      >✦</motion.span>
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        style={{ position: "absolute", top: "30%", right: "20%", fontSize: "12px", color: "#ff6b9d", zIndex: 1 }}
      >✦</motion.span>
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
        style={{ position: "absolute", bottom: "25%", left: "25%", fontSize: "14px", color: "#ffb6d5", zIndex: 1 }}
      >✦</motion.span>
      <motion.span
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
        style={{ position: "absolute", top: "15%", right: "30%", fontSize: "10px", color: "#ffd4e8", zIndex: 1 }}
      >✦</motion.span>
    </main>
  );
}
