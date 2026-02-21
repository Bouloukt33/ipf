import FloatingBackground from "@/app/components/FloatingBackground";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-x-hidden font-nunito">
            <FloatingBackground />
            <div className="relative z-[2]">
                {children}
            </div>
        </div>
    )
}