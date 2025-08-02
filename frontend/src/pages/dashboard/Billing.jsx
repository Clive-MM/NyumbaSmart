import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Billing = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Billing
                </Typography>
                <Typography variant="body1">
                    This is the Billing page. Here you will manage tenant billing.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Billing;
