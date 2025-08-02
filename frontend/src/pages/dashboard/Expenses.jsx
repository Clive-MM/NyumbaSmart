import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Expenses = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Expenses
                </Typography>
                <Typography variant="body1">
                    This is the Expenses page. Here you will manage landlord expenses.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Expenses;
