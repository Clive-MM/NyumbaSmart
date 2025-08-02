import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setSnackbar({ open: true, message: "Please enter your email.", severity: "error" });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setSnackbar({
                open: true,
                message: response.data.message || "Password reset link sent to your email.",
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
                minHeight: "100vh",
                background: "linear-gradient(135deg, #E0EAFC, #CFDEF3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Container maxWidth="xs">
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(12px)",
                            boxShadow: "8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            gutterBottom
                            sx={{ color: "#1E3A8A", fontWeight: "bold", textShadow: "0px 0px 6px rgba(0,0,0,0.2)" }}
                        >
                            Forgot Password?
                        </Typography>

                        <Typography variant="body2" align="center" sx={{ mb: 2, color: "#374151" }}>
                            Enter your email to receive a password reset link.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        background: "rgba(255,255,255,0.8)",
                                        boxShadow: "inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.5)",
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
                                    backgroundColor: "#1E3A8A",
                                    fontWeight: "bold",
                                    borderRadius: 3,
                                    boxShadow: "4px 4px 10px rgba(0,0,0,0.2)",
                                    "&:hover": { backgroundColor: "#0100FE" },
                                }}
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} sx={{ color: "white" }} />}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
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
