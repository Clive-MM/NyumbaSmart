// src/sections/FeaturesSection.jsx
import React from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";

/* ---- PayNest palette ---- */
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

// Load Orbitron once
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector(`link[href="${fontLink.href}"]`)) {
  document.head.appendChild(fontLink);
}

// Pulse glow for hover
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(255,46,196,.35); }
  50%{ transform: scale(1.03); box-shadow: 0 0 16px rgba(255,46,196,.55); }
  100%{ transform: scale(1); box-shadow: 0 0 0 rgba(255,46,196,.35); }
`;

const GlowCard = styled(Card)(() => ({
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 4px 30px rgba(255,46,196,0.35)",
  overflow: "hidden",
  transition: "transform .3s ease, box-shadow .3s ease",
  "&:hover": {
    animation: `${pulse} .8s ease-in-out`,
    boxShadow:
      "0 0 20px rgba(255,46,196,.65), 0 0 30px rgba(138,107,255,.45)",
  },
}));

const ImageBox = styled(Box)(({ image }) => ({
  height: 160,
  backgroundImage: `url(${image})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const features = [
  {
    title: "Tenant & Unit Management",
    description:
      "Assign tenants to units, manage lease info, and handle vacate or transfer notices with ease.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1754586644/ChatGPT_Image_Aug_7_2025_08_10_26_PM_ok7tfd.png",
  },
  {
    title: "Rent & Billing",
    description:
      "Track rent payments, manage utility bills, and send tenants monthly summaries via SMS.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1754585467/ChatGPT_Image_Aug_7_2025_07_50_50_PM_kzutsg.png",
  },
  {
    title: "Reporting & Analytics",
    description:
      "View real-time income reports, track expenses, and export summaries for KRA tax filing.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1754579312/ChatGPT_Image_Aug_7_2025_06_08_10_PM_emqb8t.png",
  },
  {
    title: "Accessibility & Notifications",
    description:
      "Access the system on mobile and notify tenants automatically via SMS or email.",
    image:
      "https://res.cloudinary.com/djydkcx01/image/upload/v1754579128/ChatGPT_Image_Aug_7_2025_06_00_21_PM_itikc7.png",
  },
];

// ---- Motion variants (staggered fade-up + 3D + blur, row-aware, reduced-motion)
const useVariants = (reduced) => {
  const baseShow = reduced
    ? { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }
    : { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" };

  return {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: reduced ? 0 : 0.1, delayChildren: 0.12 },
      },
    },
    card: (i, cols = 4) => ({
      hidden: reduced
        ? { opacity: 0 }
        : { opacity: 0, y: 26, rotateX: 8, scale: 0.98, filter: "blur(6px)" },
      show: {
        ...baseShow,
        transition: {
          duration: reduced ? 0.2 : 0.55,
          ease: [0.22, 1, 0.36, 1],
          // left→right within each row
          delay: ((i % cols) * (reduced ? 0 : 0.06)),
        },
      },
      hover: reduced
        ? {}
        : { y: -6, scale: 1.01, transition: { duration: 0.18 } },
    }),
    image: reduced
      ? {}
      : { initial: { scale: 1.03 }, hover: { scale: 1.06, transition: { duration: 0.25 } } },
  };
};

const FeaturesSection = () => {
  const prefersReduced = useReducedMotion();
  const variants = useVariants(prefersReduced);

  return (
    <Box
      sx={{
        py: 10,
        px: 3,
        background: `linear-gradient(180deg, ${P.bgViolet} 0%, ${P.bgNavy} 35%, ${P.bgDeep} 60%, ${P.bgDeep} 100%)`,
        color: P.textStrong,
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: 800,
          fontSize: "2.8rem",
          textTransform: "uppercase",
          background: `linear-gradient(to right, ${P.cyan}, ${P.lilac}, ${P.magenta})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 6px rgba(255,46,196,.45)",
          mb: 2,
        }}
      >
        From Chaos to Chill — Meet PayNest
      </Typography>

      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: 600, color: P.textSoft, textShadow: "0 0 4px rgba(138,107,255,.4)" }}
      >
        Turning Landlord Headaches into Happy Checks.
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{
          fontWeight: 600,
          fontSize: "1.1rem",
          color: P.cyan,
          textShadow: "0 0 4px rgba(0,200,255,.45)",
          mb: 6,
        }}
      >
        We Fix the Drama, You Count the Commas.
      </Typography>

      <motion.div
        variants={variants.container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                variants={variants.card(index, 4)} // 4 columns on md; change to 3 if you alter breakpoints
                whileHover="hover"
              >
                <GlowCard sx={{ maxWidth: 345, mx: "auto" }}>
                  <motion.div
                    initial={variants.image.initial}
                    whileHover={variants.image.hover}
                  >
                    <ImageBox image={feature.image} />
                  </motion.div>

                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: P.magenta, fontWeight: 800 }}>
                        {feature.title.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: P.textStrong,
                          fontFamily: "'Orbitron', sans-serif",
                          textShadow: "0 0 3px rgba(138,107,255,.55)",
                        }}
                      >
                        {feature.title}
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "'Orbitron', sans-serif",
                        color: P.textSoft,
                        fontWeight: 500,
                        fontSize: "1rem",
                        textAlign: "center",
                        textShadow: "0 0 2px rgba(0,0,0,.6)",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </GlowCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default FeaturesSection;
