// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";

// Header now only exports HEADER_HEIGHT (top margin = 0 inside Header)
import Header, { HEADER_HEIGHT } from "../dashboard/Header";

// Sidebar reports its live width
import SideMenu, {
    SIDEBAR_EXPANDED,
    SIDEBAR_COLLAPSED,
} from "../dashboard/SideMenu";

// Pages
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

    // Track the current sidebar width (expanded by default)
    const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_EXPANDED);

    // Header sits flush to the top; reserve just its height
    const CONTENT_OFFSET = HEADER_HEIGHT + 8; // + progress rail

    // Keep body padding in sync with Header's side gap (16px)
    const SIDE_GAP_PX = 16;

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

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar */}
            <SideMenu
                setActivePage={setActivePage}
                onWidthChange={(w) => setSidebarWidth(w ?? SIDEBAR_COLLAPSED)}
            />

            {/* Header (fixed, uses live sidebar width) */}
            <Header
                sidebarWidth={sidebarWidth}
                onOpenSettings={() => setActivePage("settings")}
                onLogout={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }}
            />

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    ml: `${sidebarWidth}px`,
                    pt: `${CONTENT_OFFSET}px`,
                    px: `${SIDE_GAP_PX}px`, // keep same side gap as Header
                    transition: "margin-left .28s ease, padding-top .2s ease",
                }}
            >
                {renderContent()}
            </Box>
        </Box>
    );
}
