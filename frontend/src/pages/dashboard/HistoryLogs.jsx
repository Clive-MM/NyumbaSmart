import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const HistoryLogs = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    History Logs
                </Typography>
                <Typography variant="body1">
                    This is the History Logs page. Here you will view system activity and logs.
                </Typography>
            </Paper>
        </Box>
    );
};

export default HistoryLogs;
