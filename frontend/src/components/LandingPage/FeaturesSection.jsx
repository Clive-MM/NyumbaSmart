// src/sections/FeaturesSection.jsx
import React from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Container
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";

/* ---- Updated Palette to match NavBar ---- */
const BRAND = {
  magenta: "#D4124E",
  slate: "#0F172A",
  glassBg: "rgba(255, 255, 255, 0.75)",
};

// --- STYLED COMPONENTS ---

/* THE RAISED 3D TABLET 
   - Slate-style shadows for Apple-like glass depth
   - Rim-light border and inner highlights maintained
*/
const RaisedGlassTablet = styled(Card)(() => ({
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  
  // APPLE-STYLE SLATE DEPTH
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.25), 
    inset 0 2px 2px rgba(255, 255, 255, 0.3)
  `,
  
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  
  "&:hover": {
    background: "rgba(255, 255, 255, 0.12)",
    boxShadow: `
      0 30px 60px rgba(0, 0, 0, 0.35), 
      inset 0 2px 4px rgba(255, 255, 255, 0.4)
    `,
  },
}));

const ImageBox = styled(Box)(({ image }) => ({
  height: 160,
  backgroundImage: `url(${image})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
}));

const features = [
  {
    title: "Tenant & Unit Management",
    description: "Assign tenants to units, manage lease info, and handle vacate or transfer notices with ease.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754586644/ChatGPT_Image_Aug_7_2025_08_10_26_PM_ok7tfd.png",
  },
  {
    title: "Rent & Billing",
    description: "Track rent payments, manage utility bills, and send tenants monthly summaries via SMS.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754585467/ChatGPT_Image_Aug_7_2025_07_50_50_PM_kzutsg.png",
  },
  {
    title: "Reporting & Analytics",
    description: "View real-time income reports, track expenses, and export summaries for KRA tax filing.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754579312/ChatGPT_Image_Aug_7_2025_06_08_10_PM_emqb8t.png",
  },
  {
    title: "Accessibility & Notifications",
    description: "Access the system on mobile and notify tenants automatically via SMS or email.",
    image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754579128/ChatGPT_Image_Aug_7_2025_06_00_21_PM_itikc7.png",
  },
];

const useVariants = (reduced) => {
  return {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: 0.1 },
      },
    },
    card: (i, cols = 4) => ({
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      show: {
        opacity: 1, y: 0, scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut",
          delay: ((i % cols) * (reduced ? 0 : 0.05)),
        },
      },
    }),
  };
};

const FeaturesSection = () => {
  const prefersReduced = useReducedMotion();
  const variants = useVariants(prefersReduced);

  return (
    <Box
      sx={{
        py: 15,
        px: 3,
        background: BRAND.glassBg, 
        backdropFilter: "blur(20px)",
        color: BRAND.slate,
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: { xs: "2rem", md: "2.8rem" },
            letterSpacing: 0.6,
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #FF0080, #D4124E, #FF3B3B, #2979FF, #7E00A6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          From Chaos to Chill — Meet PayNest
        </Typography>

        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 600, color: alpha(BRAND.slate, 0.8), mb: 2 }}
        >
          Turning Landlord Headaches into Happy Checks.
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "#00c8ff", // Restored Cyan color
            mb: 8,
          }}
        >
          We Fix the Drama, You Count the Commas.
        </Typography>

        <motion.div
          variants={variants.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  variants={variants.card(index, 4)}
                  whileHover={!prefersReduced ? { y: -10 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  <RaisedGlassTablet sx={{ maxWidth: 345, mx: "auto", position: "relative" }}>
                    
                    <ImageBox image={feature.image} />

                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: BRAND.magenta, fontWeight: 800 }}>
                          {feature.title.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: BRAND.slate,
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: "1.1rem"
                          }}
                        >
                          {feature.title}
                        </Typography>
                      }
                    />
                    <CardContent sx={{ pb: 4 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "'Orbitron', sans-serif",
                          color: alpha(BRAND.slate, 0.7),
                          fontWeight: 500,
                          fontSize: "1rem",
                          textAlign: "center",
                          lineHeight: 1.7
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </RaisedGlassTablet>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default FeaturesSection;