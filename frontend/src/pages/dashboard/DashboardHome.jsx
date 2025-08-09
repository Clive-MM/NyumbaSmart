// src/pages/DashboardHome.jsx (or wherever your DashboardHome lives)
import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";

export default function DashboardHome() {
    // ✅ same functionality: read user name from storage
    const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));
    const fullName = storedUser?.FullName || "User";

    // Brand palette
    const BRAND = {
        pink: "#FF0080",
        magenta: "#D4124E",
        red: "#FF3B3B",
        blue: "#2979FF",
        purple: "#7E00A6",
    };
    const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

    // Neumorphism / glass surface
    const cardSx = {
        p: { xs: 3, md: 4 },
        mx: "auto",
        maxWidth: 980,
        borderRadius: 4,
        background: "rgba(255,255,255,0.78)", // glass over white page
        border: "1px solid rgba(0,0,0,0.05)",
        backdropFilter: "blur(8px)",
        boxShadow:
            "12px 12px 24px rgba(0,0,0,0.06), -10px -10px 22px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.5)",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
                "16px 16px 30px rgba(0,0,0,0.08), -12px -12px 24px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.65)",
        },
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#fff" }}>
            <Paper elevation={0} sx={cardSx}>
                <Stack spacing={1.2} alignItems="center" textAlign="center">
                    {/* Gradient heading in brand colors */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            lineHeight: 1.2,
                            letterSpacing: 0.3,
                            background: brandGradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Hello {fullName} 👋
                    </Typography>

                    {/* Subheading / tagline */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: "rgba(17,24,39,0.78)",
                            maxWidth: 760,
                        }}
                    >
                        Welcome to NyumbaSmart Dashboard! This is what is going on today.
                    </Typography>

                    {/* Thin accent rule in brand gradient */}
                    <Box
                        sx={{
                            mt: 1.5,
                            height: 4,
                            width: 120,
                            borderRadius: 999,
                            background: brandGradient,
                            boxShadow: "0 6px 16px rgba(212,18,78,0.25)",
                        }}
                    />
                </Stack>
            </Paper>
        </Box>
    );
}
