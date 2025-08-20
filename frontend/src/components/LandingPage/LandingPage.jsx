// src/components/LandingPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
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
    answer:
      "PayNest provides an all-in-one platform to automate tenant management and rent collection.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755257904/ChatGPT_Image_Aug_15_2025_02_38_01_PM_deljba.png",
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
      "https://res.cloudinary.com/djydkcx01/image/upload/v1755241333/ChatGPT_Image_Aug_15_2025_10_01_33_AM_gznw5f.png",
  },
];

const SLIDE_MS = 6000; // autoplay cadence

export default function LandingPage() {
  const navigate = useNavigate();

  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("sm"));   // <600
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));   // >=900

  const cardSize = xs ? 140 : mdUp ? 210 : 170;
  const gapX = Math.round(cardSize * 1.1);
  const stepY1 = Math.round(cardSize * 0.08);
  const stepY2 = Math.round(cardSize * 0.16);
  const rowWidth = gapX * 2 + cardSize;

  const [active, setActive] = useState(0);
  const [, setLoaded] = useState({});
  const timerRef = useRef(null);

  useEffect(() => ensureOrbitronLoaded(), []);

  // Optimized sources
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

  // Preload heroes so background never flashes
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

  // Autoplay only if we have slides
  useEffect(() => {
    if (!hasSlides) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive((p) => (p + 1) % slides.length);
    }, SLIDE_MS);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [active, slides.length, hasSlides]);

  const roleLayout = {
    lead: { x: 0, y: 0, scale: 1.0, z: 3, shadow: "0 14px 40px rgba(0,0,0,.35)" },
    mid: { x: gapX, y: stepY1, scale: 0.92, z: 2, shadow: "0 12px 32px rgba(0,0,0,.30)" },
    tail: { x: gapX * 2, y: stepY2, scale: 0.84, z: 1, shadow: "0 10px 26px rgba(0,0,0,.25)" },
  };

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
          pt: { xs: 7, sm: 8, md: 10 },
          pb: { xs: 5, sm: 6, md: 8 },
          overflow: "hidden",
        }}
      >
        {/* Background = first card (active) */}
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
                filter: "brightness(.82) contrast(1.08) saturate(1.05)",
                zIndex: 1
              }}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        )}

        {/* Copy block */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 14, sm: 24, md: 40 },
            bottom: { xs: 18, sm: 28, md: 44 },
            maxWidth: { xs: 520, sm: 600, md: 720 },
            pr: 1,
            textAlign: "left",
            zIndex: 6, // above cards
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Orbitron', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: { xs: "1.9rem", sm: "2.6rem", md: "3.4rem" },
              lineHeight: 1.06,
              mb: 1.0,
              background: headingGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 22px rgba(0,0,0,.35)",
            }}
          >
            {currentSlide?.title || "Welcome to PayNest"}
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Orbitron', system-ui, sans-serif",
              fontWeight: 700,
              color: BRAND.pink,
              fontSize: { xs: "0.98rem", sm: "1.1rem", md: "1.18rem" },
              mb: 1.1,
              textShadow: "0 3px 16px rgba(0,0,0,.35)",
            }}
          >
            {currentSlide?.question || ""}
          </Typography>

          <Typography
            sx={{
              color: BRAND.soft,
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.08rem" },
              lineHeight: 1.7,
              mb: 2.0,
              maxWidth: 760,
              textShadow: "0 2px 14px rgba(0,0,0,.30)",
            }}
          >
            {currentSlide?.answer || ""}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              px: { xs: 3, md: 3.75 },
              py: { xs: 1, md: 1.25 },
              borderRadius: "28px",
              fontWeight: 800,
              textTransform: "uppercase",
              fontFamily: "'Orbitron', system-ui, sans-serif",
              background: headingGradient,
              boxShadow: "0 12px 30px rgba(255,0,128,0.2)",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 18px 46px rgba(255,0,128,0.28)",
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Horizontal cards */}
        {hasSlides && (
          <Box
            sx={{
              position: "absolute",
              right: { xs: -28, sm: 12, md: 40 }, // nudge out on small screens
              bottom: { xs: 12, sm: 20, md: 44 },
              width: rowWidth,
              height: cardSize + stepY2 + 20,
              zIndex: 4,               // below text
              pointerEvents: "none",   // never block text/UI
            }}
          >
            {order.map((slideIdx, i) => {
              const card = slides[slideIdx];
              if (!card) return null;
              const role = i === 0 ? "lead" : i === 1 ? "mid" : "tail";
              const target = {
                lead: { x: 0, y: 0, scale: 1.0, z: 3, shadow: "0 14px 40px rgba(0,0,0,.35)" },
                mid: { x: gapX, y: stepY1, scale: 0.92, z: 2, shadow: "0 12px 32px rgba(0,0,0,.30)" },
                tail: { x: gapX * 2, y: stepY2, scale: 0.84, z: 1, shadow: "0 10px 26px rgba(0,0,0,.25)" },
              }[role];

              return (
                <motion.div
                  key={`${safeActive}-${role}-${card.cardSrc}`}
                  initial={false}
                  animate={{ x: target.x, y: target.y, scale: target.scale, zIndex: target.z }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  style={{
                    position: "absolute",
                    width: cardSize,
                    height: cardSize,
                    borderRadius: 22,
                    backgroundImage: `url(${card.cardSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: target.shadow,
                    overflow: "hidden",
                  }}
                >
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
