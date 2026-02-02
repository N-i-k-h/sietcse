import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import type { User, Student } from '../../types';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, BookOpen, Fingerprint } from 'lucide-react';

interface ProfileReportProps {
    user: Student; // Strictly for students now, can be extended
}

export const ProfileReport = ({ user }: ProfileReportProps) => {
    // Transform data for Recharts
    const attendanceData = Object.entries(user.attendance).map(([subject, percent]) => ({
        name: subject,
        present: percent,
        absent: 100 - percent
    }));

    const marksData = Object.entries(user.marks.midterm).map(([subject, marks]) => ({
        subject,
        midterm: marks,
        lab: user.marks.lab[subject] || 0
    }));

    const COLORS = ['#22C55E', '#E5E7EB']; // Green vs Gray

    // Calculate overall attendance for Pie Chart
    const totalClasses = Object.keys(user.attendance).length * 100;
    const totalPresent = Object.values(user.attendance).reduce((a, b) => a + b, 0);
    const overallPercentage = Math.round((totalPresent / totalClasses) * 100);

    const overallAttendanceData = [
        { name: 'Present', value: overallPercentage },
        { name: 'Absent', value: 100 - overallPercentage },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* 1. Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8"
            >
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-green-300 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-green-200">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500">
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                            <Fingerprint size={16} /> {user.usn}
                        </span>
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                            <Mail size={16} /> {user.email}
                        </span>
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-sm">
                            <BookOpen size={16} /> Sem {user.semester} • Section {user.section}
                        </span>
                    </div>
                </div>
                {/* Quick Stat Pill */}
                <div className="text-center bg-green-50 px-6 py-4 rounded-xl border border-green-100">
                    <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Overall Attendance</p>
                    <p className="text-4xl font-black text-green-700">{overallPercentage}%</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Attendance Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-primary rounded-r-full"></span>
                        Attendance Breakdown
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F3F4F6' }}
                                />
                                <Bar dataKey="present" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={20} name="Present %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. Academic Performance */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-r-full"></span>
                        Performance Report
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={marksData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="midterm" fill="#3B82F6" name="Midterm (25)" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="lab" fill="#A855F7" name="Lab (50)" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

        </div>
    );
};
