import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Lock,
  Login as LoginIcon,
  Sms,
  Replay,
} from "@mui/icons-material";
import axios from "axios";

/* ----------------------------------------------
   PayNest Auth (Twilio Verify + 2FA SMS)
----------------------------------------------- */

const API_URL = process.env.REACT_APP_API_URL;
const logoUrl =
  "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

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

const Screen = styled(Box)({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background:
    "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(16,0,36,0.95) 50%, rgba(5,5,5,1) 100%)",
  color: BRAND.text,
  padding: 16,
  overflow: "hidden",
});

const Shell = styled(Paper)({
  position: "relative",
  width: 1140,
  maxWidth: "98vw",
  height: 520,
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(135deg, rgba(20,20,28,0.94), rgba(12,12,16,0.98))",
  boxShadow:
    "0 0 14px rgba(255,0,128,0.25), 0 0 24px rgba(69,107,188,0.2), 14px 14px 32px rgba(0,0,0,0.65), -8px -8px 20px rgba(255,255,255,0.02)",
});

const HeaderBar = styled(Link)({
  position: "absolute",
  top: 14,
  left: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  zIndex: 20,
  textDecoration: "none",
  cursor: "pointer",
});

const Container = styled(Box)({ position: "absolute", inset: 0 });

const Panel = styled(Box)({
  position: "absolute",
  top: 0,
  height: "100%",
  width: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 22,
  zIndex: 5,
});

const FormCard = styled(Box)({
  width: "100%",
  maxWidth: 420,
  borderRadius: 20,
  padding: 18,
  background: BRAND.card,
  boxShadow: `inset 6px 6px 14px ${BRAND.insetDark}, inset -6px -6px 14px ${BRAND.insetLight}, 0 0 12px rgba(255,0,128,0.18)`,
});

const OverlayWrap = styled(Box)(({ active }) => ({
  position: "absolute",
  top: 0,
  left: "50%",
  width: "50%",
  height: "100%",
  overflow: "hidden",
  transition: "transform 600ms ease-in-out",
  zIndex: 4,
  transform: active ? "translateX(-100%)" : "translateX(0)",
}));

const Overlay = styled(Box)({
  background:
    "linear-gradient(135deg, rgba(212,18,78,0.22), rgba(126,0,166,0.22), rgba(69,107,188,0.22))",
  position: "relative",
  left: "-100%",
  width: "200%",
  height: "100%",
  display: "flex",
});

const OverlayPanel = styled(Box)({
  position: "relative",
  width: "50%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  padding: 24,
  textAlign: "center",
});

const OverlayButton = styled(Button)({
  marginTop: 12,
  borderRadius: 12,
  padding: "10px 18px",
  fontWeight: 700,
  background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink})`,
  color: "#fff",
  boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

const NInput = styled(TextField)({
  marginTop: 10,
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    background: "#0f1219",
    color: BRAND.text,
    boxShadow: `inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
  },
  "& .MuiInputLabel-root": { color: BRAND.subtext },
});

const NButton = styled(motion(Button))({
  marginTop: 14,
  borderRadius: 12,
  background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink}, ${BRAND.blue})`,
  color: "#fff",
  fontWeight: 700,
  padding: "10px 14px",
  boxShadow: `6px 6px 12px ${BRAND.insetDark}, -6px -6px 12px ${BRAND.insetLight}`,
  "&:hover": {
    transform: "scale(1.03)",
    background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.pink}, ${BRAND.magenta})`,
  },
});
// eslint-disable-next-line
const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

