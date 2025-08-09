// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";

// Header exports height/top so we can reserve space beneath it
import Header, { HEADER_HEIGHT, HEADER_TOP } from "../dashboard/Header";

// SideMenu exposes its expanded/collapsed widths and notifies on change
import SideMenu, {
    SIDEBAR_EXPANDED,
    SIDEBAR_COLLAPSED,
} from "../dashboard/SideMenu";

import Profile from "../../pages/dashboard/Profile";
import Billing from "../../pages/dashboard/Billing";
import Expenses from "../../pages/dashboard/Expenses";
import Properties from "../../pages/dashboard/Properties";
import Tenants from "../../pages/dashboard/Tenants";
import HistoryLogs from "../../pages/dashboard/HistoryLogs";
import Settings from "../../pages/dashboard/Settings";
import Notification from "../../pages/dashboard/Notification";
import Payments from "../../pages/dashboard/Payments";
import Reports from "../../pages/dashboard/Reports";
import DashboardHome from "../../pages/dashboard/DashboardHome";

export default function DashboardLayout() {
    const [activePage, setActivePage] = useState("dashboard");

    // keep current sidebar width in sync with SideMenu (expanded by default)
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_EXPANDED);

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
                return <DashboardHome />;
        }
    };

    // space reserved for the fixed, rounded header
    const CONTENT_OFFSET = HEADER_TOP + HEADER_HEIGHT + 8; // 16 + 72 + 8 = 96px

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F7FAFC" }}>
            {/* Sidebar — reports width changes to parent */}
            <SideMenu
                setActivePage={setActivePage}
                onWidthChange={(w) => setSidebarWidth(w ?? SIDEBAR_COLLAPSED)}
            />

            {/* Header — sized/positioned using the live sidebar width */}
            <Header
                sidebarWidth={sidebarWidth}
                onOpenSettings={() => setActivePage("settings")}
                onLogout={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }}
            />

            {/* Main content — shifts right by sidebar width and down by header height */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    ml: `${sidebarWidth}px`,
                    pt: `${CONTENT_OFFSET}px`,
                    px: { xs: 2, md: 3 },
                    transition: "margin-left .28s ease, padding-top .2s ease",
                }}
            >
                {renderContent()}
            </Box>
        </Box>
    );
}
