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
    LinearProgress,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;

const ResetPassword = () => {
    const { token } = useParams(); // ✅ Get token from URL
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const getPasswordStrength = (pw) => {
        let strength = 0;
        if (pw.length >= 8) strength += 25;
        if (/[A-Z]/.test(pw)) strength += 25;
        if (/[0-9]/.test(pw)) strength += 25;
        if (/[\W_]/.test(pw)) strength += 25;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordStrength(getPasswordStrength(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setSnackbar({ open: true, message: "Both password fields are required.", severity: "error" });
            return;
        }

        if (password !== confirmPassword) {
            setSnackbar({ open: true, message: "Passwords do not match.", severity: "error" });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/reset-password/${token}`, {
                new_password: password,
                confirm_password: confirmPassword,
            });

            setSnackbar({ open: true, message: response.data.message, severity: "success" });

            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Password reset failed.",
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
                            Reset Password
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                            Enter your new password below.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {password && (
                                <Box sx={{ mt: 1 }}>
                                    <LinearProgress variant="determinate" value={passwordStrength} />
                                    <Typography variant="caption">
                                        {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}
                                    </Typography>
                                </Box>
                            )}

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
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
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </motion.div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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

export default ResetPassword;
