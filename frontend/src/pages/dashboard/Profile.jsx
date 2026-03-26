// src/pages/dashboard/Profile.jsx
import React, { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, CircularProgress, Alert, Collapse, Grid, alpha
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/* ---------- Branding & Constants (Synced for Light Theme) ---------- */
const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    orange: "#E8511E",
    purple: "#7E00A6",
    blue: "#456BBC",
    text: "#1A1D23",      // Darker text for light background
    subtext: "#64748B",   // Muted slate for labels
    glassWhite: "rgba(255, 255, 255, 0.85)",
};

const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.orange}, ${BRAND.blue}, ${BRAND.purple})`;

const FONTS = {
    display: `"Cinzel", ui-serif, Georgia, serif`,
    subhead: `"Nunito", ui-sans-serif, system-ui`,
    number: `"Sora", ui-sans-serif, system-ui`,
};

/* ---------- Animations ---------- */
const glareSweep = keyframes`
  0% { transform: translateX(-120%) rotate(18deg); opacity: 0; }
  10% { opacity: .30; } 50% { opacity: .40; } 90% { opacity: .10; }
  100% { transform: translateX(120%) rotate(18deg); opacity: 0; }
`;

/* ---------- Styled Components ---------- */
const FormCard = styled(Box)({
    maxWidth: 980,
    width: "100%",
    borderRadius: 24,
    padding: 32,
    marginInline: "auto",
    position: "relative",
    // Light Glassmorphism
    background: `linear-gradient(135deg, ${alpha('#fff', 0.90)}, ${alpha('#f8fafc', 0.85)})`,
    backdropFilter: "saturate(160%) blur(18px)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)",
    overflow: "hidden",
    isolation: "isolate",
    "&::before": {
        content: '""',
        position: "absolute",
        top: -100, bottom: -100, left: 0, width: "50%",
        background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))",
        transform: "translateX(-120%) rotate(18deg)",
        animation: `${glareSweep} 7s ease-in-out infinite`,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        zIndex: 1,
    },
});

const NInput = styled(TextField)({
    marginTop: 12,
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.6)", 
        color: BRAND.text,
        // Light Neumorphism: Inner shadow for "pressed" look
        boxShadow: `inset 2px 2px 5px rgba(0,0,0,0.03), inset -2px -2px 5px rgba(255,255,255,0.8)`,
        "& fieldset": { borderColor: "rgba(0,0,0,0.04)" },
        "&.Mui-focused fieldset": { borderColor: alpha(BRAND.pink, 0.2) },
        "&.Mui-focused": {
            background: "#fff",
            boxShadow: `0 8px 16px ${alpha(BRAND.pink, 0.08)}`,
        },
    },
    "& .MuiInputLabel-root": { color: BRAND.subtext, fontSize: "0.85rem", fontWeight: 600 },
});

const NButton = styled(motion.button)({
    borderRadius: 12,
    background: brandGradient,
    color: "#fff",
    fontWeight: 800,
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    minWidth: 160,
    boxShadow: `0 10px 20px ${alpha(BRAND.pink, 0.3)}`,
    fontFamily: FONTS.subhead,
    textTransform: "uppercase",
    letterSpacing: 1,
});

const CompletenessBar = styled(Box)(({ percent }) => ({
    width: "100%",
    height: 6,
    borderRadius: 3,
    background: "rgba(0,0,0,0.05)",
    position: "relative",
    overflow: "hidden",
    marginTop: 8,
    "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: `${percent}%`,
        background: brandGradient,
        transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
    }
}));

const SectionTitle = ({ children }) => (
    <Typography
        variant="subtitle2"
        sx={{
            mt: 4,
            mb: 1.5,
            fontWeight: 900,
            fontFamily: FONTS.display,
            color: BRAND.pink, // Uniform pink color
            letterSpacing: 1.8,
            textTransform: "uppercase",
            // Underline removed as requested
            display: "block", 
            textAlign: "left"
        }}
    >
        {children}
    </Typography>
);

const AvatarWrap = styled("label")({
    display: "grid",
    placeItems: "center",
    width: 120,
    height: 120,
    margin: "0 auto 16px",
    borderRadius: "50%",
    position: "relative",
    cursor: "pointer",
    background: "#fff",
    border: `1px solid ${alpha(BRAND.blue, 0.1)}`,
    boxShadow: `0 10px 25px ${alpha(BRAND.blue, 0.15)}`,
    transition: "all .3s ease",
    "&:hover": { transform: "scale(1.05)", boxShadow: `0 12px 30px ${alpha(BRAND.pink, 0.2)}` },
});

/* ---------- Main Component ---------- */
export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        DisplayName: "", Bio: "", DateOfBirth: "",
        Address: "", City: "", County: "", PostalCode: "",
        SupportEmail: "", SupportPhone: "",
        NationalID: "", KRA_PIN: "",
        MpesaPaybill: "", MpesaTill: "", MpesaAccountName: "",
        BankName: "", BankBranch: "", AccountName: "", AccountNumber: "",
    });

    const [preview, setPreview] = useState(null);
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/viewprofile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setProfile(res.data);
            setFormData(res.data);
            setPreview(res.data.ProfilePicture);
        } catch (err) {
            setToast({ open: true, type: "error", msg: "Welcome! Complete your profile." });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append("ProfilePicture", file);

        try {
            const res = await axios.post(`${API_URL}/profile/avatar`, fd, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setProfile(res.data.profile);
            setToast({ open: true, type: "success", msg: "Avatar updated!" });
        } catch (err) {
            setToast({ open: true, type: "error", msg: "Upload failed." });
        } finally { setUploadingAvatar(false); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        setLoading(true);
        const hasProfile = !!profile;
        const url = hasProfile ? `${API_URL}/refreshprofile` : `${API_URL}/create_profile`;
        const method = hasProfile ? "put" : "post";

        try {
            const res = await axios({
                method, url, data: formData,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setProfile(res.data.profile);
            setIsEditing(false);
            setToast({ open: true, type: "success", msg: "Profile successfully saved!" });
        } catch (err) {
            setToast({ open: true, type: "error", msg: "Save failed. Please check inputs." });
        } finally { setLoading(false); }
    };

    if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}><CircularProgress color="secondary" /></Box>;

    return (
        <Box sx={{ pt: 0, pb: 8, px: 2 }}>
            <FormCard as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Header Section */}
                <Typography 
    variant="h4" 
    sx={{ 
        fontFamily: FONTS.display, 
        textAlign: 'center', 
        mb: 1, 
        // CHANGE: Set color to BRAND.pink and remove gradient/transparent fill
        color: BRAND.pink, 
        fontWeight: 900, 
        letterSpacing: 3 
    }}
>
    LANDLORD PROFILE
</Typography>

                {/* Completeness Tracker */}
                <Box sx={{ mb: 5, textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
                    <Typography variant="caption" sx={{ color: BRAND.subtext, fontWeight: 700, letterSpacing: 1 }}>
                        PROFILE STRENGTH: {profile?.completeness || 0}%
                    </Typography>
                    <CompletenessBar percent={profile?.completeness || 0} />
                </Box>

                {/* Avatar Section */}
                <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', mb: 2 }}>
    <AvatarWrap htmlFor="avatar-upload">
        <input hidden accept="image/*" id="avatar-upload" type="file" onChange={handleFileChange} disabled={!isEditing} />
        
        <Avatar 
            src={preview} 
            sx={{ 
                width: 106, 
                height: 106, 
                // CHANGE 1: Background is now pinkish (alpha adds subtle transparency)
                bgcolor: alpha(BRAND.pink, 0.1), 
                // CHANGE 2: Solid pink border for uniformity
                border: `3px solid ${BRAND.pink}`,
                // Optional: color of initials if no image is present
                color: BRAND.pink,
                fontWeight: 900,
                fontSize: '2rem',
                fontFamily: FONTS.display
            }} 
        >
            {/* This shows initials if 'preview' is empty/null */}
            {!preview && formData.DisplayName?.charAt(0).toUpperCase()}
        </Avatar>

        {uploadingAvatar && (
            <CircularProgress 
                size={120} 
                sx={{ 
                    position: 'absolute', 
                    color: BRAND.pink,
                    top: -7, // Adjusted to sit perfectly around the new border
                    left: -7 
                }} 
            />
        )}
    </AvatarWrap>
</Box>

                {/* Form Sections */}
                <SectionTitle>Identity & Bio</SectionTitle>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><NInput fullWidth label="Display Name" name="DisplayName" value={formData.DisplayName} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={6}><NInput fullWidth type="date" label="Date of Birth" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleChange} disabled={!isEditing} InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12}><NInput fullWidth multiline rows={2} label="Short Bio" name="Bio" value={formData.Bio} onChange={handleChange} disabled={!isEditing} /></Grid>
                </Grid>

                <SectionTitle>Contact & Address</SectionTitle>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><NInput fullWidth label="Business Email" name="SupportEmail" value={formData.SupportEmail} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={6}><NInput fullWidth label="Business Phone" name="SupportPhone" value={formData.SupportPhone} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12}><NInput fullWidth label="Physical Address" name="Address" value={formData.Address} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="City" name="City" value={formData.City} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="County" name="County" value={formData.County} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="Postal Code" name="PostalCode" value={formData.PostalCode} onChange={handleChange} disabled={!isEditing} /></Grid>
                </Grid>

                <SectionTitle>Statutory & Payments</SectionTitle>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><NInput fullWidth label="National ID" name="NationalID" value={formData.NationalID} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={6}><NInput fullWidth label="KRA PIN" name="KRA_PIN" value={formData.KRA_PIN} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="M-Pesa Paybill" name="MpesaPaybill" value={formData.MpesaPaybill} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="M-Pesa Till" name="MpesaTill" value={formData.MpesaTill} onChange={handleChange} disabled={!isEditing} /></Grid>
                    <Grid item xs={12} sm={4}><NInput fullWidth label="Bank Account" name="AccountNumber" value={formData.AccountNumber} onChange={handleChange} disabled={!isEditing} /></Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 8 }}>
                    {!isEditing ? (
                        <NButton onClick={() => setIsEditing(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Edit Profile</NButton>
                    ) : (
                        <>
                            <NButton onClick={handleSave} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Save Changes</NButton>
                            <NButton 
                                onClick={() => { setIsEditing(false); fetchProfile(); }} 
                                style={{ background: "rgba(0,0,0,0.05)", color: BRAND.text, border: '1px solid rgba(0,0,0,0.1)' }}
                            >
                                Cancel
                            </NButton>
                        </>
                    )}
                </Box>

                <Collapse in={toast.open} sx={{ mt: 4 }}>
                    <Alert severity={toast.type} variant="filled" onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: 3 }}>
                        {toast.msg}
                    </Alert>
                </Collapse>

            </FormCard>
        </Box>
    );
}