import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
    LinearProgress,
    IconButton,
    InputAdornment,
    Paper,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL;

// 🌟 Neumorphic Styled Paper
const NeumorphicPaper = styled(Paper)({
    padding: "2rem",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(15px)",
    boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 450,
    margin: "auto",
    textAlign: "center",
    transition: "0.3s",
    "&:hover": {
        boxShadow: "inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff",
    },
});

// 🌟 Neumorphic TextField
const NeumorphicTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#e0e0e0",
        boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
    },
    "& .MuiInputLabel-root": { fontWeight: 500 },
});

// 🌟 Neumorphic Button
const NeumorphicButton = styled(Button)({
    marginTop: "1rem",
    background: "#456BBC",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: 12,
    boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
    "&:hover": {
        background: "#0100FE",
    },
});

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
                background: "linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NeumorphicPaper>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: "#456BBC" }}>
                        Reset Password
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: "#333" }}>
                        Enter your new password below.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <NeumorphicTextField
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

                        {/* Password Strength Bar */}
                        {password && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={passwordStrength}
                                    sx={{
                                        height: 6,
                                        borderRadius: 5,
                                        backgroundColor: "#d1d9e6",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor:
                                                passwordStrength < 50 ? "#ff4d4f" : passwordStrength < 75 ? "#faad14" : "#52c41a",
                                        },
                                    }}
                                />
                                <Typography variant="caption">
                                    {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}
                                </Typography>
                            </Box>
                        )}

                        <NeumorphicTextField
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

                        <NeumorphicButton type="submit" fullWidth disabled={loading}>
                            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Reset Password"}
                        </NeumorphicButton>
                    </Box>
                </NeumorphicPaper>
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
