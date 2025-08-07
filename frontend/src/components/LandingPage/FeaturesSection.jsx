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

// Glow animation
const glow = keyframes`
  0% {
    box-shadow: 0 0 5px #FF0080, 0 0 10px #FF69B4, 0 0 20px #D4124E, 0 0 30px #7E00A6, 0 0 40px #FFD700;
    opacity: 0;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 0 0 40px #FFD700, 0 0 50px #FF69B4;
    transform: scale(1);
    opacity: 1;
  }
`;

// Styled glowing card
const GlowCard = styled(Card)(() => ({
    border: "2px solid white",
    borderRadius: "16px",
    backgroundColor: "#fff",
    animation: `${glow} 2s cubic-bezier(.08, .3, .41, 1.05) forwards`,
    opacity: 0,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    overflow: "hidden",
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: `0 0 12px #FF0080,
                    0 0 24px #D4124E,
                    0 0 36px #7E00A6,
                    0 0 48px #FFD700,
                    0 0 60px #FF69B4`,
    }
}));

// Top image area
const ImageBox = styled(Box)(({ image }) => ({
    height: 160,
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
}));

// Card data
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
            {/* Heading */}
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

            {/* Subheading Part 1 */}
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

            {/* Subheading Part 2 */}
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

            {/* Feature Cards */}
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
                                                fontWeight: 700,
                                                color: "#111",
                                                fontFamily: "'Orbitron', sans-serif",
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                    }
                                />
                                <CardContent>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: "'Orbitron', sans-serif",
                                            color: "#555",
                                            fontSize: "0.95rem",
                                            textAlign: "center",
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
