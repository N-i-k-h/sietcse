import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { FacultyForm } from '../../components/admin/FacultyForm';
import { Search, Plus, Edit2, Trash2, Award, GraduationCap } from 'lucide-react';
import type { Staff } from '../../types';
import { facultyService } from '../../services/facultyService';

export const FacultyList = () => {
    // State
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        experience: 'all', // "0-5", "5-10", "10+"
        role: 'all', // "hod", "staff"
        degree: 'all' // "PhD", "M.Tech", etc.
    });

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Fetch Faculty
    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const queryFilters: any = {};
            if (filters.degree !== 'all') queryFilters.degree = filters.degree;
            if (filters.experience !== 'all') queryFilters.experience = filters.experience;
            // Note: role filter is not directly supported by get all API params as per service definition, 
            // but we can filter locally or update service. 
            // Checking server/routes/faculty.js, it doesn't filter by role in GET /.
            // So we will filter role client-side.

            const data = await facultyService.getAll(queryFilters);
            setStaffList(data);
        } catch (error) {
            console.error('Failed to fetch faculty:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.degree, filters.experience]); // Re-fetch when server-supported filters change

    // --- Filter Logic ---
    const filteredStaff = staffList.filter(s => {
        // 1. Search (Client Side)
        const matchesSearch =
            (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (s.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // 2. Role Filter (Client Side since API doesn't support it yet)
        const matchesRole = filters.role === 'all' || s.role === filters.role;

        return matchesSearch && matchesRole;
    });

    // --- Actions ---
    const handleAdd = () => {
        setEditingStaff(null);
        setIsFormOpen(true);
    };

    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await facultyService.delete(id);
            setStaffList(prev => prev.filter(s => s.id !== id));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Failed to delete faculty:', error);
            alert('Failed to delete faculty');
        }
    };

    const handleSave = async (data: Partial<Staff>) => {
        try {
            if (editingStaff) {
                // Update
                await facultyService.update(editingStaff.id, data);
                // Password update is separate endpoint in service, but let's see if form sends it.
                // Form sends newPassword. Service has updatePassword.
                // @ts-ignore
                if (data.newPassword) {
                    // @ts-ignore
                    await facultyService.updatePassword(editingStaff.id, data.newPassword);
                }
                fetchFaculty();
            } else {
                // Create
                const newData = { ...data };
                // @ts-ignore
                if (newData.newPassword) {
                    // @ts-ignore
                    newData.password = newData.newPassword;
                }
                // Also ensure required fields like designation are present (Form defaults handle this)

                await facultyService.create(newData as any);
                fetchFaculty();
            }
            setIsFormOpen(false);
        } catch (error: any) {
            console.error('Failed to save faculty:', error);
            alert(error.response?.data?.error || 'Failed to save faculty');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
                    <p className="text-gray-500">Manage teaching staff, profiles, and assignments</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all"
                >
                    <Plus size={20} />
                    <span>Add Faculty</span>
                </button>
            </header>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name or ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filters.experience}
                        onChange={e => setFilters({ ...filters, experience: e.target.value })}
                    >
                        <option value="all">Experience: All</option>
                        <option value="0-5">0-5 Years</option>
                        <option value="5-10">5-10 Years</option>
                        <option value="10+">10+ Years</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filters.degree}
                        onChange={e => setFilters({ ...filters, degree: e.target.value })}
                    >
                        <option value="all">Degree: All</option>
                        <option value="PhD">PhD</option>
                        <option value="M.Tech">M.Tech</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filters.role}
                        onChange={e => setFilters({ ...filters, role: e.target.value })}
                    >
                        <option value="all">Role: All</option>
                        <option value="hod">HOD</option>
                        <option value="staff">Teaching Staff</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Faculty Profile</th>
                                <th className="p-4">Academic Info</th>
                                <th className="p-4">Experience</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading faculty...</td>
                                </tr>
                            ) : filteredStaff.length > 0 ? (
                                filteredStaff.map(staff => (
                                    <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                    {(staff.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {staff.name}
                                                        {/* @ts-ignore */}
                                                        {(staff.experienceTotal || 0) > 10 && (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" title="Senior Faculty (>10 Years Exp)">
                                                                <Award size={10} /> Senior
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: {staff.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-gray-900">{staff.designation}</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    {/* @ts-ignore */}
                                                    <GraduationCap size={14} /> {staff.highestDegree || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {/* @ts-ignore */}
                                            <div>Total: <span className="font-bold">{staff.experienceTotal || 0} Yrs</span></div>
                                            {/* @ts-ignore */}
                                            <div className="text-xs text-gray-400">Research: {staff.experienceResearch || 0} Yrs</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-gray-900">{staff.email}</div>
                                            {/* @ts-ignore */}
                                            <div className="text-xs text-gray-500">{staff.phone || 'No Phone'}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(staff)}
                                                    className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(staff.id)}
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
                                        No faculty members found.
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
                title={editingStaff ? `Edit Profile: ${editingStaff.name}` : "Add New Faculty"}
            >
                <FacultyForm
                    initialData={editingStaff}
                    onSubmit={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to completely remove this faculty member? This action cannot be undone and will remove them from all assigned classes and timetables.
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
                            Delete Forever
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
