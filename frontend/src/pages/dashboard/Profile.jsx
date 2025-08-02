import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    CircularProgress,
    Paper,
    TextField,
    Grid,
    Fab,
    Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import axios from "axios";

const Input = styled("input")({
    display: "none",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: 16,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
    background: "#f9fafc",
    textAlign: "center",
    maxWidth: 500,
    margin: "auto",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 10,
        background: "#fff",
    },
    "& .MuiInputLabel-root": {
        fontWeight: 500,
    },
}));

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

    useEffect(() => {
        axios
            .get("/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => {
                const data = res.data.profile;
                setProfile(data);
                setFormData({
                    ProfilePicture: data?.ProfilePicture || null,
                    Address: data?.Address || "",
                    NationalID: data?.NationalID || "",
                    KRA_PIN: data?.KRA_PIN || "",
                    Bio: data?.Bio || "",
                    DateOfBirth: data?.DateOfBirth || "",
                });
                setPreview(data?.ProfilePicture || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, ProfilePicture: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const form = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key]) form.append(key, formData[key]);
        });

        axios
            .post("/profile", form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(() => {
                alert("✅ Profile saved successfully!");
                setIsEditing(false);
            })
            .catch(() => alert("❌ Failed to save profile"));
    };

    if (loading) return <CircularProgress sx={{ m: 5 }} />;

    return (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <StyledPaper>
                {/* ✅ Avatar Section */}
                <label htmlFor="avatar-upload">
                    <Input
                        accept="image/*"
                        id="avatar-upload"
                        type="file"
                        onChange={handleFileChange}
                        disabled={!isEditing}
                    />
                    <Avatar
                        src={preview}
                        sx={{
                            width: 110,
                            height: 110,
                            mx: "auto",
                            mb: 1,
                            bgcolor: "#E0E0E0",
                            border: "3px solid #1976D2",
                            cursor: isEditing ? "pointer" : "default",
                            "&:hover": isEditing ? { opacity: 0.8 } : {},
                        }}
                    />
                </label>

                {profile?.user?.FullName && (
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E3A8A" }}
                    >
                        {profile.user.FullName}
                    </Typography>
                )}

                {/* ✅ Editable Fields */}
                <StyledTextField
                    fullWidth
                    label="Bio"
                    name="Bio"
                    value={formData.Bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            fullWidth
                            label="Address"
                            name="Address"
                            value={formData.Address}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
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
                        <StyledTextField
                            fullWidth
                            label="National ID"
                            name="NationalID"
                            value={formData.NationalID}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            fullWidth
                            label="KRA PIN"
                            name="KRA_PIN"
                            value={formData.KRA_PIN}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                </Grid>

                {/* ✅ Floating Action Buttons */}
                {!isEditing ? (
                    <Tooltip title="Edit Profile">
                        <Fab
                            color="primary"
                            onClick={() => setIsEditing(true)}
                            sx={{ mt: 1 }}
                        >
                            <EditIcon />
                        </Fab>
                    </Tooltip>
                ) : (
                    <Box display="flex" gap={3} justifyContent="center">
                        <Tooltip title="Save Changes">
                            <Fab color="success" onClick={handleSave}>
                                <SaveIcon />
                            </Fab>
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <Fab
                                color="error"
                                onClick={() => setIsEditing(false)}
                            >
                                <CloseIcon />
                            </Fab>
                        </Tooltip>
                    </Box>
                )}
            </StyledPaper>
        </Box>
    );
}
