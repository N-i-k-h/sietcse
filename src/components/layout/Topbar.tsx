import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm sticky top-0 z-10 w-full">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Dashboard
            </h2>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role} • {user?.department} Dept</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold shadow-md shadow-green-200">
                    {user?.name.charAt(0)}
                </div>
            </div>
        </header>
    )
}
