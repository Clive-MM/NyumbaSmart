import React from "react";
import { Box, Typography } from "@mui/material";

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#1E3A8A",
                color: "white",
                textAlign: "center",
                py: 2,
                mt: "auto",
            }}
        >
            <Typography variant="body2">
                © {new Date().getFullYear()} PayNest. All rights reserved.
            </Typography>
        </Box>
    );
}

export default Footer;
