import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import FeaturesSection from "../LandingPage/FeaturesSection";
import Operation from "../LandingPage/Operation";

const heroSlides = [
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/q_auto:best,f_auto,w_1920/ChatGPT_Image_Aug_3_2025_02_25_27_PM_rcuvaq.png",
        title: "Manage Properties Like a Pro",
        question: "Tired of scattered records and manual rent tracking?",
        answer:
            "PayNest provides an all-in-one platform to automate tenant management and rent collection.",
        textColor: "#ffffff",
    },
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/q_auto:best,f_auto,w_1920/ChatGPT_Image_Aug_3_2025_02_29_46_PM_jjatrh.png",
        title: "Hassle-Free Rent Payments",
        question: "Spending too much time following up on rentpayment progress?",
        answer:
            "PayNest instantly records tenant payments, and updates transactions in real-time, making it easy to track payments and make folowup on unpaid bills and informed decisions.",
        textColor: "#f5f5f5",
    },
    {
        url: "https://res.cloudinary.com/djydkcx01/image/upload/q_auto:best,f_auto,w_1920/ChatGPT_Image_Aug_3_2025_02_05_26_PM_sswdk0.png",
        title: "Unlock the Full Potential of Your Properties",
        question: "Managing multiple properties but lack clear insights?",
        answer:
            "PayNest provides real-time reports on earnings, expenses, and occupancy, making it easier to track profits, reduce costs, and simplify tax calculations.",
        textColor: "#ffffff",
    },
];

const LandingPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const currentSlide = heroSlides[currentIndex];

    return (
        <Box
            sx={{
                width: "100vw",
                minHeight: "100vh",
                margin: 0,
                padding: 0,
                overflowX: "hidden",
            }}
        >
            <NavBar />

            {/* Slideshow section */}
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {heroSlides.map((slide, index) => (
                    <motion.div
                        key={slide.url}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentIndex === index ? 1 : 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{
                            backgroundImage: `url(${slide.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: -1,
                            filter: "contrast(1.1) brightness(1.05)",
                        }}
                    />
                ))}

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

                {/* Hero Text */}
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: currentSlide.textColor,
                        zIndex: 1,
                        px: 2,
                        maxWidth: "90%",
                    }}
                >
                    <motion.div
                        key={currentSlide.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem" },
                                mb: 1,
                                textShadow: "2px 2px 10px rgba(0,0,0,0.6)",
                                fontFamily: "'Counter Stream', sans-serif",
                            }}
                        >
                            {currentSlide.title}
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: { xs: "1rem", sm: "1.2rem" },
                                mb: 1.5,
                                fontStyle: "italic",
                                color: "#ffe6e6",
                                textShadow: "1px 1px 6px rgba(0,0,0,0.6)",
                            }}
                        >
                            {currentSlide.question}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                maxWidth: 700,
                                mx: "auto",
                                mb: 3,
                                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                                lineHeight: 1.6,
                                fontFamily: "'Xillian', sans-serif",
                                textShadow: "1px 1px 6px rgba(0,0,0,0.6)",
                            }}
                        >
                            {currentSlide.answer}
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/register")}
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
            <FeaturesSection />
            <Operation />

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default LandingPage;