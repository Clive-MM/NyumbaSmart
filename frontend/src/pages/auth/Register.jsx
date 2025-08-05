import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    LinearProgress,
    Snackbar,
    Alert,
    Paper,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Phone, Lock } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;
const logoUrl = "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const NeumorphicPaper = styled(Paper)({
    padding: "2rem",
    borderRadius: "20px",
    background: "#e0e0e0",
    boxShadow:
        "0 0 10px #FF0080, 0 0 20px #D4124E, 0 0 30px #7E00A6, 8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 450,
    margin: "auto",
    textAlign: "center",
    transition: "0.3s",
    "&:hover": {
        boxShadow: "inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff",
    },
});

const NeumorphicTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#e0e0e0",
        boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
    },
    "& .MuiInputLabel-root": { fontWeight: 500 },
});

const NeumorphicButton = styled(motion(Button))({
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
});

const StyledMotionLink = styled(motion(Link))({
    color: "#D4124E",
    fontWeight: "bold",
    textDecoration: "none",
    transition: "color 0.3s",
    "&:hover": {
        color: "#FF0080",
    },
});

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
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();
    const phoneRegex = /^2547\d{8}$/;

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value.startsWith("254")) value = "254" + value.replace(/^0+/, "");
        setFormData({ ...formData, phone: value });
        setPhoneError(!phoneRegex.test(value));
    };

    const getPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^\w]/.test(password)) strength += 25;
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
            setOpenSnackbar(true);
            setTimeout(() => navigate("/login"), 2000);
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
                backgroundImage: "url(https://res.cloudinary.com/djydkcx01/image/upload/v1754425642/juliana-morales-ramirez-vTNA1cC_IZY-unsplash_axtieh.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
            }}
        >
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <NeumorphicPaper>
                    <Link to="/" style={{ textDecoration: "none" }}>
                        <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: "pointer", marginBottom: "1.5rem" }}>
                            <img src={logoUrl} alt="PayNest Logo" style={{ height: 60, marginBottom: 8 }} />
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    background: "linear-gradient(to right, #D4124E, #E8511E)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                PayNest Registration
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#333",
                                    fontWeight: 500,
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
                        <NeumorphicTextField fullWidth label="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} margin="normal" required />

                        <NeumorphicTextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} margin="normal" required InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />

                        <NeumorphicTextField fullWidth label="Phone Number" value={formData.phone} onChange={handlePhoneChange} margin="normal" error={phoneError} helperText={phoneError ? "Invalid format. Use 2547XXXXXXXX" : ""} required InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }} />

                        <NeumorphicTextField fullWidth type={showPassword ? "text" : "password"} label="Password" value={formData.password} onChange={handlePasswordChange} margin="normal" required InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

                        {formData.password && (
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress variant="determinate" value={passwordStrength} sx={{ height: 6, borderRadius: 5, backgroundColor: "#d1d9e6", "& .MuiLinearProgress-bar": { backgroundColor: passwordStrength < 50 ? "#ff4d4f" : passwordStrength < 75 ? "#faad14" : "#52c41a" } }} />
                                <Typography variant="caption">{passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}</Typography>
                            </Box>
                        )}

                        <NeumorphicTextField fullWidth type={showConfirmPassword ? "text" : "password"} label="Confirm Password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} margin="normal" required InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

                        <FormControlLabel control={<Checkbox checked={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} />} label="I agree to the Terms & Privacy Policy" sx={{ mt: 1 }} />

                        <NeumorphicButton whileTap={{ scale: 0.97 }} type="submit" fullWidth disabled={loading}>{loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Register"}</NeumorphicButton>

                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Already have an account?{' '}
                            <StyledMotionLink to="/login" whileHover={{ scale: 1.1 }}>Login</StyledMotionLink>
                        </Typography>
                    </Box>
                </NeumorphicPaper>
            </motion.div>

            <Snackbar open={openSnackbar} autoHideDuration={2500} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity="success" sx={{ width: "100%" }}>
                    🎉 Welcome aboard!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Register;
