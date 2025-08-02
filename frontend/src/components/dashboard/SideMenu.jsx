import React, { useState } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MenuIcon from "@mui/icons-material/Menu";

const NeumorphicBox = styled(Box)(({ isCollapsed }) => ({
    width: isCollapsed ? 80 : 240,
    padding: "1rem 0.5rem",
    marginTop: "64px",
    minHeight: "calc(100vh - 64px)",
    background: "#e0e0e0",
    borderRadius: "0 20px 20px 0",
    boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    transition: "width 0.3s ease-in-out, box-shadow 0.3s",
    overflow: "hidden",
}));

const NeumorphicListItemButton = styled(ListItemButton)(({ active }) => ({
    borderRadius: "10px",
    marginBottom: "8px",
    padding: "10px 14px",
    background: active ? "#d4d4d4" : "transparent",
    boxShadow: active
        ? "inset 4px 4px 6px #bebebe, inset -4px -4px 6px #ffffff"
        : "none",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
        backgroundColor: "rgba(69, 107, 188, 0.15)",
        transform: "scale(1.03)",
    },
}));

export default function SideMenu({ setActivePage }) {
    const [activePage, setActive] = useState("dashboard");
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { text: "", icon: <MenuIcon />, page: "toggle" }, // ✅ Collapse Button First
        { text: "Dashboard", icon: <DashboardIcon />, page: "dashboard" },
        { text: "Properties", icon: <HomeIcon />, page: "properties" },
        { text: "Tenants", icon: <PeopleIcon />, page: "tenants" },
        { text: "Billing", icon: <ReceiptIcon />, page: "billing" },
        { text: "Payments", icon: <PaymentIcon />, page: "payments" },
        { text: "Expenses", icon: <AttachMoneyIcon />, page: "expenses" },
        { text: "Reports", icon: <AssessmentIcon />, page: "reports" },
        { text: "History Logs", icon: <HistoryIcon />, page: "historylogs" },
        { text: "Notifications", icon: <NotificationsIcon />, page: "notifications" },
        { text: "Settings", icon: <SettingsIcon />, page: "settings" },
    ];

    return (
        <NeumorphicBox isCollapsed={collapsed}>
            <List>
                {menuItems.map((item, index) => (
                    <Tooltip
                        key={index}
                        title={collapsed && item.text ? item.text : ""}
                        placement="right"
                        arrow
                    >
                        <ListItem disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ width: "100%" }}
                            >
                                <NeumorphicListItemButton
                                    active={activePage === item.page ? 1 : 0}
                                    onClick={() => {
                                        if (item.page === "toggle") {
                                            setCollapsed(!collapsed); // ✅ Collapse/Expand
                                        } else {
                                            setActive(item.page);
                                            setActivePage(item.page);
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: "#456BBC", minWidth: 40 }}>
                                        {item.icon}
                                    </ListItemIcon>

                                    {!collapsed && item.text && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontSize: "0.95rem",
                                                fontWeight: 500,
                                                color: "#333",
                                            }}
                                        />
                                    )}
                                </NeumorphicListItemButton>
                            </motion.div>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </NeumorphicBox>
    );
}
