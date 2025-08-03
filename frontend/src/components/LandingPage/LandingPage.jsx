import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import NavBar from "./NavBar";
import Footer from "./Footer";

const LandingPage = () => {
    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* ✅ NavBar */}
            <NavBar />

            {/* ✅ Hero Section */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                    color: "white",
                    p: 5,
                }}
            >
                <Container>
                    <Typography variant="h2" gutterBottom>
                        Welcome to PayNest
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        Manage properties, tenants, and payments – all in one place.
                    </Typography>
                    <Button variant="contained" color="secondary" size="large" sx={{ mt: 3 }}>
                        Get Started
                    </Button>
                </Container>
            </Box>

            {/* ✅ Footer */}
            <Footer />
        </Box>
    );
};

export default LandingPage;
