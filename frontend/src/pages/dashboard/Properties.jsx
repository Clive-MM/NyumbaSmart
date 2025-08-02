import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Properties = () => {
    return (
        <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Properties
                </Typography>
                <Typography variant="body1">
                    This is the Properties page. Here you will manage all properties and apartments.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Properties;
