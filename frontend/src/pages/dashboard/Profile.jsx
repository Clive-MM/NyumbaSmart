import React, { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, CircularProgress, Paper, TextField, Grid, Fab, Tooltip, Snackbar, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import axios from "axios";

const Input = styled("input")({ display: "none" });

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: 20,
    background: "#e0e0e0",
    boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    maxWidth: 520,
    margin: "auto",
    textAlign: "center",
}));

const StyledTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: "#e0e0e0",
        boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
    },
    "& .MuiInputLabel-root": { fontWeight: 500 },
});

const NeumorphicFab = styled(Fab)({
    background: "#e0e0e0",
    boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
    "&:active": { boxShadow: "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff" },
});

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        ProfilePicture: null,
        Address: "",
        NationalID: "",
        KRA_PIN: "",
        Bio: "",
        DateOfBirth: "",
    });
    const [preview, setPreview] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const fetchProfile = () => {
        axios
            .get("http://127.0.0.1:5000/viewprofile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => {
                setProfile(res.data);
                setFormData({
                    ProfilePicture: null,
                    Address: res.data.Address || "",
                    NationalID: res.data.NationalID || "",
                    KRA_PIN: res.data.KRA_PIN || "",
                    Bio: res.data.Bio || "",
                    DateOfBirth: res.data.DateOfBirth || "",
                });
                setPreview(res.data.ProfilePicture || null);
            })
            .catch(() => setAlert({ open: true, message: "❌ Failed to load profile", severity: "error" }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, ProfilePicture: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = () => {
        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key]) form.append(key, formData[key]);
        });

        const method = profile && profile.Address ? "put" : "post";
        const url =
            method === "post"
                ? "http://127.0.0.1:5000/create_profile"
                : "http://127.0.0.1:5000/refreshprofile";

        axios({
            method,
            url,
            data: form,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
            },
        })
            .then((res) => {
                setAlert({ open: true, message: res.data.message, severity: "success" });
                setIsEditing(false);

                if (res.data.profile) {
                    setProfile(res.data.profile);
                    setPreview(res.data.profile.ProfilePicture || preview);
                }
            })
            .catch((err) => {
                setAlert({
                    open: true,
                    message: err.response?.data?.message || "❌ Failed to save profile",
                    severity: "error",
                });
            });
    };

    if (loading) return <CircularProgress sx={{ m: 5 }} />;

    return (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <StyledPaper>
                <label htmlFor="avatar-upload">
                    <Input accept="image/*" id="avatar-upload" type="file" onChange={handleFileChange} disabled={!isEditing} />
                    <Avatar
                        src={preview}
                        sx={{
                            width: 110,
                            height: 110,
                            mx: "auto",
                            mb: 2,
                            bgcolor: "#e0e0e0",
                            border: "3px solid #ccc",
                            boxShadow: "4px 4px 10px #bebebe, -4px -4px 10px #ffffff",
                            cursor: isEditing ? "pointer" : "default",
                            "&:hover": isEditing ? { opacity: 0.8 } : {},
                        }}
                    />
                </label>

                {profile?.FullName && (
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: "#333" }}>
                        {profile.FullName}
                    </Typography>
                )}

                <StyledTextField fullWidth label="Bio" name="Bio" value={formData.Bio} onChange={handleChange} disabled={!isEditing} multiline rows={2} sx={{ mb: 2 }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Address" name="Address" value={formData.Address} onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
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
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="National ID" name="NationalID" value={formData.NationalID} onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="KRA PIN" name="KRA_PIN" value={formData.KRA_PIN} onChange={handleChange} disabled={!isEditing} />
                    </Grid>
                </Grid>

                {!isEditing ? (
                    <Tooltip title="Edit Profile">
                        <NeumorphicFab onClick={() => setIsEditing(true)}>
                            <EditIcon />
                        </NeumorphicFab>
                    </Tooltip>
                ) : (
                    <Box display="flex" gap={3} justifyContent="center">
                        <Tooltip title="Save Changes">
                            <NeumorphicFab sx={{ color: "green" }} onClick={handleSave}>
                                <SaveIcon />
                            </NeumorphicFab>
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <NeumorphicFab sx={{ color: "red" }} onClick={() => setIsEditing(false)}>
                                <CloseIcon />
                            </NeumorphicFab>
                        </Tooltip>
                    </Box>
                )}
            </StyledPaper>

            {/* ✅ Snackbar Notifications */}
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert severity={alert.severity} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