/* =============================
   OTP Dialog (Verify / Resend)
   mode: "login" | "registration"
============================= */
function OtpDialog({
  open,
  mode = "login",
  email,
  rememberMe,
  onClose,
  onVerified, // (result?: {token, user})
  onMessage,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [trustDevice, setTrustDevice] = useState(true);

  useEffect(() => {
    if (!open) {
      setCode("");
      setResendCooldown(0);
      setTrustDevice(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open || resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, resendCooldown]);

  const canSubmit = useMemo(() => code.trim().length >= 4, [code]);

  const handleVerify = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);

      if (mode === "login") {
        // Finalize 2FA: backend returns token & user
        const { data } = await axios.post(`${API_URL}/auth/login-verify`, {
          email,
          code: code.trim(),
          trust_device: !!trustDevice,
          remember_me: !!rememberMe, // optional for server-side cookies
        });
        onMessage?.("✅ Login verified. Welcome!", "success");
        onVerified?.({ token: data?.token, user: data?.user });
        onClose?.();
      } else {
        // Registration phone verification (no token expected)
        await axios.post(`${API_URL}/auth/verify-otp`, {
          email,
          code: code.trim(),
        });
        onMessage?.("✅ Phone verified successfully. Please sign in.", "success");
        onVerified?.();
        onClose?.();
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        (status === 429
          ? "Too many attempts. Please wait a bit and try again."
          : "Failed to verify code.");
      onMessage?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/resend-otp`, { email });
      setResendCooldown(30);
      onMessage?.("OTP resent via SMS.", "success");
    } catch (err) {
      onMessage?.(err.response?.data?.message || "Failed to resend OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
        <Sms fontSize="small" />{" "}
        {mode === "login" ? "Two-Factor Authentication" : "Verify your phone"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: BRAND.subtext, mb: 1 }}>
          {mode === "login"
            ? <>We sent a 6-digit code to the phone linked with <b>{email}</b> to complete sign-in.</>
            : <>Enter the 6-digit code we sent to the phone linked with <b>{email}</b>.</>}
        </Typography>
        <NInput
          fullWidth
          autoFocus
          label="OTP Code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
          inputProps={{ inputMode: "numeric", maxLength: 10 }}
        />
        {mode === "login" && (
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: BRAND.subtext }}>
                Trust this device for 30 days
              </Typography>
            }
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleResend}
          startIcon={<Replay />}
          disabled={loading || resendCooldown > 0}
          sx={{ color: BRAND.blue }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
        </Button>
        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={!canSubmit || loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =============================
   Register Form
============================= */
function RegisterForm({ onSuccess, onBackToLogin, onNeedOtp }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    terms: false,
    showConfirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [strength, setStrength] = useState(0);

  // Prefer UI hint 2547xxxxxxxx (server normalizes to +2547…)
  const phoneRegex = /^2547\d{8}$/;

  const getStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    if (/[^\w]/.test(pwd)) s += 25;
    return s;
  };

  const handlePhone = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (!value.startsWith("254")) value = "254" + value.replace(/^0+/, "");
    setFormData((s) => ({ ...s, phone: value }));
    setPhoneError(!phoneRegex.test(value));
  };

  const handlePassword = (e) => {
    const v = e.target.value;
    setFormData((s) => ({ ...s, password: v }));
    setStrength(getStrength(v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) return onSuccess?.("You must accept Terms & Privacy Policy.", "error");
    if (phoneError) return onSuccess?.("Use phone format 2547XXXXXXXX.", "error");

    try {
      setLoading(true);
      // Prefer new endpoint; fall back if backend still on /register
      try {
        await axios.post(`${API_URL}/auth/register`, formData);
      } catch (e) {
        if ([404, 405].includes(e?.response?.status)) {
          await axios.post(`${API_URL}/register`, formData);
        } else {
          throw e;
        }
      }

      onSuccess?.(
        "Account created. We sent you a code via SMS. Please verify.",
        "success"
      );
      // Open OTP (registration mode) → verify phone then go to login
      onNeedOtp?.({ email: formData.email, mode: "registration" });
    } catch (err) {
      onSuccess?.(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <NInput
          fullWidth
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        <NInput
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        <NInput
          fullWidth
          label="Phone Number"
          value={formData.phone}
          onChange={handlePhone}
          error={phoneError}
          helperText={phoneError ? "Use 2547XXXXXXXX" : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
        />
        <NInput
          fullWidth
          type={showPassword ? "text" : "password"}
          label="Password"
          value={formData.password}
          onChange={handlePassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {formData.password && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={strength}
              sx={{
                height: 6,
                borderRadius: 5,
                backgroundColor: BRAND.insetDark,
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    strength < 50 ? "#ff4d4f" : strength < 75 ? "#faad14" : "#52c41a",
                },
              }}
            />
            <Typography variant="caption" sx={{ color: BRAND.subtext }}>
              {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
            </Typography>
          </Box>
        )}

        <NInput
          fullWidth
          type={formData.showConfirm ? "text" : "password"}
          label="Confirm Password"
          value={formData.confirm_password}
          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setFormData((s) => ({ ...s, showConfirm: !s.showConfirm }))}>
                  {formData.showConfirm ? <VisibilityOff /> : <Visibility />}
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
          label={
            <Typography variant="body2" sx={{ color: BRAND.subtext }}>
              I agree to the Terms & Privacy Policy
            </Typography>
          }
        />

        <NButton whileTap={{ scale: 0.97 }} type="submit" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Register"}
        </NButton>

        <Button onClick={onBackToLogin} fullWidth sx={{ mt: 1, color: BRAND.blue }}>
          Back to Login
        </Button>
      </Box>
    </FormCard>
  );
}

/* =============================
   Login Form (with 2FA trigger)
============================= */
function LoginForm({ onSuccess, onNeedOtp }) {
  const [formData, setFormData] = useState({ email: "", password: "", remember_me: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("remember_me") === "true";
    const email = localStorage.getItem("remember_email");
    const encryptedPassword = localStorage.getItem("remember_password");
    const password = encryptedPassword ? decrypt(encryptedPassword) : "";
    if (remembered && email && password) setFormData({ email, password, remember_me: true });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password)
      return onSuccess?.("Please enter email and password.", "error");

    try {
      setLoading(true);
      const resp = await axios.post(`${API_URL}/login`, formData);
      const { token, user } = resp.data;
      // If password-only (no 2FA needed), parent will store and redirect via onNeedOtp? No, we handle here:
      onNeedOtp?.({ mode: "direct-success", token, user, remember_me: formData.remember_me });
    } catch (err) {
      const status = err.response?.status;
      const needs = err.response?.data?.needs_verification;
      const reason = err.response?.data?.reason;
      const message = err.response?.data?.message || "Login failed. Try again.";

      if (status === 403 && needs) {
        // 2FA or first-time phone verification required
        onSuccess?.(message, "warning");
        onNeedOtp?.({
          mode: "login",
          email: formData.email,
          remember_me: formData.remember_me,
          reason,
        });
        return;
      }

      onSuccess?.(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <NInput
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        <NInput
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Checkbox name="remember_me" checked={formData.remember_me} onChange={handleChange} />
          }
          label={<Typography variant="body2" sx={{ color: BRAND.subtext }}>Remember Me</Typography>}
        />
        <NButton whileTap={{ scale: 0.97 }} type="submit" fullWidth disabled={loading}>
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            <>
              <LoginIcon /> Login
            </>
          )}
        </NButton>
        <Typography variant="body2" align="center" sx={{ mt: 1.5 }}>
          <Link to="/forgot-password" style={{ color: BRAND.blue, textDecoration: "none" }}>
            Forgot Password?
          </Link>
        </Typography>
      </Box>
    </FormCard>
  );
}

/* =============================
   Main Component
============================= */
export default function AuthDoubleSliderRefined() {
  const [rightActive, setRightActive] = useState(false); // false = Login, true = Register
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // OTP modal control
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpMode, setOtpMode] = useState("login"); // "login" | "registration"
  const [otpEmail, setOtpEmail] = useState("");
  const [loginRememberMe, setLoginRememberMe] = useState(false);

  const navigate = useNavigate();

  const notify = (message, severity = "success", redirect) => {
    setSnackbar({ open: true, message, severity });
    if (redirect) setTimeout(() => navigate(redirect), 1200);
  };

  const storeSession = (remember, token, user) => {
    if (!token || !user) return;
    if (remember) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("remember_me", "true");
      localStorage.setItem("remember_email", user.Email || "");
      // do not store password on OTP flow
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("remember_me");
      localStorage.removeItem("remember_email");
      localStorage.removeItem("remember_password");
    }
  };

  const openOtp = ({ email, mode = "login", remember_me = false }) => {
    setOtpMode(mode);
    setOtpEmail(email || "");
    setLoginRememberMe(!!remember_me);
    setOtpOpen(true);
  };

  // Handle child messages
  const handleNotify = (message, severity = "success", redirect) =>
    notify(message, severity, redirect);

  return (
    <Screen>
      <Shell as={motion.div} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        {/* Header */}
        <HeaderBar to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <motion.img
              src={logoUrl}
              alt="PayNest"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08, rotate: 2 }}
              transition={{ duration: 0.3 }}
              style={{
                height: 42,
                width: 42,
                borderRadius: 8,
                boxShadow: "inset 3px 3px 6px #0a0b10, inset -3px -3px 6px #1b1f29",
              }}
            />
            <Box sx={{ textAlign: "center" }}>
              <motion.div initial={{ y: 0, opacity: 1 }} whileHover={{ y: -1, opacity: 1 }} transition={{ duration: 0.25 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.blue}, ${BRAND.pink})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 0.3,
                    textShadow: "0 0 14px rgba(255,0,128,0.18)",
                  }}
                >
                  PayNest&nbsp;&nbsp;Smart Homes, Smarter Payments
                </Typography>
              </motion.div>
            </Box>
          </motion.div>
        </HeaderBar>

        {/* Forms */}
        <Container>
          {/* Login (left) */}
          <Panel
            sx={{
              left: 0,
              transform: rightActive ? "translateX(-100%)" : "translateX(0)",
              transition: "transform 600ms ease-in-out",
            }}
          >
            <LoginForm
              onSuccess={handleNotify}
              onNeedOtp={({ mode, email, remember_me, token, user }) => {
                // If login completed with no OTP needed
                if (mode === "direct-success" && token && user) {
                  storeSession(!!remember_me, token, user);
                  handleNotify(`🎉 Welcome back, ${user.FullName}! Redirecting...`, "success", "/dashboard");
                  return;
                }
                // Otherwise open OTP (step-up 2FA)
                openOtp({ email, mode: "login", remember_me });
              }}
            />
          </Panel>

          {/* Register (right) */}
          <Panel
            sx={{
              right: 0,
              transform: rightActive ? "translateX(0)" : "translateX(100%)",
              transition: "transform 600ms ease-in-out",
            }}
          >
            <RegisterForm
              onSuccess={(m, sev) => handleNotify(m, sev || "success")}
              onBackToLogin={() => setRightActive(false)}
              onNeedOtp={({ email }) => openOtp({ email, mode: "registration" })}
            />
          </Panel>
        </Container>

        {/* Overlay below forms; opposite side of active form */}
        <OverlayWrap active={rightActive}>
          <Overlay>
            <OverlayPanel>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={900}>
                  Welcome back
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: BRAND.subtext }}>
                  Already have an account? Login to continue.
                </Typography>
                <OverlayButton onClick={() => setRightActive(false)}>Go to Login</OverlayButton>
              </Box>
            </OverlayPanel>
            <OverlayPanel>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={900}>
                  Landlords, Let’s Make It Pay.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: BRAND.subtext }}>
                  Your smart hub for rent, bills, and peace of mind.
                </Typography>
                <OverlayButton onClick={() => setRightActive(true)}>REGISTER HERE</OverlayButton>
              </Box>
            </OverlayPanel>
          </Overlay>
        </OverlayWrap>
      </Shell>

      {/* OTP Dialog */}
      <OtpDialog
        open={otpOpen}
        mode={otpMode}
        email={otpEmail}
        rememberMe={loginRememberMe}
        onClose={() => setOtpOpen(false)}
        onVerified={(result) => {
          if (otpMode === "login" && result?.token && result?.user) {
            // Finalize login directly from /auth/login-verify response
            storeSession(loginRememberMe, result.token, result.user);
            handleNotify(`🎉 Welcome back, ${result.user.FullName}! Redirecting...`, "success", "/dashboard");
          } else {
            // Registration verify → slide back to login
            setRightActive(false);
          }
        }}
        onMessage={handleNotify}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2400}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Screen>
  );
}
