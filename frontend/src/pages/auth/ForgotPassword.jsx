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
                backgroundColor: "#FFFFFF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Container maxWidth="xs">
                    <Paper elevation={6} sx={{ p: 4, borderRadius: 3, backgroundColor: "#F5FBF7" }}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#456BBC", fontWeight: "bold" }}>
                            Forgot Password?
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
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
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    backgroundColor: "#456BBC",
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

            {/* Snackbar */}
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
