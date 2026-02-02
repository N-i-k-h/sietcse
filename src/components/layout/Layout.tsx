import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

export const Layout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Topbar />
                <main className="flex-1 p-8 overflow-auto">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}
