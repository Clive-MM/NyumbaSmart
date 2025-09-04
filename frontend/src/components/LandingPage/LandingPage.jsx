// src/components/LandingPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, useMediaQuery, useTheme, Paper } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  text: "rgba(235,235,235,.98)",
  soft: "rgba(230,230,230,.92)",
};

const BRAND_BG = `
  radial-gradient(1200px 600px at 8% -10%, rgba(255,0,128,.10), transparent 60%),
  radial-gradient(1100px 520px at 108% 6%, rgba(69,107,188,.10), transparent 60%),
  radial-gradient(900px 500px at 50% 110%, rgba(126,0,166,.08), transparent 60%),
  linear-gradient(180deg, #0b0d13 0%, #0a0220 50%, #07080d 100%)
`;

/* Orbitron once */
const ORBITRON_URL = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap";
function ensureOrbitronLoaded() {
  if (typeof document === "undefined") return;
  if (!document.head.querySelector('link[data-orbitron="true"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = ORBITRON_URL;
    link.setAttribute("data-orbitron", "true");
    document.head.appendChild(link);
  }
}

/* Cloudinary helper */
function cld(url, { w, h, dpr = 2 } = {}) {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  const sep = url.includes("/upload/") ? "/upload/" : "/image/upload/";
  const [a, b] = url.split(sep);
  const pieces = ["f_auto", "q_auto", `dpr_${dpr}`];
  if (w) pieces.push(`w_${w}`);
  if (h) pieces.push(`h_${h}`, "c_fill");
  return `${a}${sep}${pieces.join(",")}/${b}`;
}

/* Slides */
const RAW_SLIDES = [
  {
    title: "Manage Properties Like a Pro",
    question: "Tired of scattered records and manual rent tracking?",
    answer: "All-in-one platform to automate tenant management and rent collection.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755257904/ChatGPT_Image_Aug_15_2025_02_38_01_PM_deljba.png",
  },
  {
    title: "Hassle-Free Rent Payments",
    question: "Spending too much time following up on rent?",
    answer: "Instantly records tenant payments and updates transactions in real time.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755085306/ChatGPT_Image_Aug_13_2025_02_41_13_PM_gpv4ws.png",
  },
  {
    title: "Unlock the Full Potential of Your Properties",
    question: "Managing multiple properties but lack clear insights?",
    answer: "Real-time reports on earnings, expenses, and occupancy—track profits and handle taxes.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755241333/ChatGPT_Image_Aug_15_2025_10_01_33_AM_gznw5f.png",
  },
];

// Autoplay (slower if reduced motion)
const BASE_SLIDE_MS = 7000;

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("sm"));   // <600
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));   // >=900
  const prefersReducedMotion = useReducedMotion();

  const cardSize = xs ? 140 : mdUp ? 210 : 170;
  const gapX = Math.round(cardSize * 1.1);
  const stepY1 = Math.round(cardSize * 0.08);
  const stepY2 = Math.round(cardSize * 0.16);
  const rowWidth = gapX * 2 + cardSize;

  const [active, setActive] = useState(0);
  const [, setLoaded] = useState({});
  const timerRef = useRef(null);

  useEffect(() => ensureOrbitronLoaded(), []);

  const slides = useMemo(
    () =>
      RAW_SLIDES.map((s) => ({
        ...s,
        heroSrc: cld(s.image, { w: 1920, dpr: 2 }),
        cardSrc: cld(s.image, { w: 640, dpr: 2 }),
      })),
    []
  );

  const hasSlides = slides.length > 0;
  const safeActive = hasSlides ? active % slides.length : 0;
  const order = hasSlides ? [safeActive, (safeActive + 1) % slides.length, (safeActive + 2) % slides.length] : [];
  const currentSlide = hasSlides ? slides[safeActive] : null;

  // Preload heroes
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = s.heroSrc;
      const done = () =>
        setLoaded((m) => (m?.[s.heroSrc] ? m : { ...m, [s.heroSrc]: true }));
      if (img.complete) done();
      else if (img.decode) img.decode().then(done).catch(() => (img.onload = done));
      else img.onload = done;
    });
  }, [slides]);

  // Autoplay (respect reduced motion)
  useEffect(() => {
    if (!hasSlides) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const interval = prefersReducedMotion ? BASE_SLIDE_MS * 1.5 : BASE_SLIDE_MS;
    timerRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % slides.length);
    }, interval);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [active, slides.length, hasSlides, prefersReducedMotion]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100svh",
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
          minHeight: { xs: "92svh", md: "95svh" },
          position: "relative",
          display: "grid",
          placeItems: "center",
          pt: { xs: 8, sm: 9, md: 11 },
          pb: { xs: 5, sm: 6, md: 8 },
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        {hasSlides && (
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentSlide.heroSrc}
              src={currentSlide.heroSrc}
              alt=""
              decoding="async"
              loading="eager"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(.66) contrast(1.05) saturate(1.0)",
                zIndex: 1,
              }}
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
              animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.04 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.4 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        )}

        {/* Global vignette for contrast */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background:
              "radial-gradient(120% 120% at 70% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Glass panel — narrower width, taller height, left-biased, no card overlap */}
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            left: { xs: 12, sm: 24, md: 40 },
            bottom: { xs: 16, sm: 24, md: 44 },

            // ↓ Updated per your request
            width: { xs: "88vw", sm: "80vw", md: 560, lg: 640, xl: 700 },
            maxWidth: 700,
            minHeight: { xs: 260, sm: 300, md: 340 },

            zIndex: 4, // below cards
            overflow: "hidden",
            clipPath: "inset(0 round 16px)",
            borderRadius: 16,
            background: "rgba(10,12,20,0.55)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 36px rgba(0,0,0,0.45)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Box
            sx={{
              pt: { xs: 2.2, sm: 2.6, md: 3 },
              pb: { xs: 2.2, sm: 2.6, md: 3 },
              px: { xs: 2, sm: 2.6, md: 3 },

              width: "100%",
              display: "grid",
              justifyItems: { xs: "center", md: "start" },
              rowGap: { xs: 1.05, sm: 1.15, md: 1.25 },
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.25rem" },
                lineHeight: 1.22,
                letterSpacing: 0.3,
                background: "linear-gradient(90deg, #FF0080, #456BBC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 10px rgba(0,0,0,.35)",
              }}
            >
              {currentSlide?.title || "Welcome to PayNest"}
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Orbitron', system-ui, sans-serif",
                fontWeight: 600,
                color: "#FFE6F2",
                fontSize: { xs: "0.98rem", sm: "1.06rem", md: "1.12rem" },
                textShadow: "0 1px 8px rgba(0,0,0,.40)",
              }}
            >
              {currentSlide?.question || ""}
            </Typography>

            <Typography
              sx={{
                color: "rgba(235,235,235,.96)",
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" },
                lineHeight: 1.7,
                textShadow: "0 1px 6px rgba(0,0,0,.28)",
                maxWidth: { md: 640 },
              }}
            >
              {currentSlide?.answer || ""}
            </Typography>

            <Button
  aria-label="Get started with PayNest"
  variant="contained"
  size="large"
  onClick={() => navigate("/login")}
  sx={{
    px: { xs: 3, md: 3.4 },
    py: { xs: 1, md: 1.1 },
    borderRadius: "28px",
    fontWeight: 700,
    textTransform: "uppercase",
    fontFamily: "'Orbitron', system-ui, sans-serif",
    background: "linear-gradient(90deg, #FF0080, #456BBC)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 10px 26px rgba(255,0,128,0.18)",
    justifySelf: "center",   // ← center in the panel (Grid axis)
    mx: "auto",               // ← safety for non-grid layouts
    "&:hover": {
      transform: prefersReducedMotion ? "none" : "translateY(-2px)",
      boxShadow: "0 18px 40px rgba(255,0,128,0.26)",
    },
  }}
