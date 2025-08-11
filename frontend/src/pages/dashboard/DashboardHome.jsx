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
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        color: "#fff",
        background: "#0e0a17",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
            "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03), inset 0 0 0 rgba(255,255,255,0)",
        transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
                "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
            borderColor: "transparent",
            background:
                "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
            filter: "drop-shadow(0 18px 28px rgba(255,0,128,.12))",
        },
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
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
                            color: "rgba(237,237,241,.82)",
                            maxWidth: 720,
                            fontFamily: `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`,
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
                            icon={<TrendingUpIcon sx={{ color: "#fff" }} />}
                            label="See your KPIs below"
                            sx={{
                                color: "#fff",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                "& .MuiChip-icon": { color: "#fff" },
                            }}
                            size="small"
                        />
                        <Chip
                            icon={<BoltIcon sx={{ color: "#fff" }} />}
                            label="Quick actions in the toolbar"
                            sx={{
                                color: "#fff",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                "& .MuiChip-icon": { color: "#fff" },
                            }}
                            size="small"
                        />
                        <Chip
                            icon={<LocalCafeIcon sx={{ color: "#fff" }} />}
                            label="We’ll keep it clear & calm"
                            sx={{
                                color: "#fff",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                "& .MuiChip-icon": { color: "#fff" },
                            }}
                            size="small"
                        />
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
}
