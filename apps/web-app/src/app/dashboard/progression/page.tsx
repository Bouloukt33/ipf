'use client'

import { PageLeaderboard } from '@/components/user/dashboard/progression/classement/PageLeaderboard'
import { PageProgression } from '@/components/user/dashboard/progression/PageProgression'
import React, { useEffect, useRef, useState } from 'react'

const minimalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

    .theme-fill-anim {
        height: 100%;
        border-radius: 5px;
        width: 0;
        transition: width 1.1s cubic-bezier(0.34, 1.2, 0.64, 1);
    }

    .succes-bar-fill {
        height: 100%;
        border-radius: 4px;
        background: #D27A2D;         /* ← couleur manquante */
        transition: width 0.5s ease-out;  /* ← animation bonus */
    }
`
export default function ProgressionPage() {
    const [tab, setTab] = useState<'progression' | 'leaderboard'>('progression')

    return (
        <div className="bg-cream min-h-screen font-nunito">
            <style dangerouslySetInnerHTML={{ __html: minimalStyles }} />

            {/* Tabs */}
            <div
                className="flex sticky top-0 z-50 bg-cream"
                style={{ borderBottom: '3px solid rgba(210,122,45,0.39)' }}
            >
                {[
                    {
                        key: 'progression',
                        label: 'Ma Progression',
                        icon: (
                            <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current flex-shrink-0">
                                <path d="M13 2.05V4.06c3.95.49 7 3.85 7 7.94 0 3.21-1.81 6-4.72 7.28L13 17v5l6-3.19C21.91 16.26 24 12.79 24 12c0-5.18-3.95-9.45-9.02-10.42zM11 2.06C5.95 3.03 2 7.3 2 12.01c0 3.79 2.09 7.26 5 9.04L11 17V2.06z" />
                            </svg>
                        ),
                    },
                    /*{
                        key: 'leaderboard',
                        label: 'Classement',
                        icon: (
                            <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current flex-shrink-0">
                                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H7v2h10v-2h-4v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
                            </svg>
                        ),
                    },*/
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as typeof tab)}
                        className={`flex-1 max-w-[220px] px-5 py-[18px] text-[14px] font-black uppercase tracking-[0.6px] flex items-center gap-2 border-none bg-transparent cursor-pointer transition-all duration-200
              ${tab === t.key
                                ? 'text-navy border-b-[3px] border-orange -mb-[3px]'
                                : 'text-muted border-b-[3px] border-transparent -mb-[3px] hover:text-navy'
                            }
              max-[600px]:text-[12px] max-[600px]:px-3 max-[600px]:py-3.5
            `}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'progression' ? (
                <PageProgression onGoLeaderboard={() => setTab('leaderboard')} />
            ) : (
                <PageLeaderboard />
            )}
        </div>
    )
}