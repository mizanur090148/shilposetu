import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

interface HomeProps {
    stats?: {
        total_vendors?: number;
        verified_vendors?: number;
        active_orders?: number;
        total_machines?: number;
    };
}

const bnNum = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

const ICONS: Record<string, string> = {
    ord: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    yarn: '<circle cx="12" cy="12" r="8"/><path d="M6 7c4 2 8 2 12 0M5 12c5 2 9 2 14 0M6 17c4-2 8-2 12 0"/>',
    mc: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    qc: '<path d="M9 12l2 2 4-4"/><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>',
    bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    led: '<path d="M4 5c3-1 5-1 8 1 3-2 5-2 8-1v14c-3-1-5-1-8 1-3-2-5-2-8-1z"/><path d="M12 6v14"/>',
    ven: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M17 8h4M19 6v4"/>',
    wa: '<path d="M4 20l1.5-4A8 8 0 1 1 9 19z"/><path d="M9 9c0 3 3 6 6 6"/>',
    acc: '<path d="M3 7h18v12H3z"/><path d="M3 11h18M7 15h3"/>',
};

const FEATURES = [
    {
        key: 'ord',
        title: 'সাব-কন্ট্রাক্ট অর্ডার',
        desc: 'কোন ভেন্ডরের কোন অর্ডার, কত kg, কোন ফেব্রিক, কতটুকু হলো — এক নজরে।',
        badge: 'SC-2610-014 · 62%',
        isOrderLink: true,
    },
    {
        key: 'yarn',
        title: 'সুতা ও লট',
        desc: 'কাউন্ট, স্পিনার, লট, ব্যাগ ধরে সুতা গ্রহণ। সুতা ব্যালেন্স আর প্রসেস লস নিজে থেকেই।',
        badge: '30/1 CC · Lot SQ-88412',
    },
    {
        key: 'mc',
        title: 'মেশিন বোর্ড ও শেষের তারিখ',
        desc: 'কোন মেশিন কোন অর্ডারে চলছে। মেশিন বাড়ালে-কমালে শেষের তারিখ বদলে যায়।',
        badge: '4 M/C × 380 kg/দিন',
    },
    {
        key: 'qc',
        title: 'QC ও কাপড়ের সমস্যা',
        desc: 'রোল ধরে পরিদর্শন, hole, needle mark, barre — কোন মেশিনে কী হলো সব রেকর্ডে।',
        badge: 'R-0388 · needle mark',
    },
    {
        key: 'bill',
        title: 'বিল ও ভাউচার',
        desc: 'ডেলিভারি চালান থেকে এক ক্লিকে ভেন্ডরের বিল, সাথে ভাউচার। প্যাডের মতো প্রিন্ট।',
        badge: 'BL-2610-001 · JV-0927',
    },
    {
        key: 'led',
        title: 'পার্টি লেজার',
        desc: 'প্রতিটা পার্টির আলাদা খাতা — অর্ডার, সুতা, বিল, কত পেলাম, কত বাকি।',
        badge: 'বাকি ৳ ৪৪,৪৭৫',
    },
    {
        key: 'ven',
        title: 'ভেন্ডর পোর্টাল',
        desc: 'ভেন্ডরের লোক নিজের অর্ডারটুকুই দেখবেন। লোক বদলালে অ্যাক্সেস বদলান এক সুইচে।',
        badge: 'শুধু নিজের অর্ডার',
    },
    {
        key: 'wa',
        title: 'WhatsApp রিপোর্ট',
        desc: 'প্রতিদিন রাতে ভেন্ডরের WhatsApp এ কাজের অগ্রগতি আর Excel ফাইল।',
        badge: 'রাত ৮:০০ · .xlsx',
    },
    {
        key: 'acc',
        title: 'খরচ, ব্যাংক, LC ও হাজিরা',
        desc: 'দৈনিক খরচ, ইউটিলিটি বিল, ব্যাংক, LC আর কর্মীদের হাজিরা — অফিসের সব হিসাব।',
        badge: '৫৮ জন · শিফট A/B',
    },
];

const ANSWERS = {
    sub: {
        eb: 'সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির জন্য',
        h: 'আপনার পুরো নিটিংয়ের কাজ, শুরু থেকে বিল পর্যন্ত।',
        p: 'ভেন্ডর থেকে অর্ডার আসা, সুতা গ্রহণ, মেশিনে তোলা, প্রতিদিনের প্রোডাকশন, QC, ডেলিভারি চালান, বিল আর টাকা পাওয়া — প্রতিটা ধাপ নিটখাতায় থাকবে।',
        li: [
            'প্রতিটা ভেন্ডরের আলাদা পার্টি লেজার',
            'মেশিন সংখ্যা দিলেই কবে কাজ শেষ হবে তার হিসাব',
            'এক ক্লিকে বিল, ভাউচার আর প্রিন্ট',
            'ভেন্ডরের লোক নিজেই দেখবেন তার কাজের আপডেট',
        ],
        btn: 'সাব-কন্ট্রাক্ট অর্ডার দেখুন',
    },
    comp: {
        eb: 'কম্পোজিট ফ্যাক্টরির জন্য',
        h: 'আপনার সব সাব-কন্ট্রাক্টরের কাজ, এক স্ক্রিনে।',
        p: 'আপনার সাব-কন্ট্রাক্টর নিটখাতা ব্যবহার করলে আপনার নিটিং বা প্ল্যানিংয়ের লোক একটা লগইন দিয়েই দেখবেন কোন অর্ডার কতদূর, কোন লট চলছে, QC তে কী সমস্যা হলো।',
        li: [
            'ভেন্ডর পোর্টাল সবসময় ফ্রি',
            'প্রতিদিন রাতে WhatsApp এ Excel রিপোর্ট',
            'শুধু আপনার অর্ডার দেখবেন, অন্য কারো না',
            'দায়িত্ব বদলালে নতুন লোককে অ্যাক্সেস দেওয়া সহজ',
        ],
        btn: 'সাব-কন্ট্রাক্ট ফিডে যান',
    },
};

