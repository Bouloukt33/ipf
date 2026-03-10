import { ILeaderboardRow, IPodiumEntry } from "@/lib/type";

export const PATHS = {
    chevron: "M7 2l10 10L7 22V2z",
    arrowLeft: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
    arrowRight: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
    crown: "M5 16L2 6l5.5 4L12 4l4.5 6L22 6l-3 10H5zm0 2h14v2H5v-2z",
    arrowUp: "M7 14l5-5 5 5z",
    arrowDown: "M7 10l5 5 5-5z",
}

export const PODIUM: IPodiumEntry[] = [
    { rank: 1, initial: "M", name: "Marie D.", score: "2 847", bg: "linear-gradient(135deg,#D27A2D,#e88c3a)" },
    { rank: 2, initial: "S", name: "Sophie L.", score: "1 924", bg: "linear-gradient(135deg,#5d7fa0,#3a5f80)" },
    { rank: 3, initial: "J", name: "Jean-Pierre M.", score: "1 603", bg: "linear-gradient(135deg,#6a8c72,#4a6c52)" },
]

export const PODIUM_STYLES: Record<1 | 2 | 3, { bar: string; numColor: string; height: string; avatarSize: string; textSize: string }> = {
    1: { bar: "linear-gradient(180deg,#fde97a,#f4c430)", numColor: "rgba(180,130,0,.5)", height: "min-h-[120px]", avatarSize: "w-20 h-20 rounded-[20px] text-[32px]", textSize: "" },
    2: { bar: "linear-gradient(180deg,#dce6f0,#c0ccd8)", numColor: "rgba(100,120,140,.4)", height: "min-h-[80px]", avatarSize: "w-16 h-16 rounded-2xl text-2xl", textSize: "" },
    3: { bar: "linear-gradient(180deg,#f5c4a4,#e0a080)", numColor: "rgba(160,80,40,.4)", height: "min-h-[60px]", avatarSize: "w-16 h-16 rounded-2xl text-2xl", textSize: "" },
}

export const ORDER: Record<1 | 2 | 3, string> = { 1: "order-2", 2: "order-1", 3: "order-3" }

export const LB_ROWS: ILeaderboardRow[] = [
    { rk: "4", hi: true, initial: "C", name: "Claire B.", handle: "@claireb", trend: "up", trendVal: "+2", score: "1 603", bg: "linear-gradient(135deg,#c0392b,#e74c3c)", me: false },
    { rk: "5", hi: true, initial: "A", name: "Antoine R.", handle: "@antoiner", trend: "eq", trendVal: "—", score: "1 540", bg: "linear-gradient(135deg,#1a6b8a,#2980b9)", me: false },
    { rk: "6", hi: true, initial: "L", name: "Lucie T.", handle: "@luciet", trend: "dn", trendVal: "-1", score: "1 503", bg: "linear-gradient(135deg,#8e44ad,#ce82ff)", me: false },
    { rk: "7", hi: true, initial: "T", name: "Thomas R.", handle: "@thomasr", trend: "up", trendVal: "+3", score: "1 420", bg: "linear-gradient(135deg,#D27A2D,#e88c3a)", me: true },
    { rk: "8", hi: false, initial: "K", name: "Kévin F.", handle: "@kevinf", trend: "up", trendVal: "+1", score: "1 237", bg: "linear-gradient(135deg,#27ae60,#58cc02)", me: false },
    { rk: "9", hi: false, initial: "N", name: "Nathalie P.", handle: "@nathaliep", trend: "eq", trendVal: "—", score: "1 180", bg: "linear-gradient(135deg,#7f8c8d,#95a5a6)", me: false },
    { rk: "10", hi: false, initial: "P", name: "Pierre V.", handle: "@pierrev", trend: "dn", trendVal: "-3", score: "1 003", bg: "linear-gradient(135deg,#d35400,#e67e22)", me: false },
]