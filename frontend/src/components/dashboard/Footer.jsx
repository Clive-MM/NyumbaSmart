import React from "react";
import { Box, Typography } from "@mui/material";

const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    red: "#FF3B3B",
    blue: "#2979FF",
    purple: "#7E00A6",
};
const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                position: "relative",
                // Glassmorphism base
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "saturate(120%) blur(10px)",
                WebkitBackdropFilter: "saturate(120%) blur(10px)",
                // Neumorphism (soft outer + subtle inset)
                boxShadow:
                    "0 -10px 24px rgba(15,23,42,0.06), inset 8px 8px 16px rgba(0,0,0,0.04), inset -8px -8px 16px rgba(255,255,255,0.60)",
                borderTop: "1px solid rgba(15,23,42,0.08)",
                color: "#0F172A",
                textAlign: "center",
                py: 2,
                mt: "auto",
                // Accent gradient hairline at the very top edge
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: brandGradient,
                    borderRadius: "0 0 8px 8px",
                    boxShadow: "0 6px 16px rgba(212,18,78,0.18)",
                },
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    // crisp text on glass
                    textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                    userSelect: "none",
                }}
            >
                © {new Date().getFullYear()} PayNest. All rights reserved.
            </Typography>
        </Box>
    );
}

export default Footer;
