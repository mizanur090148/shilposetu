import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import KnitkhataLayout from '../../Layouts/KnitkhataLayout';
import './knitkhata.css';
import {
    RoleMode,
    KnitkhataViewTab,
    Order,
    ProductionLogItem,
    UserItem,
    KnitkhataProps
} from './types';
import {
    INITIAL_ORDERS,
    INITIAL_VENDORS,
    INITIAL_MACHINE_STATE,
    INITIAL_PROD_LOG,
    INITIAL_USERS,
    bn,
    calcPct,
    fmtD,
    calcEta
} from './mockData';

export default function KnitkhataIndex({ factory, auth }: KnitkhataProps) {
    const [role, setRole] = useState<RoleMode>('fac');
    const [view, setView] = useState<KnitkhataViewTab>('dash');
    const [curOrder, setCurOrder] = useState<string>('SC-2610-014');
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [machineState] = useState<Record<string, string>>(INITIAL_MACHINE_STATE);
    const [prodLog, setProdLog] = useState<ProductionLogItem[]>(INITIAL_PROD_LOG);
    const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
    const vendors = INITIAL_VENDORS;

    // Accounts tab
    const [accTab, setAccTab] = useState<'exp' | 'util' | 'bank' | 'lc' | 'party'>('exp');

    // Dynamic ETA calculator inputs (per order)
    const [etaM, setEtaM] = useState<number>(3);
    const [etaR, setEtaR] = useState<number>(380);

    // Shift entry form
    const [entryDate, setEntryDate] = useState('03 Oct 2026');
    const [entrySh, setEntrySh] = useState('A');
    const [entryM, setEntryM] = useState('M-04|SC-2610-014');
    const [entryKg, setEntryKg] = useState('180');
    const [entryR, setEntryR] = useState('8');
    const [entryOp, setEntryOp] = useState('জসিম');
    const [entryLot, setEntryLot] = useState('SQ-88412');
    const [entryIss, setEntryIss] = useState('না');

    // Vendor user add form
    const [newVendorName, setNewVendorName] = useState('নতুন প্রতিনিধি');
    const [newVendorPhone, setNewVendorPhone] = useState('+8801XXXXXXXXX');
    const [newVendorOrg, setNewVendorOrg] = useState('ABC Knit Composite');

    // Toast feedback
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2600);
    };

    const handleRoleSwitch = (newRole: RoleMode) => {
        setRole(newRole);
        if (newRole === 'ven') {
            if (!orders.find(o => o.id === curOrder && o.v === 'abc')) {
                setCurOrder('SC-2610-014');
            }
            setView('vorders');
            showToast('ABC Knit Composite ভিউ চালু করা হয়েছে');
        } else {
            setView('dash');
            showToast('ফ্যাক্টরি ভিউ চালু করা হয়েছে');
        }
    };

    const handleNavigate = (tab: KnitkhataViewTab) => {
        setView(tab);
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    };

    const handleSelectOrder = (orderId: string) => {
        setCurOrder(orderId);
        const target = orders.find(o => o.id === orderId);
        if (target) {
            setEtaM(target.machines.length || 1);
            setEtaR(target.rate || 350);
        }
        setView('detail');
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    };

    // Save shift entry
    const handleSaveEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const [m, oid] = entryM.split('|');
        const kg = parseFloat(entryKg) || 0;
        const rolls = parseInt(entryR) || 0;

        const newLog: ProductionLogItem = {
            d: '03 Oct',
            sh: entrySh as 'A' | 'B',
            m,
            o: oid,
            kg,
            rolls,
            op: entryOp
        };

        setProdLog(prev => [newLog, ...prev]);

        setOrders(prev =>
            prev.map(o => {
                if (o.id === oid) {
                    const newDone = Math.min(o.qty, o.done + kg);
                    return { ...o, done: newDone };
                }
                return o;
            })
        );

        const target = orders.find(o => o.id === oid);
        const updatedDone = target ? Math.min(target.qty, target.done + kg) : kg;
        const updatedPct = target ? Math.round((updatedDone / target.qty) * 100) : 100;

        showToast(`${m} এ ${kg} kg সেভ হয়েছে · ${oid} এখন ${updatedPct}%`);
    };

    // Toggle user switch
    const handleToggleUser = (idx: number) => {
        setUsers(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], on: !next[idx].on };
            const u = next[idx];
            showToast(u.on ? `${u.n} এর অ্যাক্সেস চালু` : `${u.n} এর অ্যাকাউন্ট বন্ধ করা হলো`);
            return next;
        });
    };

    const handleAddVendorUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: UserItem = {
            n: newVendorName,
            r: 'ভেন্ডর প্রতিনিধি',
            org: newVendorOrg,
            on: true,
            last: 'এখনো না',
            vendor: true
        };
        setUsers(prev => [...prev, newUser]);
        showToast('অ্যাক্সেস দেওয়া হয়েছে, OTP লিংক পাঠানো হলো');
    };

    // Helper functions
    const vName = (id: string) => vendors[id]?.name || id;
    const pct = (o: Order) => calcPct(o.done, o.qty);
    const etaOf = (o: Order, m = o.machines.length, r = o.rate) => calcEta(o, m, r);
    const stPill = (o: Order) =>
        o.status === 'run' ? (
            <span className="pill p-acc">চলছে</span>
        ) : o.status === 'wait' ? (
            <span className="pill p-yarn">সুতার অপেক্ষায়</span>
        ) : (
            <span className="pill p-ok">ডেলিভারি সম্পন্ন</span>
        );

    // Order table component
    const renderOrderTable = (list: Order[]) => (
        <div className="tw">
            <table>
                <thead>
                    <tr>
                        <th>অর্ডার নং</th>
                        <th>ভেন্ডর</th>
                        <th>ফেব্রিক</th>
                        <th className="n">অর্ডার (kg)</th>
                        <th className="n">হয়েছে (kg)</th>
                        <th>অগ্রগতি</th>
                        <th className="n">মেশিন</th>
                        <th>সম্ভাব্য শেষ</th>
                        <th>অবস্থা</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(o => {
                        const e = etaOf(o);
                        return (
                            <tr
                                key={o.id}
                                className="click"
                                onClick={() => handleSelectOrder(o.id)}
                            >
                                <td className="mono">{o.id}</td>
                                <td>{vName(o.v)}</td>
                                <td>{o.fabric} {o.gsm} GSM</td>
                                <td className="n">{bn(o.qty)}</td>
                                <td className="n">{bn(o.done)}</td>
                                <td>
                                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                                        <div className="bar" style={{ width: '90px' }}>
                                            <i style={{ width: `${pct(o)}%` }} />
                                        </div>
                                        <span className="mono small">{pct(o)}%</span>
                                    </div>
                                </td>
                                <td className="n">{o.machines.length || '—'}</td>
                                <td className="mono small">
                                    {o.status === 'done' ? '—' : e ? fmtD(e.date) : 'সুতা এলে'}
                                </td>
                                <td>{stPill(o)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    // Screen: Order Detail
    const renderDetail = (readonly: boolean) => {
        const o = orders.find(x => x.id === curOrder) || orders[0];
        const e = etaOf(o, etaM, etaR);
        const yarnTotal = o.yarnIn.reduce((a, y) => a + y.kg, 0);
        const loss = 2;
        const allow = Math.round(yarnTotal * (1 - loss / 100));
        const log = prodLog.filter(p => p.o === o.id);

        return (
            <>
                <div className="head">
                    <div>
                        <button
                            type="button"
                            className="btn sm"
                            onClick={() => handleNavigate(readonly ? 'vorders' : 'orders')}
                        >
                            ← সব অর্ডার
                        </button>
                        <h2 style={{ marginTop: '8px' }}>
                            {o.id} · {o.fabric} {o.gsm} GSM
                        </h2>
                        <p>{vName(o.v)} · শুরু {o.start}</p>
                    </div>
                    {stPill(o)}
                </div>

                <div className="card">
                    <div className="facts">
                        <div><span>ফেব্রিক</span><b>{o.fabric}</b></div>
                        <div><span>GSM</span><b className="mono">{o.gsm}</b></div>
                        <div><span>Dia × Gauge</span><b className="mono">{o.dia}</b></div>
                        <div><span>রং</span><b>{o.color}</b></div>
                        <div><span>সুতা</span><b>{o.yarn}</b></div>
                        {!readonly && <div><span>নিটিং চার্জ</span><b className="mono">৳{o.rateTk}/kg</b></div>}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                            <b>অগ্রগতি</b>
                            <span className="mono">{bn(o.done)} / {bn(o.qty)} kg · {pct(o)}%</span>
                        </div>
                        <div className="bar big" style={{ marginTop: '6px' }}>
                            <i style={{ width: `${pct(o)}%` }} />
                        </div>
                    </div>
                </div>

                {o.status === 'run' && (
                    <div className="card">
                        <h3>কবে শেষ হবে? (হিসাব)</h3>
                        <div className="eta">
                            <label className="f">
                                মেশিন সংখ্যা
                                <input
                                    type="number"
                                    min="1"
                                    value={etaM}
                                    disabled={readonly}
                                    onChange={ev => setEtaM(parseInt(ev.target.value) || 1)}
                                />
                            </label>
                            <label className="f">
                                প্রতি মেশিন/দিন (kg)
                                <input
                                    type="number"
                                    min="1"
                                    value={etaR}
                                    disabled={readonly}
                                    onChange={ev => setEtaR(parseInt(ev.target.value) || 1)}
                                />
                            </label>
                            <div className="out">
                                <span className="small muted">বাকি</span>
                                <b>{bn(o.qty - o.done)} kg</b>
                            </div>
                            <div className="out">
                                <span className="small muted">দৈনিক মোট</span>
                                <b>{bn(etaM * etaR)} kg</b>
                            </div>
                            <div className="out">
                                <span className="small muted">সম্ভাব্য শেষ</span>
                                <b>{e ? fmtD(e.date) : '—'}</b>
                            </div>
                        </div>
                        <p className="small muted" style={{ margin: '8px 0 0' }}>
                            চলমান মেশিন: {o.machines.map(m => (
                                <span key={m} className="pill p-acc" style={{ marginRight: '4px' }}>{m}</span>
                            ))}
                            {!readonly && ' — মেশিন বাড়ালে/কমালে তারিখ নিজে থেকেই বদলাবে।'}
                        </p>
                    </div>
                )}

                <div className="grid g2">
                    <div className="card">
                        <h3>সুতা গ্রহণ (Yarn Receive)</h3>
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>কাউন্ট</th>
                                        <th>স্পিনার</th>
                                        <th>লট</th>
                                        <th className="n">ব্যাগ</th>
                                        <th className="n">kg</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {o.yarnIn.map((y, idx) => (
                                        <tr key={idx}>
                                            <td>{y.count}</td>
                                            <td>{y.spinner}</td>
                                            <td className="mono">{y.lot}</td>
                                            <td className="n">{y.bags}</td>
                                            <td className="n">{bn(y.kg)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {yarnTotal ? (
                            <div className="facts" style={{ marginTop: '12px' }}>
                                <div><span>মোট সুতা পাওয়া</span><b className="mono">{bn(yarnTotal)} kg</b></div>
                                <div><span>প্রসেস লস ধরে ({loss}%)</span><b className="mono">{bn(allow)} kg</b></div>
                                <div>
                                    <span>সুতা ব্যালেন্স (মেশিনে যায়নি)</span>
                                    <b className="mono">{bn(Math.max(0, yarnTotal - Math.round(o.done / (1 - loss / 100))))} kg</b>
                                </div>
                            </div>
                        ) : (
                            <p className="small muted">সুতা এখনো আসেনি।</p>
                        )}
                    </div>

                    <div className="card">
                        <h3>QC ও কাপড়ের সমস্যা</h3>
                        {o.qc.length ? (
                            <div className="tw">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>তারিখ</th>
                                            <th>রোল</th>
                                            <th>মেশিন</th>
                                            <th>সমস্যা</th>
                                            <th className="n">kg</th>
                                            <th>ফলাফল</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o.qc.map((q, idx) => (
                                            <tr key={idx}>
                                                <td>{q.d}</td>
                                                <td className="mono">{q.roll}</td>
                                                <td className="mono">{q.m}</td>
                                                <td>{q.issue}</td>
                                                <td className="n">{q.kg}</td>
                                                <td><span className={`pill p-${q.s}`}>{q.res}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="small muted">কোনো রেকর্ড নেই।</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3>দৈনিক প্রোডাকশন লগ</h3>
                    {log.length ? (
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>তারিখ</th>
                                        <th>শিফট</th>
                                        <th>মেশিন</th>
                                        <th className="n">kg</th>
                                        <th className="n">রোল</th>
                                        {!readonly && <th>অপারেটর</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{p.d}</td>
                                            <td>{p.sh}</td>
                                            <td className="mono">{p.m}</td>
                                            <td className="n">{p.kg}</td>
                                            <td className="n">{p.rolls}</td>
                                            {!readonly && <td>{p.op}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="small muted">এখনো প্রোডাকশন শুরু হয়নি।</p>
                    )}
                </div>

                {!readonly && (
                    <div className="card">
                        <h3>ভেন্ডর অ্যাক্সেস</h3>
                        <p className="small muted" style={{ marginTop: '-4px' }}>
                            {vName(o.v)}-এর যারা এই অর্ডার দেখতে পারেন
                        </p>
                        {users
                            .filter(u => u.vendor && u.org === vName(o.v))
                            .map((u, idx) => (
                                <div
                                    key={idx}
                                    className="row"
                                    style={{ justifyContent: 'space-between', padding: '6px 0' }}
                                >
                                    <div>
                                        <b>{u.n}</b> <span className="small muted">· {u.r}</span>
                                    </div>
                                    {u.on ? (
                                        <span className="pill p-ok">সক্রিয়</span>
                                    ) : (
                                        <span className="pill p-idle">বন্ধ</span>
                                    )}
                                </div>
                            ))}
                        <div className="row" style={{ marginTop: '8px' }}>
                            <button
                                type="button"
                                className="btn sm"
                                onClick={() => handleNavigate('users')}
                            >
                                পারমিশন বদলান
                            </button>
                            <button
                                type="button"
                                className="btn sm"
                                onClick={() => handleNavigate('wa')}
                            >
                                WhatsApp রিপোর্ট সেটিং
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // View data calculations
    const run = orders.filter(o => o.status === 'run');
    const todayKg = prodLog.filter(p => p.d === '03 Oct').reduce((a, p) => a + p.kg, 0);
    const mRun = Object.values(machineState).filter(s => s.startsWith('run')).length;
    const cls = (s: string) => (s.startsWith('run') ? 'run' : s);

    // Attendance data
    const ppl: [string, string, string, number[]][] = [
        ['জসিম উদ্দিন', 'অপারেটর', 'A', [1, 1, 1, 1, 1, 1, 1]],
        ['সোহেল রানা', 'অপারেটর', 'A', [1, 1, 0, 1, 1, 1, 1]],
        ['মাসুদ মিয়া', 'অপারেটর', 'B', [1, 1, 1, 1, 1, 2, 1]],
        ['ফারুক হোসেন', 'অপারেটর', 'B', [1, 1, 1, 1, 1, 1, 0]],
        ['নাজমুল হক', 'টেকনিশিয়ান', 'A', [1, 1, 1, 1, 1, 1, 1]],
        ['রুবিনা খাতুন', 'QC ইন্সপেক্টর', 'A', [1, 1, 1, 2, 1, 1, 1]]
    ];
    const days = ['27', '28', '29', '30', '01', '02', '03'];

    // All QC items
    const allQc = orders.flatMap(o => o.qc.map(q => ({ ...q, o: o.id, v: vName(o.v) })));

    // WhatsApp phone simulator
    const renderWaPhone = () => {
        const o = orders[0];
        const o2 = orders[1];
        return (
            <div className="phone">
                <div className="wh">
                    <b>নিটখাতা রিপোর্ট</b>রহমান নিটিং ইন্ডাস্ট্রিজ
                </div>
                <div className="body">
                    <div className="bub">
                        আসসালামু আলাইকুম কামরুল সাহেব,<br />
                        ৩ অক্টোবর ২০২৬ এর নিটিং আপডেট:<br /><br />
                        <b>{o.id}</b> · {o.fabric} {o.gsm}<br />
                        আজ: 1,100 kg · মোট {pct(o)}%<br />
                        মেশিন: {o.machines.length}টি · শেষ হবে ~{etaOf(o) ? fmtD(etaOf(o)!.date) : '০৮ Oct'}<br />
                        QC: ১টি রোল বাতিল (needle mark)<br /><br />
                        <b>{o2.id}</b> · {o2.fabric}<br />
                        মোট {pct(o2)}% · কাল শেষ হবে
                        <time>রাত ৮:০০</time>
                    </div>
                    <div className="bub file">
                        <div className="xl">XLSX</div>
                        <div>
                            <b className="small">ABC_Knitting_Report_03Oct26.xlsx</b>
                            <div className="small muted">3 শিট · 24 KB</div>
                        </div>
                    </div>
                    <div className="bub">
                        লাইভ দেখতে: knitkhata.app/v/abc
                        <time>রাত ৮:০০</time>
                    </div>
                </div>
            </div>
        );
    };

    // Excel sheet preview
    const renderSheetPreview = () => (
        <div className="tw sheet">
            <table>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Fabric</th>
                        <th>Order kg</th>
                        <th>Today kg</th>
                        <th>Total kg</th>
                        <th>%</th>
                        <th>M/C</th>
                        <th>Yarn Lot</th>
                        <th>QC</th>
                        <th>ETA</th>
                    </tr>
                </thead>
                <tbody>
                    {orders
                        .filter(o => o.v === 'abc')
                        .map(o => {
                            const todaySum = prodLog
                                .filter(p => p.o === o.id && p.d === '03 Oct')
                                .reduce((a, p) => a + p.kg, 0);
                            const e = etaOf(o);
                            return (
                                <tr key={o.id}>
                                    <td>{o.id}</td>
                                    <td>{o.fabric} {o.gsm}</td>
                                    <td>{o.qty}</td>
                                    <td>{todaySum}</td>
                                    <td>{o.done}</td>
                                    <td>{pct(o)}</td>
                                    <td>{o.machines.length}</td>
                                    <td>{o.yarnIn.map(y => y.lot).join(', ')}</td>
                                    <td>{o.qc.filter(q => q.s !== 'ok').length} issue</td>
                                    <td>{e ? fmtD(e.date) : '—'}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );

    return (
        <KnitkhataLayout
            auth={auth}
            factory={factory}
            role={role}
            onRoleChange={handleRoleSwitch}
            activeTab={view}
            onNavigate={handleNavigate}
            toastMessage={toastMessage}
            title={
                view === 'dash'
                    ? 'ড্যাশবোর্ড'
                    : view === 'orders'
                    ? 'সাব-কন্ট্রাক্ট অর্ডার'
                    : 'নিটখাতা প্রোটোটাইপ'
            }
        >
            {/* SCREEN: DASHBOARD */}
            {view === 'dash' && (
                <>
                    <div className="head">
                        <div>
                            <h2>আজকের অবস্থা</h2>
                            <p>শনিবার, ৩ অক্টোবর ২০২৬ · শিফট A চলছে</p>
                        </div>
                        <div className="row">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => handleNavigate('entry')}
                            >
                                + প্রোডাকশন এন্ট্রি
                            </button>
                            <button
                                type="button"
                                className="btn pri"
                                onClick={() => handleNavigate('orders')}
                            >
                                অর্ডার দেখুন
                            </button>
                        </div>
                    </div>

                    <div className="kpis">
                        <div className="kpi">
                            <span>চলমান অর্ডার</span>
                            <b>{run.length}</b>
                            <i>১টি সুতার অপেক্ষায়</i>
                        </div>
                        <div className="kpi">
                            <span>আজকের প্রোডাকশন</span>
                            <b>{bn(todayKg)} kg</b>
                            <i>শিফট A পর্যন্ত</i>
                        </div>
                        <div className="kpi">
                            <span>মেশিন চলছে</span>
                            <b>{mRun} / 24</b>
                            <i>২টি ব্রেকডাউন</i>
                        </div>
                        <div className="kpi">
                            <span>QC সমস্যা (খোলা)</span>
                            <b>3</b>
                            <i>২টি ABC, ১টি XYZ</i>
                        </div>
                        <div className="kpi">
                            <span>আজকের খরচ</span>
                            <b>৳ 18,450</b>
                            <i>৬টি ভাউচার</i>
                        </div>
                    </div>

                    <div className="grid g2">
                        <div className="card">
                            <h3>মেশিন বোর্ড</h3>
                            <div className="machines">
                                {Object.entries(machineState).map(([m, s]) => (
                                    <div
                                        key={m}
                                        className={`mc ${cls(s)}`}
                                        title={s}
                                        onClick={() => {
                                            if (s.startsWith('run')) {
                                                handleSelectOrder(s.split(':')[1]);
                                            }
                                        }}
                                    >
                                        <b>{m}</b>
                                        {s.startsWith('run')
                                            ? s.split(':')[1].slice(-3)
                                            : s === 'down'
                                            ? 'ব্রেকডাউন'
                                            : s === 'wait'
                                            ? 'রিজার্ভ'
                                            : 'খালি'}
                                    </div>
                                ))}
                            </div>
                            <div className="legend">
                                <span style={{ '--c': 'var(--accent)' } as React.CSSProperties}>
                                    অর্ডারে চলছে (নিচে অর্ডার নং)
                                </span>
                                <span style={{ '--c': 'var(--yarn)' } as React.CSSProperties}>
                                    পরের অর্ডারের জন্য রিজার্ভ
                                </span>
                                <span style={{ '--c': 'var(--bad)' } as React.CSSProperties}>
                                    ব্রেকডাউন
                                </span>
                                <span style={{ '--c': 'var(--idle)' } as React.CSSProperties}>
                                    খালি
                                </span>
                            </div>
                        </div>

                        <div className="card">
                            <h3>নজর দেওয়া দরকার</h3>
                            <div className="alert">
                                <i className="dot" style={{ background: 'var(--bad)' }} />
                                <div>
                                    <b>SC-2610-014</b> — M-07 এ needle mark, ১টি রোল (২২ kg) বাতিল। ABC কে জানানো হয়েছে।
                                </div>
                            </div>
                            <div className="alert">
                                <i className="dot" style={{ background: 'var(--warn)' }} />
                                <div>
                                    <b>SC-2610-018</b> — Nobo Composite এর সুতা এখনো আসেনি। ৩টি মেশিন রিজার্ভ করে রাখা।
                                </div>
                            </div>
                            <div className="alert">
                                <i className="dot" style={{ background: 'var(--warn)' }} />
                                <div>
                                    <b>SC-2609-011</b> — মাত্র ১৯০ kg বাকি, কাল দুপুরে শেষ হবে। ডেলিভারি চালান রেডি করুন।
                                </div>
                            </div>
                            <div className="alert">
                                <i className="dot" style={{ background: 'var(--accent)' }} />
                                <div>ডেসকো বিদ্যুৎ বিল (সেপ্টেম্বর) জমার শেষ তারিখ ১০ অক্টোবর।</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>চলমান অর্ডারের অগ্রগতি</h3>
                        {renderOrderTable(orders.filter(o => o.status !== 'done'))}
                    </div>
                </>
            )}

            {/* SCREEN: ORDERS */}
            {view === 'orders' && (
                <>
                    <div className="head">
                        <div>
                            <h2>সাব-কন্ট্রাক্ট অর্ডার</h2>
                            <p>বিভিন্ন কম্পোজিট/ভেন্ডর থেকে আসা সব নিটিং কাজ এক জায়গায়</p>
                        </div>
                        <button
                            type="button"
                            className="btn pri"
                            onClick={() => showToast('নতুন অর্ডার ফর্ম — পরের ভার্সনে')}
                        >
                            + নতুন অর্ডার
                        </button>
                    </div>

                    <div className="kpis">
                        {Object.entries(vendors).map(([k, v]) => {
                            const os = orders.filter(o => o.v === k);
                            const q = os.reduce((a, o) => a + o.qty, 0);
                            const d = os.reduce((a, o) => a + o.done, 0);
                            return (
                                <div key={k} className="kpi">
                                    <span>{v.name}</span>
                                    <b>{bn(d)} / {bn(q)}</b>
                                    <i>kg · {os.length}টি অর্ডার</i>
                                </div>
                            );
                        })}
                    </div>

                    {renderOrderTable(orders)}

                    <p className="small muted">
                        যেকোনো অর্ডারে ক্লিক করলে বিস্তারিত — সুতা, লট, মেশিন, দৈনিক প্রোডাকশন, QC — সব দেখা যাবে।
                    </p>
                </>
            )}

            {/* SCREEN: DETAIL */}
            {view === 'detail' && renderDetail(role === 'ven')}

            {/* SCREEN: SHIFT ENTRY */}
            {view === 'entry' && (
                <>
                    <div className="head">
                        <div>
                            <h2>প্রোডাকশন এন্ট্রি</h2>
                            <p>ফ্লোর সুপারভাইজার মোবাইল থেকে প্রতি শিফটে এটুকু পূরণ করবেন</p>
                        </div>
                    </div>

                    <form className="card" onSubmit={handleSaveEntry}>
                        <div className="form">
                            <label className="f">
                                তারিখ
                                <input
                                    value={entryDate}
                                    onChange={e => setEntryDate(e.target.value)}
                                />
                            </label>
                            <label className="f">
                                শিফট
                                <select
                                    value={entrySh}
                                    onChange={e => setEntrySh(e.target.value)}
                                >
                                    <option>A</option>
                                    <option>B</option>
                                </select>
                            </label>
                            <label className="f">
                                মেশিন
                                <select
                                    value={entryM}
                                    onChange={e => setEntryM(e.target.value)}
                                >
                                    {orders
                                        .filter(o => o.status === 'run')
                                        .flatMap(o =>
                                            o.machines.map(m => (
                                                <option key={`${m}|${o.id}`} value={`${m}|${o.id}`}>
                                                    {m} — {o.id}
                                                </option>
                                            ))
                                        )}
                                </select>
                            </label>
                            <label className="f">
                                প্রোডাকশন (kg)
                                <input
                                    type="number"
                                    value={entryKg}
                                    onChange={e => setEntryKg(e.target.value)}
                                />
                            </label>
                            <label className="f">
                                রোল সংখ্যা
                                <input
                                    type="number"
                                    value={entryR}
                                    onChange={e => setEntryR(e.target.value)}
                                />
                            </label>
                            <label className="f">
                                অপারেটর
                                <input
                                    value={entryOp}
                                    onChange={e => setEntryOp(e.target.value)}
                                />
                            </label>
                            <label className="f">
                                ব্যবহৃত সুতার লট
                                <select
                                    value={entryLot}
                                    onChange={e => setEntryLot(e.target.value)}
                                >
                                    <option>SQ-88412</option>
                                    <option>SQ-88419</option>
                                    <option>AK-5521</option>
                                    <option>NS-2290</option>
                                </select>
                            </label>
                            <label className="f">
                                কোনো সমস্যা?
                                <select
                                    value={entryIss}
                                    onChange={e => setEntryIss(e.target.value)}
                                >
                                    <option>না</option>
                                    <option>Hole</option>
                                    <option>Needle mark</option>
                                    <option>Barre</option>
                                    <option>Oil spot</option>
                                    <option>Lycra out</option>
                                </select>
                            </label>
                        </div>
                        <div className="row" style={{ marginTop: '14px' }}>
                            <button className="btn pri" type="submit">
                                সেভ করুন
                            </button>
                            <span className="small muted">
                                সেভ করলেই অর্ডারের অগ্রগতি, শেষের তারিখ আর ভেন্ডরের রিপোর্ট আপডেট হবে।
                            </span>
                        </div>
                    </form>

                    <div className="card">
                        <h3>আজকের এন্ট্রি</h3>
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>শিফট</th>
                                        <th>মেশিন</th>
                                        <th>অর্ডার</th>
                                        <th className="n">kg</th>
                                        <th className="n">রোল</th>
                                        <th>অপারেটর</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prodLog
                                        .filter(p => p.d === '03 Oct')
                                        .map((p, idx) => (
                                            <tr key={idx}>
                                                <td>{p.sh}</td>
                                                <td className="mono">{p.m}</td>
                                                <td className="mono">{p.o}</td>
                                                <td className="n">{p.kg}</td>
                                                <td className="n">{p.rolls}</td>
                                                <td>{p.op}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* SCREEN: QC */}
            {view === 'qc' && (
                <>
                    <div className="head">
                        <div>
                            <h2>QC ও কাপড়ের সমস্যা</h2>
                            <p>রোল ধরে ধরে পরিদর্শন, ফল্ট আর সমাধানের রেকর্ড</p>
                        </div>
                        <button
                            type="button"
                            className="btn pri"
                            onClick={() => showToast('QC এন্ট্রি ফর্ম — পরের ভার্সনে')}
                        >
                            + QC এন্ট্রি
                        </button>
                    </div>

                    <div className="kpis">
                        <div className="kpi">
                            <span>আজ পরিদর্শন</span>
                            <b>46 রোল</b>
                        </div>
                        <div className="kpi">
                            <span>পাস</span>
                            <b>44</b>
                        </div>
                        <div className="kpi">
                            <span>খোলা সমস্যা</span>
                            <b>3</b>
                        </div>
                        <div className="kpi">
                            <span>রিজেক্ট (এ মাসে)</span>
                            <b>0.6%</b>
                        </div>
                    </div>

                    <div className="tw">
                        <table>
                            <thead>
                                <tr>
                                    <th>তারিখ</th>
                                    <th>অর্ডার</th>
                                    <th>ভেন্ডর</th>
                                    <th>রোল</th>
                                    <th>মেশিন</th>
                                    <th>সমস্যা</th>
                                    <th className="n">kg</th>
                                    <th>অবস্থা</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allQc.map((q, idx) => (
                                    <tr key={idx}>
                                        <td>{q.d}</td>
                                        <td className="mono">{q.o}</td>
                                        <td>{q.v}</td>
                                        <td className="mono">{q.roll}</td>
                                        <td className="mono">{q.m}</td>
                                        <td>{q.issue}</td>
                                        <td className="n">{q.kg}</td>
                                        <td>
                                            <span className={`pill p-${q.s}`}>{q.res}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* SCREEN: ACCOUNTS */}
            {view === 'acc' && (
                <>
                    <div className="head">
                        <div>
                            <h2>হিসাব-নিকাশ</h2>
                            <p>খরচ, বিল, ব্যাংক, LC আর পার্টি — এক্সেলের আলাদা আলাদা শিটের জায়গায়</p>
                        </div>
                        <button
                            type="button"
                            className="btn pri"
                            onClick={() => showToast('ভাউচার এন্ট্রি — পরের ভার্সনে')}
                        >
                            + নতুন এন্ট্রি
                        </button>
                    </div>

                    <div className="tabs">
                        <button
                            type="button"
                            className={accTab === 'exp' ? 'on' : ''}
                            onClick={() => setAccTab('exp')}
                        >
                            দৈনিক খরচ
                        </button>
                        <button
                            type="button"
                            className={accTab === 'util' ? 'on' : ''}
                            onClick={() => setAccTab('util')}
                        >
                            ইউটিলিটি বিল
                        </button>
                        <button
                            type="button"
                            className={accTab === 'bank' ? 'on' : ''}
                            onClick={() => setAccTab('bank')}
                        >
                            ব্যাংক
                        </button>
                        <button
                            type="button"
                            className={accTab === 'lc' ? 'on' : ''}
                            onClick={() => setAccTab('lc')}
                        >
                            LC
                        </button>
                        <button
                            type="button"
                            className={accTab === 'party' ? 'on' : ''}
                            onClick={() => setAccTab('party')}
                        >
                            পার্টি লেজার
                        </button>
                    </div>

                    {accTab === 'exp' && (
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>তারিখ</th>
                                        <th>খাত</th>
                                        <th>বিবরণ</th>
                                        <th>দিয়েছেন</th>
                                        <th className="n">টাকা</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>03 Oct</td><td>মেশিন পার্টস</td><td>নিডল (Groz-Beckert) ২০০ পিস</td><td>শফিকুল</td><td className="n">9,800</td></tr>
                                    <tr><td>03 Oct</td><td>পরিবহন</td><td>ABC তে কাপড় ডেলিভারি — পিকআপ ভাড়া</td><td>তানভীর</td><td className="n">3,500</td></tr>
                                    <tr><td>03 Oct</td><td>তেল/লুব্রিকেন্ট</td><td>নিটিং অয়েল ২০ লিটার</td><td>শফিকুল</td><td className="n">3,600</td></tr>
                                    <tr><td>03 Oct</td><td>আপ্যায়ন</td><td>বায়ার/ভেন্ডর ভিজিট</td><td>তানভীর</td><td className="n">850</td></tr>
                                    <tr><td>03 Oct</td><td>অফিস</td><td>প্রিন্টার কালি</td><td>তানভীর</td><td className="n">700</td></tr>
                                    <tr><td colSpan={4}><b>আজকের মোট</b></td><td className="n"><b>18,450</b></td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {accTab === 'util' && (
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>বিল</th>
                                        <th>মাস</th>
                                        <th className="n">টাকা</th>
                                        <th>শেষ তারিখ</th>
                                        <th>অবস্থা</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>বিদ্যুৎ (DESCO)</td><td>সেপ্টেম্বর</td><td className="n">3,84,200</td><td>10 Oct</td><td><span className="pill p-warn">বাকি</span></td></tr>
                                    <tr><td>গ্যাস</td><td>সেপ্টেম্বর</td><td className="n">42,500</td><td>15 Oct</td><td><span className="pill p-warn">বাকি</span></td></tr>
                                    <tr><td>পানি (WASA)</td><td>সেপ্টেম্বর</td><td className="n">6,300</td><td>12 Oct</td><td><span className="pill p-ok">জমা</span></td></tr>
                                    <tr><td>ইন্টারনেট</td><td>অক্টোবর</td><td className="n">3,000</td><td>05 Oct</td><td><span className="pill p-ok">জমা</span></td></tr>
                                    <tr><td>ফ্যাক্টরি ভাড়া</td><td>অক্টোবর</td><td className="n">2,50,000</td><td>07 Oct</td><td><span className="pill p-warn">বাকি</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {accTab === 'bank' && (
                        <div>
                            <div className="kpis">
                                <div className="kpi">
                                    <span>ব্যাংক A — চলতি হিসাব</span>
                                    <b>৳ 14,62,300</b>
                                    <i>শেষ লেনদেন আজ</i>
                                </div>
                                <div className="kpi">
                                    <span>ব্যাংক B — CC লোন</span>
                                    <b>৳ −22,40,000</b>
                                    <i>লিমিট ৩০ লাখ</i>
                                </div>
                                <div className="kpi">
                                    <span>ক্যাশ ইন হ্যান্ড</span>
                                    <b>৳ 86,500</b>
                                </div>
                            </div>
                            <div className="tw" style={{ marginTop: '12px' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>তারিখ</th>
                                            <th>ব্যাংক</th>
                                            <th>বিবরণ</th>
                                            <th className="n">জমা</th>
                                            <th className="n">উত্তোলন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>03 Oct</td><td>ব্যাংক A</td><td>ABC Knit Composite — বিল নং INV-0912</td><td className="n">6,72,000</td><td className="n">—</td></tr>
                                        <tr><td>02 Oct</td><td>ব্যাংক A</td><td>সেপ্টেম্বর বেতন</td><td className="n">—</td><td className="n">11,40,000</td></tr>
                                        <tr><td>01 Oct</td><td>ব্যাংক B</td><td>LC মার্জিন — নিডল ও স্পেয়ার</td><td className="n">—</td><td className="n">2,10,000</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {accTab === 'lc' && (
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>LC নং</th>
                                        <th>পণ্য</th>
                                        <th>সাপ্লায়ার</th>
                                        <th className="n">মূল্য (USD)</th>
                                        <th>মার্জিন</th>
                                        <th>শিপমেন্ট</th>
                                        <th>অবস্থা</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td className="mono">LC-26-0417</td><td>সার্কুলার মেশিন স্পেয়ার পার্টস</td><td>(সাপ্লায়ার, চীন)</td><td className="n">18,400</td><td>20%</td><td>20 Oct</td><td><span className="pill p-acc">খোলা হয়েছে</span></td></tr>
                                    <tr><td className="mono">LC-26-0302</td><td>নিডল ও সিংকার</td><td>(সাপ্লায়ার, জার্মানি)</td><td className="n">7,250</td><td>25%</td><td>পৌঁছেছে</td><td><span className="pill p-warn">ডকুমেন্ট বাকি</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {accTab === 'party' && (
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>পার্টি</th>
                                        <th>ধরন</th>
                                        <th className="n">মোট বিল</th>
                                        <th className="n">পেয়েছি / দিয়েছি</th>
                                        <th className="n">বাকি</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>ABC Knit Composite</td><td>ভেন্ডর (আয়)</td><td className="n">18,24,000</td><td className="n">12,40,000</td><td className="n">5,84,000</td></tr>
                                    <tr><td>XYZ Fashion Ltd</td><td>ভেন্ডর (আয়)</td><td className="n">9,00,000</td><td className="n">9,00,000</td><td className="n">0</td></tr>
                                    <tr><td>নিডল সাপ্লায়ার</td><td>সাপ্লায়ার (খরচ)</td><td className="n">1,96,000</td><td className="n">1,50,000</td><td className="n">46,000</td></tr>
                                    <tr><td>পরিবহন কন্ট্রাক্টর</td><td>সাপ্লায়ার (খরচ)</td><td className="n">72,000</td><td className="n">60,000</td><td className="n">12,000</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* SCREEN: ATTENDANCE */}
            {view === 'att' && (
                <>
                    <div className="head">
                        <div>
                            <h2>হাজিরা ও বেতন</h2>
                            <p>শিফট অনুযায়ী দৈনিক হাজিরা, মাস শেষে বেতন শিট নিজে থেকেই তৈরি</p>
                        </div>
                    </div>

                    <div className="kpis">
                        <div className="kpi">
                            <span>মোট কর্মী</span>
                            <b>58</b>
                        </div>
                        <div className="kpi">
                            <span>আজ উপস্থিত</span>
                            <b>53</b>
                        </div>
                        <div className="kpi">
                            <span>ছুটিতে</span>
                            <b>3</b>
                        </div>
                        <div className="kpi">
                            <span>অনুপস্থিত</span>
                            <b>2</b>
                        </div>
                    </div>

                    <div className="tw">
                        <table>
                            <thead>
                                <tr>
                                    <th>নাম</th>
                                    <th>পদ</th>
                                    <th>শিফট</th>
                                    {days.map(d => (
                                        <th key={d}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ppl.map((p, idx) => (
                                    <tr key={idx}>
                                        <td>{p[0]}</td>
                                        <td>{p[1]}</td>
                                        <td>{p[2]}</td>
                                        {p[3].map((v, di) => (
                                            <td key={di}>
                                                {v === 1 ? (
                                                    <span className="pill p-ok">P</span>
                                                ) : v === 0 ? (
                                                    <span className="pill p-bad">A</span>
                                                ) : (
                                                    <span className="pill p-warn">L</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="small muted">
                        P = উপস্থিত, A = অনুপস্থিত, L = ছুটি। পরে ফিঙ্গারপ্রিন্ট মেশিনের ডেটা সরাসরি আনা যাবে।
                    </p>
                </>
            )}

            {/* SCREEN: USERS */}
            {view === 'users' && (
                <>
                    <div className="head">
                        <div>
                            <h2>ইউজার ও পারমিশন</h2>
                            <p>কে কী দেখবে, আপনি ঠিক করবেন। লোক বদলালে পুরোনো অ্যাকাউন্ট বন্ধ, নতুনকে অ্যাক্সেস।</p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>নাম</th>
                                        <th>ভূমিকা</th>
                                        <th>প্রতিষ্ঠান</th>
                                        <th>শেষ লগইন</th>
                                        <th>সক্রিয়</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={i}>
                                            <td><b>{u.n}</b></td>
                                            <td>{u.r}</td>
                                            <td>{u.vendor ? <span className="pill p-yarn">{u.org}</span> : u.org}</td>
                                            <td className="small">{u.last}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`switch ${u.on ? 'on' : ''}`}
                                                    onClick={() => handleToggleUser(i)}
                                                    aria-label={`${u.n} সক্রিয়/বন্ধ`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid g2">
                        <form className="card" onSubmit={handleAddVendorUser}>
                            <h3>ভেন্ডর প্রতিনিধি যোগ করুন</h3>
                            <div className="form">
                                <label className="f">
                                    নাম
                                    <input
                                        value={newVendorName}
                                        onChange={e => setNewVendorName(e.target.value)}
                                    />
                                </label>
                                <label className="f">
                                    মোবাইল (WhatsApp)
                                    <input
                                        value={newVendorPhone}
                                        onChange={e => setNewVendorPhone(e.target.value)}
                                    />
                                </label>
                                <label className="f">
                                    প্রতিষ্ঠান
                                    <select
                                        value={newVendorOrg}
                                        onChange={e => setNewVendorOrg(e.target.value)}
                                    >
                                        {Object.values(vendors).map(v => (
                                            <option key={v.name}>{v.name}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div style={{ marginTop: '12px' }}>
                                <b className="small">সে কী কী দেখতে পারবে</b>
                                <label className="chk"><input type="checkbox" defaultChecked disabled /> শুধু তার প্রতিষ্ঠানের অর্ডার (এটা সবসময় বাধ্যতামূলক)</label>
                                <label className="chk"><input type="checkbox" defaultChecked /> অগ্রগতি, মেশিন সংখ্যা ও সম্ভাব্য শেষ তারিখ</label>
                                <label className="chk"><input type="checkbox" defaultChecked /> সুতা গ্রহণ, লট ও সুতা ব্যালেন্স</label>
                                <label className="chk"><input type="checkbox" defaultChecked /> QC রিপোর্ট ও কাপড়ের সমস্যা</label>
                                <label className="chk"><input type="checkbox" /> দৈনিক রোল-ভিত্তিক প্রোডাকশন লগ</label>
                                <label className="chk"><input type="checkbox" /> বিল ও পেমেন্টের অবস্থা</label>
                                <label className="chk"><input type="checkbox" defaultChecked /> প্রতিদিন রাতে WhatsApp এ Excel রিপোর্ট</label>
                            </div>
                            <button className="btn pri" type="submit" style={{ marginTop: '8px' }}>
                                অ্যাক্সেস দিন
                            </button>
                        </form>

                        <div className="card">
                            <h3>লোক বদলালে কী হবে</h3>
                            <div className="prose small">
                                <p>ধরুন ABC Knit Composite এর আসিফ সাহেব চাকরি ছেড়ে দিলেন। আপনি তার সুইচ বন্ধ করবেন — সাথে সাথে তার লগইন আর WhatsApp রিপোর্ট দুটোই বন্ধ।</p>
                                <p>এরপর নতুন যিনি দায়িত্ব নিলেন (যেমন কামরুল সাহেব), তাকে উপরের ফর্ম থেকে যোগ করবেন। তিনি SMS/WhatsApp এ একটা OTP লিংক পাবেন, পাসওয়ার্ড ঠিক করে ঢুকবেন। পুরোনো সব ইতিহাস তিনিও দেখতে পাবেন, কারণ ডেটা প্রতিষ্ঠানের নামে রাখা, ব্যক্তির নামে না।</p>
                                <p>কে কখন ঢুকেছে, কী দেখেছে — সব একটা অডিট লগে থাকবে।</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* SCREEN: WHATSAPP */}
            {view === 'wa' && (
                <>
                    <div className="head">
                        <div>
                            <h2>WhatsApp রিপোর্ট</h2>
                            <p>প্রতিদিন নির্দিষ্ট সময়ে প্রতিটি ভেন্ডরের প্রতিনিধির কাছে নিজে থেকেই যাবে</p>
                        </div>
                    </div>

                    <div className="grid g2">
                        <div className="card">
                            <h3>সেটিং</h3>
                            <div className="form">
                                <label className="f">
                                    পাঠানোর সময়
                                    <select>
                                        <option>রাত ৮:০০</option>
                                        <option>সকাল ৯:০০</option>
                                        <option>দুইবার (সকাল + রাত)</option>
                                    </select>
                                </label>
                                <label className="f">
                                    ফরম্যাট
                                    <select>
                                        <option>সারাংশ মেসেজ + Excel</option>
                                        <option>শুধু Excel</option>
                                        <option>শুধু মেসেজ</option>
                                    </select>
                                </label>
                            </div>

                            <h3 style={{ marginTop: '18px' }}>কারা পাবেন</h3>
                            {users
                                .filter(u => u.vendor)
                                .map((u, i) => (
                                    <div
                                        key={i}
                                        className="row"
                                        style={{
                                            justifyContent: 'space-between',
                                            padding: '6px 0',
                                            borderBottom: '1px dashed var(--line)'
                                        }}
                                    >
                                        <div>
                                            <b>{u.n}</b>
                                            <div className="small muted">{u.org}</div>
                                        </div>
                                        {u.on ? (
                                            <span className="pill p-ok">পাবেন</span>
                                        ) : (
                                            <span className="pill p-idle">বন্ধ</span>
                                        )}
                                    </div>
                                ))}

                            <div className="row" style={{ marginTop: '12px' }}>
                                <button
                                    type="button"
                                    className="btn pri"
                                    onClick={() => showToast('টেস্ট রিপোর্ট পাঠানো হলো (প্রোটোটাইপ — আসলে যায়নি)')}
                                >
                                    টেস্ট পাঠান
                                </button>
                            </div>

                            <h3 style={{ marginTop: '18px' }}>Excel এ যা থাকবে (ABC)</h3>
                            {renderSheetPreview()}
                        </div>

                        <div className="card">
                            <h3>ভেন্ডর যা দেখবেন</h3>
                            {renderWaPhone()}
                        </div>
                    </div>
                </>
            )}

            {/* SCREEN: PLAN */}
            {view === 'plan' && (
                <>
                    <div className="head">
                        <div>
                            <h2>কাজের পরিকল্পনা</h2>
                            <p>নিটখাতা বানাতে কী কী লাগবে — ধাপ, মডিউল, প্রযুক্তি আর ঝুঁকি</p>
                        </div>
                    </div>

                    <div className="card">
                        <h3>ধাপে ধাপে কাজ</h3>
                        <div className="phase">
                            <div className="when">ধাপ ০<br />২–৩ সপ্তাহ</div>
                            <div>
                                <b>মাঠ থেকে শেখা</b>
                                <ul>
                                    <li>৩–৫টা ছোট নিটিং ফ্যাক্টরি ঘুরে তাদের এখনকার Excel শিট, চালান, রেজিস্টার খাতা সংগ্রহ করা</li>
                                    <li>১–২টা কম্পোজিটের নিটিং/প্ল্যানিং লোকের সাথে কথা — তারা সাব-কন্ট্রাক্টরের কাছে কী তথ্য চায়</li>
                                    <li>এই প্রোটোটাইপ দেখিয়ে মতামত নেওয়া, কোন স্ক্রিন সবচেয়ে জরুরি সেটা ঠিক করা</li>
                                    <li>প্রথম ১–২টা "পাইলট ফ্যাক্টরি" ঠিক করা যারা ফ্রি তে ব্যবহার করবে</li>
                                </ul>
                            </div>
                        </div>

                        <div className="phase">
                            <div className="when">ধাপ ১ (MVP)<br />৬–৮ সপ্তাহ</div>
                            <div>
                                <b>সাব-কন্ট্রাক্ট ট্র্যাকিং — মূল জিনিস</b>
                                <ul>
                                    <li>লগইন, ফ্যাক্টরি সেটআপ, মেশিন লিস্ট (নং, Dia, Gauge)</li>
                                    <li>ভেন্ডর/পার্টি, অর্ডার, সুতা গ্রহণ (কাউন্ট, স্পিনার, লট, ব্যাগ, kg)</li>
                                    <li>মেশিন অ্যাসাইন, শিফট-ভিত্তিক প্রোডাকশন এন্ট্রি (মোবাইলে সহজ ফর্ম)</li>
                                    <li>QC/রোল ইন্সপেকশন, ফল্ট, পাস/রিজেক্ট</li>
                                    <li>শেষ তারিখের হিসাব, সুতা ব্যালেন্স ও প্রসেস লস</li>
                                    <li>ভেন্ডর পোর্টাল: শুধু নিজের অর্ডার দেখা, পারমিশন, অ্যাকাউন্ট চালু/বন্ধ</li>
                                    <li>দৈনিক Excel রিপোর্ট তৈরি + WhatsApp এ পাঠানো</li>
                                </ul>
                            </div>
                        </div>

                        <div className="phase">
                            <div className="when">ধাপ ২<br />৬–৮ সপ্তাহ</div>
                            <div>
                                <b>অফিস ও হিসাব</b>
                                <ul>
                                    <li>দৈনিক খরচ ভাউচার, খাত অনুযায়ী রিপোর্ট</li>
                                    <li>ইউটিলিটি বিল ও শেষ তারিখের রিমাইন্ডার</li>
                                    <li>ব্যাংক হিসাব, ক্যাশ বুক, LC রেজিস্টার</li>
                                    <li>পার্টি লেজার — কার কাছে কত পাওনা/দেনা; ডেলিভারি চালান থেকে বিল তৈরি</li>
                                    <li>হাজিরা, ওভারটাইম, মাসিক বেতন শিট</li>
                                </ul>
                            </div>
                        </div>

                        <div className="phase">
                            <div className="when">ধাপ ৩<br />৪–৬ সপ্তাহ</div>
                            <div>
                                <b>অ্যান্ড্রয়েড অ্যাপ</b>
                                <ul>
                                    <li>প্রথমে ওয়েবসাইটটাকেই মোবাইলে "অ্যাপের মতো" (PWA) চালানো</li>
                                    <li>এরপর Play Store এ আসল অ্যাপ — একই কোড থেকে (Capacitor বা Flutter)</li>
                                    <li>নেট না থাকলেও এন্ট্রি নেওয়া, নেট এলে সিঙ্ক — ফ্লোরে এটা খুব দরকার</li>
                                </ul>
                            </div>
                        </div>

                        <div className="phase">
                            <div className="when">ধাপ ৪<br />চলমান</div>
                            <div>
                                <b>আয়ের মডেল</b>
                                <ul>
                                    <li>প্রথম ৩ মাস পুরো ফ্রি, তারপর মেশিন সংখ্যা অনুযায়ী মাসিক প্যাকেজ</li>
                                    <li>ভেন্ডর পোর্টাল সবসময় ফ্রি — কম্পোজিটগুলোই অন্য সাব-কন্ট্রাক্টরকে এই সফটওয়্যারে আনতে চাপ দেবে</li>
                                    <li>পরে: কম্পোজিটদের জন্য আলাদা ড্যাশবোর্ড (সব সাব-কন্ট্রাক্টর এক জায়গায়) — এটা পেইড হতে পারে</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>প্রযুক্তি (প্রস্তাবিত)</h3>
                        <div className="stack">
                            <div><b>ওয়েব অ্যাপ</b><span className="small muted">Next.js (React) — বাংলা/ইংরেজি দুই ভাষা</span></div>
                            <div><b>ডেটাবেস</b><span className="small muted">PostgreSQL (Supabase) — প্রতিটি ফ্যাক্টরি ও ভেন্ডরের ডেটা আলাদা রাখার "Row Level Security"</span></div>
                            <div><b>WhatsApp</b><span className="small muted">WhatsApp Business Cloud API (Meta) — অনুমোদিত টেমপ্লেট মেসেজ + Excel ফাইল</span></div>
                            <div><b>Excel</b><span className="small muted">ExcelJS দিয়ে সার্ভারে ফাইল বানানো, প্রতিদিন নির্দিষ্ট সময়ে শিডিউল</span></div>
                            <div><b>লগইন</b><span className="small muted">মোবাইল নম্বর + OTP — ফ্লোরের লোকের জন্য পাসওয়ার্ডের চেয়ে সহজ</span></div>
                            <div><b>হোস্টিং</b><span className="small muted">Vercel + Supabase দিয়ে শুরু, শুরুতে খরচ খুব কম</span></div>
                        </div>
                    </div>

                    <div className="card">
                        <h3>ডেটার মূল অংশগুলো</h3>
                        <p className="small muted prose" style={{ marginTop: '-4px' }}>
                            ডেভেলপারকে বোঝানোর জন্য — কোন জিনিসের রেকর্ড রাখতে হবে
                        </p>
                        <div className="row">
                            {[
                                'ফ্যাক্টরি (টেন্যান্ট)',
                                'ইউজার ও রোল',
                                'পারমিশন',
                                'পার্টি / ভেন্ডর',
                                'অর্ডার',
                                'সুতা গ্রহণ ও লট',
                                'মেশিন',
                                'মেশিন অ্যাসাইন',
                                'দৈনিক প্রোডাকশন',
                                'রোল',
                                'QC ইন্সপেকশন',
                                'ডেলিভারি চালান',
                                'বিল / ইনভয়েস',
                                'খরচ ভাউচার',
                                'ইউটিলিটি বিল',
                                'ব্যাংক লেনদেন',
                                'LC',
                                'কর্মী ও হাজিরা',
                                'বেতন',
                                'রিপোর্ট শিডিউল',
                                'অডিট লগ'
                            ].map(x => (
                                <span key={x} className="pill p-idle">
                                    {x}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3>যেসব জায়গায় সাবধান থাকতে হবে</h3>
                        <div className="prose">
                            <p>
                                <b>ফ্লোরের এন্ট্রি।</b> সফটওয়্যার যত ভালোই হোক, সুপারভাইজার ঠিকমতো এন্ট্রি না দিলে সব শূন্য। তাই এন্ট্রি ফর্ম খুব ছোট, বাংলায়, মোবাইলে ৩০ সেকেন্ডে শেষ হওয়ার মতো হতে হবে।
                            </p>
                            <p>
                                <b>ভেন্ডরের গোপনীয়তা।</b> ABC যেন কখনোই XYZ এর অর্ডার বা রেট দেখতে না পায় — এটা ডেটাবেসের স্তরেই আটকাতে হবে, শুধু স্ক্রিনে লুকিয়ে রাখলে হবে না।
                            </p>
                            <p>
                                <b>WhatsApp API।</b> Meta তে বিজনেস ভেরিফিকেশন আর মেসেজ টেমপ্লেট অনুমোদন লাগে, আর প্রতি মেসেজে কিছু খরচ আছে। শুরুতে এটা পরীক্ষা করে নেওয়া ভালো।
                            </p>
                            <p>
                                <b>এক্সেল থেকে সরে আসা।</b> পুরোনো Excel ডেটা এক ক্লিকে ইমপোর্ট করার ব্যবস্থা থাকলে ফ্যাক্টরিগুলো সহজে রাজি হবে।
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* SCREEN: VENDOR MY ORDERS */}
            {view === 'vorders' && (
                <>
                    <div className="vbanner">
                        আপনি <b>মো. কামরুল হাসান</b> হিসেবে লগইন করেছেন — <b>ABC Knit Composite</b>। এখানে শুধু রহমান নিটিং এ চলা আপনাদের অর্ডারগুলো দেখা যাচ্ছে।
                    </div>
                    <div className="head">
                        <div>
                            <h2>আমার অর্ডার</h2>
                            <p>সর্বশেষ আপডেট: আজ, শিফট A (দুপুর ২:০০)</p>
                        </div>
                    </div>
                    {renderOrderTable(orders.filter(o => o.v === 'abc'))}
                    <p className="small muted">
                        রেট, অপারেটরের নাম, অন্য ভেন্ডরের তথ্য — এগুলো ভেন্ডর দেখতে পান না।
                    </p>
                </>
            )}

            {/* SCREEN: VENDOR DAILY REPORT */}
            {view === 'vreport' && (
                <>
                    <div className="vbanner">
                        প্রতিদিন রাত ৮টায় এই রিপোর্ট আপনার WhatsApp এ আসে।
                    </div>
                    <div className="grid g2">
                        <div className="card">
                            <h3>আজকের Excel</h3>
                            {renderSheetPreview()}
                        </div>
                        <div className="card">
                            {renderWaPhone()}
                        </div>
                    </div>
                </>
            )}
        </KnitkhataLayout>
    );
}
