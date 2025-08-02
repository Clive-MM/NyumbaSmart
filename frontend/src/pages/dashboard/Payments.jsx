import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Payments = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Payments
                </Typography>
                <Typography variant="body1">
                    This is the Payments page. Here you will manage and track all tenant rent and bill payments.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Payments;
