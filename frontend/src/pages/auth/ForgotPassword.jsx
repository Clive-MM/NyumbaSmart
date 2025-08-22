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
        background: "#e0e0e0", // light gray bg suits neumorphism
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
        style={{ position: "relative", zIndex: 1 }}
      >
        <Paper
          sx={{
            p: 4,
            width: { xs: "90vw", sm: 400 },
            borderRadius: "30px",
            background: "#e0e0e0",
            boxShadow:
              "9px 9px 16px #bebebe, -9px -9px 16px #ffffff", // 🔽 soft raised shadow
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
                    "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff", // 🔽 inset for logo circle
                }}
              />
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  mb: 0.5,
                  background: "linear-gradient(to right, #D4124E, #456BBC, #FF0080)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                PayNest Login
              </Typography>
              <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>
                Smart Homes, Smarter Payments.
              </Typography>
            </motion.div>
          </Link>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#222", mb: 1 }}
          >
            Forgot Your Password?
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
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
                  borderRadius: "20px",
                  background: "#e0e0e0",
                  boxShadow:
                    "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff", // 🔽 pressed look
                },
                "& .MuiInputBase-input": {
                  color: "#111",
                  fontWeight: 500,
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#D4124E",
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
                borderRadius: "20px",
                fontWeight: "bold",
                background: "#e0e0e0",
                color: "#333",
                boxShadow:
                  "6px 6px 12px #bebebe, -6px -6px 12px #ffffff", // 🔽 raised effect
                "&:hover": {
                  background: "#e0e0e0",
                  boxShadow:
                    "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff", // 🔽 pressed effect on hover
                },
              }}
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={20} sx={{ color: "#D4124E" }} />
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
