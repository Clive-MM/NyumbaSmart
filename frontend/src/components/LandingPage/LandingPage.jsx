// src/components/LandingPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";

import NavBar from "./NavBar";
import Footer from "./Footer";
import FeaturesSection from "../LandingPage/FeaturesSection";
import Operation from "../LandingPage/Operation";
import FeedbackSection from "../LandingPage/FeedbackSection";

/* ---- PayNest brand ---- */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  red: "#FF3B3B",
  blue: "#2979FF",
  purple: "#7E00A6",
  text: "rgba(235,235,235,.96)",
  soft: "rgba(220,220,220,.85)",
};
const headingGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

const BRAND_BG = `
  radial-gradient(1200px 600px at 8% -10%, rgba(255,0,128,.14), transparent 60%),
  radial-gradient(1100px 520px at 108% 6%, rgba(69,107,188,.12), transparent 60%),
  radial-gradient(900px 500px at 50% 110%, rgba(126,0,166,.10), transparent 60%),
  linear-gradient(180deg, #0b0d13 0%, #0a0220 50%, #07080d 100%)
`;

/* Load Orbitron once */
const orbitronHref =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap";
(() => {
  if (typeof document !== "undefined" && !document.head.querySelector(`link[href="${orbitronHref}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = orbitronHref;
    document.head.appendChild(link);
  }
})();

/* Cloudinary quality helpers (keeps images sharp without manual editing) */
const cld = (url, { w, h, dpr = 2 } = {}) => {
  // inject f_auto,q_auto and optional size/dpr into Cloudinary URL
  if (!url.includes("res.cloudinary.com")) return url;
  const sep = url.includes("/upload/") ? "/upload/" : "/image/upload/";
  const [a, b] = url.split(sep);
  const pieces = ["f_auto", "q_auto", `dpr_${dpr}`];
  if (w) pieces.push(`w_${w}`);
  if (h) pieces.push(`h_${h}`, "c_fill");
  return `${a}${sep}${pieces.join(",")}/${b}`;
};

/* Slides with your images */
const RAW_SLIDES = [
  {
    title: "Manage Properties Like a Pro",
    question: "Tired of scattered records and manual rent tracking?",
    answer:
      "PayNest provides an all-in-one platform to automate tenant management and rent collection.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755080475/Apartment_Design_rctd0r.jpg",
  },
  {
    title: "Hassle-Free Rent Payments",
    question: "Spending too much time following up on rent-payment progress?",
    answer:
      "PayNest instantly records tenant payments and updates transactions in real time—so follow-ups and decisions get easier.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755085306/ChatGPT_Image_Aug_13_2025_02_41_13_PM_gpv4ws.png",
  },
  {
    title: "Unlock the Full Potential of Your Properties",
    question: "Managing multiple properties but lack clear insights?",
    answer:
      "Real-time reports on earnings, expenses, and occupancy make it simple to track profits, reduce costs, and handle taxes.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755088543/ChatGPT_Image_Aug_13_2025_03_35_18_PM_h5in8v.png",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);

  // Build responsive sources (hero ~2400w for clarity, cards ~420w)
  const slides = useMemo(
    () =>
      RAW_SLIDES.map((s) => ({
        ...s,
        heroSrc: cld(s.image, { w: 2400, dpr: 2 }),
        cardSrc: cld(s.image, { w: 420, dpr: 2 }),
      })),
    []
  );

  // Preload the next hero image for crisp transitions
  useEffect(() => {
    const next1 = slides[(idx + 1) % slides.length]?.heroSrc;
    if (!next1) return;
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = next1;
  }, [idx, slides]);

  // Auto-rotate hero + cards
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % slides.length);
    }, 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const active = slides[idx];
  const thumbs = [
    slides[idx],
    slides[(idx + 1) % slides.length],
    slides[(idx + 2) % slides.length],
  ];

  // Subtle parallax on scroll (tiny translateY)
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 400], [0, 18]); // 18px drift

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        position: "relative",
        color: BRAND.text,
        backgroundImage: BRAND_BG,
        backgroundAttachment: { xs: "scroll", md: "fixed" },
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <NavBar />

      {/* HERO */}
      <Box
        sx={{
          width: "100%",
          minHeight: "82vh",
          position: "relative",
          display: "grid",
          placeItems: "center",
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        {/* Full-bleed hero with SOFT crossfade + Ken Burns (no darkening/blur) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={active.heroSrc}
            src={active.heroSrc}
            alt=""
            width="100%"
            height="100%"
            decoding="async"
            loading="eager"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              imageRendering: "crisp-edges", // fallback
              WebkitImageSmoothing: "antialiased",
              willChange: "transform, opacity",
            }}
            initial={{ opacity: 0, scale: 1.02, x: -6 }}
            animate={{ opacity: 1, scale: 1.06, x: 0, y: yParallax }}
            exit={{ opacity: 0, scale: 1.02, x: 6 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>

        {/* (Keep) bottom-left readability veil — made lighter to preserve sharpness */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "60%",
            maxWidth: 860,
            height: "55%",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,.65) 78%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* LOWER-LEFT: Title / Question / Answer (unchanged position) */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 16, sm: 28, md: 40 },
            bottom: { xs: 16, sm: 28, md: 40 },
            maxWidth: { xs: 520, md: 640 },
            pr: 2,
            textAlign: "left",
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.6rem", md: "3rem" },
              lineHeight: 1.1,
              mb: 1,
              background: headingGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 22px rgba(0,0,0,.35)", // subtle readability polish
            }}
          >
            {active.title}
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              color: BRAND.pink,
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
              mb: 1.2,
              textShadow: "0 3px 16px rgba(0,0,0,.35)",
            }}
          >
            {active.question}
          </Typography>

          <Typography
            sx={{
              color: BRAND.soft,
              fontSize: { xs: "0.98rem", sm: "1.06rem" },
              lineHeight: 1.65,
              mb: 2,
              maxWidth: 720,
              textShadow: "0 2px 14px rgba(0,0,0,.30)",
            }}
          >
            {active.answer}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              px: 3.5,
              py: 1.15,
              borderRadius: "26px",
              fontWeight: 800,
              textTransform: "uppercase",
              fontFamily: "'Orbitron', sans-serif",
              background: headingGradient,
              boxShadow: "0 10px 28px rgba(255,0,128,0.18)",
              transition: "transform .25s ease, box-shadow .25s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 16px 42px rgba(255,0,128,0.26)",
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* BOTTOM-RIGHT: 3 glassy cards, auto-sliding with smooth entrance */}
        <Box
          sx={{
            position: "absolute",
            right: { xs: 16, sm: 24, md: 40 },
            bottom: { xs: 16, sm: 24, md: 40 },
            display: "flex",
            gap: { xs: 1.5, md: 2 },
            alignItems: "flex-end",
          }}
        >
          <AnimatePresence initial={false}>
            {thumbs.map((s, n) => (
              <motion.div
                key={`${idx}-${n}-${s.cardSrc}`}
                initial={{ opacity: 0, y: 26, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 22,
                  backgroundImage: `url(${s.cardSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  imageRendering: "crisp-edges",
                  boxShadow:
                    "0 14px 40px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.06)",
                  position: "relative",
                  overflow: "hidden",
                  willChange: "transform, opacity",
                }}
              >
                {/* glass layer for modern feel */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(120% 100% at 0% 100%, rgba(255,255,255,.10), rgba(255,255,255,0) 55%)",
                    pointerEvents: "none",
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      </Box>

      {/* other sections */}
      <Box id="features"><FeaturesSection /></Box>
      <Operation />
      <Box id="feedback"><FeedbackSection /></Box>
      <Footer />
    </Box>
  );
}
