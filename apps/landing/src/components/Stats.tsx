const stats = [
    { value: '500+', label: 'professionnels formés' },
    { value: '1 200', label: 'questions au catalogue' },
    { value: '94%', label: 'taux de satisfaction' },
    { value: '5s', label: 'pour répondre' },
];

export default function Stats() {
    return (
        <section className="bg-navy py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <div className="text-4xl font-black gradient-text-animate mb-1">{stat.value}</div>
                            <div className="text-white/60 text-sm font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
