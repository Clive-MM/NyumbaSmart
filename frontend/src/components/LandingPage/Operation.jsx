import React from "react";
import { Box, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

// Orbit rotation animation
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Rotating container
const CircleContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    width: 400,
    height: 400,
    margin: "0 auto",
    borderRadius: "50%",
    marginBottom: theme.spacing(6),
    animation: `${rotate} 25s linear infinite`, // continuous rotation
}));

// Center Hub
const CenterHub = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "linear-gradient(to right, #FF0080, #7E00A6)",
    color: "#fff",
    padding: theme.spacing(2.5),
    borderRadius: "50%",
    boxShadow: "0 0 20px rgba(255, 0, 128, 0.6)",
    fontWeight: "bold",
    fontSize: "1.2rem",
    textAlign: "center",
    zIndex: 2,
}));

// Step Bubble
const StepBubble = styled(Box)(({ top, left, bg }) => ({
    position: "absolute",
    top,
    left,
    background: bg || "#ffffff33",
    backdropFilter: "blur(6px)",
    color: "#fff",
    padding: "1rem",
    borderRadius: "50%",
    width: 110,
    height: 110,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "0.85rem",
    textAlign: "center",
    boxShadow: "0 0 12px rgba(255, 255, 255, 0.2)",
    transition: "transform 0.3s ease",
    cursor: "pointer",
    transform: "rotate(-360deg)", // cancels parent rotation
    "&:hover": {
        transform: "rotate(-360deg) scale(1.1)",
        boxShadow: "0 0 20px #FFD700, 0 0 30px #FF69B4",
    },
}));

const Operation = () => {
    return (
        <Box
            sx={{
                py: 10,
                background:
                    "linear-gradient(180deg, rgba(16,0,36,1) 0%, rgba(24,0,48,0.95) 50%, rgba(5,5,5,1) 100%)",
                color: "#fff",
                textAlign: "center",
                fontFamily: "'Orbitron', sans-serif",
            }}
        >
            {/* Title */}
            <Typography
                variant="h4"
                sx={{
                    mb: 2,
                    fontWeight: 700,
                    background: "linear-gradient(to right, #FF0080, #FFD700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 5px rgba(255,255,255,0.3)",
                }}
            >
                How PayNest Works
            </Typography>

            {/* Subtitle */}
            <Typography variant="subtitle1" sx={{ mb: 6, color: "#ccc" }}>
                Follow these simple steps to start managing your properties like a pro.
            </Typography>

            {/* Circular Flow */}
            <CircleContainer>
                <CenterHub>PayNest</CenterHub>

                <StepBubble top="0" left="45%" bg="#7E00A6">
                    Register
                </StepBubble>

                <StepBubble top="12%" left="80%" bg="#FF0080">
                    Login
                </StepBubble>

                <StepBubble top="45%" left="100%" bg="#FFD700">
                    Add Apartments & Tenants
                </StepBubble>

                <StepBubble top="80%" left="80%" bg="#FF69B4">
                    Track Rent & Bills
                </StepBubble>

                <StepBubble top="90%" left="45%" bg="#24c6dc">
                    Notify & Report
                </StepBubble>

                <StepBubble top="80%" left="10%" bg="#7E00A6">
                    File Tax with Reports
                </StepBubble>

                <StepBubble top="45%" left="-10%" bg="#FF0080">
                    Gain Insights
                </StepBubble>

                <StepBubble top="12%" left="10%" bg="#FFD700">
                    Grow Your Investment
                </StepBubble>
            </CircleContainer>
        </Box>
    );
};

export default Operation;
