import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const NavBar = () => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const slogan = "Smart Homes, Smarter Payments.";
    const [visibleText, setVisibleText] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i <= slogan.length) {
                setVisibleText(slogan.substring(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const AnimatedIconButton = motion(IconButton);

    return (
        <AppBar
            position="fixed"
            sx={{
                background: "rgba(30, 58, 138, 0.85)", // ✅ Same as header
                backdropFilter: "blur(12px)",
                borderRadius: "0 0 20px 20px",
                boxShadow: "4px 4px 10px rgba(0,0,0,0.2)",
                px: { xs: 2, sm: 3 },
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    minHeight: "110px",
                }}
            >
                {/* ✅ Logo + Slogan */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <motion.div
                            initial={{ y: -80 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            whileHover={{ scale: 1.1 }}
                            style={{
                                background: "rgba(255, 255, 255, 0.25)",
                                padding: "8px",
                                borderRadius: "12px",
                                boxShadow:
                                    "inset 3px 3px 6px rgba(190,190,190,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)",
                            }}
                        >
                            <img
                                src={logoUrl}
                                alt="PayNest Logo"
                                style={{ height: 50, width: 50, objectFit: "contain" }}
                            />
                        </motion.div>

                        {!isMobile && (
                            <Box>
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: "bold",
                                            letterSpacing: 1.2,
                                            color: "#fff",
                                            textShadow: "0px 0px 12px rgba(255,255,255,0.8)",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => navigate("/")}
                                    >
                                        PayNest
                                    </Typography>
                                </motion.div>

                                <motion.div>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontSize: "1.2rem",
                                            fontStyle: "italic",
                                            color: "#E0E7FF",
                                            textShadow: "0px 0px 8px rgba(255,255,255,0.7)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {visibleText}
                                    </Typography>
                                </motion.div>
                            </Box>
                        )}
                    </Box>
                </motion.div>

                {/* ✅ Icon Buttons */}
                <Box display="flex" gap={2}>
                    <Tooltip title="Login">
                        <AnimatedIconButton
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate("/login")}
                            sx={{
                                background: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(8px)",
                                boxShadow:
                                    "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)",
                                color: "#06b6d4",
                                p: 1.5,
                                borderRadius: "50%",
                            }}
                        >
                            <LoginIcon />
                        </AnimatedIconButton>
                    </Tooltip>

                    <Tooltip title="Register">
                        <AnimatedIconButton
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate("/register")}
                            sx={{
                                background: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(8px)",
                                boxShadow:
                                    "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)",
                                color: "#10b981",
                                p: 1.5,
                                borderRadius: "50%",
                            }}
                        >
                            <PersonAddIcon />
                        </AnimatedIconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
