// src/sections/Operation.jsx
import React, { useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

/* ---------- PayNest brand ---------- */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  red: "#FF3B3B",
  blue: "#2979FF",
  purple: "#7E00A6",
  cyan: "#00C8FF",
  lilac: "#8A6BFF",

  bgViolet: "#140A1E",
  bgNavy: "#0E1220",
  bgDeep: "#0A0D16",

  white: "#FFFFFF",
  textStrong: "#F3F4F6",
  textSoft: "rgba(227,229,236,.82)",
};

const ACCENTS = [BRAND.cyan, BRAND.lilac, BRAND.magenta];

/* Load Orbitron once */
(() => {
  const href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap";
  if (typeof document !== "undefined" && !document.head.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
})();

/* ---------- Section ---------- */
const Section = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(10, 0, 12),
  background: `
    radial-gradient(900px 700px at 15% -10%, rgba(255,46,196,0.16), transparent 60%),
    radial-gradient(900px 700px at 90% 0%, rgba(0,200,255,0.12), transparent 60%),
    linear-gradient(180deg, ${BRAND.bgViolet} 0%, ${BRAND.bgNavy} 45%, ${BRAND.bgDeep} 100%)
  `,
  color: BRAND.white,
  fontFamily: "'Orbitron', sans-serif",
}));

const TitleWrap = styled(Box)({
  textAlign: "center",
  marginBottom: 28,
});

