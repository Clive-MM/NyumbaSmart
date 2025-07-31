import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, CircularProgress, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => {
                setProfile(res.data.profile);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <CircularProgress sx={{ m: 5 }} />;

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
            <Paper sx={{ p: 3, textAlign: "center", boxShadow: 3 }}>
                <Avatar
                    src={profile?.ProfilePicture || "https://i.pravatar.cc/150?img=3"}
                    sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold">
                    {profile?.user?.FullName || "No Name"}
                </Typography>
                <Typography color="text.secondary">{profile?.Bio || "No bio yet"}</Typography>

                <Typography sx={{ mt: 2 }}>
                    📍 Address: {profile?.Address || "Not set"}
                </Typography>
                <Typography>🆔 National ID: {profile?.NationalID || "Not set"}</Typography>
                <Typography>🧾 KRA PIN: {profile?.KRA_PIN || "Not set"}</Typography>
                <Typography>
                    🎂 Date of Birth: {profile?.DateOfBirth || "Not set"}
                </Typography>

                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => navigate("/profile/edit")}
                >
                    Edit Profile
                </Button>
            </Paper>
        </Box>
    );
};

export default Profile;
