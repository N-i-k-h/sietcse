import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { StudentForm } from '../../components/admin/StudentForm';
import { ProfileReport } from '../../components/common/ProfileReport';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import type { Student } from '../../types';
import { studentService } from '../../services/studentService';

export const StudentList = () => {
    // State
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        year: 'all',
        semester: 'all'
    });

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [viewingProfile, setViewingProfile] = useState<Student | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Fetch Students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const queryFilters: any = {};
            if (filters.year !== 'all') queryFilters.year = parseInt(filters.year);
            if (filters.semester !== 'all') queryFilters.semester = parseInt(filters.semester);

            const data = await studentService.getAll(queryFilters);
            setStudentList(data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            // Optionally show toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // --- Filter Logic (Client-side Search) ---
    // Server-side filtering is done for Year/Sem, but name/USN search is client-side for now
    const filteredStudents = studentList.filter(s => {
        const matchesSearch =
            (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (s.usn?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // --- Actions ---
    const handleAdd = () => {
        setEditingStudent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await studentService.delete(id);
            setStudentList(prev => prev.filter(s => s.id !== id));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Failed to delete student:', error);
            alert('Failed to delete student');
        }
    };

    const handleSave = async (data: Partial<Student>) => {
        try {
            if (editingStudent) {
                // Update
                await studentService.update(editingStudent.id, data);
                // Refresh list or update locally
                fetchStudents();
            } else {
                // Create
                // Ensure required fields are present
                const newData = { ...data };
                // Make sure we send fields as expected by backend
                // @ts-ignore
                if (newData.newPassword) {
                    // @ts-ignore
                    newData.password = newData.newPassword;
                }

                await studentService.create(newData as any);
                fetchStudents();
            }
            setIsFormOpen(false);
        } catch (error: any) {
            console.error('Failed to save student:', error);
            alert(error.response?.data?.error || 'Failed to save student');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                    <p className="text-gray-500">Enroll new students, manage profiles and credentials</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all"
                >
                    <Plus size={20} />
                    <span>Enroll Student</span>
                </button>
            </header>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or USN..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filters.year}
                        onChange={e => setFilters({ ...filters, year: e.target.value })}
                    >
                        <option value="all">Year: All</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y} Year</option>)}
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filters.semester}
                        onChange={e => setFilters({ ...filters, semester: e.target.value })}
                    >
                        <option value="all">Sem: All</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Student Profile</th>
                                <th className="p-4">Academic Info</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Guardian Info</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading students...</td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">
                                                    {(student.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{student.usn}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                                                    Year {student.year}
                                                </span>
                                                <span className="text-sm text-gray-600">Sem {student.semester} - {student.section}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-gray-900">{student.email}</div>
                                            {/* @ts-ignore */}
                                            <div className="text-xs text-gray-500">{student.phone || 'No Phone'}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {/* @ts-ignore */}
                                            {(student.parentName || student.parentPhone) ? (
                                                <div>
                                                    {/* @ts-ignore */}
                                                    <div className="text-gray-900 font-medium">{student.parentName}</div>
                                                    {/* @ts-ignore */}
                                                    <div className="text-xs text-gray-500">{student.parentPhone}</div>
                                                </div>
                                            ) : <span className="text-gray-400 text-xs">-</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingProfile(student)}
                                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition"
                                                    title="View Report"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(student.id)}
                                                    className="p-2 bg-gray-50 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400">
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingStudent ? `Edit Student: ${editingStudent.name}` : "Enroll New Student"}
                maxWidth="max-w-2xl"
            >
                <StudentForm
                    initialData={editingStudent}
                    onSubmit={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Profile Report Modal */}
            <Modal
                isOpen={!!viewingProfile}
                onClose={() => setViewingProfile(null)}
                title={`Performance Report: ${viewingProfile?.name}`}
            >
                {viewingProfile && <div className="max-h-[70vh] overflow-y-auto pr-2"><ProfileReport user={viewingProfile} /></div>}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Disenrollment"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to remove this student? This will delete their attendance records, marks history, and login credentials permanently.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            // @ts-ignore
                            onClick={() => handleDelete(deleteConfirmId!)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                        >
                            Remove Student
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
