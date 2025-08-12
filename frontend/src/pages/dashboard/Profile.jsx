// src/pages/dashboard/Profile.jsx
import React, { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, CircularProgress, Alert, Collapse, Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/* ---------- Brand (shared) ---------- */
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
const FONTS = {
    display: `"Cinzel", ui-serif, Georgia, serif`,
    subhead: `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
    number: `"Sora", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
};
/* ---------- Card ---------- */
const FormCard = styled(Box)({
    maxWidth: 980,
    width: "100%",
    borderRadius: 20,
    padding: 22,
    marginInline: "auto",
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

/* ---------- Inputs ---------- */
const NInput = styled(TextField)({
    marginTop: 12,
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#0f1219",
        color: BRAND.text,
        boxShadow: `inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
        "&.Mui-focused fieldset": { borderColor: "transparent" },
        "&.Mui-focused": {
            boxShadow:
                `0 0 0 2px rgba(212,18,78,.35), 0 0 18px rgba(69,107,188,.22), inset 3px 3px 6px ${BRAND.insetDark}, inset -3px -3px 6px ${BRAND.insetLight}`,
        },
    },
    "& .MuiInputLabel-root": { color: BRAND.subtext },
});

/* ---------- Buttons ---------- */
const NButton = styled(motion.button)({
    borderRadius: 12,
    background: `linear-gradient(90deg, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.pink}, ${BRAND.blue})`,
    color: "#fff",
    fontWeight: 800,
    padding: "12px 14px",
    border: "none",
    cursor: "pointer",
    minWidth: 160,
    boxShadow: `6px 6px 12px ${BRAND.insetDark}, -6px -6px 12px ${BRAND.insetLight}`,
});
const btnTap = { whileTap: { scale: 0.97 } };

/* ---------- Section heading ---------- */
const SectionTitle = ({ children }) => (
    <Typography
        variant="subtitle2"
        sx={{
            mt: 2.5,
            mb: .25,
            fontWeight: 900,
            letterSpacing: .3,
            color: BRAND.text,
            textTransform: "uppercase",
            opacity: .9,
        }}
    >
        {children}
    </Typography>
);

/* ---------- Avatar Ring + Upload ---------- */
const AvatarWrap = styled("label")({
    display: "grid",
    placeItems: "center",
    width: 112,
    height: 112,
    margin: "2px auto 8px",
    borderRadius: "50%",
    position: "relative",
    cursor: "pointer",
    background:
        "linear-gradient(135deg, rgba(212,18,78,.35), rgba(69,107,188,.25))",
    boxShadow:
        "0 10px 26px rgba(0,0,0,0.4), inset 0 0 0 3px rgba(255,255,255,0.05)",
    transition: "filter .2s ease, transform .2s ease",
    "&:hover": { filter: "brightness(1.05)", transform: "translateY(-1px)" },
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -6,
        borderRadius: "50%",
        background:
            "linear-gradient(90deg, rgba(212,18,78,.45), rgba(69,107,188,.45), rgba(255,0,128,.45))",
        filter: "blur(14px)",
        zIndex: -1,
        opacity: 0.65,
    },
});
const HiddenFile = styled("input")({ display: "none" });

/* ---------- Component ---------- */
export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        // identity
        DisplayName: "",
        Bio: "",
        DateOfBirth: "",
        // contact
        Address: "",
        City: "",
        County: "",
        PostalCode: "",
        SupportEmail: "",
        SupportPhone: "",
        // IDs
        NationalID: "",
        KRA_PIN: "",
        // mpesa
        MpesaPaybill: "",
        MpesaTill: "",
        MpesaAccountName: "",
        // bank
        BankName: "",
        BankBranch: "",
        AccountName: "",
        AccountNumber: "",
    });

    const [preview, setPreview] = useState(null);
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });
    const closeToastSoon = () =>
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2300);

    /* ----- Load profile ----- */
    const fetchProfile = async () => {
        try {
            console.log("[PROFILE] GET /viewprofile");
            const res = await axios.get(`${API_URL}/viewprofile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            console.log("[PROFILE] viewprofile response:", res.data);
            setProfile(res.data);
            setFormData((f) => ({
                ...f,
                // identity
                DisplayName: res.data.DisplayName || "",
                Bio: res.data.Bio || "",
                DateOfBirth: res.data.DateOfBirth || "",
                // contact + address
                Address: res.data.Address || "",
                City: res.data.City || "",
                County: res.data.County || "",
                PostalCode: res.data.PostalCode || "",
                SupportEmail: res.data.SupportEmail || "",
                SupportPhone: res.data.SupportPhone || "",
                // IDs
                NationalID: res.data.NationalID || "",
                KRA_PIN: res.data.KRA_PIN || "",
                // mpesa
                MpesaPaybill: res.data.MpesaPaybill || "",
                MpesaTill: res.data.MpesaTill || "",
                MpesaAccountName: res.data.MpesaAccountName || "",
                // bank
                BankName: res.data.BankName || "",
                BankBranch: res.data.BankBranch || "",
                AccountName: res.data.AccountName || "",
                AccountNumber: res.data.AccountNumber || "",
            }));
            setPreview(res.data.ProfilePicture || null);
        } catch (err) {
            console.error("[PROFILE] Failed to load:", err?.response?.data || err);
            setToast({ open: true, type: "error", msg: "Failed to load profile." });
            closeToastSoon();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []); // eslint-disable-line

    /* ----- Avatar upload -> /profile/avatar ----- */
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previous = preview;              // keep to revert on error
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);                   // instant preview
        setUploadingAvatar(true);

        try {
            const fd = new FormData();
            // Backend accepts "file" or "ProfilePicture"
            fd.append("file", file);
            fd.append("ProfilePicture", file);

            console.log("[PROFILE] POST /profile/avatar (size:", file.size, "type:", file.type, ")");
            const res = await axios.post(`${API_URL}/profile/avatar`, fd, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            console.log("[PROFILE] avatar upload response:", res.data);

            const newUrl = res?.data?.profile?.ProfilePicture;
            if (newUrl) {
                setProfile(res.data.profile);
                setPreview(newUrl);
                setToast({ open: true, type: "success", msg: "Avatar updated." });

                // sync header cache
                try {
                    const current = JSON.parse(localStorage.getItem("user") || "{}");
                    localStorage.setItem("user", JSON.stringify({ ...current, ProfilePicture: newUrl }));
                } catch { /* ignore */ }
            } else {
                setToast({ open: true, type: "warning", msg: "Uploaded, but no URL returned." });
                setPreview(previous);
            }
        } catch (err) {
            console.error("[PROFILE] Avatar upload failed:", err?.response?.data || err);
            setToast({
                open: true,
                type: "error",
                msg: err?.response?.data?.message || "Failed to upload avatar.",
            });
            setPreview(previous);
        } finally {
            setUploadingAvatar(false);
        }
    };

    /* ----- Text fields save (no file) ----- */
    const handleChange = (e) =>
        setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        const form = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== "") form.append(k, v);
        });

        // Use your existing endpoints: POST /create_profile, PUT /refreshprofile
        const hasProfile = !!profile; // after first GET, this is reliable
        const url = hasProfile ? `${API_URL}/refreshprofile` : `${API_URL}/create_profile`;
        const method = hasProfile ? "put" : "post";

        try {
            console.log(`[PROFILE] ${method.toUpperCase()} ${url}`);
            const res = await axios({
                method,
                url,
                data: form,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                // NOTE: don't set Content-Type for FormData; axios sets boundary automatically
            });
            console.log("[PROFILE] save response:", res.data);
            setToast({ open: true, type: "success", msg: res.data.message || "Saved!" });
            setIsEditing(false);
            if (res.data.profile) setProfile(res.data.profile);
            closeToastSoon();
        } catch (err) {
            console.error("[PROFILE] Save failed:", err?.response?.data || err);
            const msg = err?.response?.data?.message || "Failed to save profile.";
            setToast({ open: true, type: "error", msg });
            closeToastSoon();
        }
    };

    if (loading) return <CircularProgress sx={{ m: 5 }} />;

    return (
        <Box sx={{ py: 3 }}>
            <FormCard as={motion.div} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <Typography
                    variant="h6"
                    sx={{
                        // Original styles
                        textAlign: "center",
                        mb: 1,

                        // Styles from the "Billing" component
                        fontWeight: 800,
                        background: BRAND.gradient, // Using BRAND.gradient for the background
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: FONTS.display, // Added fontFamily for "Cinzel"
                        letterSpacing: .5,       // Added letterSpacing
                    }}
                >
                    PROFILE
                </Typography>


                {/* Avatar */}
                <Box sx={{ textAlign: "center", mb: 1 }}>
                    <AvatarWrap htmlFor="avatar-upload" title={isEditing ? "Change avatar" : ""}>
                        <HiddenFile
                            accept="image/*"
                            id="avatar-upload"
                            type="file"
                            onChange={handleFileChange}
                            disabled={!isEditing || uploadingAvatar}
                        />
                        <Avatar
                            src={preview || undefined}
                            sx={{
                                width: 96,
                                height: 96,
                                bgcolor: "#0f1219",
                                border: "3px solid rgba(255,255,255,0.08)",
                                color: BRAND.text,
                                fontWeight: 800,
                                opacity: uploadingAvatar ? 0.6 : 1,
                            }}
                        />
                    </AvatarWrap>
                    {profile?.FullName && (
                        <Typography sx={{ color: BRAND.text, fontWeight: 800, fontSize: 16, mb: 1 }}>
                            {profile.FullName}
                        </Typography>
                    )}
                </Box>

                {/* Identity */}
                <SectionTitle>Identity</SectionTitle>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NInput
                            fullWidth
                            label="Display Name"
                            name="DisplayName"
                            value={formData.DisplayName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput
                            fullWidth
                            type="date"
                            label="Date of Birth"
                            name="DateOfBirth"
                            value={formData.DateOfBirth}
                            onChange={handleChange}
                            disabled={!isEditing}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <NInput
                            fullWidth
                            multiline
                            rows={2}
                            label="Bio"
                            name="Bio"
                            value={formData.Bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                </Grid>

                {/* Contact & Address */}
                <SectionTitle>Contact & Address</SectionTitle>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Support Email" name="SupportEmail" value={formData.SupportEmail}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Support Phone" name="SupportPhone" value={formData.SupportPhone}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>

                    <Grid item xs={12}>
                        <NInput fullWidth label="Address" name="Address" value={formData.Address}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="City" name="City" value={formData.City}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="County" name="County" value={formData.County}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="Postal Code" name="PostalCode" value={formData.PostalCode}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                </Grid>

                {/* Identification */}
                <SectionTitle>Identification</SectionTitle>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="National ID" name="NationalID" value={formData.NationalID}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="KRA PIN" name="KRA_PIN" value={formData.KRA_PIN}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                </Grid>

                {/* M‑Pesa */}
                <SectionTitle>M‑Pesa Details</SectionTitle>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="Paybill" name="MpesaPaybill" value={formData.MpesaPaybill}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="Till" name="MpesaTill" value={formData.MpesaTill}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <NInput fullWidth label="Account Name" name="MpesaAccountName" value={formData.MpesaAccountName}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                </Grid>

                {/* Bank */}
                <SectionTitle>Bank Details</SectionTitle>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Bank Name" name="BankName" value={formData.BankName}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Bank Branch" name="BankBranch" value={formData.BankBranch}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Account Name" name="AccountName" value={formData.AccountName}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NInput fullWidth label="Account Number" name="AccountNumber" value={formData.AccountNumber}
                            onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 2 }}>
                    {!isEditing ? (
                        <NButton {...btnTap} onClick={() => setIsEditing(true)}>Edit Profile</NButton>
                    ) : (
                        <>
                            <NButton {...btnTap} onClick={handleSave}>Save Changes</NButton>
                            <NButton
                                {...btnTap}
                                style={{ background: "linear-gradient(90deg,#555,#333)" }}
                                onClick={() => { setIsEditing(false); fetchProfile(); }}
                            >
                                Cancel
                            </NButton>
                        </>
                    )}
                </Box>

                {/* Toasts */}
                <Collapse in={toast.open} appear>
                    <Alert sx={{ mt: 2, borderRadius: 2 }} severity={toast.type} variant="filled">
                        {toast.msg}
                    </Alert>
                </Collapse>
            </FormCard>
        </Box>
    );
}
