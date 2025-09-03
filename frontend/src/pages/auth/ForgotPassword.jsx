// ./src/pages/auth/ForgotPassword.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  // flow: start -> verify -> reset
  const [step, setStep] = useState("start");

  // shared
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // step 1
  const [identifier, setIdentifier] = useState(""); // email or phone
  // step 2
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  // step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // token after VERIFY
  const [resetToken, setResetToken] = useState(null);

  // simple helpers
  const isEmail = useMemo(
    () => /\S+@\S+\.\S+/.test(identifier.trim()),
    [identifier]
  );

  // resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const showMsg = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // STEP 1: request code (SMS via backend)
  const handleStart = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showMsg(
        "Please enter your email or Safaricom phone (+2547… / 07…)",
        "error"
      );
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot/start`, {
        identifier: identifier.trim(),
      });
      showMsg(
        "If the account exists, we’ve sent a verification code (check your SMS).",
        "success"
      );
      setResendIn(30); // 30s cooldown
      setStep("verify");
    } catch (error) {
      showMsg(
        error?.response?.data?.message || "Failed to start password reset.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: verify code → get reset_token
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      showMsg("Please enter the code we sent you.", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/forgot/verify`, {
        identifier: identifier.trim(),
        code: code.trim(),
      });
      const token = res.data?.reset_token;
      if (!token) throw new Error("Missing reset_token");
      setResetToken(token);
      showMsg("Code verified. Please create a new password.", "success");
      setStep("reset");
    } catch (error) {
      showMsg(error?.response?.data?.message || "Invalid or expired code.", "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: resend code
  const handleResend = async () => {
    if (resendIn > 0) return;
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot/start`, {
        identifier: identifier.trim(),
      });
      setResendIn(30);
      showMsg("A new code has been sent (if the account exists).", "success");
    } catch (error) {
      showMsg(error?.response?.data?.message || "Failed to resend code.", "error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: set new password
  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetToken) {
      showMsg("Missing reset token. Please verify your code again.", "error");
      setStep("verify");
      return;
    }
    if (!newPassword || !confirmPassword) {
      showMsg("Please enter and confirm your new password.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMsg("Passwords do not match.", "error");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot/reset`, {
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showMsg("Password reset successful! You can now log in.", "success");
      // clear out
      setIdentifier("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken(null);
      setStep("start");
    } catch (error) {
      showMsg(error?.response?.data?.message || "Failed to reset password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
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
            background: BRAND.card,
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
                PayNest Password Reset
              </Typography>
              <Typography variant="body2" sx={{ color: BRAND.subtext, fontWeight: 500 }}>
                Smart Homes, Smarter Payments.
              </Typography>
            </motion.div>
          </Link>

          {step === "start" && (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: BRAND.text, mb: 1 }}>
                Forgot Your Password?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: BRAND.subtext }}>
                Enter your <b>email or phone</b> (e.g. <i>you@domain.com</i> or <i>+2547… / 07…</i>).
                If we find your account, we’ll text you a verification code.
              </Typography>

              <Box component="form" onSubmit={handleStart}>
                <TextField
                  fullWidth
                  label="Email or Phone"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
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
                  {loading ? "Sending..." : "Send Code"}
                </Button>
              </Box>
            </>
          )}

          {step === "verify" && (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: BRAND.text, mb: 1 }}>
                Verify Your Code
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: BRAND.subtext }}>
                We sent a code to the phone linked to{" "}
                <b>{isEmail ? identifier.trim().toLowerCase() : identifier.trim()}</b>. Enter it below.
              </Typography>

              <Box component="form" onSubmit={handleVerify}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  type="tel"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  margin="normal"
                  inputProps={{ maxLength: 8, inputMode: "numeric" }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      background: "#0f1219",
                      color: BRAND.text,
                      boxShadow: `inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
                    },
                    "& .MuiInputBase-input": { color: BRAND.text, letterSpacing: 2 },
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
                  disabled={loading || code.trim().length < 4}
                  startIcon={
                    loading && <CircularProgress size={20} sx={{ color: "#fff" }} />
                  }
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  onClick={handleResend}
                  disabled={loading || resendIn > 0}
                  sx={{ mt: 1.5, textTransform: "none", color: BRAND.subtext }}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </Button>

                <Button
                  onClick={() => setStep("start")}
                  disabled={loading}
                  sx={{ mt: 0.5, textTransform: "none", color: BRAND.subtext }}
                >
                  Use a different email/phone
                </Button>
              </Box>
            </>
          )}

          {step === "reset" && (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: BRAND.text, mb: 1 }}>
                Create a New Password
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: BRAND.subtext }}>
                Minimum 8 characters with upper, lower, digit, and a special character.
              </Typography>

              <Box component="form" onSubmit={handleReset}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw((s) => !s)} edge="end">
                          {showPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                      borderColor: BRAND.blue
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPw2 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw2((s) => !s)} edge="end">
                          {showPw2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                      borderColor: BRAND.blue
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
                  {loading ? "Saving..." : "Reset Password"}
                </Button>

                <Button
                  onClick={() => setStep("verify")}
                  disabled={loading}
                  sx={{ mt: 1.5, textTransform: "none", color: BRAND.subtext }}
                >
                  Back to code verification
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
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
