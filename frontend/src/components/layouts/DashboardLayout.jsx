import React, { useState } from "react";
import { Box } from "@mui/material";
import Header from "../dashboard/Header";
import Footer from "../dashboard/Footer";
import SideMenu from "../dashboard/SideMenu";
import Profile from "../../pages/dashboard/Profile";
import Billing from "../../pages/dashboard/Billing";
import Expenses from "../../pages/dashboard/Expenses";
import Properties from "../../pages/dashboard/Properties";
import Tenants from "../../pages/dashboard/Tenants";
import HistoryLogs from "../../pages/dashboard/HistoryLogs";
import Settings from "../../pages/dashboard/Settings";
import Notification from "../../pages/dashboard/Notification";
import Payments from "../../pages/dashboard/Payments";
import Reports from "../../pages/dashboard/Reports"

import DashboardHome from "../../pages/dashboard/DashboardHome";



export default function DashboardLayout() {
    const [activePage, setActivePage] = useState("dashboard");

    const renderContent = () => {
        switch (activePage) {
            case "billing":
                return <Billing />;
            case "expenses":
                return <Expenses />;
            case "properties":
                return <Properties />;
            case "tenants":
                return <Tenants />;
            case "historylogs":
                return <HistoryLogs />;
            case "profile":
                return <Profile />;
            case "settings":
                return <Settings />;
            case "notifications":
                return <Notification />;
            case "payments":
                return <Payments />;
            case "reports":
                return <Reports />;

            default:
                return <DashboardHome />; // ✅ Default page
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
