import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import KnitkhataLayout, { TAB_HREFS } from '../../Layouts/KnitkhataLayout';
import './knitkhata.css';
import {
    RoleMode,
    KnitkhataViewTab,
    Order,
    ProductionLogItem,
    UserItem,
    KnitkhataProps,
    YarnIntake,
    DeliveryChallan
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

export default function KnitkhataIndex({
    factory,
    auth,
    initialTab = 'dash',
    initialRole = 'fac',
    initialOrderId = 'SC-2610-014',
    factoryMachines = [],
    customMachines = [],
    machineTypes = [],
    userPosts = [],
    quotationsSubmitted = []
}: KnitkhataProps) {
    const [role, setRole] = useState<RoleMode>(initialRole);
    const [view, setView] = useState<KnitkhataViewTab>(initialTab);
    const [curOrder, setCurOrder] = useState<string>(initialOrderId);
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [machineState, setMachineState] = useState<Record<string, string>>(INITIAL_MACHINE_STATE);
    const [prodLog, setProdLog] = useState<ProductionLogItem[]>(INITIAL_PROD_LOG);
    const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
    const vendors = INITIAL_VENDORS;

    useEffect(() => {
        if (initialTab && initialTab !== view) {
            setView(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (initialRole && initialRole !== role) {
            setRole(initialRole);
        }
    }, [initialRole]);

    useEffect(() => {
        if (initialOrderId && initialOrderId !== curOrder) {
            setCurOrder(initialOrderId);
        }
    }, [initialOrderId]);

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

    // Subcontract Orders filter & search state
    const [orderFilter, setOrderFilter] = useState<'all' | 'run' | 'wait' | 'done'>('all');
    const [orderVendorFilter, setOrderVendorFilter] = useState<string>('all');
    const [orderSearch, setOrderSearch] = useState('');
    const [orderSort, setOrderSort] = useState<'date' | 'progress' | 'qty'>('date');

    // Add Order Modal state
    const [showAddOrderModal, setShowAddOrderModal] = useState(false);
    const [newOId, setNewOId] = useState(`SC-2610-02${orders.length + 1}`);
    const [newOVendor, setNewOVendor] = useState('abc');
    const [newOFabric, setNewOFabric] = useState('Single Jersey 100% Cotton');
    const [newOGsm, setNewOGsm] = useState('160');
    const [newODia, setNewODia] = useState('30" × 24G');
    const [newOColor, setNewOColor] = useState('Navy Blue');
    const [newOYarnCount, setNewOYarnCount] = useState('30s Combed');
    const [newOYarnSpinner, setNewOYarnSpinner] = useState('Square Textiles');
    const [newOYarnLot, setNewOYarnLot] = useState('SQ-90112');
    const [newOQty, setNewOQty] = useState('5000');
    const [newORateTk, setNewORateTk] = useState('24');
    const [newORateKg, setNewORateKg] = useState('500');
    const [newOStatus, setNewOStatus] = useState<'run' | 'wait'>('run');
    const [newOMachines, setNewOMachines] = useState<string>('M-03, M-08');
    const [newOYarnKg, setNewOYarnKg] = useState('2500');
    const [newOYarnBags, setNewOYarnBags] = useState('50');

    // Quick Yarn Intake Modal state
    const [showYarnModal, setShowYarnModal] = useState(false);
    const [yarnTargetOrder, setYarnTargetOrder] = useState<string>('SC-2610-018');
    const [yarnCountInput, setYarnCountInput] = useState('26s Melange');
    const [yarnSpinnerInput, setYarnSpinnerInput] = useState('Square Textiles');
    const [yarnLotInput, setYarnLotInput] = useState('SQ-91040');
    const [yarnBagsInput, setYarnBagsInput] = useState('60');
    const [yarnKgInput, setYarnKgInput] = useState('3000');

    // Subcontract Order Handlers
    const handleAddOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qtyNum = parseFloat(newOQty) || 5000;
        const rateTkNum = parseFloat(newORateTk) || 24;
        const rateKgNum = parseFloat(newORateKg) || 500;
        const gsmNum = parseInt(newOGsm) || 160;
        const yarnKgNum = parseFloat(newOYarnKg) || 0;
        const yarnBagsNum = parseInt(newOYarnBags) || 0;

        const machinesList = newOMachines
            .split(',')
            .map(m => m.trim())
            .filter(Boolean);

        const newYarnIn: YarnIntake[] = yarnKgNum > 0 ? [
            {
                count: newOYarnCount,
                spinner: newOYarnSpinner,
                lot: newOYarnLot,
                bags: yarnBagsNum,
                kg: yarnKgNum
            }
        ] : [];

        const createdOrder: Order = {
            id: newOId.trim() || `SC-2610-02${orders.length + 1}`,
            v: newOVendor,
            fabric: newOFabric,
            gsm: gsmNum,
            dia: newODia,
            color: newOColor,
            yarn: newOYarnCount,
            qty: qtyNum,
            done: 0,
            machines: machinesList,
            rate: rateKgNum,
            rateTk: rateTkNum,
            start: '04 Oct 2026',
            status: newOStatus,
            yarnIn: newYarnIn,
            qc: []
        };

        setOrders(prev => [createdOrder, ...prev]);

        if (newOStatus === 'run' && machinesList.length > 0) {
            setMachineState(prev => {
                const next = { ...prev };
                machinesList.forEach(m => {
                    next[m] = `run:${createdOrder.id}`;
                });
                return next;
            });
        }

        setShowAddOrderModal(false);
        setNewOId(`SC-2610-02${orders.length + 2}`);
        showToast(`নতুন অর্ডার ${createdOrder.id} সফলভাবে যুক্ত হয়েছে!`);
    };

    const handleUpdateOrderStatus = (orderId: string, nextStatus: 'run' | 'wait' | 'done') => {
        setOrders(prev =>
            prev.map(o => {
                if (o.id === orderId) {
                    return { ...o, status: nextStatus };
                }
                return o;
            })
        );
        showToast(`অর্ডার ${orderId} এর অবস্থা পরিবর্তন করা হয়েছে`);
    };

    const handleOpenYarnModal = (orderId: string) => {
        setYarnTargetOrder(orderId);
        const target = orders.find(o => o.id === orderId);
        if (target) {
            setYarnCountInput(target.yarn || '30s Combed');
        }
        setShowYarnModal(true);
    };

    const handleYarnIntakeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const kg = parseFloat(yarnKgInput) || 0;
        const bags = parseInt(yarnBagsInput) || 0;

        setOrders(prev =>
            prev.map(o => {
                if (o.id === yarnTargetOrder) {
                    const newIntake: YarnIntake = {
                        count: yarnCountInput,
                        spinner: yarnSpinnerInput,
                        lot: yarnLotInput,
                        bags,
                        kg
                    };
                    const updatedYarn = [...o.yarnIn, newIntake];
                    const nextStatus = o.status === 'wait' ? 'run' : o.status;
                    return {
                        ...o,
                        yarnIn: updatedYarn,
                        status: nextStatus
                    };
                }
                return o;
            })
        );

        setShowYarnModal(false);
        showToast(`অর্ডার ${yarnTargetOrder} এ ${kg} kg সুতা গ্রহণ সফলভাবে সেভ হয়েছে!`);
    };

    // Delivery Challan Modal state & handlers
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryTargetOrder, setDeliveryTargetOrder] = useState<string>('SC-2610-014');
    const [deliveryDateInput, setDeliveryDateInput] = useState('03 Oct 2026');
    const [deliveryChallanNo, setDeliveryChallanNo] = useState('CH-2610-062');
    const [deliveryRollsInput, setDeliveryRollsInput] = useState('25');
    const [deliveryKgInput, setDeliveryKgInput] = useState('1000');
    const [deliveryVehicleInput, setDeliveryVehicleInput] = useState('পিকআপ ঢাকা মেট্রো-ন ১২-৮৮৪০');
    const [deliveryDriverPhone, setDeliveryDriverPhone] = useState('+8801711223344');

    const handleOpenDeliveryModal = (orderId: string) => {
        setDeliveryTargetOrder(orderId);
        const target = orders.find(o => o.id === orderId);
        const rem = target ? Math.max(0, target.qty - target.done) : 1000;
        setDeliveryKgInput(String(Math.min(rem > 0 ? rem : 1000, 1500)));
        setDeliveryChallanNo(`CH-2610-0${Math.floor(Math.random() * 80 + 20)}`);
        setShowDeliveryModal(true);
    };

    const handleDeliverySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const kg = parseFloat(deliveryKgInput) || 0;
        const rolls = parseInt(deliveryRollsInput) || 0;
        const chNo = deliveryChallanNo.trim() || `CH-2610-0${Math.floor(Math.random() * 80 + 20)}`;

        const newChallan: DeliveryChallan = {
            challanNo: chNo,
            date: deliveryDateInput,
            rolls,
            kg,
            vehicle: deliveryVehicleInput,
            driverPhone: deliveryDriverPhone
        };

        setOrders(prev =>
            prev.map(o => {
                if (o.id === deliveryTargetOrder) {
                    const newDone = Math.min(o.qty, o.done + kg);
                    const updatedChallans = [...(o.challans || []), newChallan];
                    const nextStatus = newDone >= o.qty ? 'done' : o.status;
                    return {
                        ...o,
                        done: newDone,
                        status: nextStatus,
                        challans: updatedChallans
                    };
                }
                return o;
            })
        );

        setShowDeliveryModal(false);
        showToast(`ডেলিভারি চালান ${chNo} সম্পন্ন! ${kg} kg ডেলিভারি রেকর্ড করা হয়েছে`);
    };

    const handleExportOrdersCsv = () => {
        const headers = ['Order ID', 'Start Date', 'Vendor', 'Phone', 'Fabric', 'GSM', 'Dia', 'Color', 'Yarn', 'Primary Lot', 'Order Qty (kg)', 'Produced (kg)', 'Balance (kg)', 'Progress (%)', 'Machines', 'Rate (Tk/kg)', 'Total Bill (Tk)', 'Status'];
        const rows = filteredOrders.map(o => {
            const rem = Math.max(0, o.qty - o.done);
            const bill = o.qty * (o.rateTk || 22);
            const lot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : 'সুতা বাকি';
            const st = o.status === 'run' ? 'চলমান' : o.status === 'wait' ? 'সুতার অপেক্ষায়' : 'সম্পন্ন';
            return [
                o.id,
                o.start,
                `"${vendors[o.v]?.name || o.v}"`,
                `"${vendors[o.v]?.phone || ''}"`,
                `"${o.fabric}"`,
                o.gsm,
                `"${o.dia}"`,
                `"${o.color}"`,
                `"${o.yarn}"`,
                `"${lot}"`,
                o.qty,
                o.done,
                rem,
                `${pct(o)}%`,
                `"${o.machines.join(', ')}"`,
                o.rateTk || 22,
                bill,
                `"${st}"`
            ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `subcontract_orders_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('সাব-কন্ট্রাক্ট অর্ডারের Excel/CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে');
    };

    // Subcontract Orders high-level metrics
    const totalOrderQty = orders.reduce((sum, o) => sum + o.qty, 0);
    const totalDoneQty = orders.reduce((sum, o) => sum + o.done, 0);
    const totalOrderProgress = calcPct(totalDoneQty, totalOrderQty);
    const totalOrderRevenue = orders.reduce((sum, o) => sum + (o.qty * (o.rateTk || 22)), 0);
    const runningOrdersCount = orders.filter(o => o.status === 'run').length;
    const waitingOrdersCount = orders.filter(o => o.status === 'wait').length;
    const doneOrdersCount = orders.filter(o => o.status === 'done').length;

    const filteredOrders = orders
        .filter(o => {
            if (orderFilter !== 'all' && o.status !== orderFilter) return false;
            if (orderVendorFilter !== 'all' && o.v !== orderVendorFilter) return false;
            if (orderSearch.trim()) {
                const q = orderSearch.toLowerCase();
                const lotMatches = o.yarnIn.some(y => y.lot.toLowerCase().includes(q));
                const vendorName = (vendors[o.v]?.name || '').toLowerCase();
                return (
                    o.id.toLowerCase().includes(q) ||
                    vendorName.includes(q) ||
                    o.fabric.toLowerCase().includes(q) ||
                    o.color.toLowerCase().includes(q) ||
                    lotMatches
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (orderSort === 'progress') {
                return pct(b) - pct(a);
            }
            if (orderSort === 'qty') {
                return b.qty - a.qty;
            }
            return b.id.localeCompare(a.id);
        });

    // Vendor Perspective Orders (Give Subcontract: Orders I Posted)
    const vendorOrdersList = orders.filter(o => o.v === 'abc');
    const vendorTotalQty = vendorOrdersList.reduce((sum, o) => sum + o.qty, 0);
    const vendorDoneQty = vendorOrdersList.reduce((sum, o) => sum + o.done, 0);
    const vendorProgressPct = calcPct(vendorDoneQty, vendorTotalQty);
    const vendorRunningCount = vendorOrdersList.filter(o => o.status === 'run').length;
    const vendorDoneCount = vendorOrdersList.filter(o => o.status === 'done').length;
    const vendorWaitingCount = vendorOrdersList.filter(o => o.status === 'wait').length;
    const vendorYarnSentKg = vendorOrdersList.reduce((sum, o) => sum + o.yarnIn.reduce((ys, y) => ys + y.kg, 0), 0);
    const vendorTotalChallansCount = vendorOrdersList.reduce((sum, o) => sum + (o.challans?.length || 0), 0);
    const vendorTotalBill = vendorOrdersList.reduce((sum, o) => sum + (o.qty * (o.rateTk || 22)), 0);

    const [vendorOrderFilter, setVendorOrderFilter] = useState<'all' | 'run' | 'done'>('all');
    const [vendorOrderSearch, setVendorOrderSearch] = useState('');

    const filteredVendorOrders = vendorOrdersList.filter(o => {
        if (vendorOrderFilter !== 'all' && o.status !== vendorOrderFilter) return false;
        if (vendorOrderSearch.trim()) {
            const q = vendorOrderSearch.toLowerCase();
            const lotMatches = o.yarnIn.some(y => y.lot.toLowerCase().includes(q));
            return (
                o.id.toLowerCase().includes(q) ||
                o.fabric.toLowerCase().includes(q) ||
                o.color.toLowerCase().includes(q) ||
                lotMatches
            );
        }
        return true;
    });

    const handleExportVendorCsv = () => {
        const headers = ['Order ID', 'Date Posted', 'Factory', 'Fabric Specs', 'Yarn & Lot Sent', 'Order Qty (kg)', 'Produced (kg)', 'Delivered (kg)', 'Pending (kg)', 'Progress (%)', 'Assigned Machines', 'Rate (Tk/kg)', 'Total Bill (Tk)', 'Status'];
        const rows = filteredVendorOrders.map(o => {
            const rem = Math.max(0, o.qty - o.done);
            const bill = o.qty * (o.rateTk || 22);
            const lot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : 'সুতা বাকি';
            const st = o.status === 'run' ? 'ফ্যাক্টরিতে চলমান' : o.status === 'wait' ? 'সুতার অপেক্ষায়' : 'সম্পন্ন';
            return [
                o.id,
                o.start,
                '"রহমান নিটিং ইন্ডাস্ট্রিজ"',
                `"${o.fabric} ${o.gsm} GSM"`,
                `"${o.yarn} (লট: ${lot})"`,
                o.qty,
                o.done,
                o.done,
                rem,
                `${pct(o)}%`,
                `"${o.machines.join(', ')}"`,
                o.rateTk || 22,
                bill,
                `"${st}"`
            ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `abc_subcontract_orders_posted_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('ABC Knit Composite এর অর্ডারের Excel/CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে');
    };

    const formatDeadline = (d: string | null | undefined) => {
        if (!d) return 'জরুরি / ফ্লেক্সিবল';
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return date.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Own Factory Machines state
    const [machineFilter, setMachineFilter] = useState<'all' | 'run' | 'wait' | 'down' | 'idle'>('all');
    const [machineSearch, setMachineSearch] = useState('');
    const [showAddMachineModal, setShowAddMachineModal] = useState(false);
    const [addMName, setAddMName] = useState('');
    const [addMType, setAddMType] = useState('Single Jersey');
    const [addMBrand, setAddMBrand] = useState('Mayer & Cie / Germany');
    const [addMDia, setAddMDia] = useState('30" × 24G');
    const [addMCph, setAddMCph] = useState('28.5');
    const [addMSerial, setAddMSerial] = useState('');
    const [addMStatus, setAddMStatus] = useState<'run' | 'wait' | 'down' | 'idle'>('idle');

    const [addedMachines, setAddedMachines] = useState<any[]>(() => {
        if (customMachines && customMachines.length > 0) {
            return customMachines.map(cm => ({
                code: cm.name,
                name: cm.name,
                type: cm.machine_type?.name || 'Circular Knitting',
                dia: '30" × 24G',
                brand: cm.brand_or_model || 'Standard Industrial',
                cph: parseFloat(String(cm.cph)) || 25,
                op: 'অ্যাসাইন বাকি',
                sh: 'প্রস্তুত',
                isCustom: true
            }));
        }
        return [];
    });

    // Factory baseline 24 floor machines
    const baseFloorMachines = [
        { code: 'M-01', type: 'Single Jersey', dia: '30" × 24G', brand: 'Mayer & Cie / Germany', cph: 28.5, op: 'মাসুদ', sh: 'A' },
        { code: 'M-02', type: 'Single Jersey', dia: '30" × 24G', brand: 'Mayer & Cie / Germany', cph: 28.5, op: 'আলাউদ্দিন', sh: 'A' },
        { code: 'M-03', type: 'Single Jersey', dia: '30" × 24G', brand: 'Fukuhara / Japan', cph: 30.0, op: '—', sh: 'খালি' },
        { code: 'M-04', type: 'Single Jersey', dia: '30" × 24G', brand: 'Fukuhara / Japan', cph: 32.0, op: 'জসিম', sh: 'A' },
        { code: 'M-05', type: 'Single Jersey', dia: '30" × 24G', brand: 'Fukuhara / Japan', cph: 31.0, op: 'বিল্লাল', sh: 'B' },
        { code: 'M-06', type: 'Single Jersey', dia: '30" × 24G', brand: 'Mayer & Cie / Germany', cph: 28.0, op: 'নাজমুল (টেক.)', sh: 'মেরামত' },
        { code: 'M-07', type: 'Single Jersey', dia: '30" × 24G', brand: 'Mayer & Cie / Germany', cph: 29.5, op: 'সোহেল', sh: 'A' },
        { code: 'M-08', type: 'Single Jersey', dia: '30" × 24G', brand: 'Terrot / Germany', cph: 28.0, op: '—', sh: 'খালি' },
        { code: 'M-09', type: 'Single Jersey', dia: '30" × 24G', brand: 'Terrot / Germany', cph: 28.0, op: '—', sh: 'খালি' },
        { code: 'M-10', type: 'Single Jersey', dia: '30" × 24G', brand: 'Pai Lung / Taiwan', cph: 27.5, op: 'শরিফ', sh: 'B' },
        { code: 'M-11', type: 'Single Jersey', dia: '30" × 24G', brand: 'Pai Lung / Taiwan', cph: 27.0, op: '—', sh: 'খালি' },
        { code: 'M-12', type: 'Single Jersey', dia: '30" × 24G', brand: 'Fukuhara / Japan', cph: 32.5, op: 'ফারুক', sh: 'A' },
        { code: 'M-13', type: 'Rib / Interlock', dia: '34" × 18G', brand: 'Terrot / Germany', cph: 26.0, op: '—', sh: 'খালি' },
        { code: 'M-14', type: 'Rib / Interlock', dia: '34" × 18G', brand: 'Terrot / Germany', cph: 26.0, op: 'নাজমুল (টেক.)', sh: 'মেরামত' },
        { code: 'M-15', type: 'Rib / Interlock', dia: '34" × 18G', brand: 'Pai Lung / Taiwan', cph: 25.5, op: 'রফিক', sh: 'সুতা অপেক্ষায়' },
        { code: 'M-16', type: 'Rib / Interlock', dia: '34" × 18G', brand: 'Pai Lung / Taiwan', cph: 25.5, op: 'তারেক', sh: 'সুতা অপেক্ষায়' },
        { code: 'M-17', type: 'Rib / Interlock', dia: '34" × 18G', brand: 'Pai Lung / Taiwan', cph: 25.0, op: 'হাসান', sh: 'সুতা অপেক্ষায়' },
        { code: 'M-18', type: 'Rib / Interlock', dia: '34" × 28G', brand: 'Terrot / Germany', cph: 27.0, op: 'নাজমুল', sh: 'A' },
        { code: 'M-19', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Santec / Taiwan', cph: 26.0, op: 'বাবুল', sh: 'B' },
        { code: 'M-20', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Santec / Taiwan', cph: 26.0, op: '—', sh: 'খালি' },
        { code: 'M-21', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Wellknit / China', cph: 24.5, op: '—', sh: 'খালি' },
        { code: 'M-22', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Wellknit / China', cph: 24.5, op: '—', sh: 'খালি' },
        { code: 'M-23', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Santec / Taiwan', cph: 25.0, op: '—', sh: 'খালি' },
        { code: 'M-24', type: 'Fleece 3-End', dia: '32" × 20G', brand: 'Santec / Taiwan', cph: 25.0, op: '—', sh: 'খালি' },
    ];

    const allMyMachines = [...baseFloorMachines, ...addedMachines].map(m => {
        const rawState = machineState[m.code] || 'idle';
        let st: 'run' | 'wait' | 'down' | 'idle' = 'idle';
        let orderId: string | undefined = undefined;
        if (rawState.startsWith('run')) {
            st = 'run';
            orderId = rawState.split(':')[1];
        } else if (rawState === 'wait') {
            st = 'wait';
        } else if (rawState === 'down') {
            st = 'down';
        }
        return {
            ...m,
            status: st,
            assignedOrder: orderId,
        };
    });

    const totalMyMachinesCount = allMyMachines.length;
    const runningMyMachinesCount = allMyMachines.filter(m => m.status === 'run').length;
    const waitMyMachinesCount = allMyMachines.filter(m => m.status === 'wait').length;
    const downMyMachinesCount = allMyMachines.filter(m => m.status === 'down').length;
    const idleMyMachinesCount = allMyMachines.filter(m => m.status === 'idle').length;
    const totalDailyCapacityKg = Math.round(allMyMachines.reduce((sum, m) => sum + (m.cph * 24), 0));

    const factoryCapRows = factoryMachines.length > 0 ? factoryMachines : [
        {
            category: 'Single Jersey',
            machine_type: 'Circular Single Jersey Knitting Machine',
            brand_or_model: 'Mayer & Cie / Fukuhara (30" × 24G)',
            no_of_machine: 12,
            capacity_per_machine: 720,
            total_capacity_per_day: 8640,
            unit_type: 'Kg'
        },
        {
            category: 'Rib / Interlock',
            machine_type: 'Double Jersey Rib & Interlock Machine',
            brand_or_model: 'Terrot / Pai Lung (34" × 18G/28G)',
            no_of_machine: 6,
            capacity_per_machine: 620,
            total_capacity_per_day: 3720,
            unit_type: 'Kg'
        },
        {
            category: 'Fleece / Terry',
            machine_type: '3-End Fleece Circular Knitting Machine',
            brand_or_model: 'Santec / Wellknit (32" × 20G)',
            no_of_machine: 6,
            capacity_per_machine: 600,
            total_capacity_per_day: 3600,
            unit_type: 'Kg'
        }
    ];

    const filteredMachines = allMyMachines.filter(m => {
        if (machineFilter === 'run' && m.status !== 'run') return false;
        if (machineFilter === 'wait' && m.status !== 'wait') return false;
        if (machineFilter === 'down' && m.status !== 'down') return false;
        if (machineFilter === 'idle' && m.status !== 'idle') return false;

        if (machineSearch.trim()) {
            const query = machineSearch.toLowerCase();
            return (
                m.code.toLowerCase().includes(query) ||
                m.type.toLowerCase().includes(query) ||
                m.brand.toLowerCase().includes(query) ||
                (m.assignedOrder && m.assignedOrder.toLowerCase().includes(query)) ||
                (m.op && m.op.toLowerCase().includes(query))
            );
        }
        return true;
    });

    const handleToggleMachineStatus = (code: string, newSt: string) => {
        setMachineState(prev => {
            const current = prev[code] || 'idle';
            let next = newSt;
            if (newSt === 'run' && !current.startsWith('run')) {
                next = 'run:SC-2610-014';
            }
            return {
                ...prev,
                [code]: next
            };
        });
        showToast(`${code} এর অবস্থা আপডেট করা হয়েছে`);
    };

    const handleAddMachineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = addMName.trim() || `M-${allMyMachines.length + 1}`;
        const newM = {
            code,
            name: code,
            type: addMType,
            dia: addMDia,
            brand: addMBrand,
            cph: parseFloat(addMCph) || 28,
            op: 'নতুন অপারেটর',
            sh: 'A',
            isCustom: true
        };

        setAddedMachines(prev => [...prev, newM]);
        if (addMStatus !== 'idle') {
            setMachineState(prev => ({
                ...prev,
                [code]: addMStatus === 'run' ? 'run:SC-2610-014' : addMStatus
            }));
        }

        router.post('/knitkhata/my-machines', {
            name: code,
            cph: parseFloat(addMCph) || 28,
            unit: 'Kg',
            brand_or_model: addMBrand,
            serial_number: addMSerial,
            notes: `${addMType} (${addMDia})`
        }, {
            preserveScroll: true,
            onError: () => {}
        });

        setShowAddMachineModal(false);
        setAddMName('');
        setAddMSerial('');
        showToast(`মেশিন ${code} সফলভাবে কারখানায় যোগ করা হয়েছে!`);
    };

    const handleRoleSwitch = (newRole: RoleMode) => {
        setRole(newRole);
        if (view === 'orders') {
            const newUrl = newRole === 'ven' ? '/knitkhata/orders?role=ven' : '/knitkhata/orders?role=fac';
            window.history.replaceState({}, '', newUrl);
            showToast(
                newRole === 'ven'
                    ? 'ভেন্ডর ভিউ: গিভ সাব-কন্ট্রাক্ট (Orders I Posted) চালু করা হয়েছে'
                    : 'ফ্যাক্টরি ভিউ: টেক সাব-কন্ট্রাক্ট (Orders I Bid / Taken) চালু করা হয়েছে'
            );
            return;
        }
        if (newRole === 'ven') {
            if (!orders.find(o => o.id === curOrder && o.v === 'abc')) {
                setCurOrder('SC-2610-014');
            }
            router.visit('/knitkhata/orders?role=ven', { preserveScroll: true });
            showToast('ভেন্ডর ভিউ: গিভ সাব-কন্ট্রাক্ট (Orders I Posted) চালু করা হয়েছে');
        } else {
            router.visit('/knitkhata/orders?role=fac', { preserveScroll: true });
            showToast('ফ্যাক্টরি ভিউ: টেক সাব-কন্ট্রাক্ট (Orders I Bid / Taken) চালু করা হয়েছে');
        }
    };

    const handleNavigate = (tab: KnitkhataViewTab) => {
        setView(tab);
        const href = TAB_HREFS[tab] || '/knitkhata';
        router.visit(href, { preserveScroll: true });
    };

    const handleSelectOrder = (orderId: string) => {
        setCurOrder(orderId);
        const target = orders.find(o => o.id === orderId);
        if (target) {
            setEtaM(target.machines.length || 1);
            setEtaR(target.rate || 350);
        }
        router.visit(`/knitkhata/orders/${orderId}`, { preserveScroll: true });
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
    const factoryDisplayName =
        factory?.business_name ||
        auth?.user?.factory?.business_name ||
        'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা ফ্যাক্টরি)';
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
                        <Link
                            href={readonly ? '/knitkhata/vendor/orders' : '/knitkhata/orders'}
                            className="btn sm"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                        >
                            ← সব অর্ডার
                        </Link>
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

                {/* DELIVERY CHALLANS & DISPATCH */}
                <div className="card">
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>ডেলিভারি চালান ও ফিনিশ ফেব্রিক প্রেরণ</h3>
                            <p className="small muted" style={{ margin: '2px 0 0' }}>
                                ভেন্ডর/পার্টির নিকট প্রস্তুত রোল প্রেরণের অনুমোদিত চালান তালিকা
                            </p>
                        </div>
                        {!readonly && (
                            <button
                                type="button"
                                className="btn sm pri"
                                onClick={() => handleOpenDeliveryModal(o.id)}
                            >
                                + নতুন চালান তৈরি
                            </button>
                        )}
                    </div>

                    {(o.challans && o.challans.length > 0) ? (
                        <>
                            <div className="tw" style={{ marginTop: '12px' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>চালান নং</th>
                                            <th>তারিখ</th>
                                            <th className="n">রোল সংখ্যা</th>
                                            <th className="n">ডেলিভারি (kg)</th>
                                            <th>পরিবহন ও গাড়ি</th>
                                            <th>ড্রাইভারের ফোন</th>
                                            <th>অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o.challans.map((ch, idx) => (
                                            <tr key={idx}>
                                                <td className="mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                                    {ch.challanNo}
                                                </td>
                                                <td>{ch.date}</td>
                                                <td className="n">{bn(ch.rolls)} রোল</td>
                                                <td className="n" style={{ color: 'var(--ok)', fontWeight: 600 }}>
                                                    {bn(ch.kg)} kg
                                                </td>
                                                <td>{ch.vehicle || 'ফ্যাক্টরি পিকআপ'}</td>
                                                <td className="mono small">{ch.driverPhone || '—'}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn sm"
                                                        onClick={() => showToast(`চালান ${ch.challanNo} এর প্রিন্ট কপি প্রস্তুত হচ্ছে`)}
                                                    >
                                                        প্রিন্ট কপি
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="facts" style={{ marginTop: '12px' }}>
                                <div>
                                    <span>মোট প্রেরিত রোল</span>
                                    <b className="mono">{bn(o.challans.reduce((a, c) => a + c.rolls, 0))} রোল</b>
                                </div>
                                <div>
                                    <span>মোট ডেলিভারি ফেব্রিক</span>
                                    <b className="mono">{bn(o.challans.reduce((a, c) => a + c.kg, 0))} kg</b>
                                </div>
                                <div>
                                    <span>ডেলিভারি বাকি</span>
                                    <b className="mono">{bn(Math.max(0, o.qty - o.challans.reduce((a, c) => a + c.kg, 0)))} kg</b>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="small muted" style={{ marginTop: '10px' }}>এখনো কোনো ডেলিভারি চালান তৈরি করা হয়নি।</p>
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
                    : view === 'orders' || view === 'vorders'
                    ? (role === 'ven' ? 'আমার দেওয়া সাব-কন্ট্রাক্ট (Give Subcontract)' : 'সাব-কন্ট্রাক্ট অর্ডার (Take Subcontract)')
                    : view === 'detail'
                    ? `অর্ডার বিবরণ (${curOrder})`
                    : view === 'machines'
                    ? 'আমার মেশিনগুলো'
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
                            <Link
                                href="/knitkhata/production-entry"
                                className="btn"
                                style={{ textDecoration: 'none' }}
                            >
                                + প্রোডাকশন এন্ট্রি
                            </Link>
                            <Link
                                href="/knitkhata/orders"
                                className="btn pri"
                                style={{ textDecoration: 'none' }}
                            >
                                অর্ডার দেখুন
                            </Link>
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

            {/* SCREEN: ORDERS (SUBCONTRACT ORDERS) */}
            {view === 'orders' && (
                <>
                    {/* DUAL-ROLE SUBCONTRACT TABS (FACTORY VIEW: TAKE SUBCONTRACT vs VENDOR VIEW: GIVE SUBCONTRACT) */}
                    <div className="subcontract-role-tabs">
                        <button
                            type="button"
                            className={`role-tab-btn ${role === 'fac' ? 'active-fac' : ''}`}
                            onClick={() => handleRoleSwitch('fac')}
                        >
                            <span className="tab-icon">🏭</span>
                            <div className="tab-info">
                                <div className="tab-title">
                                    <span>ফ্যাক্টরি ভিউ</span>
                                    <span className="tab-pill fac-pill">Take Subcontract (Orders I Bid / Taken)</span>
                                </div>
                                <span className="tab-sub">অর্ডার নেওয়া হয়েছে (যেসব কাজের সাব-কন্ট্রাক্ট কারখানায় তৈরির জন্য নিয়েছি ও বিড করেছি)</span>
                            </div>
                            <div className="tab-stat">
                                <b>{bn(orders.length)}টি</b>
                                <span>সাব-কন্ট্রাক্ট অর্ডার</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`role-tab-btn ${role === 'ven' ? 'active-ven' : ''}`}
                            onClick={() => handleRoleSwitch('ven')}
                        >
                            <span className="tab-icon">📦</span>
                            <div className="tab-info">
                                <div className="tab-title">
                                    <span>ভেন্ডর ভিউ</span>
                                    <span className="tab-pill ven-pill">Give Subcontract (Orders I Posted)</span>
                                </div>
                                <span className="tab-sub">অর্ডার দেওয়া হয়েছে (ডেটাবেসে পোস্টকৃত সাব-কন্ট্রাক্ট অর্ডার ডিমান্ড)</span>
                            </div>
                            <div className="tab-stat">
                                <b>{bn(userPosts.length || vendorOrdersList.length)}টি</b>
                                <span>পোস্ট করা অর্ডার</span>
                            </div>
                        </button>
                    </div>

                    {/* ROLE 1: FACTORY VIEW (TAKE SUBCONTRACT: ORDERS I BID / TAKEN) */}
                    {role === 'fac' && (
                        <>
                            {/* PAGE HEADER & QUICK ACTIONS */}
                            <div className="head">
                                <div>
                                    <h2>সাব-কন্ট্রাক্ট অর্ডার (Take Subcontract · Orders I Bid / Taken)</h2>
                                    <p>
                                        বিভিন্ন বায়ার ও কম্পোজিট থেকে পাওয়া সাব-কন্ট্রাক্ট অর্ডার এবং কারখানার ফ্লোরে চলমান নিটিং অগ্রগতি
                                    </p>
                                </div>
                                <div className="row">
                                    <button
                                        type="button"
                                        className="btn pri"
                                        onClick={() => setShowAddOrderModal(true)}
                                    >
                                        + নতুন অর্ডার তৈরি করুন
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            if (orders.length > 0) {
                                                handleOpenYarnModal(orders[0].id);
                                            }
                                        }}
                                    >
                                        + সুতা গ্রহণ এন্ট্রি
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            const running = orders.find(o => o.status === 'run') || orders[0];
                                            if (running) {
                                                handleOpenDeliveryModal(running.id);
                                            }
                                        }}
                                    >
                                        + ডেলিভারি চালান তৈরি
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleExportOrdersCsv}
                                        title="Excel / CSV রিপোর্ট ডাউনলোড"
                                    >
                                        এক্সপোর্ট Excel
                                    </button>
                                </div>
                            </div>

                            {/* TOP EXECUTIVE METRICS STRIP */}
                            <div className="kpis">
                                <div className="kpi">
                                    <span>মোট সাব-কন্ট্রাক্ট অর্ডার</span>
                                    <b>{bn(orders.length)}টি</b>
                                    <i>সর্বমোট {bn(totalOrderQty)} kg</i>
                                </div>
                                <div className="kpi">
                                    <span>চলমান অর্ডার</span>
                                    <b>{bn(runningOrdersCount)}টি</b>
                                    <i>ফ্লোরে নিটিং রানিং</i>
                                </div>
                                <div className="kpi">
                                    <span>সুতার অপেক্ষায়</span>
                                    <b>{bn(waitingOrdersCount)}টি</b>
                                    <i>সুতা পেলেই কাজ শুরু</i>
                                </div>
                                <div className="kpi">
                                    <span>সম্পন্ন / ডেলিভারি</span>
                                    <b>{bn(doneOrdersCount)}টি</b>
                                    <i>চালান তৈরি সম্পন্ন</i>
                                </div>
                                <div className="kpi">
                                    <span>মোট তৈরি হয়েছে</span>
                                    <b>{bn(totalDoneQty)} kg</b>
                                    <i>{bn(totalOrderProgress)}% সম্পূর্ণ</i>
                                </div>
                                <div className="kpi">
                                    <span>মোট চুক্তি মূল্য</span>
                                    <b>৳ {bn(totalOrderRevenue)}</b>
                                    <i>গড় নিটিং চার্জ</i>
                                </div>
                            </div>

                            {/* VENDOR SUMMARY CARDS (Interactive filtering) */}
                            <div className="grid g3">
                                {Object.entries(vendors).map(([k, v]) => {
                                    const vOrders = orders.filter(o => o.v === k);
                                    const vQty = vOrders.reduce((a, o) => a + o.qty, 0);
                                    const vDone = vOrders.reduce((a, o) => a + o.done, 0);
                                    const vPct = calcPct(vDone, vQty);
                                    const isSelected = orderVendorFilter === k;

                                    return (
                                        <div
                                            key={k}
                                            className={`vendor-summary-card ${isSelected ? 'act' : ''}`}
                                            onClick={() => setOrderVendorFilter(prev => prev === k ? 'all' : k)}
                                            title="ক্লিক করে এই ভেন্ডরের অর্ডারে ফিল্টার করুন"
                                        >
                                            <div className="v-top">
                                                <b>{v.name}</b>
                                                <span className={`pill ${isSelected ? 'p-acc' : 'p-idle'}`}>
                                                    {isSelected ? 'ফিল্টার সক্রিয়' : `${vOrders.length}টি অর্ডার`}
                                                </span>
                                            </div>
                                            <div className="small muted">
                                                ফোন: {v.phone} · {vOrders.filter(o => o.status === 'run').length}টি রানিং
                                            </div>
                                            <div style={{ marginTop: '4px' }}>
                                                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span className="small muted">উৎপাদন অগ্রগতি</span>
                                                    <b className="mono small">{bn(vDone)} / {bn(vQty)} kg ({vPct}%)</b>
                                                </div>
                                                <div className="bar">
                                                    <i style={{ width: `${vPct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* MAIN ORDERS SECTION WITH FILTERS, SEARCH, SORT & TABLE */}
                            <div className="card">
                                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                    {/* Filter Tabs */}
                                    <div className="roleswitch" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <button
                                            type="button"
                                            className={orderFilter === 'all' ? 'on' : ''}
                                            onClick={() => setOrderFilter('all')}
                                        >
                                            সব অর্ডার ({bn(orders.length)})
                                        </button>
                                        <button
                                            type="button"
                                            className={orderFilter === 'run' ? 'on' : ''}
                                            onClick={() => setOrderFilter('run')}
                                        >
                                            চলমান ({bn(runningOrdersCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={orderFilter === 'wait' ? 'on' : ''}
                                            onClick={() => setOrderFilter('wait')}
                                        >
                                            সুতার অপেক্ষায় ({bn(waitingOrdersCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={orderFilter === 'done' ? 'on' : ''}
                                            onClick={() => setOrderFilter('done')}
                                        >
                                            সম্পন্ন ({bn(doneOrdersCount)})
                                        </button>
                                    </div>

                                    {/* Vendor Selector & Sort & Search */}
                                    <div className="row" style={{ gap: '8px' }}>
                                        <select
                                            value={orderVendorFilter}
                                            onChange={e => setOrderVendorFilter(e.target.value)}
                                            style={{
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface2)',
                                                color: 'var(--ink)'
                                            }}
                                        >
                                            <option value="all">সব ভেন্ডর</option>
                                            {Object.entries(vendors).map(([k, v]) => (
                                                <option key={k} value={k}>{v.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={orderSort}
                                            onChange={e => setOrderSort(e.target.value as any)}
                                            style={{
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface2)',
                                                color: 'var(--ink)'
                                            }}
                                        >
                                            <option value="date">অর্ডার আইডি অনুযায়ী</option>
                                            <option value="progress">অগ্রগতির হার অনুযায়ী</option>
                                            <option value="qty">অর্ডারের পরিমাণ (kg)</option>
                                        </select>

                                        <input
                                            type="search"
                                            placeholder="অর্ডার নং, ভেন্ডর, ফেব্রিক বা লট..."
                                            value={orderSearch}
                                            onChange={e => setOrderSearch(e.target.value)}
                                            style={{
                                                minWidth: '220px',
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface2)',
                                                color: 'var(--ink)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* ORDER TABLE */}
                                <div className="tw">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>অর্ডার নং</th>
                                                <th>ভেন্ডর / পার্টি</th>
                                                <th>ফেব্রিক ও স্পেক্স</th>
                                                <th>সুতা ও লট</th>
                                                <th className="n">অর্ডার (kg)</th>
                                                <th className="n">হয়েছে (kg)</th>
                                                <th className="n">বাকি (kg)</th>
                                                <th>অগ্রগতি</th>
                                                <th>মেশিন</th>
                                                <th className="n">চার্জ / মূল্য</th>
                                                <th>সম্ভাব্য শেষ</th>
                                                <th>অবস্থা</th>
                                                <th>অ্যাকশন</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={13} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                                        কোনো সাব-কন্ট্রাক্ট অর্ডার পাওয়া যায়নি।
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map(o => {
                                                    const e = etaOf(o);
                                                    const p = pct(o);
                                                    const remKg = Math.max(0, o.qty - o.done);
                                                    const totalBill = o.qty * (o.rateTk || 22);
                                                    const primaryLot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : 'সুতা বাকি';

                                                    return (
                                                        <tr key={o.id}>
                                                            <td
                                                                className="mono click"
                                                                onClick={() => handleSelectOrder(o.id)}
                                                                style={{ fontWeight: 600, color: 'var(--accent)' }}
                                                                title="বিস্তারিত দেখতে ক্লিক করুন"
                                                            >
                                                                {o.id}
                                                                <div className="small muted" style={{ fontWeight: 'normal' }}>
                                                                    {o.start}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <b>{vName(o.v)}</b>
                                                                <div className="small muted">{vendors[o.v]?.phone}</div>
                                                            </td>
                                                            <td>
                                                                <div>{o.fabric}</div>
                                                                <div className="small muted">{o.gsm} GSM · {o.dia} · {o.color}</div>
                                                            </td>
                                                            <td>
                                                                <span className="mono small">{o.yarn}</span>
                                                                <div className="small muted">
                                                                    লট: {primaryLot} {o.yarnIn.length > 1 && `(+${o.yarnIn.length - 1})`}
                                                                </div>
                                                            </td>
                                                            <td className="n"><b>{bn(o.qty)}</b></td>
                                                            <td className="n" style={{ color: 'var(--ok)' }}><b>{bn(o.done)}</b></td>
                                                            <td className="n mono small">{bn(remKg)}</td>
                                                            <td>
                                                                <div className="row" style={{ flexWrap: 'nowrap', gap: '6px' }}>
                                                                    <div className="bar" style={{ width: '80px' }}>
                                                                        <i style={{ width: `${p}%` }} />
                                                                    </div>
                                                                    <span className="mono small">{p}%</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {o.machines.length > 0 ? (
                                                                    <div className="row" style={{ gap: '3px' }}>
                                                                        {o.machines.map(m => (
                                                                            <span key={m} className="pill p-acc" style={{ fontSize: '.72rem', padding: '1px 6px' }}>
                                                                                {m}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="small muted">অ্যাসাইন বাকি</span>
                                                                )}
                                                            </td>
                                                            <td className="n">
                                                                <div className="mono small">৳{o.rateTk}/kg</div>
                                                                <div className="small muted">মোট: ৳{bn(totalBill)}</div>
                                                            </td>
                                                            <td className="mono small">
                                                                {o.status === 'done' ? 'সম্পন্ন' : e ? fmtD(e.date) : 'সুতা এলে'}
                                                            </td>
                                                            <td>{stPill(o)}</td>
                                                            <td>
                                                                <div className="row" style={{ flexWrap: 'nowrap', gap: '4px' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={() => handleSelectOrder(o.id)}
                                                                        title="অর্ডারের বিস্তারিত দেখুন"
                                                                    >
                                                                        বিস্তারিত
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={() => handleOpenYarnModal(o.id)}
                                                                        title="এই অর্ডারে সুতা গ্রহণ যোগ করুন"
                                                                    >
                                                                        + সুতা
                                                                    </button>
                                                                    {o.status === 'run' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn sm"
                                                                            onClick={() => handleOpenDeliveryModal(o.id)}
                                                                            title="ডেলিভারি চালান তৈরি করুন"
                                                                        >
                                                                            + চালান
                                                                        </button>
                                                                    )}
                                                                    {o.status === 'wait' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn sm pri"
                                                                            onClick={() => handleUpdateOrderStatus(o.id, 'run')}
                                                                            title="অর্ডারটি সচল করুন"
                                                                        >
                                                                            সচল
                                                                        </button>
                                                                    )}
                                                                    {o.status === 'run' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn sm"
                                                                            onClick={() => handleUpdateOrderStatus(o.id, 'done')}
                                                                            title="ডেলিভারি সম্পন্ন চিহ্নিত করুন"
                                                                        >
                                                                            সম্পন্ন
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row" style={{ justifyContent: 'space-between', marginTop: '14px', alignItems: 'center' }}>
                                    <span className="small muted">
                                        মোট {bn(filteredOrders.length)}টি সাব-কন্ট্রাক্ট অর্ডার প্রদর্শিত হচ্ছে
                                    </span>
                                    <span className="small muted">
                                        যেকোনো অর্ডারে ক্লিক করলে সুতা হিসাব, লট ব্যালেন্স, রোল QC ও প্রোডাকশন ইতিহাস পাওয়া যাবে।
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ROLE 2: VENDOR VIEW (GIVE SUBCONTRACT: ORDERS I POSTED) */}
                    {role === 'ven' && (
                        <>
                            {/* VENDOR BANNER */}
                            <div className="vbanner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    আপনি <b>মো. কামরুল হাসান</b> হিসেবে লগইন আছেন — <b>ABC Knit Composite (বায়ার / সাব-কন্ট্রাক্ট দাতা)</b>।
                                    <div style={{ fontSize: '.84rem', marginTop: '3px', opacity: 0.9 }}>
                                        এখানে কেবল আপনার দেওয়া সাব-কন্ট্রাক্ট অর্ডারসমূহ, সুতা সরবরাহ হিসাব, কারখানার নিটিং অগ্রগতি ও ডেলিভারি চালানের লাইভ ট্র্যাকিং দেখা যাচ্ছে।
                                    </div>
                                </div>
                                <span className="pill p-acc" style={{ fontSize: '.76rem', background: '#ffffff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                                    🔒 ভেন্ডর কনফিডেনশিয়াল ভিউ
                                </span>
                            </div>

                            {/* VENDOR PAGE HEADER & ACTIONS */}
                            <div className="head" style={{ marginTop: '12px' }}>
                                <div>
                                    <h2>আমার দেওয়া সাব-কন্ট্রাক্ট অর্ডার (Give Subcontract · Orders I Posted)</h2>
                                    <p>
                                        ডেটাবেসে পোস্টকৃত আপনার সকল সাব-কন্ট্রাক্ট চাহিদা ও সরবরাহকৃত সুতা ও ফিনিশ রোল ডেলিভারি ট্র্যাকিং
                                    </p>
                                </div>
                                <div className="row">
                                    <Link
                                        href="/dashboard?create=1"
                                        className="btn pri"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        + নতুন সাব-কন্ট্রাক্ট দিন
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => {
                                            if (vendorOrdersList.length > 0) {
                                                handleOpenYarnModal(vendorOrdersList[0].id);
                                            }
                                        }}
                                    >
                                        + সুতা প্রেরণের চালান
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleExportVendorCsv}
                                        title="ABC Knit Composite এর অর্ডার রিপোর্ট ডাউনলোড"
                                    >
                                        এক্সপোর্ট Excel
                                    </button>
                                </div>
                            </div>

                            {/* VENDOR EXECUTIVE KPIS */}
                            <div className="kpis">
                                <div className="kpi">
                                    <span>আমার দেওয়া মোট অর্ডার</span>
                                    <b>{bn(userPosts.length || vendorOrdersList.length)}টি</b>
                                    <i>ডেটাবেসে পোস্টকৃত</i>
                                </div>
                                <div className="kpi">
                                    <span>ফ্যাক্টরিতে চলমান</span>
                                    <b>{bn(vendorRunningCount)}টি</b>
                                    <i>রহমান নিটিং এ নিটিং রানিং</i>
                                </div>
                                <div className="kpi">
                                    <span>সুতা পাঠিয়েছি</span>
                                    <b>{bn(vendorYarnSentKg)} kg</b>
                                    <i>সরবরাহকৃত সুতা</i>
                                </div>
                                <div className="kpi">
                                    <span>ডেলিভারি পেয়েছি</span>
                                    <b>{bn(vendorDoneQty)} kg</b>
                                    <i>{bn(vendorProgressPct)}% ডেলিভার্ড</i>
                                </div>
                                <div className="kpi">
                                    <span>বাকি ফেব্রিক</span>
                                    <b>{bn(Math.max(0, vendorTotalQty - vendorDoneQty))} kg</b>
                                    <i>উৎপাদন বাকি</i>
                                </div>
                                <div className="kpi">
                                    <span>মোট প্রদেয় নিটিং বিল</span>
                                    <b>৳ {bn(vendorTotalBill)}</b>
                                    <i>গড় ৳২২-২৪/kg</i>
                                </div>
                            </div>

                            {/* DATABASE POSTED ORDERS (GIVE SUBCONTRACT: ORDERS I POSTED) */}
                            <div className="card" style={{ marginBottom: '20px' }}>
                                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>
                                            📦 ডেটাবেসে পোস্টকৃত সাব-কন্ট্রাক্ট ডিমান্ডসমূহ (Give Subcontract · Orders I Posted)
                                        </h3>
                                        <p className="small muted" style={{ margin: '2px 0 0' }}>
                                            আপনার অ্যাকাউন্টের মাধ্যমে পোস্ট করা সকল সাব-কন্ট্রাক্ট কাজ ও প্রাপ্ত দরপত্র
                                        </p>
                                    </div>
                                    <Link href="/dashboard" className="btn sm">
                                        মূল ড্যাশবোর্ডে দেখুন →
                                    </Link>
                                </div>

                                <div className="tw">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>অর্ডারের বিবরণ ও শিরোনাম</th>
                                                <th>ক্যাটাগরি</th>
                                                <th className="n">অর্ডার ভলিউম</th>
                                                <th>ডেলিভারি ডেডলাইন</th>
                                                <th>প্রাপ্ত দরপত্র (Bids)</th>
                                                <th>অবস্থা</th>
                                                <th>অ্যাকশন</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userPosts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                                        এখনো কোনো সাব-কন্ট্রাক্ট অর্ডার পোস্ট করা হয়নি।
                                                    </td>
                                                </tr>
                                            ) : (
                                                userPosts.map((post: any) => (
                                                    <tr key={post.id}>
                                                        <td>
                                                            <Link
                                                                href={`/feed/${post.id}`}
                                                                style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                                                            >
                                                                {post.title}
                                                            </Link>
                                                            <div className="small muted">
                                                                📍 {post.district || 'বাংলাদেশ'} · আইডি: #{post.id}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="pill p-acc" style={{ textTransform: 'capitalize' }}>
                                                                {post.category?.replace('_', ' ') || 'সিঙ্গেল জার্সি'}
                                                            </span>
                                                        </td>
                                                        <td className="n">
                                                            <b>{post.target_quantity?.toLocaleString()}</b> {post.unit || 'kg'}
                                                        </td>
                                                        <td className="mono small">
                                                            {formatDeadline(post.deadline)}
                                                        </td>
                                                        <td>
                                                            <span className={`pill ${(post.quotations_count || 0) > 0 ? 'p-ok' : 'p-idle'}`}>
                                                                {post.quotations_count || 0}টি দরপত্র
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {post.accepted_factory ? (
                                                                <span className="pill p-ok" title={`অনুমোদিত ফ্যাক্টরি: ${post.accepted_factory?.business_name}`}>
                                                                    ✓ {post.accepted_factory?.business_name || 'অনুমোদিত'}
                                                                </span>
                                                            ) : (
                                                                <span className="pill p-idle">
                                                                    {post.status === 'open' ? 'উন্মুক্ত' : post.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="row" style={{ gap: '4px' }}>
                                                                {(post.quotations_count || 0) > 0 ? (
                                                                    <Link
                                                                        href={`/quotations/compare/${post.id}`}
                                                                        className="btn sm pri"
                                                                        style={{ textDecoration: 'none' }}
                                                                    >
                                                                        দরপত্র তুলনা ({post.quotations_count})
                                                                    </Link>
                                                                ) : (
                                                                    <Link
                                                                        href={`/feed/${post.id}`}
                                                                        className="btn sm"
                                                                        style={{ textDecoration: 'none' }}
                                                                    >
                                                                        দেখুন
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* VENDOR PRODUCTION MONITORING TABLE (ABC KNIT COMPOSITE FLOOR ORDERS) */}
                            <div className="card">
                                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>ফ্যাক্টরি উৎপাদন অগ্রগতি ও সুতা চালান ট্র্যাকিং</h3>
                                        <p className="small muted" style={{ margin: '2px 0 0' }}>
                                            রহমান নিটিং এ চলমান আপনার ব্যাচসমূহের রিয়েল-টাইম নিটিং স্ট্যাটাস
                                        </p>
                                    </div>

                                    <div className="row" style={{ gap: '8px' }}>
                                        <input
                                            type="search"
                                            placeholder="অর্ডার নং, ফেব্রিক, রঙ বা সুতা লট..."
                                            value={vendorOrderSearch}
                                            onChange={e => setVendorOrderSearch(e.target.value)}
                                            style={{
                                                minWidth: '240px',
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface2)',
                                                color: 'var(--ink)'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* VENDOR ORDERS TABLE */}
                                <div className="tw">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>অর্ডার নং</th>
                                                <th>সাব-কন্ট্রাক্টর ফ্যাক্টরি</th>
                                                <th>ফেব্রিক ও স্পেক্স</th>
                                                <th>সরবরাহকৃত সুতা ও লট</th>
                                                <th className="n">অর্ডার (kg)</th>
                                                <th className="n">ফ্যাক্টরিতে তৈরি (kg)</th>
                                                <th className="n">বাকি (kg)</th>
                                                <th>অগ্রগতি</th>
                                                <th>চলমান মেশিন</th>
                                                <th className="n">নিটিং বিল</th>
                                                <th>সম্ভাব্য ডেলিভারি</th>
                                                <th>অবস্থা</th>
                                                <th>অ্যাকশন</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVendorOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={13} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                                        কোনো উৎপাদন রেকর্ড পাওয়া যায়নি।
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredVendorOrders.map(o => {
                                                    const e = etaOf(o);
                                                    const p = pct(o);
                                                    const remKg = Math.max(0, o.qty - o.done);
                                                    const bill = o.qty * (o.rateTk || 22);
                                                    const lot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : 'সুতা পাঠানো বাকি';

                                                    return (
                                                        <tr key={o.id}>
                                                            <td
                                                                className="mono click"
                                                                onClick={() => handleSelectOrder(o.id)}
                                                                style={{ fontWeight: 600, color: 'var(--accent)' }}
                                                                title="অর্ডারের লাইভ অগ্রগতি দেখতে ক্লিক করুন"
                                                            >
                                                                {o.id}
                                                                <div className="small muted" style={{ fontWeight: 'normal' }}>
                                                                    {o.start}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <b>রহমান নিটিং ইন্ডাস্ট্রিজ</b>
                                                                <div className="small muted">ফতুল্লা, নারায়ণগঞ্জ · +8801711000000</div>
                                                            </td>
                                                            <td>
                                                                <div>{o.fabric}</div>
                                                                <div className="small muted">{o.gsm} GSM · {o.dia} · {o.color}</div>
                                                            </td>
                                                            <td>
                                                                <span className="mono small">{o.yarn}</span>
                                                                <div className="small muted">
                                                                    লট: {lot} {o.yarnIn.length > 1 && `(+${o.yarnIn.length - 1})`}
                                                                </div>
                                                            </td>
                                                            <td className="n"><b>{bn(o.qty)}</b></td>
                                                            <td className="n" style={{ color: 'var(--ok)' }}><b>{bn(o.done)}</b></td>
                                                            <td className="n mono small">{bn(remKg)}</td>
                                                            <td>
                                                                <div className="row" style={{ flexWrap: 'nowrap', gap: '6px' }}>
                                                                    <div className="bar" style={{ width: '80px' }}>
                                                                        <i style={{ width: `${p}%` }} />
                                                                    </div>
                                                                    <span className="mono small">{p}%</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {o.machines.length > 0 ? (
                                                                    <div className="row" style={{ gap: '3px' }}>
                                                                        {o.machines.map(m => (
                                                                            <span key={m} className="pill p-acc" style={{ fontSize: '.72rem', padding: '1px 6px' }}>
                                                                                {m}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="small muted">মেশিন বরাদ্দ বাকি</span>
                                                                )}
                                                            </td>
                                                            <td className="n">
                                                                <div className="mono small">৳{o.rateTk || 22}/kg</div>
                                                                <div className="small muted">মোট: ৳{bn(bill)}</div>
                                                            </td>
                                                            <td className="mono small">
                                                                {o.status === 'done' ? 'ডেলিভারি সম্পন্ন' : e ? fmtD(e.date) : 'সুতা পৌঁছালে'}
                                                            </td>
                                                            <td>{stPill(o)}</td>
                                                            <td>
                                                                <div className="row" style={{ flexWrap: 'nowrap', gap: '4px' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={() => handleSelectOrder(o.id)}
                                                                        title="লাইভ উৎপাদন ট্র্যাকিং দেখুন"
                                                                    >
                                                                        লাইভ ট্র্যাকিং
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={() => handleOpenYarnModal(o.id)}
                                                                        title="এই অর্ডারের জন্য সুতা প্রেরণের এন্ট্রি"
                                                                    >
                                                                        + সুতা পাঠান
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row" style={{ justifyContent: 'space-between', marginTop: '14px', alignItems: 'center' }}>
                                    <span className="small muted">
                                        মোট {bn(filteredVendorOrders.length)}টি সাব-কন্ট্রাক্ট ব্যাচ প্রদর্শিত হচ্ছে (ABC Knit Composite)
                                    </span>
                                    <span className="small muted" style={{ color: 'var(--muted)' }}>
                                        গোপনীয়তার স্বার্থে অন্য কোনো পার্টির অর্ডার বা ইন্টারনাল অপারেটর ডেটা এখানে প্রদর্শিত হয় না।
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* MODAL: ADD NEW SUBCONTRACT ORDER */}
                    {showAddOrderModal && (
                        <div
                            className="modal-backdrop"
                            onClick={() => setShowAddOrderModal(false)}
                        >
                            <div
                                className="modal-box"
                                onClick={e => e.stopPropagation()}
                                style={{ maxWidth: '640px' }}
                            >
                                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <h3 style={{ margin: 0 }}>নতুন সাব-কন্ট্রাক্ট অর্ডার এন্ট্রি</h3>
                                    <button
                                        type="button"
                                        className="btn sm"
                                        onClick={() => setShowAddOrderModal(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleAddOrderSubmit} className="form">
                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            অর্ডার নম্বর / কোড *
                                            <input
                                                required
                                                value={newOId}
                                                onChange={e => setNewOId(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            ভেন্ডর / কম্পোজিট পার্টি *
                                            <select
                                                value={newOVendor}
                                                onChange={e => setNewOVendor(e.target.value)}
                                            >
                                                {Object.entries(vendors).map(([k, v]) => (
                                                    <option key={k} value={k}>{v.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <label className="f">
                                        ফেব্রিক নাম ও কম্পোজিশন *
                                        <input
                                            required
                                            placeholder="যেমন: Single Jersey 100% Cotton বা 1×1 Rib with Lycra"
                                            value={newOFabric}
                                            onChange={e => setNewOFabric(e.target.value)}
                                        />
                                    </label>

                                    <div className="grid g3" style={{ gap: '10px' }}>
                                        <label className="f">
                                            GSM *
                                            <input
                                                type="number"
                                                required
                                                value={newOGsm}
                                                onChange={e => setNewOGsm(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            Dia × Gauge *
                                            <input
                                                required
                                                value={newODia}
                                                onChange={e => setNewODia(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            রং (Color) *
                                            <input
                                                required
                                                value={newOColor}
                                                onChange={e => setNewOColor(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            অর্ডার পরিমাণ (kg) *
                                            <input
                                                type="number"
                                                required
                                                value={newOQty}
                                                onChange={e => setNewOQty(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            নিটিং চার্জ (৳/kg) *
                                            <input
                                                type="number"
                                                step="0.5"
                                                required
                                                value={newORateTk}
                                                onChange={e => setNewORateTk(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            দৈনিক উৎপাদন লক্ষ্য (kg/দিন/মেশিন)
                                            <input
                                                type="number"
                                                value={newORateKg}
                                                onChange={e => setNewORateKg(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            প্রাথমিক অবস্থা
                                            <select
                                                value={newOStatus}
                                                onChange={e => setNewOStatus(e.target.value as any)}
                                            >
                                                <option value="run">চলমান (এখনই মেশিনে উঠবে)</option>
                                                <option value="wait">সুতার অপেক্ষায়</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="f">
                                        নিযুক্ত ফ্লোর মেশিন (কমা দিয়ে আলাদা করুন)
                                        <input
                                            placeholder="যেমন: M-03, M-08"
                                            value={newOMachines}
                                            onChange={e => setNewOMachines(e.target.value)}
                                        />
                                    </label>

                                    <div style={{ marginTop: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                                        <b className="small">প্রথম সুতা গ্রহণ চালান (ঐচ্ছিক)</b>
                                        <div className="grid g3" style={{ gap: '8px', marginTop: '6px' }}>
                                            <label className="f">
                                                সুতার কাউন্ট
                                                <input
                                                    value={newOYarnCount}
                                                    onChange={e => setNewOYarnCount(e.target.value)}
                                                />
                                            </label>
                                            <label className="f">
                                                স্পিনার মিল
                                                <input
                                                    value={newOYarnSpinner}
                                                    onChange={e => setNewOYarnSpinner(e.target.value)}
                                                />
                                            </label>
                                            <label className="f">
                                                সুতার লট নম্বর
                                                <input
                                                    value={newOYarnLot}
                                                    onChange={e => setNewOYarnLot(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                        <div className="grid g2" style={{ gap: '8px', marginTop: '6px' }}>
                                            <label className="f">
                                                ব্যাগ সংখ্যা
                                                <input
                                                    type="number"
                                                    value={newOYarnBags}
                                                    onChange={e => setNewOYarnBags(e.target.value)}
                                                />
                                            </label>
                                            <label className="f">
                                                প্রাপ্ত সুতা (kg)
                                                <input
                                                    type="number"
                                                    value={newOYarnKg}
                                                    onChange={e => setNewOYarnKg(e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setShowAddOrderModal(false)}
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn pri"
                                        >
                                            অর্ডার সংরক্ষণ করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL: QUICK YARN INTAKE */}
                    {showYarnModal && (
                        <div
                            className="modal-backdrop"
                            onClick={() => setShowYarnModal(false)}
                        >
                            <div
                                className="modal-box"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <h3 style={{ margin: 0 }}>সুতা গ্রহণ চালান এন্ট্রি (Yarn Intake)</h3>
                                    <button
                                        type="button"
                                        className="btn sm"
                                        onClick={() => setShowYarnModal(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleYarnIntakeSubmit} className="form">
                                    <label className="f">
                                        অর্ডার নির্বাচন *
                                        <select
                                            value={yarnTargetOrder}
                                            onChange={e => setYarnTargetOrder(e.target.value)}
                                        >
                                            {orders.map(o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.id} — {vName(o.v)} ({o.fabric})
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            সুতার কাউন্ট *
                                            <input
                                                required
                                                placeholder="যেমন: 30s Combed"
                                                value={yarnCountInput}
                                                onChange={e => setYarnCountInput(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            স্পিনার মিল *
                                            <input
                                                required
                                                placeholder="যেমন: Square Textiles"
                                                value={yarnSpinnerInput}
                                                onChange={e => setYarnSpinnerInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <label className="f">
                                        সুতার লট নম্বর *
                                        <input
                                            required
                                            placeholder="যেমন: SQ-91040"
                                            value={yarnLotInput}
                                            onChange={e => setYarnLotInput(e.target.value)}
                                        />
                                    </label>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            ব্যাগ সংখ্যা *
                                            <input
                                                type="number"
                                                required
                                                value={yarnBagsInput}
                                                onChange={e => setYarnBagsInput(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            মোট পরিমাণ (kg) *
                                            <input
                                                type="number"
                                                required
                                                value={yarnKgInput}
                                                onChange={e => setYarnKgInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setShowYarnModal(false)}
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn pri"
                                        >
                                            সুতা চালান সেভ করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL: CREATE DELIVERY CHALLAN */}
                    {showDeliveryModal && (
                        <div
                            className="modal-backdrop"
                            onClick={() => setShowDeliveryModal(false)}
                        >
                            <div
                                className="modal-box"
                                onClick={e => e.stopPropagation()}
                                style={{ maxWidth: '580px' }}
                            >
                                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <h3 style={{ margin: 0 }}>নতুন ডেলিভারি চালান তৈরি (Fabric Gate Pass)</h3>
                                    <button
                                        type="button"
                                        className="btn sm"
                                        onClick={() => setShowDeliveryModal(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <form onSubmit={handleDeliverySubmit}>
                                    <label className="f">
                                        সাব-কন্ট্রাক্ট অর্ডার নির্বাচন *
                                        <select
                                            value={deliveryTargetOrder}
                                            onChange={e => setDeliveryTargetOrder(e.target.value)}
                                        >
                                            {orders.map(o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.id} · {vendors[o.v]?.name} · {o.fabric} ({bn(o.done)}/{bn(o.qty)} kg)
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            চালান নম্বর *
                                            <input
                                                required
                                                value={deliveryChallanNo}
                                                onChange={e => setDeliveryChallanNo(e.target.value)}
                                            />
                                        </label>
                                        <label className="f">
                                            চালানের তারিখ *
                                            <input
                                                required
                                                value={deliveryDateInput}
                                                onChange={e => setDeliveryDateInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            রোল সংখ্যা *
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={deliveryRollsInput}
                                                onChange={e => setDeliveryRollsInput(e.target.value)}
                                            />
                                        </label>
                                        <label className="f">
                                            ডেলিভারি নেট ওজন (kg) *
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={deliveryKgInput}
                                                onChange={e => setDeliveryKgInput(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            পরিবহন / গাড়ির নম্বর
                                            <input
                                                placeholder="যেমন: পিকআপ ঢাকা মেট্রো-ন ১২-৮৮৪০"
                                                value={deliveryVehicleInput}
                                                onChange={e => setDeliveryVehicleInput(e.target.value)}
                                            />
                                        </label>
                                        <label className="f">
                                            ড্রাইভার / প্রতিনিধির মোবাইল
                                            <input
                                                placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                                                value={deliveryDriverPhone}
                                                onChange={e => setDeliveryDriverPhone(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setShowDeliveryModal(false)}
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn pri"
                                        >
                                            চালান নিশ্চিত ও সেভ করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
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

            {/* SCREEN: MY MACHINES (OWN FACTORY MACHINES) */}
            {view === 'machines' && (
                <>
                    <div className="head">
                        <div>
                            <h2>আমার মেশিনগুলো</h2>
                            <p>
                                কারখানা: <b>{factoryDisplayName}</b> · শুধুমাত্র আপনার কারখানার নিজস্ব ফ্লোর মেশিন ও সক্ষমতা
                            </p>
                        </div>
                        <div className="row">
                            <button
                                type="button"
                                className="btn pri"
                                onClick={() => setShowAddMachineModal(true)}
                            >
                                + নতুন মেশিন যোগ করুন
                            </button>
                            <Link
                                href="/knitkhata"
                                className="btn"
                                style={{ textDecoration: 'none' }}
                            >
                                ফ্লোর ড্যাশবোর্ড
                            </Link>
                        </div>
                    </div>

                    {/* KPIS SUMMARY */}
                    <div className="kpis">
                        <div className="kpi">
                            <span>মোট কারখানা মেশিন</span>
                            <b>{bn(totalMyMachinesCount)}টি</b>
                            <i>{bn(runningMyMachinesCount)}টি সচল</i>
                        </div>
                        <div className="kpi">
                            <span>বর্তমানে সচল</span>
                            <b>{bn(runningMyMachinesCount)}টি</b>
                            <i>{bn(run.length)}টি অর্ডারে রানিং</i>
                        </div>
                        <div className="kpi">
                            <span>রিজার্ভ / অপেক্ষায়</span>
                            <b>{bn(waitMyMachinesCount)}টি</b>
                            <i>সুতা পেলেই কাজ শুরু</i>
                        </div>
                        <div className="kpi">
                            <span>ব্রেকডাউন / মেরামত</span>
                            <b>{bn(downMyMachinesCount)}টি</b>
                            <i>রক্ষণাবেক্ষণ চলছে</i>
                        </div>
                        <div className="kpi">
                            <span>খালি / প্রস্তুত</span>
                            <b>{bn(idleMyMachinesCount)}টি</b>
                            <i>নতুন অর্ডারের জন্য রেডি</i>
                        </div>
                        <div className="kpi">
                            <span>দৈনিক মোট সক্ষমতা</span>
                            <b>{bn(totalDailyCapacityKg)} kg</b>
                            <i>২৪ ঘণ্টা পূর্ণ শিফটে</i>
                        </div>
                    </div>

                    {/* REGISTERED CAPACITY SUMMARY CARD */}
                    <div className="card">
                        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>মেশিনের ধরন ও দৈনিক উৎপাদন সক্ষমতা</h3>
                                <p className="small muted" style={{ marginTop: '2px' }}>
                                    আপনার কারখানায় নিবন্ধিত প্রতিটি মেশিন ক্যাটাগরির সামগ্রিক উৎপাদন হার
                                </p>
                            </div>
                            <span className="pill p-ok">
                                রেজিস্টার্ড ফ্যাক্টরি: {factory?.business_name || 'রহমান নিটিং'}
                            </span>
                        </div>

                        <div className="tw">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ক্যাটাগরি / মেশিন টাইপ</th>
                                        <th>ব্র্যান্ড ও মডেল / স্পেসিফিকেশন</th>
                                        <th className="n">মোট মেশিন</th>
                                        <th className="n">মেশিন প্রতি ক্ষমতা (kg/দিন)</th>
                                        <th className="n">দৈনিক মোট সক্ষমতা</th>
                                        <th>অবস্থা</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factoryCapRows.map((fc, idx) => (
                                        <tr key={idx}>
                                            <td><b>{fc.category || fc.machine_type}</b></td>
                                            <td>{fc.brand_or_model || 'Standard Specs'}</td>
                                            <td className="n"><b>{bn(fc.no_of_machine)}টি</b></td>
                                            <td className="n">{bn(fc.capacity_per_machine)} {fc.unit_type || 'Kg'}</td>
                                            <td className="n"><b>{bn(fc.total_capacity_per_day)} {fc.unit_type || 'Kg'}</b></td>
                                            <td>
                                                <span className="pill p-ok">সক্রিয় Roster</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* OWN FACTORY FLOOR MACHINES ROSTER */}
                    <div className="card">
                        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>ফ্লোর মেশিন রোস্টার ও লাইভ স্ট্যাটাস</h3>
                                <p className="small muted" style={{ marginTop: '2px' }}>
                                    প্রতিটি মেশিনের অপারেটর, শিফট ও চলমান অর্ডারের তাৎক্ষণিক অবস্থা
                                </p>
                            </div>

                            {/* Search */}
                            <div style={{ minWidth: '240px' }}>
                                <input
                                    type="search"
                                    placeholder="মেশিন কোড, মডেল বা অর্ডার খুঁজুন..."
                                    value={machineSearch}
                                    onChange={e => setMachineSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--line)',
                                        background: 'var(--surface2)',
                                        color: 'var(--ink)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="roleswitch" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            <button
                                type="button"
                                className={machineFilter === 'all' ? 'on' : ''}
                                onClick={() => setMachineFilter('all')}
                            >
                                সব মেশিন ({bn(totalMyMachinesCount)})
                            </button>
                            <button
                                type="button"
                                className={machineFilter === 'run' ? 'on' : ''}
                                onClick={() => setMachineFilter('run')}
                            >
                                সচল ({bn(runningMyMachinesCount)})
                            </button>
                            <button
                                type="button"
                                className={machineFilter === 'wait' ? 'on' : ''}
                                onClick={() => setMachineFilter('wait')}
                            >
                                রিজার্ভ ({bn(waitMyMachinesCount)})
                            </button>
                            <button
                                type="button"
                                className={machineFilter === 'down' ? 'on' : ''}
                                onClick={() => setMachineFilter('down')}
                            >
                                ব্রেকডাউন ({bn(downMyMachinesCount)})
                            </button>
                            <button
                                type="button"
                                className={machineFilter === 'idle' ? 'on' : ''}
                                onClick={() => setMachineFilter('idle')}
                            >
                                খালি ({bn(idleMyMachinesCount)})
                            </button>
                        </div>

                        {/* Machine Cards Grid */}
                        <div className="grid g3">
                            {filteredMachines.map(m => {
                                const isRun = m.status === 'run';
                                const isWait = m.status === 'wait';
                                const isDown = m.status === 'down';
                                const isIdle = m.status === 'idle';

                                return (
                                    <div key={m.code} className="machine-card">
                                        <div className="mc-top">
                                            <div className={`mc-badge ${isRun ? 'run' : isDown ? 'down' : isWait ? 'wait' : ''}`}>
                                                <span>⚙</span>
                                                <b>{m.code}</b>
                                            </div>

                                            {isRun ? (
                                                <span className="pill p-acc">অর্ডারে সচল</span>
                                            ) : isWait ? (
                                                <span className="pill p-yarn">সুতার অপেক্ষায়</span>
                                            ) : isDown ? (
                                                <span className="pill p-bad">ব্রেকডাউন</span>
                                            ) : (
                                                <span className="pill p-idle">খালি প্রস্তুত</span>
                                            )}
                                        </div>

                                        <div className="mc-specs">
                                            <div>
                                                <span>মেশিনের ধরন: </span>
                                                <b>{m.type}</b>
                                            </div>
                                            <div>
                                                <span>Dia × Gauge: </span>
                                                <b className="mono">{m.dia}</b>
                                            </div>
                                            <div>
                                                <span>ব্র্যান্ড ও মডেল: </span>
                                                <span>{m.brand}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <div>
                                                    <span>CPH (ঘণ্টা): </span>
                                                    <b className="mono">{bn(m.cph)} kg/hr</b>
                                                </div>
                                                <div>
                                                    <span>দৈনিক: </span>
                                                    <b className="mono">{bn(Math.round(m.cph * 24))} kg</b>
                                                </div>
                                            </div>
                                        </div>

                                        {isRun && m.assignedOrder && (
                                            <div
                                                style={{
                                                    background: 'var(--surface2)',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '.83rem',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleSelectOrder(m.assignedOrder!)}
                                                title="অর্ডার বিস্তারিত দেখুন"
                                            >
                                                <span className="small muted">চলমান অর্ডার: </span>
                                                <b className="mono" style={{ color: 'var(--accent)' }}>{m.assignedOrder}</b>
                                                <div className="small muted">অপারেটর: {m.op} ({m.sh})</div>
                                            </div>
                                        )}

                                        {isWait && (
                                            <div style={{ background: 'var(--yarn-soft)', color: 'var(--yarn)', padding: '6px 10px', borderRadius: '6px', fontSize: '.83rem' }}>
                                                <b>SC-2610-018</b> এর সুতা গ্রহণের অপেক্ষায়
                                            </div>
                                        )}

                                        {isDown && (
                                            <div style={{ background: 'var(--bad-soft)', color: 'var(--bad)', padding: '6px 10px', borderRadius: '6px', fontSize: '.83rem' }}>
                                                <b>রক্ষণাবেক্ষণ:</b> নিডল ও সিনকার বদলানো হচ্ছে
                                            </div>
                                        )}

                                        {isIdle && (
                                            <div style={{ background: 'var(--surface2)', color: 'var(--muted)', padding: '6px 10px', borderRadius: '6px', fontSize: '.83rem' }}>
                                                কোনো অ্যাসাইনমেন্ট নেই · কাজ নেওয়ার জন্য প্রস্তুত
                                            </div>
                                        )}

                                        {/* Status Switcher & Action */}
                                        <div className="mc-status-bar">
                                            <span className="small muted">অবস্থা পরিবর্তন:</span>
                                            <div className="row" style={{ gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    className={`btn sm ${isRun ? 'pri' : ''}`}
                                                    onClick={() => handleToggleMachineStatus(m.code, 'run')}
                                                    title="সচল করুন"
                                                >
                                                    সচল
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn sm ${isIdle ? 'pri' : ''}`}
                                                    onClick={() => handleToggleMachineStatus(m.code, 'idle')}
                                                    title="খালি করুন"
                                                >
                                                    খালি
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn sm ${isDown ? 'pri' : ''}`}
                                                    onClick={() => handleToggleMachineStatus(m.code, 'down')}
                                                    title="ব্রেকডাউন চিহ্নিত করুন"
                                                >
                                                    ডাউন
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* MODAL: ADD NEW MACHINE */}
                    {showAddMachineModal && (
                        <div
                            className="modal-backdrop"
                            onClick={() => setShowAddMachineModal(false)}
                        >
                            <div
                                className="modal-box"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <h3 style={{ margin: 0 }}>কারখানায় নতুন মেশিন যোগ করুন</h3>
                                    <button
                                        type="button"
                                        className="btn sm"
                                        onClick={() => setShowAddMachineModal(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleAddMachineSubmit} className="form">
                                    <label className="f">
                                        মেশিনের নাম / ফ্লোর কোড *
                                        <input
                                            required
                                            placeholder="যেমন: M-25 বা Mayer Relanit 01"
                                            value={addMName}
                                            onChange={e => setAddMName(e.target.value)}
                                        />
                                    </label>

                                    <label className="f">
                                        মেশিনের ধরন / ক্যাটাগরি *
                                        <select
                                            value={addMType}
                                            onChange={e => setAddMType(e.target.value)}
                                        >
                                            <option value="Single Jersey">Circular Single Jersey</option>
                                            <option value="Rib / Interlock">Circular Rib / Interlock</option>
                                            <option value="Fleece 3-End">Circular 3-End Fleece / Terry</option>
                                            <option value="Flatbed Collar & Cuff">Flatbed Collar & Cuff</option>
                                            <option value="Auto Striper">Auto Striper Knitting</option>
                                        </select>
                                    </label>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            Dia × Gauge
                                            <input
                                                placeholder='যেমন: 30" × 24G'
                                                value={addMDia}
                                                onChange={e => setAddMDia(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            ব্র্যান্ড ও অরিজিন
                                            <input
                                                placeholder="যেমন: Mayer & Cie / Germany"
                                                value={addMBrand}
                                                onChange={e => setAddMBrand(e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <div className="grid g2" style={{ gap: '10px' }}>
                                        <label className="f">
                                            ঘণ্টায় ক্যাপাসিটি (CPH - kg) *
                                            <input
                                                type="number"
                                                step="0.5"
                                                required
                                                value={addMCph}
                                                onChange={e => setAddMCph(e.target.value)}
                                            />
                                        </label>

                                        <label className="f">
                                            প্রাথমিক অবস্থা
                                            <select
                                                value={addMStatus}
                                                onChange={e => setAddMStatus(e.target.value as any)}
                                            >
                                                <option value="idle">খালি (কাজের জন্য প্রস্তুত)</option>
                                                <option value="run">সচল (চলমান অর্ডার)</option>
                                                <option value="wait">রিজার্ভ (সুতার অপেক্ষায়)</option>
                                                <option value="down">ব্রেকডাউন / মেরামত</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="f">
                                        মেশিন সিরিয়াল নম্বর (ঐচ্ছিক)
                                        <input
                                            placeholder="যেমন: MC-2026-8891"
                                            value={addMSerial}
                                            onChange={e => setAddMSerial(e.target.value)}
                                        />
                                    </label>

                                    <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setShowAddMachineModal(false)}
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn pri"
                                        >
                                            মেশিন সেভ করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
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
