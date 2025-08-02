import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Notifications = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Notifications
                </Typography>
                <Typography variant="body1">
                    This is the Notifications page. Here you will view and manage all system notifications sent to tenants or landlords.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Notifications;
