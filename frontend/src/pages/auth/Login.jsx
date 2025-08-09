import React, { useState, useEffect } from "react";
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
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Login as LoginIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const NeumorphicPaper = styled(Paper)(() => ({
    padding: "2rem",
    borderRadius: "20px",
    background: "#e0e0e0",
    boxShadow:
        "0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 400,
    width: "90vw",
    margin: "auto",
    textAlign: "center",
    transition: "0.3s",
}));

const NeumorphicTextField = styled(TextField)(() => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#e0e0e0",
        boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
        boxShadow: "0 0 5px #456BBC",
        borderColor: "#456BBC",
    },
    "& .MuiInputLabel-root": { fontWeight: 500 },
}));

const NeumorphicButton = styled(motion(Button))(() => ({
    marginTop: "1rem",
    background: "linear-gradient(to right, #D4124E, #E8511E, #FF0080, #456BBC)",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: 12,
    transition: "all 0.3s ease",
    boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    "&:hover": {
        transform: "scale(1.05)",
        background: "linear-gradient(to right, #456BBC, #FF0080, #D4124E)",
        boxShadow:
            "0 0 12px rgba(69, 107, 188, 0.6), 0 0 20px rgba(212, 18, 78, 0.5)",
    },
}));

const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember_me: false,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const navigate = useNavigate();

    useEffect(() => {
        const remembered = localStorage.getItem("remember_me") === "true";
        const email = localStorage.getItem("remember_email");
        const encryptedPassword = localStorage.getItem("remember_password");
        const password = encryptedPassword ? decrypt(encryptedPassword) : "";

        if (remembered && email && password) {
            setFormData({ email, password, remember_me: true });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setSnackbar({
                open: true,
                message: "Please enter email and password.",
                severity: "error",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/login`, formData);
            const { token, user } = response.data;

            if (formData.remember_me) {
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("remember_me", "true");
                localStorage.setItem("remember_email", formData.email);
                localStorage.setItem(
                    "remember_password",
                    encrypt(formData.password)
                );
            } else {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("user", JSON.stringify(user));
                localStorage.removeItem("remember_me");
                localStorage.removeItem("remember_email");
                localStorage.removeItem("remember_password");
            }

            setSnackbar({
                open: true,
                message: `🎉 Welcome back, ${user.FullName}! Redirecting...`,
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
                position: "relative",
                minHeight: "100vh",
                backgroundColor: "#fff", // or "white"
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
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
                <NeumorphicPaper>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            style={{ cursor: "pointer", marginBottom: "1.5rem" }}
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
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="remember_me"
                                    checked={formData.remember_me}
                                    onChange={handleChange}
                                />
                            }
                            label="Remember Me"
                            sx={{ mt: 1 }}
                        />

                        <NeumorphicButton
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={20} sx={{ color: "#fff" }} />
                            ) : (
                                <>
                                    <LoginIcon /> Login
                                </>
                            )}
                        </NeumorphicButton>

                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            <Link
                                to="/forgot-password"
                                style={{ textDecoration: "none", color: "#456BBC" }}
                            >
                                Forgot Password?
                            </Link>
                        </Typography>

                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/register"
                                style={{
                                    color: "#456BBC",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                }}
                            >
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </NeumorphicPaper>
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

export default Login;
