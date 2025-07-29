import React from "react";
import { Box } from "@mui/material";
import Header from "../dashboard/Header";
import Footer from "../dashboard/Footer";
import SideMenu from "../dashboard/SideMenu"; // ✅ Import SideMenu

export default function DashboardLayout({ children }) {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            {/* ✅ Header */}
            <Header />

            {/* ✅ Main Section with SideMenu and Content */}
            <Box display="flex" flexGrow={1}>
                {/* ✅ Side Menu */}
                <SideMenu />

                {/* ✅ Main Content */}
                <Box component="main" flexGrow={1} p={3} sx={{ mt: 8 }}>
                    {children}
                </Box>
            </Box>

            {/* ✅ Footer */}
            <Footer />
        </Box>
    );
}
