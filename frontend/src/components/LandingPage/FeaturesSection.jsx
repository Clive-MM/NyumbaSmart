import React from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Avatar
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { motion } from "framer-motion";

// Load Orbitron font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Pulse animation
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 105, 180, 0.4);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 0 16px rgba(255, 105, 180, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 105, 180, 0.4);
  }
`;

// GlowCard with Glassmorphism + Hover Pulse
const GlowCard = styled(Card)(() => ({
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 4px 30px rgba(255, 0, 128, 0.4)",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
        animation: `${pulse} 0.8s ease-in-out`,
        boxShadow: `0 0 20px #FF69B4, 0 0 30px #D4124E`,
    },
}));

// Image container
const ImageBox = styled(Box)(({ image }) => ({
    height: 160,
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
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

const FeaturesSection = () => {
    return (
        <Box
            sx={{
                py: 10,
                px: 3,
                background: 'linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(16,0,36,0.95) 35%, rgba(24,0,48,0.9) 60%, rgba(5,5,5,1) 100%)',
                color: "#fff",
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
                    background: "linear-gradient(to right, #FF0080, #FF69B4, #FFD700, #D4124E)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 6px rgba(255,105,180,0.6)",
                    mb: 2,
                }}
            >
                From Chaos to Chill — Meet PayNest
            </Typography>

            <Typography
                variant="h6"
                align="center"
                sx={{
                    fontWeight: 600,
                    color: "#ddd",
                    textShadow: "0 0 4px #FF69B4",
                }}
            >
                Built for Landlords. Powered by Simplicity.
            </Typography>

            <Typography
                variant="subtitle1"
                align="center"
                sx={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    color: "#FFD700",
                    textShadow: "0 0 4px #FF0080",
                    mb: 6,
                }}
            >
                Because Your Property Should Work for You.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: index * 0.2 }}
                        >
                            <GlowCard sx={{ maxWidth: 345, mx: "auto" }}>
                                <ImageBox image={feature.image} />
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: red[500], fontWeight: 800 }}>
                                            {feature.title.charAt(0)}
                                        </Avatar>
                                    }
                                    title={
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 800,
                                                color: "#fff",
                                                fontFamily: "'Orbitron', sans-serif",
                                                textShadow: "0 0 3px #FF69B4",
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
                                            color: "#e0e0e0",
                                            fontWeight: 500,
                                            fontSize: "1rem",
                                            textAlign: "center",
                                            textShadow: "0 0 2px #000",
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
        </Box>
    );
};

export default FeaturesSection;
