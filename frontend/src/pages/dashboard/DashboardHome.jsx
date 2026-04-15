// src/pages/dashboard/DashboardHome.jsx
import React from "react";
import { Box, Paper, Stack, Typography, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

export default function DashboardHome() {
    // Pull name from storage (same approach you used elsewhere)
    const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));
    const fullName = storedUser?.FullName || "User";

    // Brand (matches the rest of the app)
    const BRAND = {
        start: "#FF0080",
        end: "#7E00A6",
        gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
        glow: "0 14px 30px rgba(255,0,128,.22), 0 8px 20px rgba(126,0,166,.18)",
    };

    // Soft, dark neumorphic card (same feel as Properties/Tenants/Billing/Payments)
    const softCard = {
        p: { xs: 5, md: 7 }, // Increased padding for that "deep" tray look
        borderRadius: '64px', // Slightly more rounded to feel more organic
        color: "#0F172A",

        // Match the background EXACTLY to create the "one-piece" look
        background: "#F8FAFC",

        // THE INSET MORPHISM:
        // We swap the outer shadows for INSET shadows.
        // The top-left (dark) and bottom-right (light) create the 3D cavity.
        boxShadow: `
            inset 8px 8px 16px #d1d9e6, 
            inset -8px -8px 16px #ffffff
        `,

        border: "none", // No border needed when using inset shadows
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",

        "&:hover": {
            // On hover, we can make the "engraving" look even deeper
            boxShadow: `
                inset 12px 12px 24px #c2cedd, 
                inset -12px -12px 24px #ffffff
            `,
            transform: "scale(0.995)", // Subtle "press" effect on hover
        },
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
            <Paper elevation={0} sx={{ ...softCard, maxWidth: 980, mx: "auto" }}>
                <Stack spacing={2.25} alignItems="center" textAlign="center">
                    {/* Title */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            letterSpacing: 0.5,
                            background: BRAND.gradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontFamily: `"Cinzel", ui-serif, Georgia, serif`,
                        }}
                    >
                        Welcome, {fullName}
                    </Typography>

                    {/* Accent rule */}
                    {/* <Box
                        sx={{
                            height: 6,
                            width: 160,
                            borderRadius: 999,
                            background: BRAND.gradient,
                            boxShadow: BRAND.glow,
                        }}
                    /> */}

                    {/* Slogan */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#64748B", // BRAND.muted for soft contrast
                            maxWidth: 720,
                            fontFamily: "'Orbitron', sans-serif",
                            fontWeight: 600,
                            lineHeight: 1.8,
                        }}
                    >
                        <strong>Quick snapshot</strong> first. <strong>Decisions</strong> second.{" "}
                        <strong>Coffee</strong> optional.
                    </Typography>

                    {/* Small, friendly hints row (keeps it interesting but subtle) */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 0.5, flexWrap: "wrap", justifyContent: "center" }}
                    >
                        <Chip
                            icon={<TrendingUpIcon />} // Removed inline color here to handle it in sx
                            label="See your KPIs below"
                            size="small"
                            sx={{
                                // 1. Text & Icon Visibility
                                color: "#64748B", // BRAND.muted slate for readability
                                fontFamily: "'Orbitron', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.7rem',

                                // 2. The Background Match
                                background: "#F8FAFC",

                                // 3. The "Carved-In" Morphism
                                // Top-left shadow (depth) + Bottom-right highlight (surface)
                                boxShadow: "inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff",
                                border: "none",

                                // 4. Brand Accent for the Icon
                                "& .MuiChip-icon": {
                                    color: "#FF0080", // Using your brand Pink/Magenta
                                    fontSize: '1rem',
                                    marginLeft: '8px'
                                },

                                // 5. Interaction
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "#F8FAFC",
                                    boxShadow: "inset 3px 3px 6px #c2cedd, inset -3px -3px 6px #ffffff",
                                    transform: "scale(0.98)" // Feels like a physical press
                                }
                            }}
                        />
                        <Chip
                            icon={<BoltIcon sx={{ color: "#fff" }} />}
                            label="Quick actions in the toolbar"
                            sx={{
                                color: "#64748B",
                                background: "#F8FAFC", // Same as background
                                // Inset shadows make the chip look "carved in"
                                boxShadow: "inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff",
                                border: "none",
                                fontFamily: "'Orbitron', sans-serif",
                                fontWeight: 700,
                                px: 1.5,
                                "& .MuiChip-icon": { color: "#FF0080" },
                            }}
                            size="small"
                        />
                        <Chip
                            icon={<LocalCafeIcon />}
                            label="We’ll keep it clear & calm"
                            size="small"
                            sx={{
                                // 1. Text & Font (Uniform with the rest of the Dashboard)
                                color: "#64748B",
                                fontFamily: "'Orbitron', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.7rem',

                                // 2. The Background Match (Same as the Tray/Tablet)
                                background: "#F8FAFC",

                                // 3. The Neumorphic Inset (Morphism Effect)
                                // Shadow #d1d9e6 creates the "hole", #ffffff creates the "rim"
                                boxShadow: "inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff",
                                border: "none",

                                // 4. The Icon Branding
                                "& .MuiChip-icon": {
                                    color: "#7E00A6", // Using your brand Purple for this one
                                    fontSize: '1rem',
                                    marginLeft: '8px'
                                },

                                // 5. Interactive Press Effect
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "#F8FAFC",
                                    boxShadow: "inset 3px 3px 6px #c2cedd, inset -3px -3px 6px #ffffff",
                                    transform: "scale(0.98)"
                                }
                            }}
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
