import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const logoUrl =
  "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* Same BRAND palette the Login page uses */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  orange: "#E8511E",
  purple: "#7E00A6",
  blue: "#456BBC",
  text: "#e6e6e6",
  subtext: "#b8b8b8",
  card: "#11131A",
  insetLight: "#2a2d36",
  insetDark: "#07080d",
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbar({
        open: true,
        message: "Please enter your email address.",
        severity: "error",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      setSnackbar({
        open: true,
        message:
          response.data.message || "Check your email for a password reset link.",
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
        position: "relative",
        minHeight: "100vh",
        // ✅ Same background as the Login page’s <Screen>
        background:
          "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(16,0,36,0.95) 50%, rgba(5,5,5,1) 100%)",
        color: BRAND.text,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: "relative", zIndex: 1, width: "100%" }}
      >
        <Paper
          sx={{
            p: 4,
            width: { xs: "92vw", sm: 420 },
            mx: "auto",
            borderRadius: 3,
            background: BRAND.card, // dark card to match login
            boxShadow: `inset 6px 6px 14px ${BRAND.insetDark}, inset -6px -6px 14px ${BRAND.insetLight}, 0 0 18px rgba(255,0,128,0.15)`,
            textAlign: "center",
          }}
        >
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
                    "inset 3px 3px 6px #0a0b10, inset -3px -3px 6px #1b1f29",
                }}
              />
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  mb: 0.5,
                  background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.blue}, ${BRAND.pink})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                PayNest Login
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND.subtext, fontWeight: 500 }}>
                Smart Homes, Smarter Payments.
              </Typography>
            </motion.div>
          </Link>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: BRAND.text, mb: 1 }}>
            Forgot Your Password?
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: BRAND.subtext }}>
            Enter your email address. We'll send a secure link so you can reset your
            password and regain access.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "#0f1219",
                  color: BRAND.text,
                  boxShadow: `inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
                },
                "& .MuiInputBase-input": { color: BRAND.text },
                "& .MuiInputLabel-root": { color: BRAND.subtext },
                "& .MuiInputLabel-root.Mui-focused": { color: BRAND.purple },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND.magenta,
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: BRAND.blue,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: 2,
                fontWeight: "bold",
                background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink}, ${BRAND.blue})`,
                color: "#fff",
                boxShadow: `6px 6px 12px ${BRAND.insetDark}, -6px -6px 12px ${BRAND.insetLight}`,
                "&:hover": {
                  transform: "translateY(-1px)",
                  background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.pink}, ${BRAND.magenta})`,
                },
              }}
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={20} sx={{ color: "#fff" }} />
              }
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>
        </Paper>
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

export default ForgotPassword;
