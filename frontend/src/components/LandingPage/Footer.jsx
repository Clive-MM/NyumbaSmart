import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
    return (
        <Box
            sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: "#f5f5f5",
                borderTop: "1px solid #ddd",
            }}
        >
            <Typography variant="body2">
                © {new Date().getFullYear()} PayNest. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
