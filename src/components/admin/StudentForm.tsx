import { useState, useEffect } from 'react';
import type { Student } from '../../types';
import { Save, UserCog, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface StudentFormProps {
    initialData?: Student | null;
    onSubmit: (data: Partial<Student>) => void;
    onCancel: () => void;
}

export const StudentForm = ({ initialData, onSubmit, onCancel }: StudentFormProps) => {
    // Defaults
    const defaultData: Partial<Student> = {
        firstName: '', lastName: '', name: '', email: '',
        usn: '', phone: '', year: 1, semester: 1, section: 'A',
        role: 'student', department: 'CSE'
    };

    const [formData, setFormData] = useState<Partial<Student>>(defaultData);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setPassword('');
        } else {
            setFormData(defaultData);
            // Auto-generate password for new students
            generatePassword();
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-update full name if first/last changes
            if (name === 'firstName' || name === 'lastName') {
                updated.name = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
            }
            return updated;
        });
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@";
        let pass = "";
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        setShowPassword(true); // Show it so admin can see
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = { ...formData };
        if (password) {
            // @ts-ignore
            finalData.newPassword = password;
        }
        onSubmit(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Identification */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    <UserCog size={16} /> Student Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input name="firstName" value={formData.firstName || ''} onChange={handleChange} required className="input-field" placeholder="John" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input name="lastName" value={formData.lastName || ''} onChange={handleChange} required className="input-field" placeholder="Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">USN (Unique ID)</label>
                        <input name="usn" value={formData.usn || ''} onChange={handleChange} required className="input-field uppercase" placeholder="1SI23CS001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" value={formData.email || ''} onChange={handleChange} required className="input-field" placeholder="student@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input name="phone" value={formData.phone || ''} onChange={handleChange} className="input-field" placeholder="9876543210" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4 mt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                        <input name="parentName" value={formData.parentName || ''} onChange={handleChange} className="input-field" placeholder="Parent/Guardian Name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                        <input name="parentPhone" value={formData.parentPhone || ''} onChange={handleChange} className="input-field" placeholder="Parent Contact" />
                    </div>
                </div>
            </div>

            {/* 2. Academic Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select name="year" value={formData.year} onChange={e => handleChange(e as any)} className="input-field">
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select name="semester" value={formData.semester} onChange={e => handleChange(e as any)} className="input-field">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <input name="section" value={formData.section || 'A'} onChange={handleChange} className="input-field uppercase" maxLength={1} />
                    </div>
                </div>
            </div>

            {/* 3. Credentials */}
            <div className="space-y-4 bg-green-50 p-4 rounded-xl border border-green-100">
                <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider flex items-center gap-2">
                    <Lock size={16} /> Credentials
                </h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {initialData ? 'Reset Password (Override)' : 'Auto-Assigned Password'}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pr-24 border-green-200 focus:border-green-500 focus:ring-green-200"
                            placeholder={initialData ? "Leave empty to keep current" : "Generating..."}
                            readOnly={!initialData} // Read-only on creation (auto-generated only) ? Strategy: allow edit if needed? Prompt said "Auto-Credentials"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors font-medium flex items-center gap-1"
                                title="Generate New Password"
                            >
                                <RefreshCw size={12} /> Gen
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    {!initialData && <p className="text-xs text-green-600 mt-1">Share this password with the student immediately.</p>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    <span>{initialData ? 'Update Student' : 'Enroll Student'}</span>
                </button>
            </div>
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.5rem 1rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 0.5rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #22C55E;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }
                .btn-primary {
                    background-color: #22C55E;
                    color: white;
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }
                .btn-primary:hover { background-color: #16A34A; }
                .btn-secondary {
                    color: #4B5563;
                    padding: 0.5rem 1.5rem;
                    font-weight: 500;
                }
                .btn-secondary:hover { background-color: #F3F4F6; border-radius: 0.5rem; }
            `}</style>
        </form>
    );
};
