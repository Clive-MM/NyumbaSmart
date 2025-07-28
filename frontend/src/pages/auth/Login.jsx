import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
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

const API_URL = process.env.REACT_APP_API_URL;

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

            // ✅ Save token to localStorage
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

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
                backgroundColor: "#FFFFFF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Container maxWidth="xs">
                    <Paper elevation={6} sx={{ p: 4, backgroundColor: "#F5FBF7", borderRadius: 3 }}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ color: "#456BBC", fontWeight: "bold" }}>
                            PayNest Login
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                            Access your landlord dashboard easily and securely.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
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

                            <TextField
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

                            {/* Remember Me */}
                            <FormControlLabel
                                control={<Checkbox name="remember_me" checked={formData.remember_me} onChange={handleChange} />}
                                label="Remember Me"
                            />

                            {/* Login Button */}
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
                                {loading ? "Logging in..." : "Login"}
                            </Button>

                            {/* Forgot Password & Register Links */}
                            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                <Link to="/forgot-password" style={{ textDecoration: "none", color: "#456BBC" }}>
                                    Forgot Password?
                                </Link>
                            </Typography>

                            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                                Don't have an account? <Link to="/register">Register</Link>
                            </Typography>
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

export default Login;
