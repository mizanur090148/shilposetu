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
    { key: 'ord', title: 'সাব-কন্ট্রাক্ট অর্ডার', desc: 'কোন ভেন্ডরের কোন অর্ডার, কত kg, কোন ফেব্রিক, কতটুকু হলো — এক নজরে।', eg: 'SC-2610-014 · 62%' },
    { key: 'yarn', title: 'সুতা ও লট', desc: 'কাউন্ট, স্পিনার, লট, ব্যাগ ধরে সুতা গ্রহণ। সুতা ব্যালেন্স আর প্রসেস লস নিজে থেকেই।', eg: '30/1 CC · Lot SQ-88412' },
    { key: 'mc', title: 'মেশিন বোর্ড ও শেষের তারিখ', desc: 'কোন মেশিন কোন অর্ডারে চলছে। মেশিন বাড়ালে-কমালে শেষের তারিখ বদলে যায়।', eg: '4 M/C × 380 kg/দিন' },
    { key: 'qc', title: 'QC ও কাপড়ের সমস্যা', desc: 'রোল ধরে পরিদর্শন, hole, needle mark, barre — কোন মেশিনে কী হলো সব রেকর্ডে।', eg: 'R-0388 · needle mark' },
    { key: 'bill', title: 'বিল ও ভাউচার', desc: 'ডেলিভারি চালান থেকে এক ক্লিকে ভেন্ডরের বিল, সাথে ভাউচার। প্যাডের মতো প্রিন্ট।', eg: 'BL-2610-001 · JV-0927' },
    { key: 'led', title: 'পার্টি লেজার', desc: 'প্রতিটা পার্টির আলাদা খাতা — অর্ডার, সুতা, বিল, কত পেলাম, কত বাকি।', eg: 'বাকি ৳ ৪৪,৪৭৫' },
    { key: 'ven', title: 'ভেন্ডর পোর্টাল', desc: 'ভেন্ডরের লোক নিজের অর্ডারটুকুই দেখবেন। লোক বদলালে অ্যাক্সেস বদলান এক সুইচে।', eg: 'শুধু নিজের অর্ডার' },
    { key: 'wa', title: 'WhatsApp রিপোর্ট', desc: 'প্রতিদিন রাতে ভেন্ডরের WhatsApp এ কাজের অগ্রগতি আর Excel ফাইল।', eg: 'রাত ৮:০০ · .xlsx' },
    { key: 'acc', title: 'খরচ, ব্যাংক, LC ও হাজিরা', desc: 'দৈনিক খরচ, ইউটিলিটি বিল, ব্যাংক, LC আর কর্মীদের হাজিরা — অফিসের সব হিসাব।', eg: '৫৮ জন · শিফট A/B' },
];

interface AnswerItem {
    eb: string;
    h: string;
    p: string;
    li: string[];
    btn: string;
    href: string;
    isSup?: boolean;
}

const ANSWERS: Record<'sub' | 'comp' | 'sup', AnswerItem> = {
    sub: {
        eb: 'সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির জন্য',
        h: 'আপনার পুরো নিটিংয়ের কাজ, শুরু থেকে বিল পর্যন্ত।',
        p: 'ভেন্ডর থেকে অর্ডার আসা, সুতা গ্রহণ, মেশিনে তোলা, প্রতিদিনের প্রোডাকশন, QC, ডেলিভারি চালান, বিল আর টাকা পাওয়া — প্রতিটা ধাপ নিটখাতায় থাকবে।',
        li: [
            'প্রতিটা ভেন্ডরের আলাদা পার্টি লেজার',
            'মেশিন সংখ্যা দিলেই কবে কাজ শেষ হবে তার হিসাব',
            'এক ক্লিকে বিল, ভাউচার আর প্রিন্ট',
            'ভেন্ডরের লোক নিজেই দেখবেন তার কাজের আপডেট',
        ],
        btn: 'ভেতরে প্রবেশ করুন',
        href: '/subcontracts',
    },
    comp: {
        eb: 'কম্পোজিট ফ্যাক্টরির জন্য',
        h: 'আপনার সব সাব-কন্ট্রাক্টরের কাজ, এক স্ক্রিনে।',
        p: 'আপনার সাব-কন্ট্রাক্টর নিটখাতা ব্যবহার করলে আপনার নিটিং বা প্ল্যানিংয়ের লোক একটা লগইন দিয়েই দেখবেন কোন অর্ডার কতদূর, কোন লট চলছে, QC তে কী সমস্যা হলো।',
        li: [
            'ভেন্ডর পোর্টাল সবসময় ফ্রি',
            'প্রতিদিন রাতে WhatsApp এ Excel রিপোর্ট',
            'শুধু আপনার অর্ডার দেখবেন, অন্য কারো না',
            'দায়িত্ব বদলালে নতুন লোককে অ্যাক্সেস দেওয়া সহজ',
        ],
        btn: 'ভেন্ডর পোর্টাল দেখুন',
        href: '/subcontracts',
    },
    sup: {
        eb: 'সাপ্লায়ারদের জন্য',
        h: 'নিটিং ফ্যাক্টরির কাছে পৌঁছান, ঠিক যখন তাদের দরকার।',
        p: 'নিটখাতার অনুমোদিত সাপ্লায়ার হলে ফ্যাক্টরিগুলো আপনাকে বিশ্বাস করে খুঁজে নেবে। নিডল, অয়েল বা স্পেয়ারের কোটেশন অনুরোধ সরাসরি আপনার কাছে আসবে।',
        li: [
            'যাচাইয়ের পর "অনুমোদিত" ব্যাজ',
            'আপনার ক্যাটাগরির কোটেশন অনুরোধ',
            'ফ্যাক্টরির রেটিং দিয়ে সুনাম তৈরি',
            'প্রিমিয়াম ও স্পন্সর পার্টনার হওয়ার সুযোগ',
        ],
        btn: 'অনুমোদিত সাপ্লায়ার হোন',
        href: '#suppliers-join',
        isSup: true,
    },
};

const SUPPLIER_CATEGORIES: Record<string, string> = {
    all: 'সব',
    mc: 'নিটিং মেশিন',
    sinker: 'সিংকার ও নিডল',
    oil: 'নিটিং অয়েল',
    spare: 'স্পেয়ার পার্টস',
    elec: 'ইলেকট্রিক গুডস',
};

const SUPPLIERS = [
    { n: 'সার্কেল নিট মেশিনারি (নমুনা)', c: 'mc', also: ['spare'], a: 'সাভার', r: 4.6, f: 28, g: 'নতুন ও রিকন্ডিশন্ড সার্কুলার মেশিন, ইনস্টলেশন ও ২৪ ঘণ্টা সার্ভিস', sp: true },
    { n: 'ইউনিনিট মেশিনারিজ (নমুনা)', c: 'mc', a: 'গাজীপুর', r: 4.5, f: 17, g: 'ফ্ল্যাট ও কলার-কাফ নিটিং মেশিন, অপারেটর ট্রেনিং', sp: false },
    { n: 'প্রাইম সিংকার হাউস (নমুনা)', c: 'sinker', a: 'গাজীপুর', r: 4.8, f: 42, g: 'সার্কুলার ও ফ্ল্যাট মেশিনের সিংকার, নিডল ও ক্যাম', sp: false },
    { n: 'ক্লিয়ারফ্লো লুব্রিক্যান্টস (নমুনা)', c: 'oil', a: 'নারায়ণগঞ্জ', r: 4.7, f: 35, g: 'দাগ না পড়া নিটিং অয়েল, সিলিন্ডার ক্লিনার', sp: false },
    { n: 'টেকস্পেয়ার বিডি (নমুনা)', c: 'spare', a: 'আশুলিয়া', r: 4.5, f: 21, g: 'ফিডার, পজিটিভ ফিড, স্টপ মোশন, বেল্ট, সিলিন্ডার', sp: false },
    { n: 'পাওয়ারলাইন ইলেকট্রিক (নমুনা)', c: 'elec', a: 'গাজীপুর', r: 4.4, f: 16, g: 'মোটর, ইনভার্টার, প্যানেল, লাইট ও ক্যাবল', sp: false },
];

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

const AD_PLACEMENTS = [
    { k: 'home', t: 'হোম পেজ ব্যানার', d: 'হোম পেজের মাঝখানে, সবার চোখে পড়ে', w: 'সব ভিজিটর' },
    { k: 'sup', t: 'সাপ্লায়ার তালিকার উপরে', d: 'যখন ফ্যাক্টরি মেশিন, সিংকার বা অয়েল খুঁজছে', w: 'কেনার জন্য খুঁজছে এমন ফ্যাক্টরি' },
    { k: 'job', t: 'চাকরি পোর্টাল ব্যানার', d: 'চাকরির তালিকার উপরে', w: 'অপারেটর, টেকনিশিয়ান, সুপারভাইজার' },
    { k: 'app', t: 'সফটওয়্যারের ড্যাশবোর্ডে', d: 'নিটখাতা ব্যবহারকারী ফ্যাক্টরির ড্যাশবোর্ডে ছোট কার্ড', w: 'ফ্যাক্টরির মালিক ও ম্যানেজার' },
];