const JOBS = [
    {
        id: 1,
        r: 'নিটিং অপারেটর (সার্কুলার মেশিন)',
        c: 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)',
        a: 'কাশিমপুর, গাজীপুর',
        t: 'op',
        s: 'আলোচনা সাপেক্ষে',
        d: 'আজ',
        n: true,
        req: [
            'সার্কুলার নিটিং মেশিনে কমপক্ষে ১ বছরের অভিজ্ঞতা',
            'শিফটে কাজ করতে আগ্রহী',
            'Single Jersey, Rib চালানোর অভিজ্ঞতা থাকলে ভালো',
        ],
    },
    {
        id: 2,
        r: 'নিটিং সুপারভাইজার',
        c: 'একটি সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরি (নমুনা)',
        a: 'আশুলিয়া, সাভার',
        t: 'sup',
        s: 'আলোচনা সাপেক্ষে',
        d: '১ দিন আগে',
        n: true,
        req: [
            '৩–৫ বছর নিটিং ফ্লোরের অভিজ্ঞতা',
            'প্রোডাকশন রিপোর্ট ও শিফট প্ল্যানিং',
            'মোবাইলে এন্ট্রি দিতে পারতে হবে',
        ],
    },
    {
        id: 3,
        r: 'নিটিং মেশিন টেকনিশিয়ান',
        c: 'নমুনা নিট কম্পোজিট',
        a: 'ফতুল্লা, নারায়ণগঞ্জ',
        t: 'tech',
        s: 'আলোচনা সাপেক্ষে',
        d: '২ দিন আগে',
        n: false,
        req: [
            'সার্কুলার মেশিন সেটিং, গেজ ও সিংকার বদলানো',
            'ব্রেকডাউন দ্রুত সারানোর অভিজ্ঞতা',
        ],
    },
    {
        id: 4,
        r: 'ফেব্রিক QC ইন্সপেক্টর (গ্রে)',
        c: 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)',
        a: 'কাশিমপুর, গাজীপুর',
        t: 'qc',
        s: 'আলোচনা সাপেক্ষে',
        d: '৩ দিন আগে',
        n: false,
        req: [
            '৪-পয়েন্ট সিস্টেমে রোল ইন্সপেকশন',
            'GSM, Dia চেক ও ফল্ট রিপোর্ট',
        ],
    },
    {
        id: 5,
        r: 'নিটিং মার্চেন্ডাইজার',
        c: 'নমুনা নিট কম্পোজিট',
        a: 'টঙ্গী, গাজীপুর',
        t: 'mer',
        s: 'আলোচনা সাপেক্ষে',
        d: '৪ দিন আগে',
        n: false,
        req: [
            'সাব-কন্ট্রাক্টর ফলোআপ ও সুতা প্ল্যানিং',
            'Excel এ দক্ষ',
            'টেক্সটাইলে স্নাতক অগ্রাধিকার',
        ],
    },
    {
        id: 6,
        r: 'নিটিং অপারেটর (ফ্ল্যাট/কলার-কাফ)',
        c: 'একটি সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরি (নমুনা)',
        a: 'মিরপুর, ঢাকা',
        t: 'op',
        s: 'আলোচনা সাপেক্ষে',
        d: '৫ দিন আগে',
        n: false,
        req: [
            'ফ্ল্যাট নিটিং মেশিনে অভিজ্ঞতা',
            'কলার ও কাফ বোনার কাজ জানা',
        ],
    },
    {
        id: 7,
        r: 'স্টোর ইনচার্জ (সুতা)',
        c: 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)',
        a: 'কাশিমপুর, গাজীপুর',
        t: 'sup',
        s: 'আলোচনা সাপেক্ষে',
        d: '১ সপ্তাহ আগে',
        n: false,
        req: [
            'সুতা গ্রহণ, লট আলাদা রাখা, ব্যালেন্স হিসাব',
            'চালান ও রেজিস্টার রাখার অভিজ্ঞতা',
        ],
    },
];

const JOB_CATEGORIES: Record<string, string> = {
    all: 'সব',
    op: 'অপারেটর',
    sup: 'সুপারভাইজার / ইনচার্জ',
    tech: 'টেকনিশিয়ান',
    qc: 'QC',
    mer: 'মার্চেন্ডাইজার',
};

