import React, { useState } from "react";
import { Box } from "@mui/material";
import Header from "../dashboard/Header";
import Footer from "../dashboard/Footer";
import SideMenu from "../dashboard/SideMenu";
import Profile from "../../pages/dashboard/Profile"; // ✅ Import Profile component

export default function DashboardLayout() {
    const [activePage, setActivePage] = useState("dashboard"); // ✅ Track active page

    const renderContent = () => {
        switch (activePage) {
            case "profile":
                return <Profile />;
            default:
                return <h2>Welcome to NyumbaSmart Dashboard</h2>; // ✅ Default page
        }
    };

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            {/* ✅ Pass setActivePage to Header */}
            <Header setActivePage={setActivePage} />

            <Box display="flex" flexGrow={1}>
                <SideMenu setActivePage={setActivePage} /> {/* ✅ Pass to SideMenu too */}

                <Box component="main" flexGrow={1} p={3} sx={{ mt: 8 }}>
                    {renderContent()} {/* ✅ Render based on activePage */}
                </Box>
            </Box>

            <Footer />
        </Box>
    );
}
