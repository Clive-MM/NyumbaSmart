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
const logoUrl = "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const NeumorphicPaper = styled(Paper)(() => ({
    padding: "2rem 1.5rem",
    borderRadius: "20px",
    background: "#e0e0e0",
    boxShadow:
        "0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 450,
    width: "100%",
    margin: "auto",
    textAlign: "center",
    transition: "0.3s",
    overflow: "visible",
    "&:hover": {
        boxShadow: "inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff",
    },
}));

const NeumorphicTextField = styled(TextField)(() => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#e0e0e0",
        boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
    },
    "& .MuiInputLabel-root": {
        fontWeight: 500,
    },
}));

const NeumorphicButton = styled(motion(Button))(() => ({
    marginTop: "1rem",
    background: "linear-gradient(to right, #D4124E, #E8511E, #FF0080)",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: 12,
    boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
    "&:hover": {
        transform: "scale(1.05)",
        background: "linear-gradient(to right, #FF0080, #E8511E, #D4124E)",
        boxShadow: "0 0 12px rgba(255, 0, 128, 0.6), 0 0 20px rgba(212, 18, 78, 0.5)",
    },
}));

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
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

            setSnackbar({
                open: true,
                message: "✅ Password reset successful! Redirecting to login...",
                severity: "success",
            });

            setTimeout(() => navigate("/login"), 4000);
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
                backgroundImage:
                    "url(https://res.cloudinary.com/djydkcx01/image/upload/v1754586644/ChatGPT_Image_Aug_7_2025_08_10_26_PM_ok7tfd.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
                overflow: "hidden",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(255,0,128,0.2), rgba(69,107,188,0.2))",
                    zIndex: 0,
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ zIndex: 1 }}
            >
                <NeumorphicPaper>
                    <Box sx={{ mb: 2 }}>
                        <img src={logoUrl} alt="PayNest Logo" style={{ height: 50, marginBottom: 4 }} />
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                                background: "linear-gradient(to right, #D4124E, #E8511E)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            PayNest Reset Password
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#333", fontWeight: 500 }}>
                            Smart Homes, Smarter Payments.
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <NeumorphicTextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePasswordChange}
                            margin="dense"
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
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
                                <LinearProgress
                                    variant="determinate"
                                    value={passwordStrength}
                                    sx={{
                                        height: 6,
                                        borderRadius: 5,
                                        backgroundColor: "#d1d9e6",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor:
                                                passwordStrength < 50
                                                    ? "#ff4d4f"
                                                    : passwordStrength < 75
                                                        ? "#faad14"
                                                        : "#52c41a",
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
                            margin="dense"
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <NeumorphicButton
                            type="submit"
                            fullWidth
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                        >
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
