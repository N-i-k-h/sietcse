import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, GraduationCap, UserPlus, BookOpen,
    Layers
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { studentService } from '../../services/studentService';
import { facultyService } from '../../services/facultyService';
import { classService } from '../../services/classService';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        nonTeaching: 12, // Static/Placeholder
        classCount: 0,
        yearCounts: { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [students, faculty, classes] = await Promise.all([
                    studentService.getAll(),
                    facultyService.getAll(),
                    classService.getAll()
                ]);

                // Calculate Year Counts
                const newYearCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
                students.forEach((s: any) => {
                    const year = s.year || 0;
                    if (year >= 1 && year <= 4) {
                        newYearCounts[year]++;
                    }
                });

                setStats({
                    totalStudents: students.length,
                    totalFaculty: faculty.length,
                    nonTeaching: 12, // Placeholder
                    classCount: classes.length,
                    yearCounts: newYearCounts
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const donutData = [
        { name: '1st Year', value: stats.yearCounts[1], color: '#86EFAC' }, // Light Green 300
        { name: '2nd Year', value: stats.yearCounts[2], color: '#4ADE80' }, // Light Green 400
        { name: '3rd Year', value: stats.yearCounts[3], color: '#22C55E' }, // Primary (500)
        { name: '4th Year', value: stats.yearCounts[4], color: '#16A34A' }, // Light Green 600
    ];

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading dashboard analytics...</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-gray-500">SIET CSE Department Overview</p>
            </header>

            {/* Row 1: Primary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Students"
                    value={stats.totalStudents}
                    icon={GraduationCap}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Total Faculty"
                    value={stats.totalFaculty}
                    icon={Users}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    label="Non-Teaching Staff"
                    value={stats.nonTeaching}
                    icon={UserPlus}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    label="Active Classes"
                    value={stats.classCount}
                    icon={BookOpen}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Row 2: Analytics - Student Distribution (Donut) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Layers size={20} className="text-primary" />
                        Student Distribution
                    </h3>
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-[100px] lg:pr-[70px]">
                            <p className="text-xs text-gray-400 font-medium">Total</p>
                            <p className="text-2xl font-black text-gray-800">{stats.totalStudents}</p>
                        </div>
                    </div>
                </div>

                {/* Row 3: Info / Help (Placeholder for removed Alert Zone) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-full">
                        <BookOpen size={32} className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">System Monitoring</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                            Advanced attendance alerts and risk analysis modules are currently being configured.
                            Analytics will appear here once sufficient data is collected.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="text-primary hover:text-green-700 font-semibold text-sm"
                    >
                        Manage Students & Attendance &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 ${bg} ${color} rounded-xl`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);
