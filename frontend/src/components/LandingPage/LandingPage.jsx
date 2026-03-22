import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container } from "@mui/material"; // Removed useTheme and useMediaQuery
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";

import NavBar from "./NavBar";
import Footer from "./Footer";
import FeaturesSection from "../LandingPage/FeaturesSection";
import Operation from "../LandingPage/Operation";
import FeedbackSection from "../LandingPage/FeedbackSection";

const BRAND = {
  magenta: "#D4124E",
  slate: "#0F172A",
  insetDark: "rgba(0, 0, 0, 0.35)",  
  insetLight: "rgba(255, 255, 255, 1)", 
};

// --- STYLED HERO COMPONENTS ---

const HeroActionPill = styled(motion.create(Button))(({ theme }) => ({
  borderRadius: "50px",
  padding: "12px 32px", 
  fontWeight: 800,
  textTransform: "uppercase",
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "0.85rem",
  letterSpacing: "0.1em",
  marginTop: theme.spacing(4),
  background: `linear-gradient(135deg, ${BRAND.magenta} 0%, #b10e41 50%, #8e0b35 100%)`,
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.45)",
  boxShadow: `
    0 15px 35px -8px rgba(0, 0, 0, 0.35),   
    0 8px 20px ${alpha(BRAND.magenta, 0.4)}, 
    inset 0 2px 2px rgba(255, 255, 255, 0.6), 
    inset 0 -2px 6px rgba(0, 0, 0, 0.3)      
  `,
  transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",

  "&:hover": {
    transform: "translateY(-6px) scale(1.04)", 
    background: `linear-gradient(135deg, #f01e6a 0%, ${BRAND.magenta} 100%)`,
    boxShadow: `
      0 25px 50px -12px rgba(0, 0, 0, 0.45), 
      0 12px 30px ${alpha(BRAND.magenta, 0.5)},
      inset 0 3px 5px rgba(255, 255, 255, 0.7)
    `,
  },

  "&:active": {
    transform: "translateY(2px) scale(0.97)",
    boxShadow: `0 5px 15px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(0,0,0,0.4)`,
  }
}));

const RAW_SLIDES = [
  {
    title: "Manage Properties Like a Pro",
    question: "Tired of scattered records and manual rent tracking?",
    answer: "All-in-one platform to automate tenant management and rent collection.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1755257904/ChatGPT_Image_Aug_15_2025_02_38_01_PM_deljba.png",
  },
  {
    title: "Hassle-Free Rent Payments",
    question: "Spending too much time following up on rent?",
    answer: "Instantly records tenant payments and updates transactions in real time.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1755085306/ChatGPT_Image_Aug_13_2025_02_41_13_PM_gpv4ws.png",
  },
  {
    title: "Unlock full property potential",
    question: "Managing multiple properties but lack clear insights?",
    answer: "Real-time reports on earnings, expenses, and occupancy—track profits and handle taxes.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1755241333/ChatGPT_Image_Aug_15_2025_10_01_33_AM_gznw5f.png",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  // CLEANED: Removed 'theme' and 'isMobile' as they were unused
  const [active, setActive] = useState(0);

  const safeActive = active % RAW_SLIDES.length;

  useEffect(() => {
    const timer = setInterval(() => setActive(p => (p + 1) % 3), 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ width: "100%", background: "#07080d", overflow: "hidden" }}>
      <NavBar />

      <Box sx={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={RAW_SLIDES[safeActive].image}
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <motion.img
              src={RAW_SLIDES[safeActive].image}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              animate={{ scale: [1, 1.05] }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            />
            <Box sx={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(7, 8, 13, 0.8) 0%, rgba(7, 8, 13, 0.4) 30%, transparent 60%)"
            }} />
          </motion.div>
        </AnimatePresence>

        <Container maxWidth="xl" sx={{ zIndex: 5, position: "relative" }}>
          <Box sx={{ maxWidth: { xs: "100%", md: 850 }, textAlign: { xs: "center", md: "left" } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={safeActive}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Typography sx={{ 
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 900, 
                  fontSize: { xs: '2.2rem', md: '3.8rem' }, lineHeight: 1.1, mb: 2,
                  color: "#fff",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
                  textShadow: `2px 2px 0px ${BRAND.magenta}, 4px 4px 15px rgba(0,0,0,0.5)`
                }}>
                  {RAW_SLIDES[safeActive].title}
                </Typography>

                <Typography sx={{ 
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 600, 
                  color: "#FFE6F2", fontSize: "1.3rem", mb: 2,
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)", letterSpacing: "1px"
                }}>
                  {RAW_SLIDES[safeActive].question}
                </Typography>

                <Typography sx={{ 
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 400, 
                  color: alpha("#fff", 0.7), mb: 2, lineHeight: 1.8, fontSize: "1.1rem",
                  maxWidth: 700, textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                  mx: { xs: "auto", md: 0 }
                }}>
                  {RAW_SLIDES[safeActive].answer}
                </Typography>
              </motion.div>
            </AnimatePresence>

            <HeroActionPill
              whileHover={{ scale: 1.05, translateY: -3 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 15px 35px -8px rgba(0, 0, 0, 0.35)",
                  "0 20px 50px -5px rgba(212, 18, 78, 0.6)", 
                  "0 15px 35px -8px rgba(0, 0, 0, 0.35)"
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => navigate("/login")}
            >
              Get Started Now
            </HeroActionPill>
          </Box>
        </Container>
      </Box>

      {/* lower sections */}
      <Box id="features"><FeaturesSection /></Box>
      <Operation />
      <Box id="feedback"><FeedbackSection /></Box>
      <Footer />
    </Box>
  );
}