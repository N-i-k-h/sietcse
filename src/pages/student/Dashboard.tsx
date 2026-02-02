import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProfileReport } from '../../components/common/ProfileReport';
import { Calendar, Clock, Bell } from 'lucide-react';
import type { Student } from '../../types';
import { studentService } from '../../services/studentService';

export const StudentDashboard = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user?.id) {
                setLoading(true);
                try {
                    // Fetch full student details (including marks/attendance potentially depending on API)
                    // Note: studentService.getById expects ID. user.id might be user_id or student_id.
                    // If auth returns user object which is joined with properties, user might suffice?
                    // But AuthContext user might be partial. Securest is to fetch.

                    // We need to know if user.id is the 'student' ID or 'user' ID.
                    // authService returns user details.
                    // If user is logged in, their user object might contain 'id' which is 'id' from 'users' table or 'students' table?
                    // backend auth.js: 'user' object returned includes student details if role is student.
                    // So user.id is likely the 'user_id' from users table, OR 'id' from students table?
                    // In auth.js: `let userDetails = { ...user }; ... userDetails = { ...userDetails, ...students[0] };`
                    // Both tables have 'id'. The student.id will overwrite user.id if spread second?
                    // user table: id, email...
                    // student table: id, user_id, ...
                    // If spread `...students[0]` later, `id` becomes student's ID.
                    // So `user.id` should be the student ID.
                    const data = await studentService.getById(user.id);
                    setStudentData(data);
                } catch (error) {
                    console.error("Failed to fetch student data", error);
                    // Fallback to user context if fetch fails or use basic info
                    if (user && user.role === 'student') {
                        setStudentData(user as Student);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStudentData();
    }, [user]);

    // Timetable is currently not supported by backend API for future schedule.
    // So we show empty state or "No classes" until that feature is added.
    const myClasses: any[] = [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    if (!studentData) {
        return <div className="p-8 text-center text-red-500">Failed to load student profile.</div>;
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {studentData.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 text-gray-500 relative">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
                        Semester {studentData.semester}
                    </div>
                </div>
            </header>

            {/* 1. Today's Schedule Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                    <Calendar size={20} className="text-primary" />
                    Today's Schedule <span className="text-gray-400 font-normal text-sm">({today})</span>
                </h2>

                <div className="flex gap-4 overflow-x-auto pb-2 relative z-10 scrollbar-hide">
                    {myClasses.length > 0 ? myClasses.map((cls, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl min-w-[160px] border border-white/10 flex flex-col gap-2 hover:bg-white/20 transition-colors">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider">Period {cls.period}</div>
                            <div className="font-bold text-lg leading-tight">{cls.subject}</div>
                            <div className="mt-auto flex items-center gap-2 text-xs text-gray-300">
                                <Clock size={12} /> 10:00 AM
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400">No classes scheduled for today.</p>
                    )}
                </div>
            </div>

            {/* 2. Detailed Profile Report */}
            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Academic Performance</h2>
                <ProfileReport user={studentData} />
            </div>
        </div>
    );
};
