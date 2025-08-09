// src/sections/Operation.jsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
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
const P = " #ffffffff"

  ;

const ACCENTS = [P.cyan, P.lilac, P.magenta];

/* Load Orbitron once */
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap";
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
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  background: "linear-gradient(90deg, #FF0080, #D4124E, #FF3B3B, #2979FF, #7E00A6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}));

/* Animated CTA Button (glow + shake + ripple) */
const GlowButton = styled(motion(Button))(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
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
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.04,
    y: [0, -1.5, 0, 1.5, 0],
    boxShadow: "0 0 18px rgba(0,200,255,.35), 0 0 34px rgba(255,46,196,.28)",
    transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
  },
  tap: { scale: 0.96 },
  in: { opacity: 0, scale: 0.96, y: 6 },
  inShow: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* --- Cards (smaller, standardized) --- */
const ServiceCard = styled(
  Card,
  { shouldForwardProp: (p) => p !== "accent" }
)(({ accent }) => ({
  width: "100%",
  maxWidth: 420,          // cap width so three fit nicely
  minHeight: 190,
  borderRadius: 18,
  position: "relative",
  display: "flex",
  alignItems: "stretch",
  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
  border: "1px solid rgba(138,163,255,0.16)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 22px rgba(5,10,30,0.5)",
  transformStyle: "preserve-3d",
  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
  "--acc": accent || P.cyan,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: 18,
    padding: 1,
    background: `linear-gradient(140deg, var(--acc), rgba(255,255,255,0) 55%)`,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    opacity: 0.5,
    transition: "opacity .25s ease",
  },
  "&:hover": {
    transform: "translateY(-6px) rotateX(1deg)",
    borderColor: "rgba(255,46,196,0.36)",
    boxShadow: "0 14px 30px rgba(0,200,255,0.22), 0 6px 16px rgba(255,46,196,0.2)",
    "&::before": { opacity: 1 },
  },
}));

/* Icon with neon ring */
const IconWrap = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${P.cyan} 0%, ${P.lilac} 55%, ${P.magenta} 100%)`,
  color: "#0E0F1C",
  boxShadow:
    "0 10px 24px rgba(0,200,255,0.28), 0 6px 16px rgba(255,46,196,0.22), 0 0 22px rgba(138,107,255,0.25)",
}));

/* Typography tuned for smaller cards */
const TitleText = styled(Typography)({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 800,
  fontSize: "1.05rem",
  lineHeight: 1.25,
  letterSpacing: "0.4px",
  color: P.textStrong,
  textAlign: "center",
});

const BodyText = styled(Typography)({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 500,
  fontSize: "0.9rem",
  lineHeight: 1.5,
  letterSpacing: "0.35px",
  color: P.textSoft,
  textAlign: "center",
});

/* Motion variants */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.985, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0)", transition: { duration: 0.35 } },
  hover: { y: -6, transition: { duration: 0.2 } },
};

/* Content */
const SERVICES = [
  {
    icon: <HomeRoundedIcon fontSize="medium" />,
    title: "All In One Solution",
    desc: "Everything you need to manage your properties, all in one smart platform.",
  },
  {
    icon: <PersonAddAlt1RoundedIcon fontSize="medium" />,
    title: "Time Saving and Automation",
    desc: "Let automation handle rent tracking and billing — so you don’t have to.",
  },
  {
    icon: <ReceiptLongRoundedIcon fontSize="medium" />,
    title: "Secure, Reliable & Accessibility",
    desc: "Bank-level security with 24/7 cloud access — your data, always safe.",
  },
  {
    icon: <AccountBalanceWalletRoundedIcon fontSize="medium" />,
    title: "Real-Time Insights",
    desc: "Know exactly what’s happening, the moment it happens.",
  },
  {
    icon: <QueryStatsRoundedIcon fontSize="medium" />,
    title: "Reports & Tax Filing Support",
    desc: "Generate reports that make decision-making and tax filing a breeze.",
  },
  {
    icon: <NotificationsActiveRoundedIcon fontSize="medium" />,
    title: "Notifications & Alerts",
    desc: "Never miss a payment — smart reminders keep you in control.",
  },
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
          {/* CSS Grid: 1 / 2 / 3 columns */}
          <Box
            sx={{
              display: "grid",
              gap: 3, // theme spacing
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)", // 3 horizontally on desktop
              },
              alignItems: "stretch",
            }}
          >
            {SERVICES.map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={!prefersReduced ? "hover" : undefined}
                style={{ width: "100%" }}
              >
                <ServiceCard
                  variant="outlined"
                  accent={ACCENTS[idx % ACCENTS.length]}
                  sx={{ mx: "auto" }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      py: 2.25,
                      height: "100%",
                      textAlign: "center",
                    }}
                  >
                    <IconWrap>{item.icon}</IconWrap>
                    <TitleText>{item.title}</TitleText>
                    <BodyText>{item.desc}</BodyText>
                  </CardContent>
                </ServiceCard>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* CTA below cards */}
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
            CLICK TO JOIN
          </GlowButton>
        </Box>
      </Container>
    </Section>
  );
}
