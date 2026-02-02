import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Calendar,
    LogOut, GraduationCap, Settings, UserCircle,
    ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import type { Role } from '../../types';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!user) return null;

    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Faculty Management', path: '/admin/faculty', icon: Users },
        { name: 'Student List', path: '/admin/students', icon: GraduationCap },
        { name: 'Class Setup', path: '/admin/academics', icon: BookOpen }, // Mapping to Academics
        { name: 'Timetable Master', path: '/admin/academics', icon: Calendar }, // Mapping to Academics
        { name: 'Settings', path: '/admin/settings', icon: Settings }, // Placeholder
    ];

    const roleLinks: Record<Role, { name: string; path: string; icon: any }[]> = {
        admin: adminLinks,
        hod: [
            { name: 'Dashboard', path: '/hod', icon: LayoutDashboard },
            { name: 'Dept. Overview', path: '/hod/overview', icon: Users },
            { name: 'Faculty Search', path: '/hod/faculty', icon: UserCircle },
        ],
        staff: [
            { name: 'My Schedule', path: '/staff/schedule', icon: Calendar },
            { name: 'Attendance', path: '/staff/attendance', icon: Users },
            { name: 'Marks Entry', path: '/staff/marks', icon: BookOpen },
        ],
        student: [
            { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
            { name: 'Profile Report', path: '/student/profile', icon: UserCircle },
        ]
    };

    const currentLinks = roleLinks[user.role] || [];

    return (
        <aside
            className={clsx(
                "fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-50 shadow-xl shadow-green-900/5",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
                <div className={clsx("font-black text-2xl tracking-tight text-primary flex items-center gap-2", isCollapsed && "justify-center w-full")}>
                    {isCollapsed ? "S" : "SIET"}
                </div>
                {!isCollapsed && (
                    <button onClick={() => setIsCollapsed(true)} className="text-gray-400 hover:text-primary transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Collapse Toggle (Visible only when collapsed) */}
            {isCollapsed && (
                <div className="flex justify-center py-4 border-b border-gray-50">
                    <button onClick={() => setIsCollapsed(false)} className="text-gray-400 hover:text-primary transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {currentLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/admin' || link.path === '/hod' || link.path === '/student' || link.path === '/staff'} // Strict match for roots
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group font-medium",
                            isActive
                                ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                : "text-gray-500 hover:bg-green-50 hover:text-green-600",
                            isCollapsed && "justify-center px-0"
                        )}
                        title={isCollapsed ? link.name : undefined}
                    >
                        <link.icon size={20} className={clsx("shrink-0", isCollapsed ? "" : "")} />
                        {!isCollapsed && <span>{link.name}</span>}

                        {/* Tooltip for collapsed state could go here */}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Area */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                <button
                    onClick={logout}
                    className={clsx(
                        "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};
