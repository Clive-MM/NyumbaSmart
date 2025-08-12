// src/components/FeedbackRatingSection.jsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import Collapse from "@mui/material/Collapse";
import MuiRating from "@mui/material/Rating";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/* ---------- Brand ---------- */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  red: "#FF3B3B",
  blue: "#2979FF",
  purple: "#7E00A6",
  cyan: "#00C8FF",
  lilac: "#8A6BFF",
  yellow: "#FFB400",
  textStrong: "#F3F4F6",
  textSoft: "rgba(227,229,236,.84)",
  bgViolet: "#140A1E",
  bgNavy: "#0E1220",
  bgDeep: "#0A0D16",
};
const headingGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

/* Load Orbitron once */
(() => {
  const href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap";
  if (
    typeof document !== "undefined" &&
    !document.head.querySelector(`link[href="${href}"]`)
  ) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
})();

/* ---------- Circular frames (soft neon rings) ---------- */
const CircleShell = styled(Box)({
  position: "relative",
  display: "grid",
  placeItems: "center",
  width: "min(100vw, 650px)",
  height: "min(95vw, 650px)",
  borderRadius: "50%",
  background: `
    radial-gradient(60% 60% at 50% 45%, rgba(255, 0, 128, .14), transparent 60%),
    radial-gradient(50% 50% at 65% 55%, rgba(0, 200, 255, .12), transparent 62%),
    radial-gradient(45% 45% at 40% 65%, rgba(138, 107, 255, .10), transparent 65%),
    linear-gradient(180deg, rgba(16,18,30,.72), rgba(10,13,22,.72))
  `,
  // ⬇ toned-down glows
  boxShadow:
    "0 16px 36px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06), 0 0 18px rgba(255,0,128,.08), 0 0 20px rgba(0,200,255,.08)",
  overflow: "hidden",
});

/* ---------- Inner glass card ---------- */
const CardGlass = styled(Paper)({
  width: "94%",
  maxWidth: 550,
  borderRadius: 20,
  padding: 20,
  background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.04))",
  border: "1px solid rgba(255,255,255,.10)",
  backdropFilter: "blur(8px)",
  // ⬇ softer shadow
  boxShadow: "0 10px 22px rgba(0,0,0,.40)",
});

/* ---------- Inputs: readable placeholders & labels ---------- */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 14,
    background: "rgba(255,255,255,0.98)",
    color: "#0E1020",
    // ⬇ softer neo look
    boxShadow:
      "8px 8px 16px rgba(0,0,0,0.05), -6px -6px 14px rgba(255,255,255,0.55)",
    "& fieldset": { border: "1px solid rgba(0,0,0,0.05)" },
    "&.Mui-focused": {
      // ⬇ softer inset
      boxShadow:
        "inset 6px 6px 12px rgba(0,0,0,0.05), inset -6px -6px 12px rgba(255,255,255,0.65)",
      "& fieldset": { borderColor: "transparent" },
    },
    "& input::placeholder, & textarea::placeholder": {
      color: "#0E1020",
      opacity: 0.85,
      fontWeight: 600,
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(20,20,20,0.65)",
    fontWeight: 600,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "rgba(14,16,32,.9)",
  },
};

/* ---------- Pill CTA (smaller, softer glow) ---------- */
const PillButton = styled(motion(Button))({
  borderRadius: 999,
  padding: "8px 18px", // smaller
  fontSize: ".9rem",
  fontWeight: 800,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "#fff",
  background: headingGradient,
  // ⬇ softer glow
  boxShadow: "0 8px 18px rgba(212,18,78,0.2)",
  outline: "none",
  alignSelf: "flex-start",
});
const pillMotion = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.025, 1],
    boxShadow: [
      "0 8px 18px rgba(212,18,78,0.20)",
      "0 12px 24px rgba(212,18,78,0.28)",
      "0 8px 18px rgba(212,18,78,0.20)",
    ],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.96 },
};