>
  GET STARTED
</Button>

          </Box>
        </Paper>

        {/* Cards (always above panel) */}
        {hasSlides && (
          <Box
            sx={{
              position: "absolute",
              right: { xs: -10, sm: 18, md: 44 },
              bottom: { xs: 8, sm: 18, md: 44 },
              width: rowWidth,
              height: cardSize + stepY2 + 20,
              zIndex: 6,
              pointerEvents: "none",
              filter: "brightness(0.88) contrast(0.98)",
            }}
          >
            {order.map((slideIdx, i) => {
              const card = slides[slideIdx];
              if (!card) return null;
              const targets = [
                { x: 0, y: 0, scale: 1.0, z: 3, shadow: "0 14px 40px rgba(0,0,0,.35)" },
                { x: gapX, y: stepY1, scale: 0.92, z: 2, shadow: "0 12px 32px rgba(0,0,0,.30)" },
                { x: gapX * 2, y: stepY2, scale: 0.84, z: 1, shadow: "0 10px 26px rgba(0,0,0,.25)" },
              ][i];

              return (
                <motion.div
                  key={`${safeActive}-${i}-${card.cardSrc}`}
                  initial={false}
                  animate={{
                    x: targets.x,
                    y: targets.y,
                    scale: prefersReducedMotion ? 1 : targets.scale,
                    zIndex: targets.z,
                  }}
                  transition={{
                    type: prefersReducedMotion ? "tween" : "spring",
                    duration: prefersReducedMotion ? 0.3 : 0.55,
                    stiffness: 260,
                    damping: 28,
                  }}
                  style={{
                    position: "absolute",
                    width: cardSize,
                    height: cardSize,
                    borderRadius: 22,
                    backgroundImage: `url(${card.cardSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: targets.shadow,
                    overflow: "hidden",
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>

      {/* other sections */}
      <Box id="features"><FeaturesSection /></Box>
      <Operation />
      <Box id="feedback"><FeedbackSection /></Box>
      <Footer />
    </Box>
  );
}
