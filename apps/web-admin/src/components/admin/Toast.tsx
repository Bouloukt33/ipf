import { useEffect, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onHide: () => void;
    duration?: number;
}

const TYPE_STYLES: Record<ToastType, { dot: string; border: string }> = {
    success: { dot: 'bg-[#10B981]', border: 'border-l-4 border-[#10B981]' },
    error: { dot: 'bg-[#EF4444]', border: 'border-l-4 border-[#EF4444]' },
    info: { dot: 'bg-[#D27A2D]', border: 'border-l-4 border-[#D27A2D]' },
};

export function Toast({ message, type = 'success', isVisible, onHide, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onHide, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onHide]);

    const styles = TYPE_STYLES[type];

    return (
        <div
            className={`
        fixed bottom-7 right-7 z-[300] flex items-center gap-3
        bg-[#172E42] text-white px-5 py-3.5 rounded-2xl
        text-[14px] font-bold shadow-2xl ${styles.border}
        transition-all duration-300 pointer-events-none
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
        >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
            <span>{message}</span>
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false,
    });

    const show = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type, visible: true });
    }, []);

    const hide = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    return { toast, show, hide };
}
