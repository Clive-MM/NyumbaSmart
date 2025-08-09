// src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import FeaturesSection from "../LandingPage/FeaturesSection";
import Operation from "../LandingPage/Operation";
import FeedbackSection from "../LandingPage/FeedbackSection";

/* ---- Brand colors / gradient for headings ---- */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  red: "#FF3B3B",
  blue: "#2979FF",
  purple: "#7E00A6",
};
const headingGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

/* Load Orbitron once (same heading vibe as Features/Feedback) */
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

/* ---- Slides (keep text content/rotation; backgrounds removed) ---- */
const heroSlides = [
  {
    title: "Manage Properties Like a Pro",
    question: "Tired of scattered records and manual rent tracking?",
    answer:
      "PayNest provides an all-in-one platform to automate tenant management and rent collection.",
  },
  {
    title: "Hassle-Free Rent Payments",
    question: "Spending too much time following up on rent-payment progress?",
    answer:
      "PayNest instantly records tenant payments and updates transactions in real time—so follow-ups and decisions get easier.",
  },
  {
    title: "Unlock the Full Potential of Your Properties",
    question: "Managing multiple properties but lack clear insights?",
    answer:
      "Real-time reports on earnings, expenses, and occupancy make it simple to track profits, reduce costs, and handle taxes.",
  },
];

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Rotate slide *text* every 10s
  useEffect(() => {
    if (!heroSlides.length) return;
    const id = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % heroSlides.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Smooth scroll to hash targets (/#features or /#feedback)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const id = hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const currentSlide =
    heroSlides[heroSlides.length ? currentIndex % heroSlides.length : 0] || {
      title: "",
      question: "",
      answer: "",
    };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        m: 0,
        p: 0,
        overflowX: "hidden",
        position: "relative",
        backgroundColor: "#FFFFFF", // pure white page background
      }}
    >
      <NavBar />

      {/* HERO (now on white background; only text animates/rotates) */}
      <Box
        sx={{
          width: "100%",
          minHeight: "82vh",
          display: "grid",
          placeItems: "center",
          position: "relative",
          backgroundColor: "#FFFFFF",
          pt: { xs: 10, md: 12 }, // space under navbar
          pb: { xs: 6, md: 8 },
        }}
      >
        <motion.div
          key={currentSlide.title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%" }}
        >
          <Box sx={{ textAlign: "center", px: 2, maxWidth: 1000, mx: "auto" }}>
            {/* Heading with Orbitron + brand gradient (same vibe as Feedback/Features) */}
            <Typography
              component="h1"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.4rem" },
                lineHeight: 1.15,
                mb: 1,
                background: headingGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {currentSlide.title}
            </Typography>

            {/* Subheading/question in strong PayNest color */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 600,
                color: BRAND.magenta,
                mb: 1.5,
                fontSize: { xs: "1.05rem", sm: "1.2rem" },
              }}
            >
              {currentSlide.question}
            </Typography>

            {/* Body copy: readable on white */}
            <Typography
              variant="body1"
              sx={{
                maxWidth: 780,
                mx: "auto",
                mb: 3,
                fontSize: { xs: "0.98rem", sm: "1.06rem" },
                lineHeight: 1.6,
                color: "#333",
              }}
            >
              {currentSlide.answer}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: "28px",
                fontWeight: 800,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                fontFamily: "'Orbitron', sans-serif",
                background: headingGradient,
                boxShadow: "0 8px 22px rgba(212,18,78,0.18)",
                "&:hover": {
                  filter: "brightness(1.05)",
                  boxShadow: "0 10px 28px rgba(212,18,78,0.24)",
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Anchor targets (IDs) for navbar scroll */}
      <Box id="features">
        <FeaturesSection />
      </Box>

      <Operation />

      <Box id="feedback">
        <FeedbackSection />
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;
