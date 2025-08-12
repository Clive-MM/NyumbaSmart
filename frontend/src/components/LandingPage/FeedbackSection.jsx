// src/components/FeedbackRatingSection.jsx
import React, { useState } from "react";
import {
  Box, Typography, TextField, CircularProgress, Alert, Collapse
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import MuiRating from "@mui/material/Rating";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/* ---------- Brand (aligned with Auth) ---------- */
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
const headingGradient = `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.blue}, ${BRAND.pink})`;

/* ---------- Section layout: always side-by-side ---------- */
const Row = styled(Box)({
  display: "flex",
  gap: 28,
  alignItems: "stretch",
  justifyContent: "center",
  flexWrap: "nowrap",
  overflowX: "auto",              // stay side-by-side; scroll on tiny screens
  scrollSnapType: "x mandatory",
  paddingBottom: 6,
});

/* ---------- Card with gradient ring ---------- */
const FormCard = styled(Box)({
  scrollSnapAlign: "center",
  minWidth: 420,
  maxWidth: 520,
  width: "100%",
  borderRadius: 20,
  padding: 18,
  position: "relative",
  background: BRAND.card,
  boxShadow: `
    0 0 14px rgba(255,0,128,0.20),
    0 16px 36px rgba(0,0,0,0.55),
    inset 6px 6px 14px ${BRAND.insetDark},
    inset -6px -6px 14px ${BRAND.insetLight}
  `,
  isolation: "isolate",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    padding: 1,
    borderRadius: 20,
    background: `linear-gradient(135deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink})`,
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    zIndex: -1,
    opacity: 0.6,
  },
});

/* ---------- Inputs (match Auth look) ---------- */
const NInput = styled(TextField)({
  marginTop: 10,
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    background: "#0f1219",
    color: BRAND.text,
    boxShadow: `inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
    transition: "box-shadow .2s, border-color .2s",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&.Mui-focused fieldset": { borderColor: "transparent" },
    "&.Mui-focused": {
      boxShadow:
        `0 0 0 2px rgba(212,18,78,.35), 0 0 18px rgba(69,107,188,.22), inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
    },
  },
  "& .MuiInputLabel-root": { color: BRAND.subtext },
});

/* ---------- Buttons (reduced width + centered) ---------- */
const NButton = styled(motion.button)({
  marginTop: 14,
  borderRadius: 12,
  background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink}, ${BRAND.blue})`,
  color: "#fff",
  fontWeight: 800,
  padding: "12px 14px",
  maxWidth: 200,          // slimmer width
  width: "100%",
  border: "none",
  cursor: "pointer",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",    // centered
  boxShadow: `6px 6px 12px ${BRAND.insetDark}, -6px -6px 12px ${BRAND.insetLight}`,
});
const btnTap = { whileTap: { scale: 0.97 } };

/* =========================
   Feedback Form
========================= */
function FeedbackForm() {
  const [form, setForm] = useState({ Email: "", Subject: "", Message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
  const autoClose = () => setTimeout(() => setToast(t => ({ ...t, open: false })), 2200);

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
    } finally { setLoading(false); }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          background: headingGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: .5,
        }}
      >
        Say it Loud 🎤 — We’re All Ears
      </Typography>
      <Typography variant="body2" sx={{ color: BRAND.subtext, mb: 1 }}>
        Got 60 seconds? Tell us what to improve or double down on.
      </Typography>

      <Box component="form" onSubmit={submit}>
        <NInput fullWidth label="Email" name="Email" type="email"
          value={form.Email} onChange={(e) => setForm(f => ({ ...f, Email: e.target.value }))} />
        <NInput fullWidth label="Subject" name="Subject"
          value={form.Subject} onChange={(e) => setForm(f => ({ ...f, Subject: e.target.value }))} />
        <NInput fullWidth multiline rows={4} label="Message" name="Message"
          value={form.Message} onChange={(e) => setForm(f => ({ ...f, Message: e.target.value }))} />

        <NButton {...btnTap} type="submit">
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send It 🚀"}
        </NButton>

        <Collapse in={toast.open} appear>
          <Alert sx={{ mt: 1, borderRadius: 2 }} severity={toast.type} variant="filled">
            {toast.msg}
          </Alert>
        </Collapse>
      </Box>
    </FormCard>
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
  const autoClose = () => setTimeout(() => setToast(t => ({ ...t, open: false })), 2200);

  const submit = async (e) => {
    e.preventDefault();
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
    } finally { setLoading(false); }
  };

  return (
    <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          background: `linear-gradient(90deg, #FFA000, ${BRAND.pink})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: .5,
        }}
      >
        Tap Your Stars ⭐ — 5 Seconds Tops
      </Typography>
      <Typography variant="body2" sx={{ color: BRAND.subtext, mb: 1 }}>
        Quick pulse check: how did we do today?
      </Typography>

      <Box component="form" onSubmit={submit}>
        <Box sx={{
          p: 1.1,
          borderRadius: 14,
          background: "#0f1219",
          boxShadow: `inset 5px 5px 10px ${BRAND.insetDark}, inset -5px -5px 10px ${BRAND.insetLight}`,
          display: "flex", alignItems: "center", gap: 1.5
        }}>
          <MuiRating
            value={stars}
            onChange={(_, v) => setStars(v || 0)}
            size="large"
            sx={{
              "& .MuiRating-iconFilled": { color: "#FFB400", filter: "drop-shadow(0 0 4px rgba(255,180,0,.25))" },
              "& .MuiRating-iconHover": { color: "#FFC447" },
              "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,.25)" },
            }}
          />
          <Typography variant="body2" sx={{ color: BRAND.text, fontWeight: 700 }}>
            {stars || "-"} / 5
          </Typography>
        </Box>

        <NInput fullWidth multiline rows={3} label="Optional comment"
          value={comment} onChange={(e) => setComment(e.target.value)} />

        <NButton {...btnTap} type="submit">
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Lock My Stars ⭐"}
        </NButton>

        <Collapse in={toast.open} appear>
          <Alert sx={{ mt: 1, borderRadius: 2 }} severity={toast.type} variant="filled">
            {toast.msg}
          </Alert>
        </Collapse>
      </Box>
    </FormCard>
  );
}

/* =========================
   Parent wrapper
========================= */
export default function FeedbackRatingSection() {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        background:
          "linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(16,0,36,0.95) 50%, rgba(5,5,5,1) 100%)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 900,
          textAlign: "center",
          color: BRAND.text,
          mb: 3,
          textShadow: "0 2px 12px rgba(126,0,166,.35)",
        }}
      >
        We’d love your thoughts
      </Typography>

      <Row>
        <FeedbackForm />
        <RatingForm />
      </Row>
    </Box>
  );
}
