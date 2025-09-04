import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Phone, Lock, Login as LoginIcon } from "@mui/icons-material";
import axios from "axios";

/* ----------------------------------------------
   PayNest Auth Double Slider (refined)
   - Header is a Home link (animated)
   - Overlay never covers the active form
   - Compact shell (height reduced)
   - Slide back to Login from Register, incl. after success
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
  height: 520, // reduced from 560
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(135deg, rgba(20,20,28,0.94), rgba(12,12,16,0.98))",
  boxShadow:
    "0 0 14px rgba(255,0,128,0.25), 0 0 24px rgba(69,107,188,0.2), 14px 14px 32px rgba(0,0,0,0.65), -8px -8px 20px rgba(255,255,255,0.02)",
});

/* ---------- Shared clickable header (Home link) ---------- */
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

/**
 * IMPORTANT: Prevent `active` prop from reaching the DOM to avoid
 * "Received `false` for a non-boolean attribute `active`" warning.
 */
const OverlayWrap = styled(
  Box,
  { shouldForwardProp: (prop) => prop !== "active" }
)(({ active }) => ({
  position: "absolute",
  top: 0,
  left: "50%",
  width: "50%",
  height: "100%",
  overflow: "hidden",
  transition: "transform 600ms ease-in-out",
  zIndex: 4, // under forms
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

/**
 * Replace deprecated motion(Button) with motion.create(Button)
 * to remove "motion() is deprecated" warning.
 */
const MotionButton = motion.create(Button);

const NButton = styled(MotionButton)({
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

const encrypt = (text) => btoa(unescape(encodeURIComponent(text)));
const decrypt = (text) => decodeURIComponent(escape(atob(text)));

/* =============================
   Register Form
============================= */
function RegisterForm({ onSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    terms: false,
    showConfirm: false, // drives confirm visibility
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [strength, setStrength] = useState(0);
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
    if (!formData.terms) return alert("You must agree to the Terms & Privacy Policy.");
    if (phoneError) return alert("Enter a valid phone number in format 2547XXXXXXXX");

    try {
      setLoading(true);
      await axios.post(`${API_URL}/register`, formData);
      onSuccess?.("🎉 Registration successful! Please log in.");
      onBackToLogin?.(); // slide back to login
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <NInput fullWidth label="Full Name" value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
        <NInput fullWidth label="Email" type="email" value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
        <NInput fullWidth label="Phone Number" value={formData.phone} onChange={handlePhone}
          error={phoneError} helperText={phoneError ? "Use 2547XXXXXXXX" : ""}
          InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }} />
        <NInput fullWidth type={showPassword ? "text" : "password"} label="Password" value={formData.password}
          onChange={handlePassword}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }} />

        {formData.password && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={strength}
              sx={{
                height: 6, borderRadius: 5, backgroundColor: BRAND.insetDark,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: strength < 50 ? "#ff4d4f" : strength < 75 ? "#faad14" : "#52c41a"
                }
              }}
            />
            <Typography variant="caption" sx={{ color: BRAND.subtext }}>
              {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
            </Typography>
          </Box>
        )}

        <NInput fullWidth type={formData.showConfirm ? "text" : "password"} label="Confirm Password"
          value={formData.confirm_password}
          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setFormData(s => ({ ...s, showConfirm: !s.showConfirm }))}>
                  {formData.showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }} />

        <FormControlLabel
          control={<Checkbox checked={formData.terms}
            onChange={(e) => setFormData({ ...formData, terms: e.target.checked })} />}
          label={<Typography variant="body2" sx={{ color: BRAND.subtext }}>
            I agree to the Terms & Privacy Policy
          </Typography>}
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
   Login Form
============================= */
function LoginForm({ onSuccess }) {
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

      if (formData.remember_me) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remember_email", formData.email);
        localStorage.setItem("remember_password", encrypt(formData.password));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("remember_me");
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_password");
      }

      onSuccess?.(`🎉 Welcome back, ${user.FullName}! Redirecting...`, "success", "/dashboard");
    } catch (err) {
      onSuccess?.(err.response?.data?.message || "Login failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <NInput fullWidth label="Email" name="email" type="email" value={formData.email}
          onChange={handleChange}
          InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
        <NInput fullWidth label="Password" name="password" type={showPassword ? "text" : "password"}
          value={formData.password} onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }} />
        <FormControlLabel
          control={<Checkbox name="remember_me" checked={formData.remember_me} onChange={handleChange} />}
          label={<Typography variant="body2" sx={{ color: BRAND.subtext }}>Remember Me</Typography>}
        />
        <NButton whileTap={{ scale: 0.97 }} type="submit" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : (<><LoginIcon /> Login</>)}
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
  const [rightActive, setRightActive] = useState(false); // false = Login (left), true = Register (right)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleNotify = (message, severity = "success", redirect) => {
    setSnackbar({ open: true, message, severity });
    if (redirect) setTimeout(() => navigate(redirect), 1200);
  };

  return (
    <Screen>
      <Shell as={motion.div} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        {/* Clickable header => Home with animation */}
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
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                whileHover={{ y: -1, opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
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
          {/* Login anchored LEFT */}
          <Panel
            sx={{
              left: 0,
              transform: rightActive ? "translateX(-100%)" : "translateX(0)",
              transition: "transform 600ms ease-in-out",
            }}
          >
            <LoginForm onSuccess={handleNotify} />
          </Panel>

          {/* Register anchored RIGHT */}
          <Panel
            sx={{
              right: 0,
              transform: rightActive ? "translateX(0)" : "translateX(100%)",
              transition: "transform 600ms ease-in-out",
            }}
          >
            <RegisterForm
              onSuccess={(m) => {
                handleNotify(m, "success");
              }}
              onBackToLogin={() => setRightActive(false)}
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
