import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExpandableMenuVertical from "./menuVertical";
import { FORM_TABS } from "../cards/Forms/config/forms";
import { useAuth } from "../../../context/AuthContext";

import {
    faPlus,
    faHome,
    faMagnifyingGlass,
    faClockRotateLeft,
    faUser,
    faGraduationCap,
    faCalendarDays,
    faTableCells,
    faBuilding,
    faBook,
} from "@fortawesome/free-solid-svg-icons";

/* Icon per form tab */

const TAB_ICONS = {
    grade: faGraduationCap,
    academicYear: faCalendarDays,
    timetable: faTableCells,
    department: faBuilding,
    subject: faBook,
    user: faUser,
    book: faBook,
    teacherAssignment: faGraduationCap,
    teacherGradeCoordinator: faUser,
    teacherProfileForm: faUser,
};


/* ---------- Modal ---------- */
function FormModal({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#151515]">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/10">
                    <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 6l12 12M6 18L18 6" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-1">{children}</div>
            </div>
        </div>
    );
}

/* ---------- Floating Menu ---------- */
export default function FloatingMenu({
    directions = ["up", "left"],
    spacing = 75,
    showNav = true,
}) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [modalKey, setModalKey] = useState(null);

    const role = user?.role;

    /* ---- role check, inline, nothing fancy ---- */
    let allowedTabs = [];

    if (role === "Admin") {
        // Admin sees every tab
        allowedTabs = FORM_TABS;
    } else if (role === "Librarian") {
        // Librarian sees only library-related tabs
        allowedTabs = FORM_TABS.filter((t) =>
            ["book", "issue", "category"].includes(t.key)
        );
    } else {
        // Anything else: no form tabs
        allowedTabs = [];
    }

    const activeTab = allowedTabs.find((t) => t.key === modalKey);

    /* Nav items — only for logged-in users who have something to see */
    const navItems =
        showNav && user
            ? [
                  { id: "home",    label: "Home",    icon: faHome,            onClick: () => navigate("/admin") },
                  { id: "search",  label: "Search",  icon: faMagnifyingGlass, onClick: () => console.log("search") },
                  { id: "history", label: "History", icon: faClockRotateLeft, onClick: () => navigate("/admin/history") },
                  { id: "Dashboard", label: "Dashboard", icon: faUser,            onClick: () => navigate("/admin/profile") },
              ]
            : [];

    /* Build the create-item list from allowed tabs */
    const formItems = allowedTabs.map((tab) => ({
        id: `create-${tab.key}`,
        label: tab.label,
        icon: TAB_ICONS[tab.key] ?? faPlus,
        onClick: () => setModalKey(tab.key),
    }));

    const menuItems = [...navItems, ...formItems];

    /* Hide the FAB if there's nothing to show */
    if (!user || menuItems.length === 0) return null;

    
    const ActiveForm = activeTab?.Component;

    const modalTitle =
        activeTab?.key === "teacherProfileForm"
            ? "Create Teacher or Student Profile"
            : `Create ${activeTab?.label ?? ""}`;


    return (
        <>
            <ExpandableMenuVertical
                directions={directions}
                spacing={spacing}
                items={menuItems}
            />

            
                <FormModal
                    open={!!modalKey}
                    onClose={() => setModalKey(null)}
                    title={modalTitle}
                >
                    {ActiveForm && (
                        <ActiveForm
                            onSuccess={() => setModalKey(null)}
                            onCancel={() => setModalKey(null)}
                        />
                    )}
                </FormModal>

        </>
    );
}