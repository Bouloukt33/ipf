export function Stars({ count }: { count: number }) {
    const starPath = 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 18l-6.2 3.1L7 14.2 2 9.3l6.9-1z'
    return (
        <div className="flex gap-[3px] mt-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path d={starPath} fill={i < count ? '#ffc800' : '#e0d5c8'} />
                </svg>
            ))}
        </div>
    )
}
