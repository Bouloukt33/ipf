'use client'

import FloatingBackground from "@/components/FloatingBackground";
import { useUser } from "@auth0/nextjs-auth0/client";
import { UserSidebar } from '@/components/sidebar/Sidebar';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();

    if (user) {
        return (
            <div className="flex min-h-screen">
                <UserSidebar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden font-nunito">
            <FloatingBackground />
            <div className="relative z-[2]">
                {children}
            </div>
        </div>
    );
}