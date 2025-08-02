import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Tenants = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Tenants
                </Typography>
                <Typography variant="body1">
                    This is the Tenants page. Here you will manage tenant details and allocations.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Tenants;
