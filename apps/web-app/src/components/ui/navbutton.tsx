export function NavButton({ onClick, path }: { onClick: () => void; path: string }) {
    return (
        <button
            onClick={onClick}
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-border bg-transparent cursor-pointer hover:border-orange transition-colors duration-150"
        >
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-muted hover:fill-orange">
                <path d={path} />
            </svg>
        </button>
    )
}