import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,

    Paper,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    // const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setSnackbar({ open: true, message: "Please enter your email address.", severity: "error" });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setSnackbar({
                open: true,
                message: response.data.message || "Check your email for a password reset link.",
                severity: "success",
            });
            setEmail("");
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Failed to send reset link.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                backgroundColor: "#fff", // or "white"
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                px: 2,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "linear-gradient(135deg, rgba(255,0,128,0.15), rgba(126,0,166,0.15), rgba(69,107,188,0.1))",
                    zIndex: 0,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ position: "relative", zIndex: 1 }}
            >
                <Paper
                    sx={{
                        p: 4,
                        width: { xs: "90vw", sm: 400 },
                        borderRadius: 4,
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(12px)",
                        boxShadow:
                            "0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
                    }}
                >
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            style={{ cursor: "pointer", marginBottom: "1.5rem", textAlign: "center" }}
                        >
                            <motion.img
                                src={logoUrl}
                                alt="PayNest Logo"
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.08, rotate: 2 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    marginBottom: "1rem",
                                    boxShadow:
                                        "0 0 10px rgba(212, 18, 78, 0.4), 0 0 15px rgba(69, 107, 188, 0.3)",
                                }}
                            />
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    mb: 0.5,
                                    background:
                                        "linear-gradient(to right, #D4124E, #456BBC, #FF0080)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    transition: "all 0.3s",
                                }}
                            >
                                PayNest Login
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#333",
                                    fontWeight: 500,
                                    transition: "color 0.3s",
                                    "&:hover": {
                                        color: "#D4124E",
                                    },
                                }}
                            >
                                Smart Homes, Smarter Payments.
                            </Typography>
                        </motion.div>
                    </Link>

                    <Typography
                        variant="h5"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: "bold", color: "#333", mb: 1 }}
                    >
                        Forgot Your Password?
                    </Typography>

                    <Typography variant="body2" align="center" sx={{ mb: 2, color: "#555" }}>
                        Enter your email address. We'll send a secure link so you can reset your password and regain access.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    background: "#fff",
                                    boxShadow:
                                        "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 2,
                                py: 1.2,
                                background:
                                    "linear-gradient(45deg, #FF416C, #FF4B2B, #C04CFD)",
                                fontWeight: "bold",
                                borderRadius: 3,
                                boxShadow:
                                    "4px 4px 10px #bebebe, -4px -4px 10px #ffffff",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.03)",
                                },
                            }}
                            disabled={loading}
                            startIcon={loading && (
                                <CircularProgress size={20} sx={{ color: "white" }} />
                            )}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </Box>
                </Paper>
            </motion.div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ForgotPassword;
