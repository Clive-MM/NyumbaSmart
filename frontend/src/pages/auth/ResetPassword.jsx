import React, { useEffect, useMemo, useState } from "react";
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
    Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import axios from "axios";
import { useParams, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL;
const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* ---------- Neumorphic styling ---------- */
const NeumorphicPaper = styled(Paper)(() => ({
    padding: "2rem 1.5rem",
    borderRadius: "20px",
    background: "#e0e0e0",
    boxShadow:
        "0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 480,
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
    "& .MuiInputLabel-root": { fontWeight: 500 },
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

export default function ResetPassword() {
    const { token: legacyToken } = useParams(); // email-link token (/reset-password/:token)
    const navigate = useNavigate();
    const location = useLocation();

    // Twilio reset token can arrive via query (?rt=...) or sessionStorage (set by Forgot flow)
    const query = new URLSearchParams(location.search);
    const rtFromQuery = query.get("rt") || "";
    const rtFromSession =
        typeof window !== "undefined" ? sessionStorage.getItem("twilio_reset_token") : "";
    const twilioToken = rtFromQuery || rtFromSession || "";

    // Auto-select mode
    const mode = useMemo(() => {
        if (legacyToken) return "email-link";
        if (twilioToken) return "twilio";
        return "none";
    }, [legacyToken, twilioToken]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const getPasswordStrength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s += 25;
        if (/[A-Z]/.test(pw)) s += 25;
        if (/[0-9]/.test(pw)) s += 25;
        if (/[\W_]/.test(pw)) s += 25;
        return s;
    };

    useEffect(() => {
        setPasswordStrength(getPasswordStrength(password));
    }, [password]);

    const canSubmit = useMemo(() => {
        if (!password || !confirmPassword) return false;
        if (password !== confirmPassword) return false;
        // Mirror server validation for UX
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[\W_]/.test(password)
        );
    }, [password, confirmPassword]);

    const submit = async (e) => {
        e.preventDefault();

        if (mode === "none") {
            setSnackbar({
                open: true,
                message: "No valid reset token found. Start from Forgot Password.",
                severity: "error",
            });
            return;
        }
        if (!canSubmit) {
            setSnackbar({
                open: true,
                message: "Please meet password requirements and confirm correctly.",
                severity: "error",
            });
            return;
        }

        try {
            setLoading(true);

            if (mode === "email-link") {
                // Email link flow
                await axios.post(`${API_URL}/reset-password/${legacyToken}`, {
                    new_password: password,
                    confirm_password: confirmPassword,
                });
            } else {
                // Twilio short-lived reset token flow
                await axios.post(`${API_URL}/auth/forgot/reset`, {
                    reset_token: twilioToken,
                    new_password: password,
                    confirm_password: confirmPassword,
                });
                // Clear token after use
                try {
                    sessionStorage.removeItem("twilio_reset_token");
                } catch { }
            }

            setSnackbar({
                open: true,
                message: "✅ Password reset successful! Redirecting to login...",
                severity: "success",
            });
            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Password reset failed.",
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
                backgroundColor: "#fff",
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
                <NeumorphicPaper component="section" aria-label="Reset password form">
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
                            Smart Homes, Smarter Security.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1.25, color: "#444" }}>
                            {mode === "email-link" && "Using email link verification."}
                            {mode === "twilio" && "Using phone verification (Twilio Verify)."}
                            {mode === "none" && (
                                <>
                                    No reset token detected.{" "}
                                    <RouterLink
                                        to="/forgot-password"
                                        style={{ color: "#456BBC", textDecoration: "none", fontWeight: 700 }}
                                    >
                                        Start from Forgot Password
                                    </RouterLink>
                                    .
                                </>
                            )}
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={submit}>
                        <NeumorphicTextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="dense"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title={showPassword ? "Hide" : "Show"}>
                                            <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {password && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                    aria-label="Password strength"
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
                            margin="dense"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title={showConfirmPassword ? "Hide" : "Show"}>
                                            <IconButton onClick={() => setShowConfirmPassword((s) => !s)} edge="end">
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <NeumorphicButton type="submit" fullWidth disabled={loading || mode === "none"} whileTap={{ scale: 0.97 }}>
                            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Reset Password"}
                        </NeumorphicButton>

                        {mode === "email-link" && (
                            <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: "#555" }}>
                                This reset link expires in 24 hours.
                            </Typography>
                        )}
                        {mode === "twilio" && (
                            <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: "#555" }}>
                                This phone-verified reset token expires in ~10 minutes and can be used once.
                            </Typography>
                        )}

                        {mode === "none" && (
                            <Button
                                component={RouterLink}
                                to="/forgot-password"
                                sx={{ mt: 1.25, color: "#456BBC", fontWeight: 700, textTransform: "none" }}
                            >
                                Go to Forgot Password
                            </Button>
                        )}
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
}
