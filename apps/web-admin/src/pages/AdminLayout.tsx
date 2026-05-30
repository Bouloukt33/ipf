import { Sidebar } from "../components/sidebar/Sidebar";
import { adminNavItems } from "../lib/nav-items";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar items={adminNavItems} logoSrc="/images/logo_admin.png" />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
