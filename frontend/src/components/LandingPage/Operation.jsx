// src/sections/Operation.jsx
import React from "react";
import {
  Box, Container, Grid, Typography, Card, CardContent, Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

/* PayNest palette */
const P = {
  bgDeep: "#380735ff",
  bgNavy: "#58092eff",
  bgViolet: "#2A0C55",
  cyan: "#00C8FF",
  lilac: "#8A6BFF",
  magenta: "#FF2EC4",
  white: "#FFFFFF",
  textStrong: "rgba(255,255,255,0.92)",
  textSoft: "rgba(220,230,255,0.78)",
};

/* Load Orbitron once */
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

/* Section */
const Section = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(8, 0, 10),
  background: `
    radial-gradient(900px 700px at 15% 0%, rgba(255,46,196,0.18), transparent 60%),
    radial-gradient(900px 700px at 90% 10%, rgba(0,200,255,0.18), transparent 60%),
    linear-gradient(180deg, ${P.bgViolet} 0%, ${P.bgNavy} 45%, ${P.bgDeep} 100%)
  `,
  color: P.white,
  fontFamily: "'Orbitron', sans-serif",
}));

const TitleWrap = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(5),
}));

const GradientText = styled(Typography)(() => ({
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  background: `linear-gradient(90deg, ${P.cyan}, ${P.lilac}, ${P.magenta})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}));

/* ---- Animated CTA Button (glow + shake + ripple + entrance) ---- */
const GlowButton = styled(motion(Button))(({ theme }) => ({
  position: "relative",
  overflow: "hidden", // for ripple
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 2.5),
  borderRadius: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  background: `linear-gradient(90deg, ${P.cyan}, ${P.lilac}, ${P.magenta})`,
  color: "#0e1020",
  boxShadow: `0 10px 24px rgba(0,200,255,0.24), 0 4px 12px rgba(138,107,255,0.2)`,
  backgroundSize: "200% 100%",
  transition: "background-position .6s ease",
  "&:hover": { backgroundPosition: "100% 0" },

  // CSS ripple on click
  "&::after": {
    content: '""',
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 0,
    height: 0,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0) 70%)",
    opacity: 0,
    pointerEvents: "none",
  },
  "&:active::after": {
    width: "220%",
    height: "220%",
    opacity: 0,
    transition: "width .5s ease, height .5s ease, opacity .6s ease",
  },
}));

const buttonVariants = {
  rest: { scale: 1, y: 0, filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" },
  hover: {
    scale: 1.04,
    y: [0, -1.5, 0, 1.5, 0], // subtle shake
    boxShadow:
      "0 0 18px rgba(0,200,255,.35), 0 0 34px rgba(255,46,196,.28)",
    filter:
      "drop-shadow(0 0 8px rgba(0,200,255,.35)) drop-shadow(0 0 14px rgba(255,46,196,.25))",
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    },
  },
  tap: { scale: 0.96 },
  in: { opacity: 0, scale: 0.96, y: 6 },
  inShow: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}; // <-- important semicolon

/* Card (compact) */
const ServiceCard = styled(Card)(({ theme }) => ({
  height: "100%",
  minHeight: 200,
  borderRadius: 18,
  display: "flex",
  alignItems: "stretch",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
  border: "1px solid rgba(138,163,255,0.16)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 24px rgba(5,10,30,0.5)",
  transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
  "&:hover": {
    transform: "translateY(-6px)",
    borderColor: "rgba(255,46,196,0.36)",
    boxShadow:
      "0 14px 30px rgba(0,200,255,0.22), 0 6px 16px rgba(255,46,196,0.2)",
  },
}));

/* Icon tile (compact) */
const IconWrap = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${P.cyan} 0%, ${P.lilac} 50%, ${P.magenta} 100%)`,
  color: "#0E0F1C",
  boxShadow:
    "0 10px 22px rgba(0,200,255,0.24), 0 4px 12px rgba(255,46,196,0.18)",
}));

/* Typography (compact for 3-per-row) */
const TitleText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 800,
  fontSize: "1.15rem",
  lineHeight: 1.25,
  letterSpacing: "0.45px",
  color: P.textStrong,
  textAlign: "center",
  textShadow: "0 1px 0 rgba(0,0,0,0.25)",
  [theme.breakpoints.down("md")]: { fontSize: "1.2rem" },
  [theme.breakpoints.down("sm")]: { fontSize: "1.1rem" },
}));

const BodyText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 500,
  fontSize: "0.9rem",
  lineHeight: 1.5,
  letterSpacing: "0.38px",
  color: P.textSoft,
  textAlign: "center",
}));

/* Motion variants for cards */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32 } },
  hover: { y: -6, transition: { duration: 0.18 } },
};

const SERVICES = [
  { icon: <HomeRoundedIcon fontSize="medium" />, title: "Property & Unit Management", desc: "Manage properties and rental units." },
  { icon: <PersonAddAlt1RoundedIcon fontSize="medium" />, title: "Tenant Onboarding & Management", desc: "Onboard and manage tenants." },
  { icon: <ReceiptLongRoundedIcon fontSize="medium" />, title: "Billing & Rent Collection", desc: "Automate billing and track payments." },
  { icon: <AccountBalanceWalletRoundedIcon fontSize="medium" />, title: "Landlord Expense Tracking", desc: "Record and monitor expenses." },
  { icon: <QueryStatsRoundedIcon fontSize="medium" />, title: "Reports & Tax Filing Support", desc: "Generate reports and tax statements." },
  { icon: <NotificationsActiveRoundedIcon fontSize="medium" />, title: "Notifications & Alerts", desc: "Send rent reminders and alerts." },
];

export default function Operation() {
  const prefersReduced = useReducedMotion();

  return (
    <Section id="services">
      <Container maxWidth="lg">
        <TitleWrap>
          <GradientText variant="h3" component="h2">
            WHY CHOOSE US
          </GradientText>
        </TitleWrap>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <Grid container spacing={2} justifyContent="center" alignItems="stretch">
            {SERVICES.map((item, idx) => (
              // 1 on mobile, 2 on tablet, **3 on desktop**
              <Grid key={idx} item xs={12} sm={6} md={4}>
                <motion.div
                  variants={cardVariants}
                  whileHover={!prefersReduced ? "hover" : undefined}
                >
                  <ServiceCard variant="outlined">
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1,
                        px: 2.25,
                        py: 2.25,
                        textAlign: "center",
                      }}
                    >
                      <IconWrap>{item.icon}</IconWrap>
                      <TitleText>{item.title}</TitleText>
                      <BodyText>{item.desc}</BodyText>
                    </CardContent>
                  </ServiceCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Centered animated CTA below cards */}
        <Box mt={5} textAlign="center">
          <GlowButton
            component={RouterLink}
            to="/register"
            size="large"
            variants={buttonVariants}
            initial="in"
            whileInView="inShow"
            viewport={{ once: true, amount: 0.4 }}
            whileHover={!prefersReduced ? "hover" : "rest"}
            whileTap="tap"
          >
            Get Started
          </GlowButton>
        </Box>
      </Container>
    </Section>
  );
}
