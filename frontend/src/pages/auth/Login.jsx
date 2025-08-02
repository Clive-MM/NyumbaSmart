import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    CircularProgress,
    Snackbar,
    Alert,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL;

// 🌟 Neumorphic Styled Paper
const NeumorphicPaper = styled(Paper)({
    padding: "2rem",
    borderRadius: "20px",
    background: "#e0e0e0",
    boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 400,
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

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "", remember_me: false });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setSnackbar({ open: true, message: "Please enter email and password.", severity: "error" });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/login`, formData);

            // ✅ Save token (if Remember Me is checked, store token persistently)
            if (formData.remember_me) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } else {
                sessionStorage.setItem("token", response.data.token);
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
            }

            setSnackbar({
                open: true,
                message: `🎉 Welcome back, ${response.data.user.FullName}! Redirecting...`,
                severity: "success",
            });

            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Login failed. Try again.",
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
                background: "#f2f3f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NeumorphicPaper>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: "#456BBC" }}>
                        PayNest Login
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: "#333" }}>
                        Access your dashboard easily and securely.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <NeumorphicTextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <NeumorphicTextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
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

                        <FormControlLabel
                            control={<Checkbox name="remember_me" checked={formData.remember_me} onChange={handleChange} />}
                            label="Remember Me"
                            sx={{ mt: 1 }}
                        />

                        <NeumorphicButton type="submit" fullWidth disabled={loading}>
                            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Login"}
                        </NeumorphicButton>

                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            <Link to="/forgot-password" style={{ textDecoration: "none", color: "#456BBC" }}>
                                Forgot Password?
                            </Link>
                        </Typography>

                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                            Don't have an account?{" "}
                            <Link to="/register" style={{ color: "#456BBC", fontWeight: "bold" }}>
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </NeumorphicPaper>
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

export default Login;
