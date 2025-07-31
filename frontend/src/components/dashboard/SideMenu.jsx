import React from "react";
import {
    Box,

    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,

} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment"; // Reports
import HistoryIcon from "@mui/icons-material/History"; // Logs / History
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"; // Expenses

function SideMenu() {
    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon /> },
        { text: "Properties", icon: <HomeIcon /> },
        { text: "Tenants", icon: <PeopleIcon /> },
        { text: "Billing", icon: <ReceiptIcon /> },
        { text: "Payments", icon: <PaymentIcon /> },
        { text: "Expenses", icon: <AttachMoneyIcon /> },
        { text: "Reports", icon: <AssessmentIcon /> },
        { text: "Logs / History", icon: <HistoryIcon /> },
        { text: "Notifications", icon: <NotificationsIcon /> },
        { text: "Settings", icon: <SettingsIcon /> },
    ];

    return (
        <Box
            sx={{
                width: 240,
                background: "linear-gradient(180deg, #f9f9f9 0%, #ffffff 100%)",
                boxShadow: "2px 0 10px rgba(0,0,0,0.08)",
                p: 2,
                minHeight: "calc(100vh - 64px)",
                mt: 8,
                borderRight: "1px solid #e0e0e0",
            }}
        >


            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            sx={{
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "#e3f2fd",
                                    transform: "scale(1.02)",
                                    transition: "all 0.2s ease-in-out",
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: "#1976d2" }}>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>


        </Box>
    );
}

export default SideMenu;