export default function Home({ stats }: HomeProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // Factory Persona Selected Key ('sub' | 'comp' | null)
    const [selectedPick, setSelectedPick] = useState<'sub' | 'comp' | null>(null);

    // Jobs Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [jobFilter, setJobFilter] = useState('all');
    const [expandedJobIds, setExpandedJobIds] = useState<number[]>([]);

    // Scrolled header state
    const [isScrolled, setIsScrolled] = useState(false);

    // Toast state
    const [toastText, setToastText] = useState<string | null>(null);
    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (text: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastText(text);
        toastTimerRef.current = setTimeout(() => setToastText(null), 2800);
    };

    // Scroll listener for sticky header shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 8);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Uncontrolled Ref for 60fps Ticking Counter (Zero React re-renders)
    const kgRef = useRef<HTMLElement>(null);
    useEffect(() => {
        if (!kgRef.current) return;
        const target = stats?.active_orders ? Math.max(stats.active_orders * 150, 1186) : 1186;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            kgRef.current.textContent = target.toLocaleString('en-IN');
            return;
        }

        const t0 = performance.now() + 300;
        const dur = 2600;
        let reqId: number;

        const tick = (now: number) => {
            const p = Math.min(1, Math.max(0, (now - t0) / dur));
            const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (kgRef.current) {
                kgRef.current.textContent = v.toLocaleString('en-IN');
            }
            if (p < 1) {
                reqId = requestAnimationFrame(tick);
            }
        };

        reqId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(reqId);
    }, [stats]);

    // Precompute Memoized Stitches for 10x12 Knit Fabric
    const stitches = useMemo(() => {
        const cols = 10;
        const rows = 12;
        const w = 40;
        const h = 33;
        const list: { id: string; d1: string; d2: string; strokeVar: string; delay: number }[] = [];

        for (let r = 0; r < rows; r++) {
            const y = 400 - (r + 0.5) * h + 4;
            const strokeVar = r === 4 || r === 5 
                ? 'var(--stitch-c)' 
                : r % 2 !== 0 
                ? 'var(--stitch-b)' 
                : 'var(--stitch-a)';

            for (let c = 0; c < cols; c++) {
                const x = c * w + w / 2;
                const delay = r * 0.16 + c * 0.035 + 0.3;
                list.push({
                    id: `${r}-${c}`,
                    d1: `M${x - w * 0.42},${y - h * 0.62} C${x - w * 0.40},${y - h * 0.05} ${x - w * 0.12},${y + h * 0.22} ${x},${y + h * 0.48}`,
                    d2: `M${x + w * 0.42},${y - h * 0.62} C${x + w * 0.40},${y - h * 0.05} ${x + w * 0.12},${y + h * 0.22} ${x},${y + h * 0.48}`,
                    strokeVar,
                    delay,
                });
            }
        }
        return list;
    }, []);

    // Filtered Jobs
    const filteredJobs = useMemo(() => {
        if (jobFilter === 'all') return JOBS;
        return JOBS.filter((j) => j.t === jobFilter);
    }, [jobFilter]);

    const toggleJobExpand = (id: number) => {
        setExpandedJobIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // ESC to close drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && drawerOpen) {
                setDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [drawerOpen]);

    const newJobsCount = JOBS.filter((j) => j.n).length;

    return (
        <div className="knitkhata-root">
            <Head>
                <title>নিটখাতা হোম - সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির ডিজিটাল খাতা</title>
                <meta name="description" content="নিটখাতা: সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির সম্পূর্ণ ডিজিটাল খাতা। অর্ডার, সুতার লট, মেশিন, QC, বিল আর পার্টির লেজার এক জায়গায়।" />
            </Head>

            {/* EMBEDDED BESPOKE CSS IDENTICAL TO UPLOADED DESIGN */}
            <style>{`
                .knitkhata-root {
                    --bg: #F4F6FA;
                    --surface: #FFFFFF;
                    --line: #E2E7EF;
                    --ink: #0F172A;
                    --muted: #5B6B82;
                    --accent: #2F5BEA;
                    --accent-2: #4F46E5;
                    --accent-ink: #FFFFFF;
                    --accent-soft: #E7EDFF;
                    --grad: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
                    --hero-a: #2AA3DF;
                    --hero-b: #3466EE;
                    --hero-ink: #FFFFFF;
                    --hl: #FACC15;
                    --strip: #0F172A;
                    --strip-ink: #CBD5E1;
                    --yarn: #D97706;
                    --yarn-soft: #FEF3C7;
                    --ok: #16A34A;
                    --ok-soft: #DCFCE7;
                    --stitch-a: #2563EB;
                    --stitch-b: #9DB7F7;
                    --stitch-c: #F5B90B;
                    --shadow: 0 1px 2px rgba(15,23,42,.05), 0 10px 30px rgba(15,23,42,.08);
                    --scrim: rgba(15,23,42,.35);
                    --f-body: "Hind Siliguri", "Noto Sans Bengali", system-ui, sans-serif;
                    --f-display: "Tiro Bangla", "Hind Siliguri", serif;
                    --f-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
                    --ease: cubic-bezier(.22,.8,.24,1);
                    background: var(--bg);
                    color: var(--ink);
                    font-family: var(--f-body);
                    font-size: 16px;
                    line-height: 1.6;
                    min-height: 100vh;
                }

                .knitkhata-root h1, .knitkhata-root h2, .knitkhata-root h3 {
                    font-family: var(--f-display);
                    font-weight: 400;
                    margin: 0;
                    line-height: 1.25;
                }

                .knitkhata-root p { margin: 0; }
                .knitkhata-root button { font: inherit; color: inherit; cursor: pointer; }
                .knitkhata-root a { color: inherit; text-decoration: none; }

                .knitkhata-root .wrap {
                    max-width: 1160px;
                    margin: 0 auto;
                    padding-inline: clamp(16px, 4vw, 40px);
                }

                .knitkhata-root .eyebrow {
                    font-family: var(--f-body);
                    font-size: .86rem;
                    font-weight: 600;
                    color: var(--yarn);
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }
                .knitkhata-root .eyebrow::before {
                    content: "";
                    width: 22px;
                    height: 2px;
                    border-radius: 2px;
                    background: currentColor;
                }

                /* Top strip */
                .knitkhata-root .strip {
                    background: var(--strip);
                    color: var(--strip-ink);
                    font-size: .8rem;
                }
                .knitkhata-root .strip .wrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 20px;
                    align-items: center;
                    padding-block: 7px;
                }
                .knitkhata-root .strip .nm {
                    color: var(--ok);
                    font-weight: 600;
                }
                .knitkhata-root .strip .nm::before {
                    content: "";
                    display: inline-block;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--ok);
                    margin-right: 7px;
                    vertical-align: 1px;
                }
                .knitkhata-root .strip .r {
                    margin-left: auto;
                    display: flex;
                    gap: 14px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .knitkhata-root .strip b {
                    font-family: var(--f-mono);
                    font-weight: 500;
                    font-size: .74rem;
                    padding: 1px 8px;
                    border-radius: 5px;
                    background: color-mix(in srgb, var(--strip-ink) 14%, transparent);
                    color: var(--hero-ink);
                }
                .knitkhata-root .strip b.g {
                    background: color-mix(in srgb, var(--ok) 22%, transparent);
                    color: var(--ok);
                }

                /* Header / Top */
                .knitkhata-root .top {
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    background: var(--surface);
                    border-bottom: 1px solid var(--line);
                    transition: box-shadow .3s;
                }
                .knitkhata-root .top.scrolled {
                    box-shadow: var(--shadow);
                }
                .knitkhata-root .top .wrap {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding-block: 14px;
                }
                .knitkhata-root .brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-right: auto;
                }
                .knitkhata-root .logo {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: var(--grad);
                    display: grid;
                    place-items: center;
                }
                .knitkhata-root .logo svg {
                    stroke: var(--accent-ink);
                }
                .knitkhata-root .brand b {
                    font-family: var(--f-display);
                    font-weight: 400;
                    font-size: 1.35rem;
                }
                .knitkhata-root .navl {
                    display: flex;
                    gap: 22px;
                    font-size: .95rem;
                }
                .knitkhata-root .navl a {
                    color: var(--muted);
                    transition: color .2s;
                }
                .knitkhata-root .navl a:hover, .knitkhata-root .navl a.highlight {
                    color: var(--accent);
                    font-weight: 600;
                }

                /* Buttons */
                .knitkhata-root .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: 999px;
                    padding: 10px 20px;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    font-weight: 500;
                    transition: transform .25s var(--ease), background .25s, border-color .25s, box-shadow .25s;
                }
                .knitkhata-root .btn:hover {
                    transform: translateY(-1px);
                    border-color: var(--accent);
                }
                .knitkhata-root .btn.pri {
                    background: var(--grad);
                    border-color: transparent;
                    color: var(--accent-ink);
                    border-radius: 10px;
                }
                .knitkhata-root .btn.pri:hover {
                    box-shadow: 0 8px 22px color-mix(in srgb, var(--accent) 40%, transparent);
                }
                .knitkhata-root .btn.light {
                    background: var(--hero-ink);
                    color: #1E40AF;
                    border-color: transparent;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .knitkhata-root .btn.light:hover {
                    box-shadow: 0 10px 24px rgba(10,30,90,.25);
                }
                .knitkhata-root .btn.glass {
                    background: color-mix(in srgb, var(--hero-ink) 14%, transparent);
                    color: var(--hero-ink);
                    border-color: color-mix(in srgb, var(--hero-ink) 35%, transparent);
                    border-radius: 10px;
                }
                .knitkhata-root .btn.glass:hover {
                    border-color: var(--hero-ink);
                }
                .knitkhata-root .btn .arr {
                    transition: transform .25s var(--ease);
                }
                .knitkhata-root .btn:hover .arr {
                    transform: translateX(4px);
                }

                /* Hero Section */
                .knitkhata-root .hero {
                    padding-block: clamp(40px, 6vw, 80px);
                    color: var(--hero-ink);
                    position: relative;
                    overflow: hidden;
                    background:
                        radial-gradient(circle, color-mix(in srgb, var(--hero-ink) 18%, transparent) 1px, transparent 1.4px) 0 0/22px 22px,
                        linear-gradient(110deg, var(--hero-a), var(--hero-b) 70%, var(--accent-2));
                    background-size: 22px 22px, 200% 100%;
                    animation: sweep 14s ease-in-out infinite alternate;
                }
                @keyframes sweep {
                    from { background-position: 0 0, 0% 0; }
                    to { background-position: 0 0, 100% 0; }
                }
                .knitkhata-root .hero .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: .86rem;
                    font-weight: 600;
                    padding: 5px 14px;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--hero-ink) 16%, transparent);
                    border: 1px solid color-mix(in srgb, var(--hero-ink) 35%, transparent);
                }
                .knitkhata-root .hero .badge i {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--hl);
                }
                .knitkhata-root .hero .wrap {
                    display: grid;
                    grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
                    gap: clamp(28px, 5vw, 64px);
                    align-items: center;
                }
                .knitkhata-root .hero h1 {
                    font-size: clamp(2.3rem, 5.4vw, 4.1rem);
                    margin-top: 14px;
                }
                .knitkhata-root .hero h1 em {
                    font-style: normal;
                    color: var(--hl);
                    position: relative;
                    white-space: nowrap;
                }
                .knitkhata-root .hero h1 em::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: .02em;
                    height: .07em;
                    border-radius: 9px;
                    background: var(--hl);
                    opacity: .55;
                    transform-origin: left;
                    animation: line 1s .9s var(--ease) both;
                }
                .knitkhata-root .hero .lead {
                    font-size: 1.12rem;
                    color: color-mix(in srgb, var(--hero-ink) 88%, transparent);
                    max-width: 52ch;
                    margin-top: 18px;
                }
                .knitkhata-root .hero .ctas {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 28px;
                }
                .knitkhata-root .fact {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 28px;
                    font-size: .86rem;
                    font-weight: 600;
                }
                .knitkhata-root .fact span {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 5px 13px;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--hero-ink) 14%, transparent);
                    border: 1px solid color-mix(in srgb, var(--hero-ink) 30%, transparent);
                }
                .knitkhata-root .fact span::before {
                    content: "✓";
                    display: grid;
                    place-items: center;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 1.5px solid var(--hero-ink);
                    font-size: .62rem;
                    line-height: 1;
                }
                .knitkhata-root .rise {
                    animation: rise .9s var(--ease) both;
                }
                .knitkhata-root .d1 { animation-delay: .05s; }
                .knitkhata-root .d2 { animation-delay: .15s; }
                .knitkhata-root .d3 { animation-delay: .25s; }
                .knitkhata-root .d4 { animation-delay: .35s; }
                .knitkhata-root .d5 { animation-delay: .45s; }

                @keyframes rise {
                    from { transform: translateY(18px); opacity: .01; }
                    to { transform: none; opacity: 1; }
                }
                @keyframes line {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }

                /* Fabric Card */
                .knitkhata-root .fabric {
                    position: relative;
                    border-radius: 22px;
                    background: var(--surface);
                    color: var(--ink);
                    border: 1px solid color-mix(in srgb, var(--hero-ink) 40%, transparent);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                    aspect-ratio: 1/1;
                    max-width: 100%;
                }
                .knitkhata-root .fabric svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .knitkhata-root .st {
                    fill: none;
                    stroke-width: 5.2;
                    stroke-linecap: round;
                    stroke-dasharray: 60;
                    stroke-dashoffset: 60;
                    animation: knit .55s var(--ease) forwards;
                }
                @keyframes knit {
                    to { stroke-dashoffset: 0; }
                }
                .knitkhata-root .fabric .tag {
                    position: absolute;
                    left: 16px;
                    bottom: 16px;
                    right: 16px;
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    flex-wrap: wrap;
                    background: color-mix(in srgb, var(--surface) 90%, transparent);
                    backdrop-filter: blur(6px);
                    border: 1px solid var(--line);
                    border-radius: 12px;
                    padding: 10px 14px;
                    font-size: .84rem;
                }
                .knitkhata-root .fabric .tag b {
                    font-family: var(--f-mono);
                    font-weight: 500;
                }
                .knitkhata-root .fabric .live {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--ok);
                    font-weight: 600;
                }
                .knitkhata-root .fabric .live i {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--ok);
                    animation: pulse 1.6s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 50%, transparent); }
                    100% { box-shadow: 0 0 0 10px transparent; }
                }

                /* Choice Section */
                .knitkhata-root section {
                    padding-block: clamp(48px, 7vw, 90px);
                }
                .knitkhata-root .sec-head {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 640px;
                    margin-bottom: 34px;
                }
                .knitkhata-root .sec-head h2 {
                    font-size: clamp(1.8rem, 3.6vw, 2.6rem);
                }
                .knitkhata-root .sec-head p {
                    color: var(--muted);
                }
                .knitkhata-root .choice {
                    border-top: 1px solid var(--line);
                }
                .knitkhata-root .picks {
                    display: flex;
                    gap: 18px;
                    align-items: stretch;
                }
                .knitkhata-root .pick {
                    flex: 1 1 0;
                    min-width: 0;
                    text-align: left;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    transition: flex-grow .6s var(--ease), transform .35s var(--ease), border-color .3s, box-shadow .35s, opacity .4s, background .3s;
                }
                .knitkhata-root .pick:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow);
                    border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
                }
                .knitkhata-root .pick .ic {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: grid;
                    place-items: center;
                    background: var(--grad);
                    color: var(--accent-ink);
                    transition: transform .5s var(--ease);
                }
                .knitkhata-root .pick.yarnish .ic {
                    background: linear-gradient(135deg, var(--hero-a), var(--hero-b));
                    color: var(--accent-ink);
                }
                .knitkhata-root .pick .ic svg {
                    width: 28px;
                    height: 28px;
                    stroke: currentColor;
                    fill: none;
                    stroke-width: 1.6;
                }
                .knitkhata-root .pick h3 {
                    font-size: 1.45rem;
                }
                .knitkhata-root .pick .q {
                    color: var(--muted);
                    font-size: .96rem;
                }
                .knitkhata-root .pick .go {
                    margin-top: auto;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: var(--accent);
                }
                .knitkhata-root .pick.yarnish .go {
                    color: var(--hero-b);
                }
                .knitkhata-root .pick .go .arr {
                    transition: transform .3s var(--ease);
                }
                .knitkhata-root .pick:hover .go .arr {
                    transform: translateX(5px);
                }
                .knitkhata-root .picks.has-sel .pick {
                    opacity: .55;
                }
                .knitkhata-root .picks.has-sel .pick.sel {
                    opacity: 1;
                    flex-grow: 1.8;
                    border-color: var(--accent);
                    box-shadow: var(--shadow);
                }
                .knitkhata-root .picks.has-sel .pick.yarnish.sel {
                    border-color: var(--hero-b);
                }
                .knitkhata-root .pick.sel .ic {
                    transform: rotate(-8deg) scale(1.08);
                }

                .knitkhata-root .reveal {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows .6s var(--ease);
                }
                .knitkhata-root .reveal.open {
                    grid-template-rows: 1fr;
                }
                .knitkhata-root .reveal > div {
                    overflow: hidden;
                }
                .knitkhata-root .answer {
                    margin-top: 22px;
                    border-radius: 18px;
                    background: var(--strip);
                    color: var(--hero-ink);
                    border: 1px solid var(--line);
                    padding: clamp(24px, 4vw, 44px);
                    display: grid;
                    grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
                    gap: 28px;
                    align-items: center;
                    transform: translateY(14px);
                    transition: transform .6s var(--ease), opacity .3s;
                }
                .knitkhata-root .reveal.open .answer {
                    transform: none;
                }
                .knitkhata-root .answer .eyebrow {
                    color: var(--hl);
                }
                .knitkhata-root .answer h3 {
                    font-size: clamp(1.6rem, 3.2vw, 2.3rem);
                    margin-top: 10px;
                }
                .knitkhata-root .answer p {
                    opacity: .8;
                    margin-top: 12px;
                    max-width: 50ch;
                }
                .knitkhata-root .answer ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    gap: 10px;
                }
                .knitkhata-root .answer li {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    font-size: .97rem;
                }
                .knitkhata-root .answer li::before {
                    content: "✓";
                    flex: none;
                    display: grid;
                    place-items: center;
                    width: 20px;
                    height: 20px;
                    margin-top: 3px;
                    border-radius: 50%;
                    background: var(--ok);
                    color: var(--strip);
                    font-size: .7rem;
                    font-weight: 700;
                }
                .knitkhata-root .answer .btn {
                    margin-top: 22px;
                    background: var(--grad);
                    border-color: transparent;
                    color: var(--accent-ink);
                    border-radius: 10px;
                }
                .knitkhata-root .answer .btn.ghost {
                    background: transparent;
                    color: var(--hero-ink);
                    border-color: color-mix(in srgb, var(--hero-ink) 35%, transparent);
                    border-radius: 10px;
                    margin-left: 8px;
                }

                /* Features Grid */
                .knitkhata-root .features {
                    border-top: 1px solid var(--line);
                }
                .knitkhata-root .fgrid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    border: 1px solid var(--line);
                    border-radius: 16px;
                    overflow: hidden;
                    background: var(--line);
                    gap: 1px;
                }
                .knitkhata-root .f {
                    background: var(--surface);
                    padding: 26px 24px 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    position: relative;
                    transition: background .3s;
                }
                .knitkhata-root .f.order-trigger {
                    cursor: pointer;
                    background: #FDFEFE;
                }
                .knitkhata-root .f::after {
                    content: "";
                    position: absolute;
                    left: 24px;
                    right: 24px;
                    bottom: 0;
                    height: 3px;
                    border-radius: 3px 3px 0 0;
                    background: var(--grad);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform .45s var(--ease);
                }
                .knitkhata-root .f:hover::after {
                    transform: scaleX(1);
                }
                .knitkhata-root .f:hover {
                    background: color-mix(in srgb, var(--accent-soft) 35%, var(--surface));
                }
                .knitkhata-root .f .fi {
                    width: 40px;
                    height: 40px;
                    border-radius: 11px;
                    background: var(--accent-soft);
                    color: var(--accent);
                    display: grid;
                    place-items: center;
                    transition: transform .45s var(--ease);
                }
                .knitkhata-root .f:hover .fi {
                    transform: translateY(-3px);
                }
                .knitkhata-root .f .fi svg {
                    width: 22px;
                    height: 22px;
                    stroke: currentColor;
                    fill: none;
                    stroke-width: 1.7;
                }
                .knitkhata-root .f h3 {
                    font-size: 1.15rem;
                }
                .knitkhata-root .f p {
                    color: var(--muted);
                    font-size: .94rem;
                }
                .knitkhata-root .f .eg {
                    margin-top: auto;
                    font-family: var(--f-mono);
                    font-size: .74rem;
                    color: var(--yarn);
                    padding-top: 6px;
                }
                .knitkhata-root .f .order-click-hint {
                    color: var(--accent);
                    font-weight: 600;
                    font-size: .84rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                }

                /* Jobs Teaser */
                .knitkhata-root .jobs {
                    border-top: 1px solid var(--line);
                }
                .knitkhata-root .jrow {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }
                .knitkhata-root .job {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: transform .35s var(--ease), box-shadow .35s, border-color .3s;
                }
                .knitkhata-root .job:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow);
                    border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
                }
                .knitkhata-root .job .role {
                    font-weight: 600;
                    font-size: 1.05rem;
                }
                .knitkhata-root .job .meta {
                    font-size: .86rem;
                    color: var(--muted);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 14px;
                }
                .knitkhata-root .chip {
                    display: inline-flex;
                    align-items: center;
                    font-size: .76rem;
                    padding: 2px 10px;
                    border-radius: 999px;
                    background: var(--yarn-soft);
                    color: var(--yarn);
                    font-weight: 600;
                    width: fit-content;
                }
                .knitkhata-root .chip.new {
                    background: var(--ok-soft);
                    color: var(--ok);
                }
                .knitkhata-root .sample {
                    font-size: .8rem;
                    color: var(--muted);
                    margin-top: 14px;
                }

                /* Footer CTA */
                .knitkhata-root .cta {
                    border-top: 1px solid var(--line);
                }
                .knitkhata-root .ctabox {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    align-items: center;
                    justify-content: space-between;
                }
                .knitkhata-root .ctabox h2 {
                    font-size: clamp(1.6rem, 3.2vw, 2.3rem);
                    max-width: 22ch;
                }
                .knitkhata-root footer {
                    border-top: 1px solid var(--line);
                    padding-block: 24px 90px;
                    font-size: .86rem;
                    color: var(--muted);
                }
                .knitkhata-root footer .wrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px 24px;
                    justify-content: space-between;
                }

                /* Corner Job Portal Button */
                .knitkhata-root .jp {
                    position: fixed;
                    right: clamp(14px, 2.5vw, 28px);
                    bottom: calc(clamp(14px, 2.5vw, 28px) + env(safe-area-inset-bottom, 0px));
                    z-index: 40;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 999px;
                    padding: 8px 16px 8px 8px;
                    box-shadow: var(--shadow);
                    animation: pop .7s 1.4s var(--ease) both;
                    transition: transform .3s var(--ease), border-color .3s;
                }
                .knitkhata-root .jp:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent);
                }
                .knitkhata-root .jp .bag {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--grad);
                    color: var(--accent-ink);
                    display: grid;
                    place-items: center;
                    position: relative;
                }
                .knitkhata-root .jp .bag svg {
                    width: 18px;
                    height: 18px;
                    stroke: currentColor;
                    fill: none;
                    stroke-width: 1.8;
                }
                .knitkhata-root .jp .bag::after {
                    content: "";
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 2px solid var(--accent);
                    opacity: 0;
                    animation: ring 2.4s 2.2s infinite;
                }
                .knitkhata-root .jp b {
                    display: block;
                    font-size: .92rem;
                    line-height: 1.2;
                }
                .knitkhata-root .jp small {
                    display: block;
                    font-size: .76rem;
                    color: var(--muted);
                    line-height: 1.2;
                }
                @keyframes pop {
                    from { transform: translateY(30px) scale(.9); opacity: .01; }
                    to { transform: none; opacity: 1; }
                }
                @keyframes ring {
                    0% { transform: scale(.9); opacity: .8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                /* Job Drawer */
                .knitkhata-root .scrim {
                    position: fixed;
                    inset: 0;
                    background: var(--scrim);
                    z-index: 50;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity .4s;
                }
                .knitkhata-root .scrim.on {
                    opacity: 1;
                    pointer-events: auto;
                }
                .knitkhata-root .drawer {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: min(460px, 100%);
                    z-index: 60;
                    background: var(--bg);
                    border-left: 1px solid var(--line);
                    box-shadow: var(--shadow);
                    transform: translateX(102%);
                    transition: transform .55s var(--ease);
                    display: flex;
                    flex-direction: column;
                    padding-top: env(safe-area-inset-top, 0px);
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                }
                .knitkhata-root .drawer.on {
                    transform: none;
                }
                .knitkhata-root .dh {
                    padding: 20px 22px 14px;
                    border-bottom: 1px solid var(--line);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .knitkhata-root .dh .row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .knitkhata-root .dh h2 {
                    font-size: 1.5rem;
                }
                .knitkhata-root .x {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    transition: transform .3s var(--ease);
                }
                .knitkhata-root .x:hover {
                    transform: rotate(90deg);
                }
                .knitkhata-root .filters {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    padding-bottom: 2px;
                }
                .knitkhata-root .filters button {
                    flex: none;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 999px;
                    padding: 5px 13px;
                    font-size: .85rem;
                    transition: background .25s, color .25s, border-color .25s;
                }
                .knitkhata-root .filters button.on {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                }
                .knitkhata-root .dlist {
                    overflow-y: auto;
                    padding: 16px 22px 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                }
                .knitkhata-root .dj {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 14px;
                    padding: 16px;
                    animation: slide .45s var(--ease) both;
                }
                @keyframes slide {
                    from { transform: translateX(16px); opacity: .01; }
                    to { transform: none; opacity: 1; }
                }
                .knitkhata-root .dj .top2 {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    align-items: flex-start;
                }
                .knitkhata-root .dj .role {
                    font-weight: 600;
                }
                .knitkhata-root .dj .meta {
                    font-size: .84rem;
                    color: var(--muted);
                }
                .knitkhata-root .dj .more {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows .4s var(--ease);
                }
                .knitkhata-root .dj.open .more {
                    grid-template-rows: 1fr;
                }
                .knitkhata-root .dj .more > div {
                    overflow: hidden;
                }
                .knitkhata-root .dj .more ul {
                    margin: 10px 0 0;
                    padding-left: 18px;
                    font-size: .88rem;
                    color: var(--muted);
                }
                .knitkhata-root .dj .acts {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }
                .knitkhata-root .dj .acts button {
                    border: 1px solid var(--line);
                    background: transparent;
                    border-radius: 999px;
                    padding: 5px 14px;
                    font-size: .85rem;
                    transition: border-color .25s;
                }
                .knitkhata-root .dj .acts button:hover {
                    border-color: var(--accent);
                }
                .knitkhata-root .dj .acts button.ap {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                }
                .knitkhata-root .dfoot {
                    border-top: 1px solid var(--line);
                    padding: 14px 22px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    font-size: .88rem;
                    color: var(--muted);
                }
                .knitkhata-root .toast {
                    position: fixed;
                    left: 50%;
                    bottom: calc(84px + env(safe-area-inset-bottom, 0px));
                    transform: translateX(-50%);
                    z-index: 70;
                    background: var(--ink);
                    color: var(--bg);
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-size: .9rem;
                    max-width: calc(100% - 32px);
                    box-shadow: var(--shadow);
                }

                @media (max-width: 900px) {
                    .knitkhata-root .hero .wrap { grid-template-columns: 1fr; }
                    .knitkhata-root .fabric { max-width: 440px; aspect-ratio: 4/3; }
                    .knitkhata-root .answer { grid-template-columns: 1fr; }
                    .knitkhata-root .fgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .knitkhata-root .jrow { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .knitkhata-root .navl { display: none; }
                    .knitkhata-root .picks { flex-direction: column; }
                    .knitkhata-root .picks.has-sel .pick.sel { flex-grow: 1; }
                    .knitkhata-root .fgrid { grid-template-columns: 1fr; }
                    .knitkhata-root .jp small { display: none; }
                    .knitkhata-root .strip .r { display: none; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .knitkhata-root *, .knitkhata-root *::before, .knitkhata-root *::after {
                        animation-duration: .01ms !important;
                        animation-delay: 0s !important;
                        transition-duration: .01ms !important;
                    }
                    .knitkhata-root .st { stroke-dashoffset: 0; }
                }
            `}</style>

            {/* 1. TOP ANNOUNCEMENT STRIP */}
            <div className="strip">
                <div className="wrap">
                    <span className="nm">নিটখাতা | KNITKHATA</span>
                    <span>সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির ডিজিটাল খাতা</span>
                    <span className="r">
                        প্রথম ৩ মাস <b className="g">ফ্রি</b> ভেন্ডর পোর্টাল <b>সবসময় ফ্রি</b>
                    </span>
                </div>
            </div>

            {/* 2. STICKY TOP HEADER */}
            <header className={`top ${isScrolled ? 'scrolled' : ''}`} id="top">
                <div className="wrap">
                    <Link className="brand" href={route('home')}>
                        <span className="logo">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                                <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
                                <path d="M4 14c4 0 4 6 8 6s4-6 8-6" opacity=".6" />
                                <path d="M4 3c4 0 4 7 8 7s4-7 8-7" opacity=".35" />
                            </svg>
                        </span>
                        <b>নিটখাতা</b>
                    </Link>

                    <nav className="navl" aria-label="মূল মেনু">
                        <a href="#choose">আপনার জন্য</a>
                        <a href="#features">ফিচার</a>
                        <a href="#jobs">চাকরি</a>
                        <Link href={route('feed.index')} className="highlight">
                            সাব-কন্ট্রাক্ট অর্ডার
                        </Link>
                    </nav>

                    {user ? (
                        <Link className="btn pri" href={route('dashboard')}>
                            ড্যাশবোর্ড <span className="arr">→</span>
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Link className="btn" href={route('login')} style={{ border: 'none', background: 'transparent' }}>
                                লগইন
                            </Link>
                            <Link className="btn pri" href={route('register')}>
                                প্রবেশ করুন <span className="arr">→</span>
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <main id="home">
                {/* 3. HERO SECTION (Blue Gradient with Animated SVG Knit Fabric) */}
                <section className="hero">
                    <div className="wrap">
                        <div>
                            <div className="badge rise d1">
                                <i></i>অর্ডার থেকে বিল পর্যন্ত · এক খাতায়
                            </div>
                            <h1 className="rise d2">
                                স্বাগতম নিটখাতায়।<br />
                                প্রতিটা সুতা, প্রতিটা রোল, <em>এক খাতায়।</em>
                            </h1>
                            <p className="lead rise d3">
                                অর্ডার, সুতার লট, মেশিন, QC, বিল আর পার্টির লেজার — এতদিন যা ছড়িয়ে ছিল এক্সেল শিট আর রেজিস্টার খাতায়, এখন সব এক জায়গায়। ভেন্ডরও দেখতে পাবেন তার কাজ কতদূর।
                            </p>
                            <div className="ctas rise d4">
                                {/* The Critical Trigger: Goes to current Subcontract Feed */}
                                <Link className="btn light" href={route('feed.index')}>
                                    সাব-কন্ট্রাক্ট অর্ডার দেখুন <span className="arr">→</span>
                                </Link>
                                <a className="btn glass" href="#features">
                                    কী কী আছে দেখুন
                                </a>
                            </div>
                            <div className="fact rise d5">
                                <span>প্রথম ৩ মাস সম্পূর্ণ ফ্রি</span>
                                <span>বাংলায়, মোবাইলেও চলে</span>
                                <span>ভেন্ডর পোর্টাল সবসময় ফ্রি</span>
                            </div>
                        </div>

                        {/* Jersey Fabric Knitting Itself */}
                        <div className="fabric rise d3" aria-label="নিজে নিজে বোনা হচ্ছে এমন সিঙ্গেল জার্সি কাপড়ের ছবি">
                            <svg id="knit" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
                                {stitches.map((s) => (
                                    <React.Fragment key={s.id}>
                                        <path
                                            className="st"
                                            style={{ stroke: s.strokeVar, animationDelay: `${s.delay}s` }}
                                            d={s.d1}
                                        />
                                        <path
                                            className="st"
                                            style={{ stroke: s.strokeVar, animationDelay: `${s.delay + 0.06}s` }}
                                            d={s.d2}
                                        />
                                    </React.Fragment>
                                ))}
                            </svg>
                            <div className="tag">
                                <span className="live"><i></i>M-07 চলছে</span>
                                <span>Single Jersey · <b>160 GSM</b> · <b>30" × 24G</b></span>
                                <span>আজ <b ref={kgRef}>0</b> kg</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CHOICE SECTION (আপনি কোন ধরনের ফ্যাক্টরি চালান?) */}
                <section className="choice" id="choose">
                    <div className="wrap">
                        <div className="sec-head">
                            <div className="eyebrow">প্রথমে বলুন</div>
                            <h2>আপনি কোন ধরনের ফ্যাক্টরি চালান?</h2>
                            <p>যেকোনো একটা বেছে নিন, আপনার জন্য কী আছে দেখাচ্ছি।</p>
                        </div>

                        <div className={`picks ${selectedPick ? 'has-sel' : ''}`} id="picks">
                            {/* Pick 1: সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরি */}
                            <button
                                className={`pick ${selectedPick === 'sub' ? 'sel' : ''}`}
                                onClick={() => setSelectedPick(selectedPick === 'sub' ? null : 'sub')}
                                aria-expanded={selectedPick === 'sub'}
                                aria-controls="rv"
                            >
                                <span className="ic">
                                    <svg viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="8.5" />
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
                                    </svg>
                                </span>
                                <h3>সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরি</h3>
                                <p className="q">
                                    কম্পোজিট বা বড় ভেন্ডরের কাছ থেকে সুতা নিয়ে কাপড় বুনে দেন, নিটিং চার্জে বিল করেন।
                                </p>
                                <span className="go">
                                    আপনার জন্য টোটাল নিট সলিউশন <span className="arr">→</span>
                                </span>
                            </button>

                            {/* Pick 2: কম্পোজিট ফ্যাক্টরি */}
                            <button
                                className={`pick yarnish ${selectedPick === 'comp' ? 'sel' : ''}`}
                                onClick={() => setSelectedPick(selectedPick === 'comp' ? null : 'comp')}
                                aria-expanded={selectedPick === 'comp'}
                                aria-controls="rv"
                            >
                                <span className="ic">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M3 21V10l5-3v4l5-3v4l5-3v12z" />
                                        <path d="M7 21v-4h3v4M14 15h2M14 18h2" />
                                    </svg>
                                </span>
                                <h3>কম্পোজিট ফ্যাক্টরি</h3>
                                <p className="q">
                                    নিজের নিটিংয়ের বাইরে অনেক কাজ সাব-কন্ট্রাক্টে দেন, আর সবার খবর ফোন করে করে নিতে হয়।
                                </p>
                                <span className="go">
                                    সব সাব-কন্ট্রাক্টর এক জায়গায় <span className="arr">→</span>
                                </span>
                            </button>
                        </div>

                        {/* Expandable Accordion Answer */}
                        <div className={`reveal ${selectedPick ? 'open' : ''}`} id="rv">
                            <div>
                                {selectedPick && (
                                    <div className="answer" id="answer">
                                        <div>
                                            <div className="eyebrow">{ANSWERS[selectedPick].eb}</div>
                                            <h3>{ANSWERS[selectedPick].h}</h3>
                                            <p>{ANSWERS[selectedPick].p}</p>
                                            <div style={{ marginTop: '22px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {/* Navigates directly to current home page (subcontract feed) */}
                                                <Link className="btn" href={route('feed.index')}>
                                                    {ANSWERS[selectedPick].btn} <span className="arr">→</span>
                                                </Link>
                                                <button
                                                    className="btn ghost"
                                                    onClick={() => showToast('আসল সাইটে এখানে নাম আর মোবাইল নম্বর নেওয়ার ফর্ম থাকবে')}
                                                >
                                                    ডেমো চাই
                                                </button>
                                            </div>
                                        </div>
                                        <ul>
                                            {ANSWERS[selectedPick].li.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. FEATURES GRID (Card #1 is the Primary Trigger to current Home Page) */}
                <section className="features" id="features">
                    <div className="wrap">
                        <div className="sec-head">
                            <div className="eyebrow">নিটখাতায় যা পাবেন</div>
                            <h2>নিটিং ফ্যাক্টরির রোজকার কাজ, একটা সফটওয়্যারে</h2>
                            <p>ফ্লোর থেকে অফিস পর্যন্ত, যে কাজগুলো আজ খাতা-কলম আর এক্সেলে হচ্ছে।</p>
                        </div>

                        <div className="fgrid" id="fgrid">
                            {FEATURES.map((f) => {
                                // First Card is "সাব-কন্ট্রাক্ট অর্ডার" - Clicking it navigates to the current home page!
                                if (f.isOrderLink) {
                                    return (
                                        <Link
                                            key={f.key}
                                            href={route('feed.index')}
                                            className="f order-trigger"
                                            title="সাব-কন্ট্রাক্ট অর্ডারের লাইভ ফিড দেখতে ক্লিক করুন"
                                        >
                                            <span className="fi">
                                                <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[f.key] }} />
                                            </span>
                                            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span>{f.title}</span>
                                                <span style={{ fontSize: '.8rem', color: 'var(--accent)' }}>ফিডে যান →</span>
                                            </h3>
                                            <p>{f.desc}</p>
                                            <span className="eg">{f.badge}</span>
                                            <span className="order-click-hint">
                                                লাইভ অর্ডার দেখতে ক্লিক করুন →
                                            </span>
                                        </Link>
                                    );
                                }

                                return (
                                    <article key={f.key} className="f">
                                        <span className="fi">
                                            <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[f.key] }} />
                                        </span>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                        <span className="eg">{f.badge}</span>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 6. JOBS TEASER (নিটিং জব পোর্টাল) */}
                <section className="jobs" id="jobs">
                    <div className="wrap">
                        <div className="sec-head">
                            <div className="eyebrow">নিটিং জব পোর্টাল</div>
                            <h2>নিটিং সেক্টরের নতুন চাকরি</h2>
                            <p>অপারেটর থেকে নিটিং ম্যানেজার, শুধু নিটিং সংক্রান্ত চাকরি। ফ্যাক্টরিগুলো ফ্রি তে পোস্ট দিতে পারবে।</p>
                        </div>

                        <div className="jrow" id="jrow">
                            {JOBS.slice(0, 3).map((j) => (
                                <article key={j.id} className="job">
                                    {j.n ? (
                                        <span className="chip new">নতুন</span>
                                    ) : (
                                        <span className="chip">{JOB_CATEGORIES[j.t]}</span>
                                    )}
                                    <div className="role">{j.r}</div>
                                    <div className="meta">
                                        <span>{j.c}</span>
                                        <span>{j.a}</span>
                                        <span>{j.d}</span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '22px', alignItems: 'center' }}>
                            <button className="btn pri" onClick={() => setDrawerOpen(true)}>
                                সব চাকরি দেখুন <span className="arr">→</span>
                            </button>
                            <button
                                className="btn"
                                onClick={() => showToast('আসল সাইটে ফ্যাক্টরিগুলো এখান থেকে ফ্রি তে চাকরির বিজ্ঞাপন দেবে')}
                            >
                                চাকরির বিজ্ঞাপন দিন
                            </button>
                        </div>
                        <p className="sample">এখানের বিজ্ঞাপনগুলো ডিজাইন দেখানোর জন্য নমুনা, আসল চাকরি না।</p>
                    </div>
                </section>

                {/* 7. FOOTER CTA */}
                <section className="cta">
                    <div className="wrap ctabox">
                        <h2>আপনার ফ্যাক্টরির খাতাটা আজই ডিজিটাল করুন।</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <Link className="btn pri" href={route('feed.index')}>
                                ভেতরে প্রবেশ করুন <span className="arr">→</span>
                            </Link>
                            <button
                                className="btn"
                                onClick={() => showToast('আসল সাইটে এখানে নাম আর মোবাইল নম্বর নেওয়ার ফর্ম থাকবে')}
                            >
                                ডেমো চাই
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <div className="wrap">
                    <span>© ২০২৬ নিটখাতা · ঢাকা, বাংলাদেশ</span>
                    <span>সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির জন্য তৈরি</span>
                </div>
            </footer>

            {/* 8. FLOATING CORNER JOB PORTAL LAUNCHER */}
            <button
                className="jp"
                onClick={() => setDrawerOpen(true)}
                aria-label="জব পোর্টাল খুলুন"
            >
                <span className="bag">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
                    </svg>
                </span>
                <span>
                    <b>জব পোর্টাল</b>
                    <small id="jpc">{bnNum(newJobsCount)}টি নতুন · মোট {bnNum(JOBS.length)}টি</small>
                </span>
            </button>

            {/* 9. SLIDE-OUT JOB DRAWER & BACKDROP SCRIM */}
            <div
                className={`scrim ${drawerOpen ? 'on' : ''}`}
                id="scrim"
                onClick={() => setDrawerOpen(false)}
            />

            <aside
                className={`drawer ${drawerOpen ? 'on' : ''}`}
                id="drawer"
                aria-label="নিটিং জব পোর্টাল"
                aria-hidden={!drawerOpen}
            >
                <div className="dh">
                    <div className="row">
                        <div>
                            <div className="eyebrow">নিটিং জব পোর্টাল</div>
                            <h2>চাকরি খুঁজুন</h2>
                        </div>
                        <button className="x" onClick={() => setDrawerOpen(false)} aria-label="বন্ধ করুন">
                            ✕
                        </button>
                    </div>

                    <div className="filters" id="filters">
                        {Object.entries(JOB_CATEGORIES).map(([k, v]) => (
                            <button
                                key={k}
                                onClick={() => setJobFilter(k)}
                                className={jobFilter === k ? 'on' : ''}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dlist" id="dlist">
                    {filteredJobs.length === 0 ? (
                        <p className="meta" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>
                            এই ধরনের কোনো চাকরি এখন নেই।
                        </p>
                    ) : (
                        filteredJobs.map((j, i) => {
                            const isExpanded = expandedJobIds.includes(j.id);
                            return (
                                <article
                                    key={j.id}
                                    className={`dj ${isExpanded ? 'open' : ''}`}
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="top2">
                                        <div>
                                            <div className="role">{j.r}</div>
                                            <div className="meta">{j.c}</div>
                                        </div>
                                        {j.n && <span className="chip new">নতুন</span>}
                                    </div>

                                    <div className="meta" style={{ marginTop: '6px' }}>
                                        {j.a} · বেতন: {j.s} · {j.d}
                                    </div>

                                    <div className="more">
                                        <div>
                                            <ul>
                                                {j.req.map((req, rIdx) => (
                                                    <li key={rIdx}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="acts">
                                        <button onClick={() => toggleJobExpand(j.id)}>
                                            {isExpanded ? 'কম দেখুন' : 'বিস্তারিত'}
                                        </button>
                                        <button
                                            className="ap"
                                            onClick={() => showToast('আসল সাইটে এখানে মোবাইল নম্বর দিয়ে আবেদন ফর্ম খুলবে')}
                                        >
                                            আবেদন করুন
                                        </button>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <div className="dfoot">
                    <span>নমুনা বিজ্ঞাপন</span>
                    <button
                        className="btn"
                        onClick={() => showToast('আসল সাইটে ফ্যাক্টরিগুলো এখান থেকে ফ্রি তে চাকরির বিজ্ঞাপন দেবে')}
                        style={{ padding: '7px 16px' }}
                    >
                        + বিজ্ঞাপন দিন
                    </button>
                </div>
            </aside>

            {/* 10. TOAST NOTIFICATION */}
            {toastText && (
                <div className="toast" id="toast">
                    {toastText}
                </div>
            )}
        </div>
    );
}
