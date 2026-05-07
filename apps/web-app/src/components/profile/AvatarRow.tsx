import { memo } from "react";

interface IAvatarRowProps {
    initial: string;
    name: string;
    email: string;
    onChangePhoto?: () => void;
}

export const AvatarRow = memo(function AvatarRow({
    initial, name, email, onChangePhoto,
}: IAvatarRowProps) {
    return (
        <div className="flex items-center gap-4 mb-6 px-4 py-4 rounded-[12px] bg-gradient-to-br from-[#172E42] to-[#1e3d58]">
            {/* Avatar circle */}
            <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#D27A2D] to-[#E89347] flex items-center justify-center text-[22px] font-black text-white flex-shrink-0 shadow-[0_4px_12px_rgba(210,122,45,0.4)]">
                {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="text-[15px] font-[800] text-white leading-tight truncate">
                    {name}
                </div>
                <div className="text-[12px] font-[600] text-white/60 mt-0.5 truncate">
                    {email}
                </div>
                <button
                    onClick={onChangePhoto}
                    className="mt-2 bg-white/[0.12] text-white text-[12px] font-[700] px-[14px] py-[7px] rounded-[20px] border border-white/25 hover:bg-white/20 hover:border-white/50 transition-all duration-200 cursor-pointer"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    Changer la photo
                </button>
            </div>
        </div>
    );
});