import { Vendor, Order, ProductionLogItem, UserItem } from './types';

export const TODAY = new Date('2026-10-03');

export const INITIAL_VENDORS: Record<string, Vendor> = {
    abc: { name: 'ABC Knit Composite', phone: '+8801711234567', email: 'kamrul@abcknit.com' },
    xyz: { name: 'XYZ Fashion Ltd', phone: '+8801819876543', email: 'shafiq@xyzfashion.com' },
    nobo: { name: 'Nobo Composite', phone: '+8801912334455', email: 'rashed@nobocomposite.com' }
};

export const INITIAL_ORDERS: Order[] = [
    {
        id: 'SC-2610-014',
        v: 'abc',
        fabric: 'Single Jersey 100% Cotton',
        gsm: 160,
        dia: '30" × 24G',
        color: 'Navy Blue',
        yarn: '30s Combed',
        qty: 8500,
        done: 5200,
        machines: ['M-04', 'M-07', 'M-12'],
        rate: 550,
        rateTk: 22,
        start: '26 Sep 2026',
        status: 'run',
        yarnIn: [
            { count: '30s Combed', spinner: 'Square Textiles', lot: 'SQ-88412', bags: 85, kg: 4250 },
            { count: '30s Combed', spinner: 'Square Textiles', lot: 'SQ-88419', bags: 90, kg: 4500 }
        ],
        qc: [
            { d: '02 Oct', roll: 'R-142', m: 'M-07', issue: 'Needle mark (১টি সুঁচ ভাঙা)', kg: 22, s: 'bad', res: 'রিজেক্ট' },
            { d: '01 Oct', roll: 'R-098', m: 'M-04', issue: 'Lycra out (২ ইঞ্চি)', kg: 21, s: 'warn', res: 'কাটিং আলাদা' },
            { d: '29 Sep', roll: 'R-041', m: 'M-12', issue: 'Oil spot (লুব্রিকেশন)', kg: 23, s: 'ok', res: 'ওয়াশিংয়ে দূর' }
        ]
    },
    {
        id: 'SC-2610-018',
        v: 'nobo',
        fabric: '1×1 Rib with Lycra',
        gsm: 220,
        dia: '34" × 18G',
        color: 'Heather Grey',
        yarn: '26s Melange + 20D Lycra',
        qty: 4000,
        done: 0,
        machines: ['M-15', 'M-16', 'M-17'],
        rate: 420,
        rateTk: 28,
        start: '—',
        status: 'wait',
        yarnIn: [],
        qc: []
    },
    {
        id: 'SC-2609-011',
        v: 'xyz',
        fabric: 'Fleece 3-End (Brushed)',
        gsm: 280,
        dia: '32" × 20G',
        color: 'Black',
        yarn: '30s + 10s + 75D',
        qty: 6200,
        done: 6010,
        machines: ['M-01', 'M-02'],
        rate: 480,
        rateTk: 26,
        start: '18 Sep 2026',
        status: 'run',
        yarnIn: [
            { count: 'Mixed', spinner: 'Akij + Badsha', lot: 'AK-5521', bags: 130, kg: 6500 }
        ],
        qc: [
            { d: '25 Sep', roll: 'R-180', m: 'M-01', issue: 'Hole (ফ্লাই সুতা)', kg: 24, s: 'warn', res: 'ফ্যাক্টরি ক্ষতিপূরণ' }
        ]
    },
    {
        id: 'SC-2609-002',
        v: 'abc',
        fabric: 'Interlock 100% Cotton',
        gsm: 200,
        dia: '30" × 24G',
        color: 'White',
        yarn: '40s Combed',
        qty: 3500,
        done: 3500,
        machines: [],
        rate: 500,
        rateTk: 24,
        start: '10 Sep 2026',
        status: 'done',
        yarnIn: [
            { count: '40s Combed', spinner: 'Noman', lot: 'NS-2290', bags: 72, kg: 3600 }
        ],
        qc: []
    },
    {
        id: 'SC-2609-001',
        v: 'xyz',
        fabric: 'Single Jersey 60/40 CVC',
        gsm: 150,
        dia: '30" × 24G',
        color: 'Charcoal',
        yarn: '34s CVC',
        qty: 5000,
        done: 5000,
        machines: [],
        rate: 550,
        rateTk: 21,
        start: '05 Sep 2026',
        status: 'done',
        yarnIn: [
            { count: '34s CVC', spinner: 'Matin', lot: 'MT-901', bags: 104, kg: 5200 }
        ],
        qc: []
    }
];

