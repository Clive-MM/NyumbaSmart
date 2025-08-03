import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "./NavBar";
import Footer from "./Footer";

const heroImages = [
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/v1754220691/ChatGPT_Image_Aug_3_2025_02_25_27_PM_rcuvaq.png",
        title: "Simplify Property Management",
        subtitle: "Manage your properties and tenants with ease and efficiency.",
    },
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/v1754220693/ChatGPT_Image_Aug_3_2025_02_29_46_PM_jjatrh.png",
        title: "Smart Rent Collection",
        subtitle: "Collect payments securely and track transactions in real-time.",
    },
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/v1754220694/ChatGPT_Image_Aug_3_2025_02_05_26_PM_sswdk0.png",
        title: "Grow Your Investments",
        subtitle: "Monitor performance and maximize your rental income effortlessly.",
    },
];

const LandingPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ width: "100%", height: "100vh", overflow: "hidden", m: 0, p: 0 }}>
            <NavBar />

            <Box sx={{ position: "relative", width: "100%", height: "100%", m: 0, p: 0 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={heroImages[currentIndex].url}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        style={{
                            backgroundImage: `url(${heroImages[currentIndex].url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: -1,
                        }}
                    />
                </AnimatePresence>

                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
                    }}
                />

                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "white",
                        zIndex: 1,
                        px: 2,
                    }}
                >
                    <motion.div
                        key={heroImages[currentIndex].title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                                color: "#fff",
                                textShadow: "3px 3px 10px rgba(0,0,0,0.7)",
                            }}
                            gutterBottom
                        >
                            {heroImages[currentIndex].title}
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                maxWidth: 700,
                                mx: "auto",
                                fontSize: { xs: "1rem", sm: "1.3rem" },
                                mb: 3,
                                color: "#f5f5f5",
                                textShadow: "2px 2px 6px rgba(0,0,0,0.6)",
                            }}
                        >
                            {heroImages[currentIndex].subtitle}
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.3,
                                borderRadius: "30px",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                background: "linear-gradient(90deg, #D4124E, #E8511E)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                textTransform: "uppercase",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    background: "linear-gradient(90deg, #E8511E, #FEAB2B)",
                                },
                            }}
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </Box>
            </Box>

            <Footer />
        </Box>
    );
};

export default LandingPage;