const GradientText = styled(Typography)({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  background: `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

/* ---------- Cards (glass + neon ring) ---------- */
const ServiceCard = styled(
  Card,
  { shouldForwardProp: (p) => p !== "accent" }
)(({ accent }) => ({
  width: "100%",
  maxWidth: 520,
  minHeight: 210,
  borderRadius: 18,
  position: "relative",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(10px)",
  boxShadow:
    "0 16px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
  "--acc": accent || BRAND.cyan,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: 18,
    padding: 1,
    background: `linear-gradient(140deg, var(--acc), rgba(255,255,255,0) 55%)`,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    opacity: 0.5,
    transition: "opacity .25s ease",
  },
  "&:hover": {
    borderColor: "rgba(255,46,196,0.38)",
    boxShadow:
      "0 18px 42px rgba(0,200,255,0.22), 0 12px 28px rgba(212,18,78,0.18)",
    "&::before": { opacity: 1 },
  },
}));

const IconWrap = styled(Box)({
  width: 68,
  height: 68,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  margin: "0 auto 12px",
  background: `linear-gradient(135deg, ${BRAND.cyan} 0%, ${BRAND.lilac} 55%, ${BRAND.magenta} 100%)`,
  color: "#0E0F1C",
  boxShadow:
    "0 14px 30px rgba(0,200,255,0.28), 0 8px 18px rgba(255,46,196,0.22), 0 0 22px rgba(138,107,255,0.25)",
});

const TitleText = styled(Typography)({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 800,
  fontSize: "1.12rem",
  lineHeight: 1.25,
  letterSpacing: "0.4px",
  color: BRAND.textStrong,
  textAlign: "center",
});

const BodyText = styled(Typography)({
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 500,
  fontSize: "0.96rem",
  lineHeight: 1.55,
  letterSpacing: "0.35px",
  color: BRAND.textSoft,
  textAlign: "center",
});

/* ---------- Motion ---------- */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.985, rotateX: 6, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] },
  },
  hover: { y: -6, transition: { duration: 0.2 } },
};

/* ---------- CTA button (glow) ---------- */
const GlowButton = styled(motion(Button))({
  position: "relative",
  overflow: "hidden",
  marginTop: 18,
  padding: "10px 22px",
  borderRadius: 14,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: "#0E1020",
  background: `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.lilac}, ${BRAND.magenta})`,
  backgroundSize: "200% 100%",
  boxShadow:
    "0 12px 26px rgba(0,200,255,0.28), 0 6px 16px rgba(138,107,255,0.22)",
  transition: "background-position .6s ease",
  "&:hover": { backgroundPosition: "100% 0" },
});

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.04,
    y: [0, -1.5, 0, 1.5, 0],
    boxShadow:
      "0 0 18px rgba(0,200,255,.35), 0 0 34px rgba(255,46,196,.28)",
    transition: {
      duration: 0.9,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    },
  },
  tap: { scale: 0.96 },
  in: { opacity: 0, scale: 0.96, y: 6 },
  inShow: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ---------- Content ---------- */
const SERVICES = [
  { icon: <HomeRoundedIcon fontSize="medium" />, title: "All In One Solution", desc: "Everything you need to manage your properties, all in one smart platform." },
  { icon: <PersonAddAlt1RoundedIcon fontSize="medium" />, title: "Time Saving and Automation", desc: "Let automation handle rent tracking and billing — so you don’t have to." },
  { icon: <ReceiptLongRoundedIcon fontSize="medium" />, title: "Secure, Reliable & Accessibility", desc: "Bank-level security with 24/7 cloud access — your data, always safe." },
  { icon: <AccountBalanceWalletRoundedIcon fontSize="medium" />, title: "Real-Time Insights", desc: "Know exactly what’s happening, the moment it happens." },
  { icon: <QueryStatsRoundedIcon fontSize="medium" />, title: "Reports & Tax Filing Support", desc: "Generate reports that make decision-making and tax filing a breeze." },
  { icon: <NotificationsActiveRoundedIcon fontSize="medium" />, title: "Notifications & Alerts", desc: "Never miss a payment — smart reminders keep you in control." },
];

/* ---------- Helpers ---------- */
function tiltFromMouse(e, el) {
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * 8;  // deg
  const rotateX = (0.5 - y) * 8;  // deg
  return { rotateX, rotateY };
}

/* ---------- Child component so hooks are at top level ---------- */
function MotionServiceCard({ item, idx, accent, prefersReduced, smooth }) {
  // Scroll-linked parallax per card
  const base = (idx % 3) - 1; // -1,0,1 slight variance
  const yParallax = useTransform(smooth, [0, 1], [base * 16, base * -16]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0.65, 1, 1, 0.9]);

  // Magnetic drift + 3D tilt
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const mx = useSpring(dx, { stiffness: 300, damping: 30, mass: 0.2 });
  const my = useSpring(dy, { stiffness: 300, damping: 30, mass: 0.2 });
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const onMove = (e) => {
    if (prefersReduced) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    dx.set(Math.max(-8, Math.min(8, x * 0.06)));
    dy.set(Math.max(-8, Math.min(8, y * 0.06)));
    const r = tiltFromMouse(e, el);
    rotateX.set(r.rotateX);
    rotateY.set(r.rotateY);
  };

  const onLeave = () => {
    dx.set(0); dy.set(0);
    rotateX.set(0); rotateY.set(0);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={!prefersReduced ? "hover" : undefined}
      style={{ width: "100%", y: yParallax, opacity }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          x: mx,
          y: my,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <ServiceCard variant="outlined" accent={accent} sx={{ mx: "auto" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              px: 2.2,
              py: 2.4,
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
    </motion.div>
  );
}

/* ---------- Component ---------- */
export default function Operation() {
  const prefersReduced = useReducedMotion();

  // Section-level scroll progress
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 15%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  return (
    <Section id="services" ref={sectionRef}>
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
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              alignItems: "stretch",
            }}
          >
            {SERVICES.map((item, idx) => (
              <MotionServiceCard
                key={idx}
                item={item}
                idx={idx}
                accent={ACCENTS[idx % ACCENTS.length]}
                prefersReduced={prefersReduced}
                smooth={smooth}
              />
            ))}
          </Box>
        </motion.div>

        {/* CTA */}
        <Box mt={5} textAlign="center">
          <GlowButton
            component={RouterLink}
            to="/login"
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