export const INITIAL_MACHINE_STATE: Record<string, string> = {
    'M-01': 'run:SC-2609-011', 'M-02': 'run:SC-2609-011', 'M-03': 'idle',
    'M-04': 'run:SC-2610-014', 'M-05': 'run:SC-2610-014', 'M-06': 'down',
    'M-07': 'run:SC-2610-014', 'M-08': 'idle', 'M-09': 'idle',
    'M-10': 'run:SC-2610-014', 'M-11': 'idle', 'M-12': 'run:SC-2610-014',
    'M-13': 'idle', 'M-14': 'down',
    'M-15': 'wait', 'M-16': 'wait', 'M-17': 'wait',
    'M-18': 'run:SC-2609-011', 'M-19': 'run:SC-2609-011', 'M-20': 'idle',
    'M-21': 'idle', 'M-22': 'idle', 'M-23': 'idle', 'M-24': 'idle'
};

export const INITIAL_PROD_LOG: ProductionLogItem[] = [
    { d: '03 Oct', sh: 'A', m: 'M-04', o: 'SC-2610-014', kg: 190, rolls: 9, op: 'জসিম' },
    { d: '03 Oct', sh: 'A', m: 'M-07', o: 'SC-2610-014', kg: 175, rolls: 8, op: 'সোহেল' },
    { d: '03 Oct', sh: 'A', m: 'M-12', o: 'SC-2610-014', kg: 185, rolls: 9, op: 'ফারুক' },
    { d: '03 Oct', sh: 'A', m: 'M-01', o: 'SC-2609-011', kg: 160, rolls: 7, op: 'মাসুদ' },
    { d: '03 Oct', sh: 'A', m: 'M-02', o: 'SC-2609-011', kg: 165, rolls: 7, op: 'আলাউদ্দিন' },
    { d: '02 Oct', sh: 'B', m: 'M-04', o: 'SC-2610-014', kg: 180, rolls: 8, op: 'বিল্লাল' },
    { d: '02 Oct', sh: 'B', m: 'M-07', o: 'SC-2610-014', kg: 170, rolls: 8, op: 'বাবুল' },
    { d: '02 Oct', sh: 'B', m: 'M-12', o: 'SC-2610-014', kg: 195, rolls: 9, op: 'শরিফ' }
];

export const INITIAL_USERS: UserItem[] = [
    { n: 'মো. আনিসুর রহমান', r: 'মালিক / এমডি', org: 'রহমান নিটিং', on: true, last: '১০ মিনিট আগে', vendor: false },
    { n: 'তানভীর আহমেদ', r: 'ম্যানেজার (অফিস ও হিসাব)', org: 'রহমান নিটিং', on: true, last: 'আজ সকাল ৯:৩০', vendor: false },
    { n: 'শফিকুল ইসলাম', r: 'ফ্লোর ইন-চার্জ (প্রোডাকশন)', org: 'রহমান নিটিং', on: true, last: 'আজ দুপুর ১:১৫', vendor: false },
    { n: 'মো. কামরুল হাসান', r: 'প্ল্যানিং ম্যানেজার', org: 'ABC Knit Composite', on: true, last: 'আজ সকাল ১১:২০', vendor: true },
    { n: 'আসিফ মাহমুদ', r: 'এক্সিকিউটিভ (সাবেক)', org: 'ABC Knit Composite', on: false, last: '১৫ দিন আগে', vendor: true },
    { n: 'ইঞ্জি. শেখ ফরিদ', r: 'জিএম (মার্চেন্ডাইজিং)', org: 'XYZ Fashion Ltd', on: true, last: 'গতকাল রাত ৮:৪৫', vendor: true }
];

const BN_DIGITS: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

export function bn(n: number | string): string {
    const s = typeof n === 'number' ? n.toLocaleString('en-US') : String(n);
    return s.replace(/[0-9]/g, d => BN_DIGITS[d] || d);
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + Math.ceil(days));
    return result;
}

export function fmtD(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
}

export function calcPct(done: number, qty: number): number {
    if (!qty) return 0;
    return Math.min(100, Math.round((done / qty) * 100));
}

export function calcEta(order: Order, machineCount: number = order.machines.length, rate: number = order.rate): { days: number; date: Date } | null {
    const rem = order.qty - order.done;
    if (rem <= 0) return { days: 0, date: TODAY };
    if (!machineCount || !rate) return null;
    const days = rem / (machineCount * rate);
    return { days, date: addDays(TODAY, days) };
}