export default function Home({ stats }: HomeProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // View Routing state: 'home' | 'sup' | 'ad'
    const [view, setView] = useState<'home' | 'sup' | 'ad'>('home');

    // Choice Picker State
    const [selectedPick, setSelectedPick] = useState<'sub' | 'comp' | 'sup' | null>(null);

    // Header scroll state
    const [isScrolled, setIsScrolled] = useState(false);

    // Suppliers section state
    const [selectedSupplierCat, setSelectedSupplierCat] = useState('all');
    const [rfqCategory, setRfqCategory] = useState('mc');
    const [rfqQuantity, setRfqQuantity] = useState('');
    const [rfqDetails, setRfqDetails] = useState('');
    const [rfqArea, setRfqArea] = useState('গাজীপুর');
    const [rfqWhen, setRfqWhen] = useState('আজই');
    const [isRfqFlashing, setIsRfqFlashing] = useState(false);
    const rfqRef = useRef<HTMLDivElement>(null);
    const rfqQtyInputRef = useRef<HTMLInputElement>(null);

    // Supplier subpage form state
    const [supName, setSupName] = useState('');
    const [supCat, setSupCat] = useState('mc');
    const [supAlsoSpare, setSupAlsoSpare] = useState(false);
    const [supTier, setSupTier] = useState('অনুমোদিত সাপ্লায়ার');
    const [supBrand, setSupBrand] = useState('');
    const [supPerson, setSupPerson] = useState('');
    const [supPhone, setSupPhone] = useState('');
    const [supArea, setSupArea] = useState('গাজীপুর');
    const [supYrs, setSupYrs] = useState('৩–১০ বছর');

    // Ad Page live builder state
    const [selectedPlc, setSelectedPlc] = useState('home');
    const [adOrg, setAdOrg] = useState('আপনার প্রতিষ্ঠান');
    const [adTitle, setAdTitle] = useState('নতুন সার্কুলার নিটিং মেশিন — ইনস্টলেশনসহ');
    const [adDesc, setAdDesc] = useState('৩০" ও ৩৪" মেশিন স্টকে আছে। ডেমো দেখতে আমাদের শোরুমে আসুন।');
    const [adCta, setAdCta] = useState('যোগাযোগ করুন');
    const [adPhone, setAdPhone] = useState('');
    const [adDays, setAdDays] = useState('১৫ দিন');
    const [adImg, setAdImg] = useState<string>('');

    // Jobs Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [jobFilter, setJobFilter] = useState('all');
    const [expandedJobIds, setExpandedJobIds] = useState<number[]>([]);

    // Toast state
    const [toastText, setToastText] = useState<string | null>(null);
    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (text: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToastText(text);
        toastTimerRef.current = setTimeout(() => setToastText(null), 2800);
    };

    // Scroll listener for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 8);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Listen to hash changes for deep linking
    useEffect(() => {
        const handleHash = () => {
            if (window.location.hash === '#suppage') {
                setView('sup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (window.location.hash === '#adpage') {
                setView('ad');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (window.location.hash === '#jobs-open') {
                setDrawerOpen(true);
            }
        };

        handleHash();
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    // Production counter in Hero
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

    // Handle ESC key to close drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && drawerOpen) {
                setDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [drawerOpen]);

    // Navigation View Switchers
    const navigateToHome = (anchor?: string) => {
        setView('home');
        requestAnimationFrame(() => {
            if (anchor) {
                const el = document.getElementById(anchor);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const navigateToSupplier = (anchor?: string) => {
        setView('sup');
        requestAnimationFrame(() => {
            if (anchor) {
                const el = document.getElementById(anchor);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const navigateToAd = () => {
        setView('ad');
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // Filter suppliers
    const filteredSuppliers = useMemo(() => {
        const ORD = ['mc', 'sinker', 'oil', 'spare', 'elec'];
        return SUPPLIERS.filter(
            (s) =>
                selectedSupplierCat === 'all' ||
                s.c === selectedSupplierCat ||
                (s.also && s.also.includes(selectedSupplierCat))
        ).sort((a, b) => (b.sp ? 1 : 0) - (a.sp ? 1 : 0) || ORD.indexOf(a.c) - ORD.indexOf(b.c));
    }, [selectedSupplierCat]);

    // Trigger RFQ from Supplier Card
    const handleSupplierQuoteClick = (cat: string) => {
        setRfqCategory(cat);
        if (rfqRef.current) {
            rfqRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsRfqFlashing(true);
            setTimeout(() => {
                setIsRfqFlashing(false);
                if (rfqQtyInputRef.current) {
                    rfqQtyInputRef.current.focus({ preventScroll: true });
                }
            }, 600);
        }
    };

    // Handle RFQ Submit
    const handleRfqSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const catName = SUPPLIER_CATEGORIES[rfqCategory] || rfqCategory;
        showToast(`${catName} — ${rfqArea} এলাকার ৩টি অনুমোদিত সাপ্লায়ারের কাছে পাঠানো হবে (নমুনা)`);
    };

    // Handle Supplier Application Submit
    const handleSupplierAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const n = supName.trim();
        if (!n) {
            showToast('প্রতিষ্ঠানের নাম লিখুন');
            return;
        }
        showToast(`${n} — আবেদন পাওয়া গেছে। নিটখাতার টিম যোগাযোগ করবে (নমুনা)`);
        setSupName('');
    };

    // Handle Ad Upload
    const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setAdImg(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    // Handle Ad Submit
    const handleAdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const plcObj = AD_PLACEMENTS.find((p) => p.k === selectedPlc);
        showToast(`বিজ্ঞাপন জমা হয়েছে — ${plcObj?.t}, ${adDays}। রিভিউর পর চালু হবে (নমুনা)`);
    };

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

    const newJobsCount = JOBS.filter((j) => j.n).length;

    return (
        <div className="knitkhata-root">
            <Head>
                <title>নিটখাতা হোম - সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির ডিজিটাল খাতা</title>
                <meta
                    name="description"
                    content="নিটখাতা: সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির ডিজিটাল খাতা। প্রতিটা সুতা, প্রতিটা রোল, এক খাতায়।"
                />
            </Head>

            {/* EMBEDDED BESPOKE CSS - EXACT SHILPO SETU / KNITKHATA THEME */}
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
                    --metal0: #F8FAFC;
                    --metal1: #E2E8F0;
                    --metal2: #CBD5E1;
                    --metal3: #64748B;
                    --metal4: #334155;
                    --fab: #EEF2FF;
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

                @media (prefers-color-scheme: dark) {
                    .knitkhata-root:not([data-theme="light"]) {
                        --bg: #0B1220;
                        --surface: #121B2E;
                        --line: #22304A;
                        --ink: #E6ECF5;
                        --muted: #94A3B8;
                        --accent: #7090FB;
                        --accent-2: #8B85F7;
                        --accent-ink: #FFFFFF;
                        --accent-soft: #1B2A55;
                        --grad: linear-gradient(135deg, #2D5FE0 0%, #5145D8 100%);
                        --hero-a: #0E5E98;
                        --hero-b: #2A3FB5;
                        --hero-ink: #FFFFFF;
                        --hl: #FDE047;
                        --strip: #060B16;
                        --strip-ink: #94A3B8;
                        --yarn: #FBBF24;
                        --yarn-soft: #3A2E12;
                        --ok: #4ADE80;
                        --ok-soft: #123222;
                        --stitch-a: #7090FB;
                        --stitch-b: #2E4A8F;
                        --stitch-c: #FBBF24;
                        --metal0: #475569;
                        --metal1: #334155;
                        --metal2: #1E293B;
                        --metal3: #94A3B8;
                        --metal4: #E2E8F0;
                        --fab: #1B2A55;
                        --shadow: 0 1px 2px rgba(0,0,0,.3), 0 10px 30px rgba(0,0,0,.35);
                        --scrim: rgba(0,0,0,.55);
                        color-scheme: dark;
                    }
                }

                .knitkhata-root * { box-sizing: border-box; }
                .knitkhata-root [hidden] { display: none !important; }
                .knitkhata-root h1, .knitkhata-root h2, .knitkhata-root h3 {
                    font-family: var(--f-display);
                    font-weight: 400;
                    margin: 0;
                    line-height: 1.25;
                }
                .knitkhata-root p { margin: 0; }
                .knitkhata-root a { color: inherit; text-decoration: none; }
                .knitkhata-root button { font: inherit; color: inherit; cursor: pointer; }
                .knitkhata-root :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 6px; }

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

                /* Top Notification Strip */
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

                /* Sticky Header */
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
                    gap: 8px;
                    font-size: .95rem;
                    flex-wrap: wrap;
                }
                .knitkhata-root .navl .np,
                .knitkhata-root .navl a.np,
                .knitkhata-root .navl button.np {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    color: var(--ink);
                    font-weight: 600;
                    padding: 9px 16px;
                    border-radius: 10px;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    transition: transform .25s var(--ease), border-color .25s, box-shadow .25s, background .25s, color .25s;
                    cursor: pointer;
                    font-size: .95rem;
                    line-height: 1.5;
                }
                .knitkhata-root .navl .np svg,
                .knitkhata-root .navl a.np svg,
                .knitkhata-root .navl button.np svg {
                    width: 18px !important;
                    height: 18px !important;
                    stroke: var(--accent) !important;
                    fill: none !important;
                    stroke-width: 1.8 !important;
                    stroke-linecap: round !important;
                    stroke-linejoin: round !important;
                    transition: stroke .25s;
                    flex-shrink: 0;
                    display: inline-block;
                }
                .knitkhata-root .navl .np:hover,
                .knitkhata-root .navl a.np:hover,
                .knitkhata-root .navl button.np:hover {
                    transform: translateY(-1px);
                    border-color: var(--accent);
                    box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 18%, transparent);
                }
                .knitkhata-root .navl .np.on,
                .knitkhata-root .navl a.np.on,
                .knitkhata-root .navl button.np.on {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                }
                .knitkhata-root .navl .np.on svg,
                .knitkhata-root .navl a.np.on svg,
                .knitkhata-root .navl button.np.on svg {
                    stroke: var(--accent-ink) !important;
                    fill: none !important;
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
                .knitkhata-root .btn.ghost {
                    background: transparent;
                    color: var(--hero-ink);
                    border-color: color-mix(in srgb, var(--hero-ink) 35%, transparent);
                    border-radius: 10px;
                    margin-left: 6px;
                }
                .knitkhata-root .btn .arr {
                    transition: transform .25s var(--ease);
                }
                .knitkhata-root .btn:hover .arr {
                    transform: translateX(4px);
                }

                /* Hero */
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

                /* Circular Knitting Machine / Fabric Stage */
                .knitkhata-root .fabric {
                    position: relative;
                    border-radius: 22px;
                    background: radial-gradient(120% 90% at 50% 40%, var(--surface) 0%, color-mix(in srgb, var(--accent-soft) 70%, var(--surface)) 100%);
                    color: var(--ink);
                    border: 1px solid color-mix(in srgb, var(--hero-ink) 40%, transparent);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                    aspect-ratio: 1/1;
                    max-width: 100%;
                }
                .knitkhata-root .mstage {
                    position: absolute;
                    inset: 4% 4% 16% 4%;
                }
                .knitkhata-root .mstage::after {
                    content: "";
                    position: absolute;
                    left: 14%;
                    right: 14%;
                    bottom: -2%;
                    height: 6%;
                    border-radius: 50%;
                    background: var(--ink);
                    opacity: .12;
                    filter: blur(8px);
                    animation: shadow 4s ease-in-out infinite;
                }
                .knitkhata-root #mimg {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    animation: hover 4s ease-in-out infinite;
                    filter: drop-shadow(0 12px 18px rgba(15,23,42,.18));
                }
                @keyframes hover { 50% { transform: translateY(-6px); } }
                @keyframes shadow { 50% { transform: scaleX(.92); opacity: .08; } }

                .knitkhata-root .fabric .tag {
                    z-index: 2;
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
                .knitkhata-root .pick.supish .ic {
                    background: linear-gradient(135deg, #F59E0B, #D97706);
                    color: #FFFFFF;
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
                .knitkhata-root .pick.supish .go {
                    color: var(--yarn);
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
                .knitkhata-root .picks.has-sel .pick.supish.sel {
                    border-color: var(--yarn);
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
                    transition: transform .6s var(--ease);
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

                /* Features */
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

                /* Ad Banner Slot */
                .knitkhata-root .adslot {
                    padding-block: 8px 0;
                }
                .knitkhata-root .adb {
                    position: relative;
                    display: grid;
                    grid-template-columns: auto minmax(0, 1fr) auto;
                    gap: 18px;
                    align-items: center;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 18px 22px;
                    overflow: hidden;
                    transition: transform .35s var(--ease), box-shadow .35s;
                }
                .knitkhata-root .adb::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 5px;
                    background: var(--grad);
                }
                .knitkhata-root .adb:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }
                .knitkhata-root .adb .ai {
                    width: 64px;
                    height: 64px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #F59E0B, #D97706);
                    display: grid;
                    place-items: center;
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 1.4rem;
                    overflow: hidden;
                    flex: none;
                }
                .knitkhata-root .adb .ai img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .knitkhata-root .adb .at {
                    font-weight: 700;
                    font-size: 1.08rem;
                    line-height: 1.35;
                }
                .knitkhata-root .adb .ad {
                    font-size: .92rem;
                    color: var(--muted);
                    margin-top: 2px;
                }
                .knitkhata-root .adb .by {
                    font-size: .8rem;
                    color: var(--muted);
                    margin-top: 4px;
                }
                .knitkhata-root .adb .ac {
                    border-radius: 10px;
                    padding: 9px 16px;
                    font-weight: 600;
                    background: var(--grad);
                    color: var(--accent-ink);
                    border: 0;
                    white-space: nowrap;
                }
                .knitkhata-root .adlbl {
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: .68rem;
                    font-weight: 700;
                    letter-spacing: .02em;
                    color: var(--muted);
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    padding: 0 6px;
                    background: var(--surface);
                }
                .knitkhata-root .adnote {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 8px;
                    font-size: .84rem;
                }
                .knitkhata-root .adnote a, .knitkhata-root .adnote button {
                    color: var(--accent);
                    font-weight: 600;
                    background: none;
                    border: none;
                    padding: 0;
                }

                /* Suppliers Section */
                .knitkhata-root .sups {
                    border-top: 1px solid var(--line);
                }
                .knitkhata-root .schips {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .knitkhata-root .schips button {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 999px;
                    padding: 6px 14px;
                    font-size: .88rem;
                    transition: background .25s, color .25s, border-color .25s;
                }
                .knitkhata-root .schips button:hover {
                    border-color: var(--accent);
                }
                .knitkhata-root .schips button.on {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                }
                .knitkhata-root .sgrid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                }
                .knitkhata-root .sc {
                    position: relative;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: transform .35s var(--ease), box-shadow .35s, border-color .3s;
                    animation: rise .5s var(--ease) both;
                }
                .knitkhata-root .sc:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow);
                    border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
                }
                .knitkhata-root .sc.sp {
                    border: 1.5px solid transparent;
                    background: linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad) border-box;
                }
                .knitkhata-root .sc .top3 {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .knitkhata-root .av {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: var(--grad);
                    color: var(--accent-ink);
                    display: grid;
                    place-items: center;
                    font-weight: 700;
                    flex: none;
                }
                .knitkhata-root .sc .nm {
                    font-weight: 600;
                    line-height: 1.3;
                }
                .knitkhata-root .vb {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: .76rem;
                    font-weight: 600;
                    color: var(--ok);
                }
                .knitkhata-root .vb::before {
                    content: "✓";
                    display: grid;
                    place-items: center;
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    background: var(--ok);
                    color: var(--surface);
                    font-size: .6rem;
                }
                .knitkhata-root .spt {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    font-size: .72rem;
                    font-weight: 700;
                    padding: 2px 9px;
                    border-radius: 999px;
                    background: var(--yarn-soft);
                    color: var(--yarn);
                }
                .knitkhata-root .sc .meta {
                    font-size: .85rem;
                    color: var(--muted);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 12px;
                }
                .knitkhata-root .sc .gives {
                    font-size: .88rem;
                }
                .knitkhata-root .sc .meta .cat {
                    font-weight: 600;
                    color: var(--accent);
                }
                .knitkhata-root .sc .meta .also {
                    font-size: .76rem;
                    font-weight: 600;
                    padding: 1px 8px;
                    border-radius: 999px;
                    background: var(--yarn-soft);
                    color: var(--yarn);
                }
                .knitkhata-root .sc .acts {
                    display: flex;
                    gap: 8px;
                    margin-top: auto;
                    padding-top: 4px;
                }
                .knitkhata-root .sc .acts button {
                    border-radius: 10px;
                    padding: 7px 14px;
                    font-size: .88rem;
                    border: 1px solid var(--line);
                    background: var(--surface);
                }
                .knitkhata-root .sc .acts button.q {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                    font-weight: 600;
                }

                /* RFQ Form */
                .knitkhata-root .rfq {
                    margin-top: 22px;
                    display: grid;
                    grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
                    gap: 24px;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 18px;
                    padding: clamp(20px, 3vw, 32px);
                    align-items: start;
                }
                .knitkhata-root .rfq h3 {
                    font-size: 1.35rem;
                }
                .knitkhata-root .rfq p {
                    color: var(--muted);
                    margin-top: 8px;
                    font-size: .95rem;
                }
                .knitkhata-root .steps {
                    list-style: none;
                    margin: 16px 0 0;
                    padding: 0;
                    display: grid;
                    gap: 10px;
                    counter-reset: st;
                }
                .knitkhata-root .steps li {
                    display: flex;
                    gap: 10px;
                    font-size: .92rem;
                    counter-increment: st;
                }
                .knitkhata-root .steps li::before {
                    content: counter(st);
                    flex: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--accent-soft);
                    color: var(--accent);
                    display: grid;
                    place-items: center;
                    font-weight: 700;
                    font-size: .8rem;
                }
                .knitkhata-root .rfqf {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .knitkhata-root .rfqf label {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    font-size: .84rem;
                    color: var(--muted);
                }
                .knitkhata-root .rfqf .wide {
                    grid-column: 1 / -1;
                }
                .knitkhata-root .rfqf .chkl span {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--ink);
                    font-size: .92rem;
                }
                .knitkhata-root .rfqf .chkl input {
                    accent-color: var(--accent);
                    width: 18px;
                    height: 18px;
                }
                .knitkhata-root .rfqf input, .knitkhata-root .rfqf select, .knitkhata-root .rfqf textarea {
                    font: inherit;
                    color: var(--ink);
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: 10px;
                    padding: 9px 11px;
                    min-width: 0;
                }
                .knitkhata-root .rfqf textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                .knitkhata-root .rfqf input:focus, .knitkhata-root .rfqf select:focus, .knitkhata-root .rfqf textarea:focus {
                    outline: 2px solid var(--accent);
                    outline-offset: 1px;
                }
                .knitkhata-root .rfq.flash {
                    animation: flash 1.2s var(--ease);
                }
                @keyframes flash {
                    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent); }
                    100% { box-shadow: 0 0 0 14px transparent; }
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

                /* Corner Job Portal Pill */
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

                /* Supplier Sub-Page (#suppage) */
                .knitkhata-root .sphero {
                    color: var(--hero-ink);
                    background:
                        radial-gradient(circle, color-mix(in srgb, var(--hero-ink) 18%, transparent) 1px, transparent 1.4px) 0 0/22px 22px,
                        linear-gradient(110deg, var(--hero-a), var(--hero-b) 70%, var(--accent-2));
                    padding-block: clamp(36px, 5vw, 64px);
                }
                .knitkhata-root .sphero .badge {
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
                .knitkhata-root .sphero .badge i {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--hl);
                }
                .knitkhata-root .sphero h1 {
                    font-size: clamp(2rem, 4.6vw, 3.4rem);
                    margin-top: 14px;
                }
                .knitkhata-root .sphero h1 em {
                    font-style: normal;
                    color: var(--hl);
                }
                .knitkhata-root .sphero .lead {
                    max-width: 60ch;
                    margin-top: 14px;
                    font-size: 1.08rem;
                    color: color-mix(in srgb, var(--hero-ink) 88%, transparent);
                }
                .knitkhata-root .prio {
                    display: grid;
                    grid-template-columns: 1.3fr 1fr 1fr;
                    gap: 14px;
                }
                .knitkhata-root .pr {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .knitkhata-root .pr b {
                    font-size: 1.08rem;
                }
                .knitkhata-root .pr > span:last-child {
                    font-size: .9rem;
                    color: var(--muted);
                }
                .knitkhata-root .pr .pn {
                    font-size: .78rem;
                    font-weight: 700;
                    color: var(--muted);
                }
                .knitkhata-root .pr.first {
                    border: 1.5px solid transparent;
                    background: linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad) border-box;
                }
                .knitkhata-root .pr.first .pn {
                    color: var(--accent);
                }
                .knitkhata-root .tiers {
                    margin-top: 40px;
                }
                .knitkhata-root .tgrid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }
                .knitkhata-root .tier {
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: transform .35s var(--ease), box-shadow .35s;
                }
                .knitkhata-root .tier:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow);
                }
                .knitkhata-root .tier.mid {
                    background: var(--strip);
                    color: var(--hero-ink);
                    border-color: var(--strip);
                }
                .knitkhata-root .tier .tn {
                    font-family: var(--f-display);
                    font-size: 1.35rem;
                }
                .knitkhata-root .tier .td {
                    font-size: .9rem;
                    opacity: .8;
                }
                .knitkhata-root .tier ul {
                    list-style: none;
                    margin: 6px 0 0;
                    padding: 0;
                    display: grid;
                    gap: 8px;
                    font-size: .92rem;
                }
                .knitkhata-root .tier li {
                    display: flex;
                    gap: 8px;
                }
                .knitkhata-root .tier li::before {
                    content: "✓";
                    color: var(--ok);
                    font-weight: 700;
                }
                .knitkhata-root .tier .btn {
                    margin-top: auto;
                    justify-content: center;
                }
                .knitkhata-root .tier.mid .btn {
                    background: var(--grad);
                    color: var(--accent-ink);
                    border-color: transparent;
                }

                /* Ad Page (#adpage) */
                .knitkhata-root .plc {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 14px;
                }
                .knitkhata-root .pl {
                    text-align: left;
                    border: 1px solid var(--line);
                    background: var(--surface);
                    border-radius: 16px;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: transform .3s var(--ease), border-color .3s, box-shadow .3s;
                }
                .knitkhata-root .pl:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow);
                }
                .knitkhata-root .pl.on {
                    border: 1.5px solid transparent;
                    background: linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad) border-box;
                }
                .knitkhata-root .pl b { font-size: 1.02rem; }
                .knitkhata-root .pl span { font-size: .86rem; color: var(--muted); }
                .knitkhata-root .pl .who { font-size: .8rem; font-weight: 600; color: var(--accent); }
                .knitkhata-root .adbuild {
                    margin-top: 28px;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 24px;
                    align-items: start;
                }
                .knitkhata-root .adbuild > * { min-width: 0; }
                .knitkhata-root #adf input, .knitkhata-root #adf select, .knitkhata-root #adf textarea {
                    width: 100%;
                }
                .knitkhata-root .adprev {
                    position: sticky;
                    top: calc(90px + env(safe-area-inset-top, 0px));
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .knitkhata-root .adprev .pt {
                    font-size: .84rem;
                    color: var(--muted);
                }
                .knitkhata-root .adrules {
                    margin-top: 36px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 10px 28px;
                    list-style: none;
                    padding: 0;
                }
                .knitkhata-root .adrules li {
                    display: flex;
                    gap: 10px;
                    font-size: .92rem;
                }
                .knitkhata-root .adrules li::before {
                    content: "✓";
                    flex: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--ok);
                    color: var(--surface);
                    display: grid;
                    place-items: center;
                    font-size: .7rem;
                    font-weight: 700;
                    margin-top: 2px;
                }

                /* Toast */
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

                /* Responsive Breakpoints */
                @media (max-width: 900px) {
                    .knitkhata-root .hero .wrap { grid-template-columns: 1fr; }
                    .knitkhata-root .fabric { max-width: 420px; aspect-ratio: 1/1; width: 100%; justify-self: center; }
                    .knitkhata-root .fabric .tag { font-size: .76rem; padding: 8px 10px; left: 10px; right: 10px; bottom: 10px; }
                    .knitkhata-root .answer { grid-template-columns: 1fr; }
                    .knitkhata-root .fgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .knitkhata-root .jrow { grid-template-columns: 1fr; }
                    .knitkhata-root .prio { grid-template-columns: 1fr; }
                    .knitkhata-root .sgrid, .knitkhata-root .tgrid { grid-template-columns: 1fr 1fr; }
                    .knitkhata-root .rfq { grid-template-columns: 1fr; }
                    .knitkhata-root .plc { grid-template-columns: 1fr 1fr; }
                    .knitkhata-root .adbuild { grid-template-columns: 1fr; }
                    .knitkhata-root .adprev { position: static; }
                }

                @media (max-width: 640px) {
                    .knitkhata-root .top .wrap { flex-wrap: wrap; gap: 10px; padding-block: 10px; }
                    .knitkhata-root .navl { width: 100%; gap: 6px; }
                    .knitkhata-root .navl a.np { flex: 1 1 0; justify-content: center; padding: 8px 6px; font-size: .84rem; gap: 5px; }
                    .knitkhata-root .navl a.np svg { width: 15px; height: 15px; }
                    .knitkhata-root .picks { flex-direction: column; }
                    .knitkhata-root .picks.has-sel .pick.sel { flex-grow: 1; }
                    .knitkhata-root .fgrid { grid-template-columns: 1fr; }
                    .knitkhata-root .jp small { display: none; }
                    .knitkhata-root .strip .r { display: none; }
                    .knitkhata-root .sgrid, .knitkhata-root .tgrid, .knitkhata-root .rfqf { grid-template-columns: 1fr; }
                    .knitkhata-root .plc, .knitkhata-root .adrules { grid-template-columns: 1fr; }
                    .knitkhata-root .adb { grid-template-columns: auto minmax(0, 1fr); }
                    .knitkhata-root .adb .ac { grid-column: 1 / -1; justify-self: start; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .knitkhata-root *, .knitkhata-root *::before, .knitkhata-root *::after {
                        animation-duration: .01ms !important;
                        animation-delay: 0s !important;
                        transition-duration: .01ms !important;
                    }
                }
            `}</style>

            {/* 1. TOP STRIP */}
            <div className="strip">
                <div className="wrap">
                    <span className="nm">নিটখাতা | KNITKHATA</span>
                    <span>সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির ডিজিটাল খাতা</span>
                    <span className="r">
                        ১ মাস <b className="g">ফ্রি ট্রায়াল</b> ভেন্ডর পোর্টাল <b>সবসময় ফ্রি</b>
                    </span>
                </div>
            </div>

            {/* 2. STICKY TOP HEADER */}
            <header className={`top ${isScrolled ? 'scrolled' : ''}`} id="top">
                <div className="wrap">
                    <a
                        className="brand"
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            navigateToHome();
                        }}
                    >
                        <span className="logo">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                                <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
                                <path d="M4 14c4 0 4 6 8 6s4-6 8-6" opacity=".6" />
                                <path d="M4 3c4 0 4 7 8 7s4-7 8-7" opacity=".35" />
                            </svg>
                        </span>
                        <b>নিটখাতা</b>
                    </a>

                    <nav className="navl" aria-label="পোর্টাল">
                        <Link href="/subcontracts" className="np">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="8.5" />
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
                            </svg>
                            সাব-কন্ট্রাক্ট ফ্যাক্টরি
                        </Link>
                        <a
                            href="#suppage"
                            className={`np ${view === 'sup' ? 'on' : ''}`}
                            id="nav-sup"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateToSupplier();
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7l9-4 9 4-9 4z" />
                                <path d="M3 7v10l9 4 9-4V7" />
                                <path d="M12 11v10" />
                            </svg>
                            সাপ্লায়ার
                        </a>
                        <a
                            href="#jobs"
                            className="np"
                            id="nav-jobs"
                            onClick={(e) => {
                                e.preventDefault();
                                setDrawerOpen(true);
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="7" width="18" height="13" rx="2" />
                                <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
                            </svg>
                            চাকরি
                        </a>
                    </nav>
                </div>
            </header>

            {/* ========================================================
                MAIN VIEW: HOME PAGE
            ======================================================== */}
            {view === 'home' && (
                <main id="home">
                    {/* Hero Section */}
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
                                    <a className="btn light" href="#choose">
                                        শুরু করুন <span className="arr">→</span>
                                    </a>
                                    <a className="btn glass" href="#features">
                                        কী কী আছে দেখুন
                                    </a>
                                </div>
                                <div className="fact rise d5">
                                    <span>১ মাস ফ্রি ট্রায়াল</span>
                                    <span>বাংলায়, মোবাইলেও চলে</span>
                                    <span>ভেন্ডর পোর্টাল সবসময় ফ্রি</span>
                                </div>
                            </div>

                            {/* Circular Knitting Machine Fabric Visual */}
                            <div className="fabric rise d3" aria-label="সার্কুলার নিটিং মেশিনের ছবি">
                                <div className="mstage">
                                    <img
                                        id="mimg"
                                        src="/images/circular-knitting-machine.webp"
                                        alt="সার্কুলার নিটিং মেশিন"
                                    />
                                </div>
                                <div className="tag">
                                    <span className="live">
                                        <i></i>M-07 চলছে
                                    </span>
                                    <span>Single Jersey · <b>160 GSM</b> · <b>30" × 24G</b></span>
                                    <span>আজ <b ref={kgRef}>0</b> kg</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Choice Section ("প্রথমে বলুন") */}
                    <section className="choice" id="choose">
                        <div className="wrap">
                            <div className="sec-head">
                                <div className="eyebrow">প্রথমে বলুন</div>
                                <h2>আপনি কে — ফ্যাক্টরি না সাপ্লায়ার?</h2>
                                <p>যেকোনো একটা বেছে নিন, আপনার জন্য কী আছে দেখাচ্ছি।</p>
                            </div>

                            <div className={`picks ${selectedPick ? 'has-sel' : ''}`} id="picks">
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
                                    <p className="q">কম্পোজিট বা বড় ভেন্ডরের কাছ থেকে সুতা নিয়ে কাপড় বুনে দেন, নিটিং চার্জে বিল করেন।</p>
                                    <span className="go">
                                        আপনার জন্য টোটাল নিট সলিউশন <span className="arr">→</span>
                                    </span>
                                </button>

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
                                    <p className="q">নিজের নিটিংয়ের বাইরে অনেক কাজ সাব-কন্ট্রাক্টে দেন, আর সবার খবর ফোন করে করে নিতে হয়।</p>
                                    <span className="go">
                                        সব সাব-কন্ট্রাক্টর এক জায়গায় <span className="arr">→</span>
                                    </span>
                                </button>

                                <button
                                    className={`pick supish ${selectedPick === 'sup' ? 'sel' : ''}`}
                                    onClick={() => setSelectedPick(selectedPick === 'sup' ? null : 'sup')}
                                    aria-expanded={selectedPick === 'sup'}
                                    aria-controls="rv"
                                >
                                    <span className="ic">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M3 7l9-4 9 4-9 4z" />
                                            <path d="M3 7v10l9 4 9-4V7" />
                                            <path d="M12 11v10" />
                                        </svg>
                                    </span>
                                    <h3>সাপ্লায়ার</h3>
                                    <p className="q">নিটিং মেশিন, সিংকার ও নিডল, অয়েল, স্পেয়ার পার্টস বা ইলেকট্রিক গুডস সাপ্লাই দেন নিটিং ফ্যাক্টরিতে।</p>
                                    <span className="go">
                                        অনুমোদিত সাপ্লায়ার হোন <span className="arr">→</span>
                                    </span>
                                </button>
                            </div>

                            {/* Expandable Accordion */}
                            <div className={`reveal ${selectedPick ? 'open' : ''}`} id="rv">
                                <div>
                                    {selectedPick && (
                                        <div className="answer" id="answer">
                                            <div>
                                                <div className="eyebrow">{ANSWERS[selectedPick].eb}</div>
                                                <h3>{ANSWERS[selectedPick].h}</h3>
                                                <p>{ANSWERS[selectedPick].p}</p>
                                                {ANSWERS[selectedPick].isSup ? (
                                                    <button
                                                        type="button"
                                                        className="btn"
                                                        onClick={() => navigateToSupplier('suppliers-join')}
                                                    >
                                                        {ANSWERS[selectedPick].btn} <span className="arr">→</span>
                                                    </button>
                                                ) : (
                                                    <Link className="btn" href={ANSWERS[selectedPick].href}>
                                                        {ANSWERS[selectedPick].btn} <span className="arr">→</span>
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn ghost"
                                                    onClick={() => showToast('আসল সাইটে এখানে নাম আর মোবাইল নম্বর নেওয়ার ফর্ম থাকবে')}
                                                >
                                                    ডেমো চাই
                                                </button>
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

                    {/* Features Grid */}
                    <section className="features" id="features">
                        <div className="wrap">
                            <div className="sec-head">
                                <div className="eyebrow">নিটখাতায় যা পাবেন</div>
                                <h2>নিটিং ফ্যাক্টরির রোজকার কাজ, একটা সফটওয়্যারে</h2>
                                <p>ফ্লোর থেকে অফিস পর্যন্ত, যে কাজগুলো আজ খাতা-কলম আর এক্সেলে হচ্ছে।</p>
                            </div>

                            <div className="fgrid" id="fgrid">
                                {FEATURES.map((f) => (
                                    <article key={f.key} className="f">
                                        <span className="fi">
                                            <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[f.key] }} />
                                        </span>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                        <span className="eg">{f.eg}</span>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Ad Banner Slot */}
                    <section className="adslot" aria-label="বিজ্ঞাপন">
                        <div className="wrap">
                            <div className="adb" id="homead">
                                <span className="adlbl">বিজ্ঞাপন</span>
                                <span className="ai">স</span>
                                <div>
                                    <div className="at">সার্কুলার নিটিং মেশিনের ফ্রি সার্ভিস চেকআপ — এই মাসে</div>
                                    <div className="ad">আপনার ফ্যাক্টরিতে এসে মেশিনের গেজ, সিলিন্ডার আর ফিডার দেখে দেবে আমাদের টেকনিশিয়ান।</div>
                                    <div className="by">সার্কেল নিট মেশিনারি (নমুনা) · নিটখাতা অনুমোদিত সাপ্লায়ার</div>
                                </div>
                                <button
                                    className="ac"
                                    type="button"
                                    onClick={() => showToast('আসল সাইটে বিজ্ঞাপনদাতার নম্বর বা লিংক খুলবে')}
                                >
                                    যোগাযোগ করুন
                                </button>
                            </div>
                            <div className="adnote">
                                <button type="button" onClick={() => navigateToAd()}>
                                    এখানে আপনার বিজ্ঞাপন দিন →
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Authorized Suppliers Section */}
                    <section className="sups" id="suppliers">
                        <div className="wrap">
                            <div className="sec-head">
                                <div className="eyebrow">অনুমোদিত সাপ্লায়ার</div>
                                <h2>নিটিং মেশিন থেকে স্পেয়ার পার্টস — যাচাই করা সাপ্লায়ার এক জায়গায়</h2>
                                <p>মেশিন বসে গেলে কাকে ডাকবেন, অরিজিনাল স্পেয়ার কোথায় পাবেন, কার কাছ থেকে নিডল নেবেন — নিটখাতার প্রতিটা অনুমোদিত সাপ্লায়ার আমরা নিজেরা যাচাই করি।</p>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="schips" id="schips">
                                {Object.entries(SUPPLIER_CATEGORIES).map(([k, v]) => (
                                    <button
                                        key={k}
                                        type="button"
                                        className={selectedSupplierCat === k ? 'on' : ''}
                                        onClick={() => setSelectedSupplierCat(k)}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>

                            {/* Supplier Grid */}
                            <div className="sgrid" id="sgrid">
                                {filteredSuppliers.map((s, i) => (
                                    <article
                                        key={i}
                                        className={`sc ${s.sp ? 'sp' : ''}`}
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        {s.sp && <span className="spt">স্পন্সর</span>}
                                        <div className="top3">
                                            <span className="av">{s.n.charAt(0)}</span>
                                            <div>
                                                <div className="nm">{s.n}</div>
                                                <span className="vb">নিটখাতা অনুমোদিত</span>
                                            </div>
                                        </div>
                                        <div className="meta">
                                            <span className="cat">{SUPPLIER_CATEGORIES[s.c]}</span>
                                            {s.also &&
                                                s.also.map((x) => (
                                                    <span key={x} className="also">
                                                        + {SUPPLIER_CATEGORIES[x]}ও দেয়
                                                    </span>
                                                ))}
                                            <span>{s.a}</span>
                                            <span>★ {bnNum(s.r)} · {bnNum(s.f)}টি ফ্যাক্টরির রেটিং</span>
                                        </div>
                                        <div className="gives">{s.g}</div>
                                        <div className="acts">
                                            <button
                                                className="q"
                                                type="button"
                                                onClick={() => handleSupplierQuoteClick(s.c)}
                                            >
                                                কোটেশন চাই
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => showToast('আসল সাইটে সাপ্লায়ারের নম্বর দেখাবে — শুধু লগইন করা ফ্যাক্টরির জন্য')}
                                            >
                                                যোগাযোগ
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <p className="sample">সাপ্লায়ারের নাম ও রেটিং ডিজাইন দেখানোর জন্য নমুনা।</p>

                            {/* RFQ Form */}
                            <div className={`rfq ${isRfqFlashing ? 'flash' : ''}`} id="rfq" ref={rfqRef}>
                                <div>
                                    <h3>কী লাগবে বলুন, কোটেশন আসবে</h3>
                                    <p>একবার লিখলেই আপনার এলাকার ৩টি অনুমোদিত সাপ্লায়ারের কাছে যাবে। দাম আর ডেলিভারির সময় তুলনা করে নিজে বেছে নেবেন।</p>
                                    <ol className="steps" aria-label="সাপ্লায়ার অনুমোদনের ধাপ">
                                        <li>ট্রেড লাইসেন্স আর ব্যবসার কাগজ যাচাই</li>
                                        <li>অন্তত ৩টি নিটিং ফ্যাক্টরির রেফারেন্স</li>
                                        <li>পণ্যের নমুনা পরীক্ষা ও সরেজমিনে দেখা</li>
                                        <li>কেনার পর ফ্যাক্টরির রেটিং; প্রমাণিত অভিযোগে ব্যাজ বাতিল</li>
                                    </ol>
                                </div>
                                <form className="rfqf" id="rfqf" onSubmit={handleRfqSubmit}>
                                    <label>
                                        কী দরকার
                                        <select
                                            value={rfqCategory}
                                            onChange={(e) => setRfqCategory(e.target.value)}
                                        >
                                            {Object.entries(SUPPLIER_CATEGORIES)
                                                .filter(([k]) => k !== 'all')
                                                .map(([k, v]) => (
                                                    <option key={k} value={k}>
                                                        {v}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                    <label>
                                        পরিমাণ
                                        <input
                                            ref={rfqQtyInputRef}
                                            value={rfqQuantity}
                                            onChange={(e) => setRfqQuantity(e.target.value)}
                                            placeholder="যেমন: ৫০০ পিস / ২০০ লিটার"
                                        />
                                    </label>
                                    <label className="wide">
                                        বিস্তারিত
                                        <textarea
                                            value={rfqDetails}
                                            onChange={(e) => setRfqDetails(e.target.value)}
                                            placeholder="যেমন: 30&quot; × 24G মেশিনের জন্য নিডল, ব্র্যান্ড পছন্দ থাকলে লিখুন"
                                        />
                                    </label>
                                    <label>
                                        এলাকা
                                        <select
                                            value={rfqArea}
                                            onChange={(e) => setRfqArea(e.target.value)}
                                        >
                                            <option>গাজীপুর</option>
                                            <option>নারায়ণগঞ্জ</option>
                                            <option>সাভার / আশুলিয়া</option>
                                            <option>ঢাকা</option>
                                            <option>চট্টগ্রাম</option>
                                        </select>
                                    </label>
                                    <label>
                                        কবে লাগবে
                                        <select
                                            value={rfqWhen}
                                            onChange={(e) => setRfqWhen(e.target.value)}
                                        >
                                            <option>আজই</option>
                                            <option>এই সপ্তাহে</option>
                                            <option>এই মাসে</option>
                                        </select>
                                    </label>
                                    <div className="wide">
                                        <button className="btn pri" type="submit">
                                            কোটেশন চাই <span className="arr">→</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <p style={{ marginTop: '22px' }}>
                                <button
                                    type="button"
                                    onClick={() => navigateToSupplier('suppliers-join')}
                                    style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', padding: 0 }}
                                >
                                    আপনি কি সাপ্লায়ার? নিটখাতার অনুমোদিত সাপ্লায়ার হোন →
                                </button>
                            </p>
                        </div>
                    </section>

                    {/* Jobs Teaser */}
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
                                <button className="btn pri" type="button" onClick={() => setDrawerOpen(true)}>
                                    সব চাকরি দেখুন <span className="arr">→</span>
                                </button>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => showToast('আসল সাইটে ফ্যাক্টরিগুলো এখান থেকে ফ্রি তে চাকরির বিজ্ঞাপন দেবে')}
                                >
                                    চাকরির বিজ্ঞাপন দিন
                                </button>
                            </div>
                            <p className="sample">এখানের বিজ্ঞাপনগুলো ডিজাইন দেখানোর জন্য নমুনা, আসল চাকরি না।</p>
                        </div>
                    </section>

                    {/* Footer CTA */}
                    <section className="cta">
                        <div className="wrap ctabox">
                            <h2>আপনার ফ্যাক্টরির খাতাটা আজই ডিজিটাল করুন।</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                <Link className="btn pri" href="/subcontracts">
                                    ভেতরে প্রবেশ করুন <span className="arr">→</span>
                                </Link>
                                <button
                                    className="btn"
                                    type="button"
                                    onClick={() => showToast('আসল সাইটে এখানে নাম আর মোবাইল নম্বর নেওয়ার ফর্ম থাকবে')}
                                >
                                    ডেমো চাই
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
            )}

            {/* ========================================================
                SUB-PAGE VIEW: DEDICATED SUPPLIERS PAGE (#suppage)
            ======================================================== */}
            {view === 'sup' && (
                <main id="suppage">
                    <section className="sphero">
                        <div className="wrap">
                            <button
                                className="btn glass"
                                type="button"
                                onClick={() => navigateToHome()}
                                style={{ marginBottom: '18px' }}
                            >
                                ← হোম পেজ
                            </button>
                            <div className="badge">
                                <i></i>সাপ্লায়ারদের জন্য
                            </div>
                            <h1>নিটখাতার <em>অনুমোদিত সাপ্লায়ার</em> হোন</h1>
                            <p className="lead">
                                যে নিটিং ফ্যাক্টরিগুলো প্রতিদিন নিটখাতায় অর্ডার, মেশিন আর খরচের হিসাব রাখে, তাদের সামনে থাকুন — ঠিক যখন তাদের মেশিন, স্পেয়ার, নিডল বা অয়েল দরকার।
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="wrap">
                            <div className="sec-head">
                                <div className="eyebrow">আমরা প্রথমে খুঁজছি</div>
                                <h2>নিটিং মেশিন সাপ্লায়ার</h2>
                                <p>বাংলাদেশে সার্কুলার ও ফ্ল্যাট নিটিং মেশিন আর তার বেশিরভাগ স্পেয়ার পার্টস আসে মেশিন সাপ্লায়ারদের হাত দিয়েই। তাই প্রথম ধাপে মেশিন সাপ্লায়ারদের অনুমোদন দেওয়া হবে, তারপর বাকি ক্যাটাগরি।</p>
                            </div>

                            <div className="prio">
                                <div className="pr first">
                                    <span className="pn">ধাপ ১ · আলাদা ক্যাটাগরি</span>
                                    <b>নিটিং মেশিন</b>
                                    <span>সার্কুলার, ফ্ল্যাট, কলার-কাফ মেশিন · নতুন ও রিকন্ডিশন্ড · ইনস্টলেশন ও সার্ভিস। মেশিন সাপ্লায়ার স্পেয়ার পার্টসও দিলে আবেদনে আলাদা করে জানাবেন।</span>
                                </div>
                                <div className="pr">
                                    <span className="pn">ধাপ ২</span>
                                    <b>সিংকার ও নিডল, নিটিং অয়েল</b>
                                    <span>রোজকার ব্যবহারের জিনিস, যা প্রতি মাসে কিনতে হয়</span>
                                </div>
                                <div className="pr">
                                    <span className="pn">ধাপ ৩</span>
                                    <b>স্পেয়ার পার্টস, ইলেকট্রিক গুডস</b>
                                    <span>ফিডার, সিলিন্ডার, স্টপ মোশন · মোটর, ইনভার্টার, প্যানেল</span>
                                </div>
                            </div>

                            <div className="tiers" id="suppliers-join">
                                <div className="sec-head" style={{ marginBottom: 0 }}>
                                    <div className="eyebrow">পার্টনারশিপ</div>
                                    <h2>তিনভাবে যুক্ত হতে পারেন</h2>
                                    <p>সব স্তরেই আগে যাচাই। "অনুমোদিত" ব্যাজ টাকা দিয়ে কেনা যায় না।</p>
                                </div>

                                <div className="tgrid">
                                    <div className="tier">
                                        <div className="tn">অনুমোদিত সাপ্লায়ার</div>
                                        <div className="td">যাচাইয়ের পর ডিরেক্টরিতে জায়গা</div>
                                        <ul>
                                            <li>"অনুমোদিত" ব্যাজ</li>
                                            <li>আপনার ক্যাটাগরির কোটেশন অনুরোধ</li>
                                            <li>ফ্যাক্টরির রেটিং ও রিভিউ</li>
                                        </ul>
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('supform');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            আবেদন করুন
                                        </button>
                                    </div>

                                    <div className="tier mid">
                                        <div className="tn">প্রিমিয়াম পার্টনার</div>
                                        <div className="td">সফটওয়্যারের ভেতরেও আপনার নাম</div>
                                        <ul>
                                            <li>ক্যাটাগরির শীর্ষে তালিকা</li>
                                            <li>নিটখাতায় নিডল বা অয়েলের খরচ লিখলে আপনার নাম সুপারিশে</li>
                                            <li>কোটেশন আগে পান</li>
                                            <li>মাসিক রিপোর্ট: কতজন দেখেছে, কতজন যোগাযোগ করেছে</li>
                                        </ul>
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => {
                                                const el = document.getElementById('supform');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            আবেদন করুন
                                        </button>
                                    </div>

                                    <div className="tier">
                                        <div className="tn">স্পন্সর পার্টনার</div>
                                        <div className="td">প্রতি ক্যাটাগরিতে মাত্র একজন</div>
                                        <ul>
                                            <li>হোম পেজে "স্পন্সর" হিসেবে লোগো</li>
                                            <li>ভেন্ডরদের WhatsApp রিপোর্টে ছোট উল্লেখ</li>
                                            <li>নিটখাতার ট্রেনিং ও ইভেন্টে উপস্থিতি</li>
                                        </ul>
                                        <button
                                            className="btn"
                                            type="button"
                                            onClick={() => showToast('স্পন্সর পার্টনারশিপের জন্য নিটখাতা অফিসের সাথে সরাসরি আলোচনা করুন')}
                                        >
                                            আলোচনা করুন
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Supplier Application Form */}
                            <div className="rfq" id="supform" style={{ marginTop: '40px' }}>
                                <div>
                                    <h3>আবেদন থেকে অনুমোদন</h3>
                                    <p>আবেদনের পর নিটখাতার টিম আপনার সাথে যোগাযোগ করবে। সাধারণত ২–৩ সপ্তাহ লাগে।</p>
                                    <ol className="steps">
                                        <li>আবেদন ফর্ম পূরণ</li>
                                        <li>ট্রেড লাইসেন্স আর ব্যবসার কাগজ যাচাই</li>
                                        <li>অন্তত ৩টি নিটিং ফ্যাক্টরির রেফারেন্স</li>
                                        <li>পণ্যের নমুনা পরীক্ষা ও সরেজমিনে দেখা</li>
                                        <li>অনুমোদন, ব্যাজ আর ডিরেক্টরিতে তালিকা</li>
                                    </ol>
                                    <p style={{ marginTop: '14px', fontSize: '.84rem', color: 'var(--muted)' }}>
                                        অনুমোদনের পরও ফ্যাক্টরির রেটিং নিয়মিত দেখা হয়। প্রমাণিত অভিযোগে ব্যাজ বাতিল হয়।
                                    </p>
                                </div>

                                <form className="rfqf" id="supf" onSubmit={handleSupplierAppSubmit}>
                                    <label className="wide">
                                        প্রতিষ্ঠানের নাম
                                        <input
                                            value={supName}
                                            onChange={(e) => setSupName(e.target.value)}
                                            placeholder="যেমন: আপনার কোম্পানির নাম"
                                            required
                                        />
                                    </label>
                                    <label>
                                        প্রধান ক্যাটাগরি
                                        <select
                                            value={supCat}
                                            onChange={(e) => setSupCat(e.target.value)}
                                        >
                                            {Object.entries(SUPPLIER_CATEGORIES)
                                                .filter(([k]) => k !== 'all')
                                                .map(([k, v]) => (
                                                    <option key={k} value={k}>
                                                        {v}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                    {supCat === 'mc' && (
                                        <label className="wide chkl" id="sf-also-w">
                                            <span>
                                                <input
                                                    type="checkbox"
                                                    checked={supAlsoSpare}
                                                    onChange={(e) => setSupAlsoSpare(e.target.checked)}
                                                />{' '}
                                                আমরা স্পেয়ার পার্টসও সরবরাহ করি
                                            </span>
                                        </label>
                                    )}
                                    <label>
                                        যে স্তরে আগ্রহী
                                        <select
                                            value={supTier}
                                            onChange={(e) => setSupTier(e.target.value)}
                                        >
                                            <option>অনুমোদিত সাপ্লায়ার</option>
                                            <option>প্রিমিয়াম পার্টনার</option>
                                            <option>স্পন্সর পার্টনার</option>
                                        </select>
                                    </label>
                                    <label className="wide">
                                        যে মেশিন বা ব্র্যান্ডের ডিলার/এজেন্ট
                                        <input
                                            value={supBrand}
                                            onChange={(e) => setSupBrand(e.target.value)}
                                            placeholder="যেমন: কোন কোন ব্র্যান্ডের মেশিন বা স্পেয়ার সরবরাহ করেন"
                                        />
                                    </label>
                                    <label>
                                        যোগাযোগের ব্যক্তি
                                        <input
                                            value={supPerson}
                                            onChange={(e) => setSupPerson(e.target.value)}
                                            placeholder="নাম ও পদবি"
                                        />
                                    </label>
                                    <label>
                                        মোবাইল (WhatsApp)
                                        <input
                                            value={supPhone}
                                            onChange={(e) => setSupPhone(e.target.value)}
                                            placeholder="+8801…"
                                        />
                                    </label>
                                    <label>
                                        অফিস/শোরুমের এলাকা
                                        <select
                                            value={supArea}
                                            onChange={(e) => setSupArea(e.target.value)}
                                        >
                                            <option>গাজীপুর</option>
                                            <option>নারায়ণগঞ্জ</option>
                                            <option>সাভার / আশুলিয়া</option>
                                            <option>ঢাকা</option>
                                            <option>চট্টগ্রাম</option>
                                        </select>
                                    </label>
                                    <label>
                                        কত বছর ধরে ব্যবসা
                                        <select
                                            value={supYrs}
                                            onChange={(e) => setSupYrs(e.target.value)}
                                        >
                                            <option>৩ বছরের কম</option>
                                            <option>৩–১০ বছর</option>
                                            <option>১০ বছরের বেশি</option>
                                        </select>
                                    </label>
                                    <div className="wide">
                                        <button className="btn pri" type="submit">
                                            আবেদন পাঠান <span className="arr">→</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>
            )}

            {/* ========================================================
                SUB-PAGE VIEW: DEDICATED ADVERTISING PAGE (#adpage)
            ======================================================== */}
            {view === 'ad' && (
                <main id="adpage">
                    <section className="sphero">
                        <div className="wrap">
                            <button
                                className="btn glass"
                                type="button"
                                onClick={() => navigateToHome()}
                                style={{ marginBottom: '18px' }}
                            >
                                ← হোম পেজ
                            </button>
                            <div className="badge">
                                <i></i>বিজ্ঞাপনদাতাদের জন্য
                            </div>
                            <h1>নিটখাতায় <em>বিজ্ঞাপন</em> দিন</h1>
                            <p className="lead">
                                নিটিং ফ্যাক্টরির মালিক, প্রোডাকশন ম্যানেজার, টেকনিশিয়ান আর চাকরিপ্রার্থী — যাদের কাছে পৌঁছাতে চান, তারা প্রতিদিন এখানে আসে।
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="wrap">
                            <div className="sec-head">
                                <div className="eyebrow">ধাপ ১</div>
                                <h2>বিজ্ঞাপন কোথায় দেখাবে</h2>
                                <p>একটা জায়গা বাছুন। ডানদিকে সাথে সাথে দেখবেন বিজ্ঞাপনটা কেমন দেখাবে।</p>
                            </div>

                            <div className="plc" id="plc">
                                {AD_PLACEMENTS.map((p) => (
                                    <button
                                        key={p.k}
                                        type="button"
                                        className={`pl ${selectedPlc === p.k ? 'on' : ''}`}
                                        onClick={() => setSelectedPlc(p.k)}
                                    >
                                        <b>{p.t}</b>
                                        <span>{p.d}</span>
                                        <span className="who">কারা দেখবে: {p.w}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="adbuild">
                                <form className="rfqf" id="adf" onSubmit={handleAdSubmit}>
                                    <label className="wide">
                                        প্রতিষ্ঠানের নাম
                                        <input
                                            value={adOrg}
                                            onChange={(e) => setAdOrg(e.target.value)}
                                        />
                                    </label>
                                    <label className="wide">
                                        শিরোনাম
                                        <input
                                            value={adTitle}
                                            maxLength={70}
                                            onChange={(e) => setAdTitle(e.target.value)}
                                        />
                                    </label>
                                    <label className="wide">
                                        ছোট বর্ণনা
                                        <textarea
                                            value={adDesc}
                                            maxLength={140}
                                            onChange={(e) => setAdDesc(e.target.value)}
                                        />
                                    </label>
                                    <label>
                                        বাটনের লেখা
                                        <select
                                            value={adCta}
                                            onChange={(e) => setAdCta(e.target.value)}
                                        >
                                            <option>যোগাযোগ করুন</option>
                                            <option>কোটেশন নিন</option>
                                            <option>বিস্তারিত দেখুন</option>
                                            <option>আবেদন করুন</option>
                                        </select>
                                    </label>
                                    <label>
                                        মোবাইল (WhatsApp)
                                        <input
                                            value={adPhone}
                                            onChange={(e) => setAdPhone(e.target.value)}
                                            placeholder="+8801…"
                                        />
                                    </label>
                                    <label>
                                        লোগো বা ছবি
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAdImageUpload}
                                        />
                                    </label>
                                    <label>
                                        কতদিন চলবে
                                        <select
                                            value={adDays}
                                            onChange={(e) => setAdDays(e.target.value)}
                                        >
                                            <option>৭ দিন</option>
                                            <option>১৫ দিন</option>
                                            <option>৩০ দিন</option>
                                        </select>
                                    </label>
                                    <div className="wide">
                                        <button className="btn pri" type="submit">
                                            বিজ্ঞাপন জমা দিন <span className="arr">→</span>
                                        </button>
                                    </div>
                                </form>

                                {/* Live Preview Card */}
                                <div className="adprev">
                                    <div className="pt" id="ad-where">
                                        প্রিভিউ — {AD_PLACEMENTS.find((p) => p.k === selectedPlc)?.t}
                                    </div>
                                    <div className="adb" id="adprev">
                                        <span className="adlbl">বিজ্ঞাপন</span>
                                        <span className="ai">
                                            {adImg ? (
                                                <img src={adImg} alt="বিজ্ঞাপন ছবি" />
                                            ) : (
                                                adOrg.trim().charAt(0) || 'আ'
                                            )}
                                        </span>
                                        <div>
                                            <div className="at">{adTitle || 'শিরোনাম'}</div>
                                            <div className="ad">{adDesc || 'বর্ণনা'}</div>
                                            <div className="by">{adOrg || 'আপনার প্রতিষ্ঠান'}</div>
                                        </div>
                                        <button className="ac" type="button">
                                            {adCta}
                                        </button>
                                    </div>
                                    <div className="pt">
                                        জমা দেওয়ার পর নিটখাতার টিম ২৪ ঘণ্টার মধ্যে দেখে চালু করবে।
                                    </div>
                                </div>
                            </div>

                            <div className="sec-head" style={{ margin: '44px 0 0' }}>
                                <div className="eyebrow">বিজ্ঞাপনের নিয়ম</div>
                                <h2>যে বিজ্ঞাপন এখানে চলে</h2>
                            </div>
                            <ul className="adrules">
                                <li>শুধু নিটিং, টেক্সটাইল আর ফ্যাক্টরির কাজে লাগে এমন পণ্য, সার্ভিস বা চাকরি</li>
                                <li>প্রতিটা বিজ্ঞাপন চালুর আগে নিটখাতার টিম দেখে নেয়</li>
                                <li>সব বিজ্ঞাপনে স্পষ্ট "বিজ্ঞাপন" লেখা থাকে, যাতে কেউ বিভ্রান্ত না হয়</li>
                                <li>মিথ্যা দাবি, অন্য কোম্পানির নাম বা লোগো ব্যবহার চলবে না</li>
                                <li>নিটখাতার অনুমোদিত সাপ্লায়াররা ভালো জায়গায় অগ্রাধিকার পান</li>
                                <li>প্রতিটা বিজ্ঞাপনের পর রিপোর্ট: কতজন দেখেছে, কতজন চেপেছে</li>
                            </ul>
                        </div>
                    </section>
                </main>
            )}

            {/* 3. GLOBAL FOOTER */}
            <footer>
                <div className="wrap">
                    <span>© ২০২৬ নিটখাতা · ঢাকা, বাংলাদেশ</span>
                    <span>
                        <button
                            type="button"
                            onClick={() => navigateToAd()}
                            style={{
                                color: 'var(--accent)',
                                fontWeight: 600,
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                            }}
                        >
                            বিজ্ঞাপন দিন
                        </button>{' '}
                        · সাব-কন্ট্রাক্ট নিটিং ফ্যাক্টরির জন্য তৈরি
                    </span>
                </div>
            </footer>

            {/* 4. CORNER FLOATING JOB PORTAL BUTTON */}
            <button
                className="jp"
                type="button"
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

            {/* 5. JOB PORTAL DRAWER & SCRIM */}
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
                        <button
                            className="x"
                            id="dx"
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            aria-label="বন্ধ করুন"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="filters" id="filters">
                        {Object.entries(JOB_CATEGORIES).map(([k, v]) => (
                            <button
                                key={k}
                                type="button"
                                className={jobFilter === k ? 'on' : ''}
                                onClick={() => setJobFilter(k)}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dlist" id="dlist">
                    {filteredJobs.length === 0 ? (
                        <p className="meta" style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>
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
                                        <button
                                            type="button"
                                            onClick={() => toggleJobExpand(j.id)}
                                        >
                                            {isExpanded ? 'কম দেখুন' : 'বিস্তারিত'}
                                        </button>
                                        <button
                                            className="ap"
                                            type="button"
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
                        type="button"
                        onClick={() => showToast('আসল সাইটে ফ্যাক্টরিগুলো এখান থেকে ফ্রি তে চাকরির বিজ্ঞাপন দেবে')}
                        style={{ padding: '7px 16px' }}
                    >
                        + বিজ্ঞাপন দিন
                    </button>
                </div>
            </aside>

            {/* 6. TOAST NOTIFICATION */}
            {toastText && (
                <div className="toast" id="toast">
                    {toastText}
                </div>
            )}
        </div>
    );
}
