import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function DashboardHome() {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Home
                </Typography>
                <Typography variant="body1">
                    Welcome to NyumbaSmart Dashboard! Use the side menu to navigate.
                </Typography>
            </Paper>
        </Box>
    );
}
