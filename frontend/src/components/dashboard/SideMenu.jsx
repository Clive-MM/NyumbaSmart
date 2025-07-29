import React from "react";
import { Box, Typography } from "@mui/material";

function SideMenu() {
    return (
        <Box
            sx={{
                width: 200,
                backgroundColor: "#f4f4f4",
                p: 2,
                minHeight: "calc(100vh - 64px)", // 64px for Header height
                mt: 8,
            }}
        >
            <Typography variant="h6">Side Menu</Typography>
            <h1>Dashboard</h1>
        </Box>
    );
}

export default SideMenu;
