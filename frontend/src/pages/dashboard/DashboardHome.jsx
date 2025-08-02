import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function DashboardHome() {
    // ✅ Retrieve user info from localStorage or sessionStorage
    const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

    const fullName = storedUser?.FullName || "User";

    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Hello {fullName} 👋
                </Typography>
                <Typography variant="body1">
                    Welcome to NyumbaSmart Dashboard! Use the side menu to navigate.
                </Typography>
            </Paper>
        </Box>
    );
}
