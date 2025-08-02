import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Reports = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Reports
                </Typography>
                <Typography variant="body1">
                    This is the Reports page. Here you will view and generate property, tenant, and payment reports.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Reports;