/* =========================
   Feedback Form
========================= */
function FeedbackForm() {
  const [form, setForm] = useState({ Email: "", Subject: "", Message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  const autoClose = () =>
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/feedback`, form);
      setToast({ open: true, type: "success", msg: "Thanks! Your feedback was submitted." });
      setForm({ Email: "", Subject: "", Message: "" });
      autoClose();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to submit feedback.";
      setToast({ open: true, type: "error", msg });
      autoClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <CircleShell>
      <CardGlass elevation={0}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              letterSpacing: 0.2,
              lineHeight: 1.1,
              background: headingGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Say it Loud 🎤 — We’re All Ears
          </Typography>
          <Typography variant="body2" sx={{ color: BRAND.textSoft }}>
            Got 60 seconds? Tell us what to improve or double down on.
          </Typography>
        </Box>

        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            name="Email"
            type="email"
            value={form.Email}
            onChange={handleChange}
            required
            fullWidth
            placeholder="your@email.com"
            sx={inputSx}
          />
          <TextField
            label="Subject"
            name="Subject"
            value={form.Subject}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            required
            fullWidth
            placeholder="Short title"
            sx={inputSx}
          />
          <TextField
            label="Message"
            name="Message"
            value={form.Message}
            onChange={(e) => setForm((f) => ({ ...f, Message: e.target.value }))}
            rows={4}
            multiline
            required
            fullWidth
            placeholder="Tell us what’s working or what to improve…"
            sx={inputSx}
          />

          <PillButton
            type="submit"
            variants={pillMotion}
            initial="initial"
            animate="animate"
            whileHover="whileHover"
            whileTap="whileTap"
          >
            {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Submit Feedback"}
          </PillButton>

          <Collapse in={toast.open} appear>
            <Alert sx={{ mt: 1, borderRadius: 2 }} severity={toast.type} variant="filled">
              {toast.msg}
            </Alert>
          </Collapse>
        </Box>
      </CardGlass>
    </CircleShell>
  );
}

/* =========================
   Rating Form
========================= */
function RatingForm() {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  const autoClose = () =>
    setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!stars) {
      setToast({ open: true, type: "warning", msg: "Please select a star rating." });
      autoClose();
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/ratings`, { RatingValue: stars, Comment: comment || null });
      setToast({ open: true, type: "success", msg: "Thanks for rating!" });
      setStars(0);
      setComment("");
      autoClose();
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to submit rating.";
      setToast({ open: true, type: "error", msg });
      autoClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <CircleShell>
      <CardGlass elevation={0}>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              letterSpacing: 0.2,
              lineHeight: 1.1,
              background: "linear-gradient(90deg, #FFA000, #FF4081)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tap Your Stars ⭐ — 5 Seconds Tops
          </Typography>
          <Typography variant="body2" sx={{ color: BRAND.textSoft }}>
            Quick pulse check: how did we do today?
          </Typography>
        </Box>

        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              p: 1.1,
              borderRadius: 14,
              background: "rgba(255,255,255,0.98)",
              // ⬇ softer inset
              boxShadow:
                "inset 5px 5px 10px rgba(0,0,0,0.05), inset -5px -5px 10px rgba(255,255,255,0.6)",
            }}
          >
            <MuiRating
              value={stars}
              onChange={(_, v) => setStars(v || 0)}
              size="large"
              sx={{
                "& .MuiRating-iconFilled": {
                  color: BRAND.yellow,
                  filter: "drop-shadow(0 0 4px rgba(255,180,0,.25))",
                },
                "& .MuiRating-iconHover": { color: "#FFC447" },
                "& .MuiRating-iconEmpty": { color: "rgba(14,16,32,.38)" },
              }}
            />
            <Typography variant="body2" sx={{ color: "#0E1020", fontWeight: 700 }}>
              {stars || "-"} / 5
            </Typography>
          </Stack>

          <TextField
            label="Optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Add a quick note (optional)"
            sx={inputSx}
          />

          <PillButton
            type="submit"
            variants={pillMotion}
            initial="initial"
            animate="animate"
            whileHover="whileHover"
            whileTap="whileTap"
          >
            {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Submit Rating"}
          </PillButton>

          <Collapse in={toast.open} appear>
            <Alert sx={{ mt: 1, borderRadius: 2 }} severity={toast.type} variant="filled">
              {toast.msg}
            </Alert>
          </Collapse>
        </Box>
      </CardGlass>
    </CircleShell>
  );
}

/* =========================
   Parent wrapper
========================= */
export default function FeedbackRatingSection() {
  return (
    <Box
      sx={{
        position: "relative",
        mt: { xs: 2, md: 4 },
        mb: { xs: 4, md: 8 },
        px: { xs: 1, md: 2 },
        background: `
          radial-gradient(900px 700px at 15% -10%, rgba(255,46,196,0.14), transparent 60%),
          radial-gradient(900px 700px at 90% 0%, rgba(0,200,255,0.10), transparent 60%),
          linear-gradient(180deg, ${BRAND.bgViolet} 0%, ${BRAND.bgNavy} 45%, ${BRAND.bgDeep} 100%)
        `,
      }}
    >
      <Box sx={{ maxWidth: 1350, mx: "auto" }}>
        <Stack spacing={0.5} alignItems="center" sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 900,
              color: BRAND.textStrong,
              textAlign: "center",
            }}
          >
            We’d love your thoughts
          </Typography>
        </Stack>

        <Grid
          container
          columns={12}
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={6} sx={{ display: "grid", placeItems: "center" }}>
            <FeedbackForm />
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: "grid", placeItems: "center" }}>
            <RatingForm />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
