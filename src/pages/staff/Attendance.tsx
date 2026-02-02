import { useState } from 'react';
import { mockClasses, mockStudents } from '../../data/mockData';
import { Check, X, User } from 'lucide-react';
import { clsx } from 'clsx';
import type { Student } from '../../types';

export const Attendance = () => {
    const [selectedClassId, setSelectedClassId] = useState(mockClasses[0]?.id || '');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    // Mock keeping track of present/absent state locally
    const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});

    // Filter students belonging to this class (mock logic: assuming all mockStudents are in the selected class for demo)
    const students = mockStudents; // In real app: students.filter(s => s.classId === selectedClassId)

    const toggleAttendance = (studentId: string) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const markAll = (status: boolean) => {
        const newState: Record<string, boolean> = {};
        students.forEach(s => newState[s.id] = status);
        setAttendanceState(newState);
    };

    const saveAttendance = () => {
        alert('Attendance saved successfully!');
        // API call would go here
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Portal</h1>
                    <p className="text-gray-500 text-sm">Mark daily attendance for your classes</p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        {mockClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-600">
                        Total Students: <span className="text-gray-900 font-bold">{students.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => markAll(true)}
                            className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                            Mark All Present
                        </button>
                        <button
                            onClick={() => markAll(false)}
                            className="text-xs font-medium px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Mark All Absent
                        </button>
                    </div>
                </div>

                <div className="bg-white">
                    {students.map((student, index) => {
                        const isPresent = attendanceState[student.id] !== false; // Default to present
                        return (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-400 font-mono w-8">{(index + 1).toString().padStart(2, '0')}</span>
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.usn}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleAttendance(student.id)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all w-32 justify-center",
                                        isPresent
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-red-100 text-red-700 border border-red-200"
                                    )}
                                >
                                    {isPresent ? (
                                        <>
                                            <Check size={18} /> Present
                                        </>
                                    ) : (
                                        <>
                                            <X size={18} /> Absent
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={saveAttendance}
                        className="bg-primary text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-green-200 hover:bg-green-600 transition-all"
                    >
                        Save Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};
