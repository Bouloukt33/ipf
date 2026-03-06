import { UserSidebar } from '@/components/user/Sidebar/Sidebar';
import { useUser } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <UserSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}