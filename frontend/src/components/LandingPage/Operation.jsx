import React, { useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
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

/* ---------- PayNest Brand (Synced with Footer/NavBar) ---------- */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  purple: "#7E00A6",
  blue: "#2979FF",
  bgViolet: "#140A1E",
  bgNavy: "#0E1220",
  bgDeep: "#0A0D16",
  white: "#FFFFFF",
  textStrong: "#F3F4F6",
  textSoft: "rgba(227,229,236,.82)",
};

const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.purple}, ${BRAND.blue})`;
const ACCENTS = [BRAND.magenta, BRAND.blue, BRAND.pink];

/* ---------- Section ---------- */
const Section = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(10, 0, 12),
  background: `
    radial-gradient(900px 700px at 15% -10%, ${alpha(BRAND.magenta, 0.16)}, transparent 60%),
    radial-gradient(900px 700px at 90% 0%, ${alpha(BRAND.blue, 0.12)}, transparent 60%),
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
  background: brandGradient,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

/* ---------- Cards (Brand Accents) ---------- */
const ServiceCard = styled(
  Card,
  { shouldForwardProp: (p) => p !== "accent" }
)(({ accent }) => ({
  width: "100%",
  maxWidth: 520,
  minHeight: 210,
  borderRadius: 18,
  position: "relative",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 16px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "all .3s ease",
  "--acc": accent || BRAND.magenta,
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
  },
  "&:hover": {
    borderColor: alpha(BRAND.pink, 0.4),
    boxShadow: `0 18px 42px ${alpha(BRAND.blue, 0.22)}, 0 12px 28px ${alpha(BRAND.magenta, 0.18)}`,
    "&::before": { opacity: 1 },
  },
}));

const IconWrap = styled(Box)(({ accent }) => ({
  width: 68,
  height: 68,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  margin: "0 auto 12px",
  background: `linear-gradient(135deg, ${BRAND.magenta} 0%, ${BRAND.blue} 100%)`,
  color: "#FFFFFF",
  boxShadow: `0 14px 30px ${alpha(BRAND.blue, 0.28)}, 0 8px 18px ${alpha(BRAND.pink, 0.22)}`,
}));

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

/* ---------- CTA button (Pill Shape synced with NavBar) ---------- */
const GlowButton = styled(motion(Button))({
  marginTop: 18,
  padding: "12px 32px",
  borderRadius: "50px", 
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "#FFFFFF",
  background: brandGradient,
  boxShadow: `0 12px 26px ${alpha(BRAND.blue, 0.28)}, 0 6px 16px ${alpha(BRAND.magenta, 0.22)}`,
  border: "1px solid rgba(255,255,255,0.3)",
});

/* ---------- Content ---------- */
const SERVICES = [
  { icon: <HomeRoundedIcon fontSize="medium" />, title: "All In One Solution", desc: "Everything you need to manage your properties, all in one smart platform." },
  { icon: <PersonAddAlt1RoundedIcon fontSize="medium" />, title: "Time Saving and Automation", desc: "Let automation handle rent tracking and billing — so you don’t have to." },
  { icon: <ReceiptLongRoundedIcon fontSize="medium" />, title: "Secure, Reliable & Accessibility", desc: "Bank-level security with 24/7 cloud access — your data, always safe." },
  { icon: <AccountBalanceWalletRoundedIcon fontSize="medium" />, title: "Real-Time Insights", desc: "Know exactly what’s happening, the moment it happens." },
  { icon: <QueryStatsRoundedIcon fontSize="medium" />, title: "Reports & Tax Filing Support", desc: "Generate reports that make decision-making and tax filing a breeze." },
  { icon: <NotificationsActiveRoundedIcon fontSize="medium" />, title: "Notifications & Alerts", desc: "Never miss a payment — smart reminders keep you in control." },
];

/* ---------- Motion Variants ---------- */
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

/* ---------- Card Logic ---------- */
function MotionServiceCard({ item, idx, accent, prefersReduced, smooth }) {
  const base = (idx % 3) - 1;
  const yParallax = useTransform(smooth, [0, 1], [base * 16, base * -16]);
  const opacity = useTransform(smooth, [0, 0.15, 0.85, 1], [0.65, 1, 1, 0.9]);

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
    
    const rx = (0.5 - (e.clientY - rect.top) / rect.height) * 8;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    rotateX.set(rx);
    rotateY.set(ry);
  };

  const onLeave = () => {
    dx.set(0); dy.set(0);
    rotateX.set(0); rotateY.set(0);
  };

  return (
    <motion.div variants={cardVariants} style={{ width: "100%", y: yParallax, opacity }}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ x: mx, y: my, rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <ServiceCard variant="outlined" accent={accent} sx={{ mx: "auto" }}>
          <CardContent sx={{ p: 2.4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <IconWrap>{item.icon}</IconWrap>
            <TitleText>{item.title}</TitleText>
            <BodyText>{item.desc}</BodyText>
          </CardContent>
        </ServiceCard>
      </motion.div>
    </motion.div>
  );
}

export default function Operation() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 85%", "end 15%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  return (
    <Section id="services" ref={sectionRef}>
      <Container maxWidth="lg">
        <TitleWrap>
          <GradientText variant="h3" component="h2">WHY CHOOSE US</GradientText>
        </TitleWrap>

        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <Box sx={{
            display: "grid", gap: 3,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            alignItems: "stretch"
          }}>
            {SERVICES.map((item, idx) => (
              <MotionServiceCard
                key={idx} item={item} idx={idx}
                accent={ACCENTS[idx % ACCENTS.length]}
                prefersReduced={prefersReduced}
                smooth={smooth}
              />
            ))}
          </Box>
        </motion.div>

        <Box mt={5} textAlign="center">
          <GlowButton
            component={RouterLink}
            to="/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CLICK TO JOIN
          </GlowButton>
        </Box>
      </Container>
    </Section>
  );
}