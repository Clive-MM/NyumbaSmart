import React from "react";
import { Box, Typography } from "@mui/material";

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                background: "rgba(30, 58, 138, 0.85)",
                backdropFilter: "blur(10px)",
                color: "white",
                textAlign: "center",
                py: 2,
                mt: "auto",
                boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.2)",
                borderTop: "1px solid rgba(255,255,255,0.3)",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 500,
                    letterSpacing: 0.5,
                    textShadow: "0px 0px 5px rgba(255,255,255,0.4)",
                }}
            >
                © {new Date().getFullYear()} PayNest. All rights reserved.
            </Typography>
        </Box>
    );
}

export default Footer;
