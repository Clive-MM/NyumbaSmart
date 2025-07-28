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
    Checkbox,
    FormControlLabel,
    LinearProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Phone, Lock } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        terms: false,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state
    const navigate = useNavigate();

    const phoneRegex = /^2547\d{8}$/;

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value.startsWith("254")) {
            value = "254" + value.replace(/^0+/, "");
        }
        setFormData({ ...formData, phone: value });
        setPhoneError(!phoneRegex.test(value));
    };

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[\W_]/.test(password)) strength += 25;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, password: value });
        setPasswordStrength(getPasswordStrength(value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.terms) {
            alert("You must agree to the Terms & Privacy Policy.");
            return;
        }

        if (phoneError) {
            alert("Enter a valid phone number in format 2547XXXXXXXX");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/register`, formData);

            setOpenSnackbar(true); // ✅ Show success message
            setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "#FFFFFF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        backgroundColor: "#F5FBF7",
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h4" align="center" gutterBottom sx={{ color: "#456BBC", fontWeight: "bold" }}>
                        PayNest Registration
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                        Manage your properties, tenants, and payments easily.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            margin="normal"
                            error={phoneError}
                            helperText={phoneError ? "Invalid format. Use 2547XXXXXXXX" : "Format: 2547XXXXXXXX"}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Phone />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Password Field */}
                        <TextField
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            name="password"
                            value={formData.password}
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
                        {formData.password && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress variant="determinate" value={passwordStrength} />
                                <Typography variant="caption">
                                    {passwordStrength < 50
                                        ? "Weak"
                                        : passwordStrength < 75
                                            ? "Medium"
                                            : "Strong"}
                                </Typography>
                            </Box>
                        )}

                        {/* Confirm Password */}
                        <TextField
                            fullWidth
                            type={showConfirmPassword ? "text" : "password"}
                            label="Confirm Password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
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

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                                />
                            }
                            label="I agree to the Terms & Privacy Policy"
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
                            {loading ? "Registering..." : "Register"}
                        </Button>

                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            Already have an account? <Link to="/login">Login</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            {/* Snackbar Notification */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={2500}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity="success" sx={{ width: "100%" }}>
                    <strong>🎉 Welcome aboard! Your NyumbaSmart account is ready.</strong>
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Register;
