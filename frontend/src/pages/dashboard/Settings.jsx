import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Settings = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>
                <Typography variant="body1">
                    This is the Settings page. Here you can manage system preferences and user account settings.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Settings;
