import { memo } from "react";

interface IProfileHeaderProps {
    name: string;
    level: number;
    subscription: string;
    memberSince: string;
    initial: string;
    avatarUrl?: string;
}

export const ProfileHeader = memo(function ProfileHeader({
    name,
    level,
    subscription,
    memberSince,
    initial,
    avatarUrl,
}: IProfileHeaderProps) {
    return (
        <div className="py-9 pb-7">
            <div className="max-w-[1020px] mx-auto px-6 flex items-start gap-6">
                {avatarUrl ? (
                    <div className="relative w-[88px] h-[88px] rounded-full bg-orange flex items-center justify-center text-4xl font-black text-white flex-shrink-0 border-4 border-white/15 overflow-hidden">
                        <img src={avatarUrl} alt={`${name}'s avatar`} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="relative w-[88px] h-[88px] rounded-full bg-orange flex items-center justify-center text-4xl font-black text-white flex-shrink-0 border-4 border-white/15">
                        {initial}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded-2xl border-2 border-navy whitespace-nowrap">
                            NIV. {level}
                        </div>
                    </div>
                )}
                <div>
                    <div className="text-[26px] font-black text-navy">{name}</div>
                    <div className="text-muted text-[15px] font-extrabold mt-1">
                        {subscription} · {memberSince}
                    </div>
                </div>
            </div>
        </div>
    );
});