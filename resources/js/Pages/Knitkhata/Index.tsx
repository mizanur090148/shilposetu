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
    Vendor,
    YarnIntake,
    DeliveryChallan,
    FactoryShift
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

export const PRESET_1_SHIFT: FactoryShift[] = [
    {
        id: 'shift_day',
        code: 'Day',
        name: 'ডে শিফট (Day)',
        startTime: '08:00',
        endTime: '17:00',
        durationHours: 9,
        inCharge: 'মো. রফিকুল ইসলাম',
        targetOutputKg: 950,
        status: 'active',
        notes: 'সাধারণ জেনারেল শিফট (সকাল ৮:০০ থেকে বিকাল ৫:০০)'
    }
];

export const PRESET_2_SHIFTS: FactoryShift[] = [
    {
        id: 'shift_a',
        code: 'A',
        name: 'শিফট A (ডে)',
        startTime: '08:00',
        endTime: '20:00',
        durationHours: 12,
        inCharge: 'মো. রফিকুল ইসলাম',
        targetOutputKg: 1400,
        status: 'active',
        notes: 'সকাল ৮:০০ থেকে রাত ৮:০০ (১২ ঘণ্টা ডে শিফট)'
    },
    {
        id: 'shift_b',
        code: 'B',
        name: 'শিফট B (নাইট)',
        startTime: '20:00',
        endTime: '08:00',
        durationHours: 12,
        inCharge: 'কামরুল হাসান',
        targetOutputKg: 1350,
        status: 'active',
        notes: 'রাত ৮:০০ থেকে সকাল ৮:০০ (১২ ঘণ্টা নাইট শিফট)'
    }
];

export const PRESET_3_SHIFTS: FactoryShift[] = [
    {
        id: 'shift_a_3',
        code: 'A',
        name: 'শিফট A (মর্নিং)',
        startTime: '06:00',
        endTime: '14:00',
        durationHours: 8,
        inCharge: 'মো. রফিকুল ইসলাম',
        targetOutputKg: 900,
        status: 'active',
        notes: 'সকাল ৬:০০ থেকে দুপুর ২:০০ (৮ ঘণ্টা মর্নিং শিফট)'
    },
    {
        id: 'shift_b_3',
        code: 'B',
        name: 'শিফট B (ইভনিং)',
        startTime: '14:00',
        endTime: '22:00',
        durationHours: 8,
        inCharge: 'কামরুল হাসান',
        targetOutputKg: 900,
        status: 'active',
        notes: 'দুপুর ২:০০ থেকে রাত ১০:০০ (৮ ঘণ্টা ইভনিং শিফট)'
    },
    {
        id: 'shift_c_3',
        code: 'C',
        name: 'শিফট C (নাইট)',
        startTime: '22:00',
        endTime: '06:00',
        durationHours: 8,
        inCharge: 'আব্দুল কাদের',
        targetOutputKg: 850,
        status: 'active',
        notes: 'রাত ১০:০০ থেকে সকাল ৬:০০ (৮ ঘণ্টা নাইট শিফট)'
    }
];

export default function KnitkhataIndex({
    factory,
    auth,
    initialTab = 'dash',
    initialRole = 'fac',
    initialOrderId = 'SC-POST-001',
    factoryMachines = [],
    customMachines = [],
    machineTypes = [],
    userPosts = [],
    quotationsSubmitted = [],
    initialOrders = [],
    initialVendors = {},
    initialVendorOrders = [],
    subcontractorFactories = {},
    dbShifts = [],
    dbProductionLogs = []
}: KnitkhataProps) {
    const [role, setRole] = useState<RoleMode>(initialRole);
    const [view, setView] = useState<KnitkhataViewTab>(initialTab);
    const [curOrder, setCurOrder] = useState<string>(initialOrderId);
    const [orders, setOrders] = useState<Order[]>(() => {
        if (initialOrders && initialOrders.length > 0) {
            return initialOrders;
        }
        return INITIAL_ORDERS;
    });
    const [vendorOrders, setVendorOrders] = useState<Order[]>(() => {
        if (initialVendorOrders && initialVendorOrders.length > 0) {
            return initialVendorOrders;
        }
        return [];
    });
    const [machineState, setMachineState] = useState<Record<string, string>>(INITIAL_MACHINE_STATE);
    const [prodLog, setProdLog] = useState<ProductionLogItem[]>(() => {
        if (dbProductionLogs && dbProductionLogs.length > 0) {
            return dbProductionLogs;
        }
        return INITIAL_PROD_LOG;
    });
    const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
    const [vendors, setVendors] = useState<Record<string, Vendor>>(() => {
        if (initialVendors && Object.keys(initialVendors).length > 0) {
            return { ...INITIAL_VENDORS, ...initialVendors };
        }
        return INITIAL_VENDORS;
    });

    useEffect(() => {
        if (dbProductionLogs && dbProductionLogs.length > 0) {
            setProdLog(dbProductionLogs);
        }
    }, [dbProductionLogs]);

    useEffect(() => {
        if (initialOrders && initialOrders.length > 0) {
            setOrders(initialOrders);
        }
    }, [initialOrders]);

    useEffect(() => {
        if (initialVendorOrders && initialVendorOrders.length > 0) {
            setVendorOrders(initialVendorOrders);
        }
    }, [initialVendorOrders]);

    useEffect(() => {
        if (initialVendors && Object.keys(initialVendors).length > 0) {
            setVendors(prev => ({ ...prev, ...initialVendors }));
        }
    }, [initialVendors]);

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

    // Shift system & Production Entry state (supports 1, 2, or 3 shifts with localStorage persistence)
    const [shiftMode, setShiftMode] = useState<1 | 2 | 3>(() => {
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('kk_shift_mode') : null;
            if (saved === '1') return 1;
            if (saved === '3') return 3;
        } catch (e) {}
        return 2;
    });
    const [entryMode, setEntryMode] = useState<'bulk' | 'single'>('bulk');
    const [bulkMachineScope, setBulkMachineScope] = useState<'assigned' | 'run' | 'all'>('assigned');
    const [entryDate, setEntryDate] = useState<string>(() => {
        const today = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(today.getDate()).padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;
    });
    const [entrySh, setEntrySh] = useState<string>(() => {
        if (dbShifts && dbShifts.length > 0) {
            return dbShifts[0].code;
        }
        return 'A';
    });
    const [entryM, setEntryM] = useState<string>(() => {
        const runOrder = (initialOrders && initialOrders.length > 0 ? initialOrders : INITIAL_ORDERS).find(o => o.status === 'run');
        if (runOrder && runOrder.machines && runOrder.machines.length > 0) {
            return runOrder.machines[0];
        }
        return 'M-01';
    });
    const [entryOrderId, setEntryOrderId] = useState<string>('');
    const [entryKg, setEntryKg] = useState('');
    const [entryR, setEntryR] = useState('');
    const [entryOp, setEntryOp] = useState('');
    const [entryLot, setEntryLot] = useState('');
    const [entryIss, setEntryIss] = useState('না');
    const [entryRemarks, setEntryRemarks] = useState('');
    const [historyShiftFilter, setHistoryShiftFilter] = useState<string>('all');
    const [bulkEntries, setBulkEntries] = useState<Record<string, { kg: string; rolls: string; op: string; lot: string; issue: string; orderId?: string; remarks?: string }>>({});

    // Factory Shift Management state
    const [factoryShifts, setFactoryShifts] = useState<FactoryShift[]>(() => {
        if (dbShifts && dbShifts.length > 0) {
            return dbShifts;
        }
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem('kk_factory_shifts') : null;
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return PRESET_3_SHIFTS;
    });

    useEffect(() => {
        if (dbShifts && dbShifts.length > 0) {
            setFactoryShifts(dbShifts);
        }
    }, [dbShifts]);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
    const [shiftFormName, setShiftFormName] = useState('শিফট A (ডে)');
    const [shiftFormCode, setShiftFormCode] = useState('A');
    const [shiftFormStart, setShiftFormStart] = useState('08:00');
    const [shiftFormEnd, setShiftFormEnd] = useState('20:00');
    const [shiftFormDuration, setShiftFormDuration] = useState('12');
    const [shiftFormInCharge, setShiftFormInCharge] = useState('মো. রফিকুল ইসলাম');
    const [shiftFormTargetKg, setShiftFormTargetKg] = useState('1400');
    const [shiftFormStatus, setShiftFormStatus] = useState<'active' | 'inactive'>('active');
    const [shiftFormNotes, setShiftFormNotes] = useState('');

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
    const [orderFilter, setOrderFilter] = useState<'run' | 'done' | 'all'>('run');
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

        router.post('/knitkhata/orders', {
            fabric: newOFabric,
            qty: qtyNum,
            status: newOStatus,
            vendor: newOVendor,
            gsm: gsmNum,
            dia: newODia,
            color: newOColor,
            yarn: newOYarnCount,
            rate_tk: rateTkNum,
            machines: machinesList,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`নতুন সাব-কন্ট্রাক্ট অর্ডার সফলভাবে ডাটাবেজে যুক্ত হয়েছে!`);
            }
        });
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
        setVendorOrders(prev =>
            prev.map(o => {
                if (o.id === orderId) {
                    return { ...o, status: nextStatus };
                }
                return o;
            })
        );

        const target = orders.find(o => o.id === orderId) || vendorOrders.find(o => o.id === orderId);
        const dbId = target?.db_id || parseInt(orderId.replace(/\D/g, ''), 10);

        if (dbId) {
            router.post('/knitkhata/orders/status', {
                order_id: dbId,
                status: nextStatus
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    const stText = nextStatus === 'run' ? 'চলমান' : nextStatus === 'wait' ? 'অপেক্ষায়' : 'সম্পন্ন';
                    showToast(`অর্ডার ${orderId} সফলভাবে '${stText}' করা হয়েছে!`);
                }
            });
        } else {
            showToast(`অর্ডার ${orderId} এর অবস্থা পরিবর্তন করা হয়েছে`);
        }
    };



    // Delivery Challan Modal state & handlers
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryTargetOrder, setDeliveryTargetOrder] = useState<string>(initialOrderId || orders[0]?.id || 'SC-POST-001');
    const [deliveryDateInput, setDeliveryDateInput] = useState('03 Oct 2026');
    const [deliveryChallanNo, setDeliveryChallanNo] = useState('CH-2610-062');
    const [deliveryRollsInput, setDeliveryRollsInput] = useState('25');
    const [deliveryKgInput, setDeliveryKgInput] = useState('1000');
    const [deliveryVehicleInput, setDeliveryVehicleInput] = useState('পিকআপ ঢাকা মেট্রো-ন ১২-৮৮৪০');
    const [deliveryDriverPhone, setDeliveryDriverPhone] = useState('+8801711223344');
    // Assign Machines modal state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignOrderId, setAssignOrderId] = useState<string>('');
    const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
    const [assignMachineSearch, setAssignMachineSearch] = useState<string>('');
    const [assignMachineFilter, setAssignMachineFilter] = useState<'all' | 'idle' | 'assigned'>('all');

    const handleOpenDeliveryModal = (orderId: string) => {
        setDeliveryTargetOrder(orderId);
        const target = orders.find(o => o.id === orderId) || vendorOrders.find(o => o.id === orderId);
        const rem = target ? Math.max(0, target.qty - target.done) : 1000;
        setDeliveryKgInput(String(Math.min(rem > 0 ? rem : 1000, 1500)));
        setDeliveryChallanNo(`CH-2610-0${Math.floor(Math.random() * 80 + 20)}`);
        setShowDeliveryModal(true);
    };

    // Open Assign Machines modal for a specific order
    const handleOpenAssignModal = (orderId: string) => {
        setAssignOrderId(orderId);
        const target = orders.find(o => o.id === orderId) || vendorOrders.find(o => o.id === orderId);
        setSelectedMachines(target?.machines || []);
        setAssignMachineSearch('');
        setAssignMachineFilter('all');
        setShowAssignModal(true);
    };

    const handleAssignSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!assignOrderId) return;

        // 1. Update orders state
        setOrders(prev =>
            prev.map(o => {
                if (o.id === assignOrderId) {
                    return {
                        ...o,
                        machines: selectedMachines,
                        status: o.status === 'wait' && selectedMachines.length > 0 ? 'run' : o.status,
                    };
                }
                return o;
            })
        );

        // 2. Update vendorOrders state
        setVendorOrders(prev =>
            prev.map(o => {
                if (o.id === assignOrderId) {
                    return {
                        ...o,
                        machines: selectedMachines,
                        status: o.status === 'wait' && selectedMachines.length > 0 ? 'run' : o.status,
                    };
                }
                return o;
            })
        );

        // 3. Update machineState
        setMachineState(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(code => {
                if (next[code] === `run:${assignOrderId}`) {
                    next[code] = 'idle';
                }
            });
            selectedMachines.forEach(code => {
                next[code] = `run:${assignOrderId}`;
            });
            return next;
        });

        setShowAssignModal(false);

        // 4. Persist to backend if this order has a DB ID
        const target = orders.find(o => o.id === assignOrderId) || vendorOrders.find(o => o.id === assignOrderId);
        const dbId = target?.db_id || parseInt((assignOrderId || '').replace(/\D/g, ''), 10);
        if (dbId) {
            router.post('/knitkhata/orders/assign-machines', {
                order_id: dbId,
                machines: selectedMachines,
            }, { preserveScroll: true });
        }
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
        setVendorOrders(prev =>
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

        const target = orders.find(o => o.id === deliveryTargetOrder) || vendorOrders.find(o => o.id === deliveryTargetOrder);
        const dbId = target?.db_id || parseInt((deliveryTargetOrder || '').replace(/\D/g, ''), 10);

        if (dbId) {
            router.post('/knitkhata/orders/delivery-challan', {
                order_id: dbId,
                challan_no: chNo,
                date: deliveryDateInput,
                rolls,
                kg,
                vehicle: deliveryVehicleInput,
                driver_phone: deliveryDriverPhone
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showToast(`চালান ${chNo} সম্পন্ন! ${kg} kg ডেলিভারি রেকর্ড করা হয়েছে`);
                }
            });
        } else {
            showToast(`ডেলিভারি চালান ${chNo} সম্পন্ন! ${kg} kg ডেলিভারি রেকর্ড করা হয়েছে`);
        }
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
    const vendorTotalQty = vendorOrders.reduce((sum, o) => sum + o.qty, 0);
    const vendorDoneQty = vendorOrders.reduce((sum, o) => sum + o.done, 0);
    const vendorProgressPct = calcPct(vendorDoneQty, vendorTotalQty);
    const vendorRunningCount = vendorOrders.filter(o => o.status === 'run').length;
    const vendorDoneCount = vendorOrders.filter(o => o.status === 'done').length;
    const vendorYarnSentKg = vendorOrders.reduce((sum, o) => sum + o.yarnIn.reduce((ys, y) => ys + y.kg, 0), 0);
    const vendorTotalChallansCount = vendorOrders.reduce((sum, o) => sum + (o.challans?.length || 0), 0);
    const vendorTotalBill = vendorOrders.reduce((sum, o) => sum + (o.qty * (o.rateTk || 22)), 0);

    const [vendorOrderFilter, setVendorOrderFilter] = useState<'run' | 'done' | 'all'>('run');
    const [vendorFactoryFilter, setVendorFactoryFilter] = useState<string>('all');
    const [vendorOrderSearch, setVendorOrderSearch] = useState('');
    const [vendorOrderSort, setVendorOrderSort] = useState<'date' | 'progress' | 'qty'>('date');

    const filteredVendorOrders = vendorOrders
        .filter(o => {
            if (vendorOrderFilter !== 'all' && o.status !== vendorOrderFilter) return false;
            if (vendorFactoryFilter !== 'all' && o.v !== vendorFactoryFilter) return false;
            if (vendorOrderSearch.trim()) {
                const q = vendorOrderSearch.toLowerCase();
                const lotMatches = o.yarnIn.some(y => y.lot.toLowerCase().includes(q));
                const facName = (o.vendorName || o.accepted_factory?.business_name || '').toLowerCase();
                return (
                    o.id.toLowerCase().includes(q) ||
                    facName.includes(q) ||
                    o.fabric.toLowerCase().includes(q) ||
                    o.color.toLowerCase().includes(q) ||
                    lotMatches
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (vendorOrderSort === 'progress') {
                return pct(b) - pct(a);
            }
            if (vendorOrderSort === 'qty') {
                return b.qty - a.qty;
            }
            return b.id.localeCompare(a.id);
        });

    const handleExportVendorCsv = () => {
        const headers = ['Order ID', 'Date Posted', 'Subcontractor Factory', 'Factory Phone', 'Location', 'Fabric Specs', 'Yarn & Lot Sent', 'Order Qty (kg)', 'Produced (kg)', 'Pending (kg)', 'Progress (%)', 'Assigned Machines', 'Rate (Tk/kg)', 'Total Bill (Tk)', 'Status'];
        const rows = filteredVendorOrders.map(o => {
            const rem = Math.max(0, o.qty - o.done);
            const bill = o.qty * (o.rateTk || 22);
            const lot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : (o.status === 'wait' ? 'সুতা পাঠানো বাকি' : 'সুতা রিসিভড');
            const fac = o.accepted_factory?.business_name || (o.is_awarded ? o.vendorName : 'দরপত্র আহ্বান চলছে');
            const phone = o.accepted_factory?.phone || o.vendorPhone || '';
            const loc = o.factory_location || '';
            const st = o.status === 'run' ? 'ফ্যাক্টরিতে চলমান' : o.status === 'wait' ? 'অপেক্ষায়' : 'সম্পন্ন';
            return [
                o.id,
                o.start,
                `"${fac}"`,
                `"${phone}"`,
                `"${loc}"`,
                `"${o.fabric} ${o.gsm} GSM"`,
                `"${o.yarn} (লট: ${lot})"`,
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
        const orgSlug = (auth?.user?.name || 'vendor').replace(/\s+/g, '_').toLowerCase();
        link.setAttribute('download', `subcontract_orders_posted_${orgSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('পোস্টকৃত সাব-কন্ট্রাক্ট অর্ডারের Excel/CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে');
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
            if (vendorOrders.length > 0 && !vendorOrders.find(o => o.id === curOrder)) {
                setCurOrder(vendorOrders[0].id);
            }
            router.visit('/knitkhata/orders?role=ven', { preserveScroll: true });
            showToast('ভেন্ডর ভিউ: গিভ সাব-কন্ট্রাক্ট (Orders I Posted) চালু করা হয়েছে');
        } else {
            if (orders.length > 0 && !orders.find(o => o.id === curOrder)) {
                setCurOrder(orders[0].id);
            }
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
        const target = orders.find(o => o.id === orderId) || vendorOrders.find(o => o.id === orderId);
        if (target) {
            setEtaM(target.machines.length || 1);
            setEtaR(target.rate || 350);
        }
        router.visit(`/knitkhata/orders/${orderId}`, { preserveScroll: true });
    };

    // Single Entry helper handlers
    const handleSingleMachineChange = (mCode: string) => {
        setEntryM(mCode);
        const mObj = allMyMachines.find(m => m.code === mCode);
        if (mObj && mObj.op && mObj.op !== '—') {
            setEntryOp(mObj.op);
        }
        const assignedO = orders.find(o => o.machines?.includes(mCode))
            || orders.find(o => o.status === 'run')
            || orders[0];
        if (assignedO) {
            setEntryOrderId(assignedO.id);
            if (assignedO.yarnIn && assignedO.yarnIn.length > 0 && assignedO.yarnIn[0].lot) {
                setEntryLot(assignedO.yarnIn[0].lot);
            }
        }
    };

    const handleTopOrderChange = (oid: string) => {
        setEntryOrderId(oid);
        if (oid) {
            const targetO = orders.find(o => o.id === oid) || vendorOrders.find(o => o.id === oid);
            if (targetO && targetO.yarnIn && targetO.yarnIn.length > 0 && targetO.yarnIn[0].lot) {
                setEntryLot(targetO.yarnIn[0].lot);
            }
            if (targetO?.machines && targetO.machines.length > 0) {
                setBulkMachineScope('assigned');
            } else {
                setBulkMachineScope('run');
            }
        }
    };

    const handleSingleOrderChange = (oid: string) => {
        handleTopOrderChange(oid);
    };

    // Save shift entry (Single Mode)
    const handleSaveEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const m = entryM;
        if (!m) {
            showToast('অনুগ্রহ করে একটি মেশিন নির্বাচন করুন');
            return;
        }

        const kg = parseFloat(entryKg) || 0;
        const rolls = parseInt(entryR) || 0;
        if (kg <= 0) {
            showToast('অনুগ্রহ করে উৎপাদনের সঠিক পরিমাণ (kg) লিখুন');
            return;
        }

        const mObj = allMyMachines.find(item => item.code === m);
        const assignedO = (entryOrderId ? orders.find(o => o.id === entryOrderId) : null)
            || orders.find(o => o.machines?.includes(m))
            || orders.find(o => o.status === 'run')
            || orders[0];
        const oid = assignedO?.id || 'SC-POST-004';

        const finalOp = entryOp || (mObj?.op !== '—' ? mObj?.op : '') || 'অপারেটর';
        const finalLot = entryLot || assignedO?.yarnIn?.[0]?.lot || '—';
        const finalIssue = entryIss || 'না';

        const newLog: ProductionLogItem = {
            d: entryDate,
            sh: entrySh,
            m,
            o: oid,
            kg,
            rolls,
            op: finalOp,
            lot: finalLot,
            issue: finalIssue,
            notes: entryRemarks,
            remarks: entryRemarks
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

        const updatedDone = assignedO ? Math.min(assignedO.qty, assignedO.done + kg) : kg;
        const updatedPct = assignedO ? Math.round((updatedDone / assignedO.qty) * 100) : 100;

        router.post('/knitkhata/production-entry', {
            mode: 'single',
            production_date: entryDate,
            shift_code: entrySh,
            machine_code: m,
            order_id: oid,
            quantity_kg: kg,
            rolls_count: rolls,
            operator_name: finalOp,
            yarn_lot: finalLot !== '—' ? finalLot : null,
            quality_issue: finalIssue,
            notes: entryRemarks,
            remarks: entryRemarks
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                showToast(`${m} এ ${bn(kg)} kg উৎপাদন ডাটাবেজে সংরক্ষিত হয়েছে · ${oid} এখন ${updatedPct}%`);
                setEntryKg('');
                setEntryR('');
                setEntryRemarks('');
            }
        });
    };

    // Shift & Bulk Entry Handlers
    const saveFactoryShifts = (updated: FactoryShift[]) => {
        setFactoryShifts(updated);
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('kk_factory_shifts', JSON.stringify(updated));
            }
        } catch (e) {}
    };

    const handleApplyShiftPreset = (presetType: 1 | 2 | 3) => {
        const preset = presetType === 1 ? PRESET_1_SHIFT : presetType === 2 ? PRESET_2_SHIFTS : PRESET_3_SHIFTS;
        saveFactoryShifts(preset);
        setShiftMode(presetType);
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('kk_shift_mode', presetType.toString());
            }
        } catch (e) {}
        if (presetType === 1) {
            setEntrySh('Day');
        } else if (presetType === 2) {
            if (entrySh !== 'A' && entrySh !== 'B') setEntrySh('A');
        } else if (presetType === 3) {
            if (entrySh !== 'A' && entrySh !== 'B' && entrySh !== 'C') setEntrySh('A');
        }
        showToast(`${presetType}টি শিফটের স্ট্যান্ডার্ড প্রিসেট সেট করা হয়েছে`);
    };

    const handleShiftModeChange = (mode: 1 | 2 | 3) => {
        handleApplyShiftPreset(mode);
    };

    const handleOpenAddShift = () => {
        setEditingShiftId(null);
        const nextCode = String.fromCharCode(65 + factoryShifts.length);
        setShiftFormName(`শিফট ${nextCode}`);
        setShiftFormCode(nextCode);
        setShiftFormStart('08:00');
        setShiftFormEnd('16:00');
        setShiftFormDuration('8');
        setShiftFormInCharge('');
        setShiftFormTargetKg('1000');
        setShiftFormStatus('active');
        setShiftFormNotes('');
        setShowShiftModal(true);
    };

    const handleOpenEditShift = (s: FactoryShift) => {
        setEditingShiftId(s.id);
        setShiftFormName(s.name);
        setShiftFormCode(s.code);
        setShiftFormStart(s.startTime);
        setShiftFormEnd(s.endTime);
        setShiftFormDuration(s.durationHours.toString());
        setShiftFormInCharge(s.inCharge || '');
        setShiftFormTargetKg(s.targetOutputKg ? s.targetOutputKg.toString() : '1000');
        setShiftFormStatus(s.status);
        setShiftFormNotes(s.notes || '');
        setShowShiftModal(true);
    };

    const handleSaveShiftModal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shiftFormName.trim() || !shiftFormCode.trim()) {
            showToast('শিফটের নাম ও কোড আবশ্যক');
            return;
        }

        const duration = parseFloat(shiftFormDuration) || 8;
        const targetKg = parseFloat(shiftFormTargetKg) || 0;

        if (editingShiftId) {
            const updated = factoryShifts.map(s => {
                if (s.id === editingShiftId) {
                    return {
                        ...s,
                        name: shiftFormName.trim(),
                        code: shiftFormCode.trim().toUpperCase(),
                        startTime: shiftFormStart,
                        endTime: shiftFormEnd,
                        durationHours: duration,
                        inCharge: shiftFormInCharge.trim(),
                        targetOutputKg: targetKg,
                        status: shiftFormStatus,
                        notes: shiftFormNotes.trim()
                    };
                }
                return s;
            });
            saveFactoryShifts(updated);
        } else {
            const newShift: FactoryShift = {
                id: `shift_${Date.now()}`,
                name: shiftFormName.trim(),
                code: shiftFormCode.trim().toUpperCase(),
                startTime: shiftFormStart,
                endTime: shiftFormEnd,
                durationHours: duration,
                inCharge: shiftFormInCharge.trim(),
                targetOutputKg: targetKg,
                status: shiftFormStatus,
                notes: shiftFormNotes.trim()
            };
            saveFactoryShifts([...factoryShifts, newShift]);
        }

        setShowShiftModal(false);

        router.post('/knitkhata/shifts', {
            id: editingShiftId,
            name: shiftFormName.trim(),
            code: shiftFormCode.trim().toUpperCase(),
            start_time: shiftFormStart,
            end_time: shiftFormEnd,
            duration_hours: duration,
            in_charge: shiftFormInCharge.trim(),
            target_output_kg: targetKg,
            status: shiftFormStatus,
            notes: shiftFormNotes.trim()
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                showToast(editingShiftId ? `শিফট "${shiftFormName}" সফলভাবে আপডেট করা হয়েছে` : `নতুন শিফট "${shiftFormName}" সফলভাবে ডাটাবেজে তৈরি হয়েছে`);
            }
        });
    };

    const handleDeleteShift = (id: string, name: string) => {
        if (factoryShifts.length <= 1) {
            showToast('কারখানায় অন্তত একটি সক্রিয় শিফট থাকা প্রয়োজন');
            return;
        }
        const updated = factoryShifts.filter(s => s.id !== id);
        saveFactoryShifts(updated);

        router.delete(`/knitkhata/shifts/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                showToast(`শিফট "${name}" মুছে ফেলা হয়েছে`);
            }
        });
    };

    const handleToggleShiftStatus = (id: string) => {
        const shiftObj = factoryShifts.find(s => s.id === id);
        if (!shiftObj) return;
        const nextStatus: 'active' | 'inactive' = shiftObj.status === 'active' ? 'inactive' : 'active';

        const updated = factoryShifts.map(s => {
            if (s.id === id) {
                return { ...s, status: nextStatus };
            }
            return s;
        });
        saveFactoryShifts(updated);

        router.post('/knitkhata/shifts', {
            id: id,
            name: shiftObj.name,
            code: shiftObj.code,
            start_time: shiftObj.startTime,
            end_time: shiftObj.endTime,
            duration_hours: shiftObj.durationHours,
            in_charge: shiftObj.inCharge,
            target_output_kg: shiftObj.targetOutputKg,
            status: nextStatus,
            notes: shiftObj.notes
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                showToast(`শিফট ${shiftObj.name} এর অবস্থা পরিবর্তন করা হয়েছে`);
            }
        });
    };

    const handleBulkEntryChange = (mCode: string, field: 'kg' | 'rolls' | 'op' | 'lot' | 'issue' | 'orderId' | 'remarks', val: string) => {
        setBulkEntries(prev => ({
            ...prev,
            [mCode]: {
                kg: prev[mCode]?.kg ?? '',
                rolls: prev[mCode]?.rolls ?? '',
                op: prev[mCode]?.op ?? '',
                lot: prev[mCode]?.lot ?? '',
                issue: prev[mCode]?.issue ?? 'না',
                orderId: prev[mCode]?.orderId ?? '',
                remarks: prev[mCode]?.remarks ?? '',
                [field]: val
            }
        }));
    };

    const handleAutofillBulkOperators = () => {
        setBulkEntries(prev => {
            const updated = { ...prev };
            allMyMachines.forEach(m => {
                const current = updated[m.code] || { kg: '', rolls: '', op: '', lot: '', issue: 'না', remarks: '' };
                updated[m.code] = {
                    ...current,
                    op: m.op !== '—' ? m.op : (current.op || 'অপারেটর')
                };
            });
            return updated;
        });
        showToast('সব মেশিনে নির্ধারিত অপারেটরদের নাম বসানো হয়েছে');
    };

    const handleSaveBulkEntry = (e: React.FormEvent) => {
        e.preventDefault();
        const newLogs: ProductionLogItem[] = [];
        const entriesPayload: any[] = [];
        const orderIncrement: Record<string, number> = {};

        Object.entries(bulkEntries).forEach(([mCode, data]) => {
            const kg = parseFloat(data.kg) || 0;
            const rolls = parseInt(data.rolls) || 0;
            if (kg <= 0) return;

            const assignedO = (data.orderId ? orders.find(o => o.id === data.orderId) : null)
                || orders.find(o => o.machines?.includes(mCode))
                || orders.find(o => o.status === 'run')
                || orders[0];
            const oId = assignedO?.id || 'SC-POST-004';
            const mObj = allMyMachines.find(m => m.code === mCode);

            newLogs.push({
                d: entryDate,
                sh: entrySh,
                m: mCode,
                o: oId,
                kg,
                rolls,
                op: data.op || mObj?.op || 'অপারেটর',
                lot: data.lot || (assignedO?.yarnIn?.[0]?.lot || '—'),
                issue: data.issue || 'না',
                notes: data.remarks || '',
                remarks: data.remarks || ''
            });

            entriesPayload.push({
                machine_code: mCode,
                order_id: oId,
                quantity_kg: kg,
                rolls_count: rolls,
                operator_name: data.op || mObj?.op || 'অপারেটর',
                yarn_lot: data.lot || (assignedO?.yarnIn?.[0]?.lot || null),
                quality_issue: data.issue || 'না',
                notes: data.remarks || '',
                remarks: data.remarks || ''
            });

            orderIncrement[oId] = (orderIncrement[oId] || 0) + kg;
        });

        if (entriesPayload.length === 0) {
            showToast('অনুগ্রহ করে অন্তত একটি মেশিনের উৎপাদন (kg) লিখুন');
            return;
        }

        setProdLog(prev => [...newLogs, ...prev]);

        setOrders(prev =>
            prev.map(o => {
                if (orderIncrement[o.id]) {
                    const newDone = Math.min(o.qty, o.done + orderIncrement[o.id]);
                    return { ...o, done: newDone };
                }
                return o;
            })
        );

        setBulkEntries({});

        router.post('/knitkhata/production-entry', {
            mode: 'bulk',
            production_date: entryDate,
            shift_code: entrySh,
            entries: entriesPayload
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                const totalSavedKg = newLogs.reduce((sum, l) => sum + l.kg, 0);
                const totalSavedRolls = newLogs.reduce((sum, l) => sum + l.rolls, 0);
                showToast(`শিফট ${entrySh}-এ মোট ${bn(newLogs.length)}টি মেশিনে ${bn(totalSavedKg)} kg (${bn(totalSavedRolls)} রোল) ডাটাবেজে সংরক্ষিত হয়েছে!`);
            }
        });
    };

    const handleDeleteProdLog = (idx: number) => {
        const item = prodLog[idx];
        if (!item) return;

        setProdLog(prev => prev.filter((_, i) => i !== idx));
        setOrders(prev =>
            prev.map(o => {
                if (o.id === item.o) {
                    return { ...o, done: Math.max(0, o.done - item.kg) };
                }
                return o;
            })
        );

        if (item.id) {
            router.delete(`/knitkhata/production-entry/${item.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    showToast(`${item.m} এর ${bn(item.kg)} kg এন্ট্রি মুছে ফেলা হয়েছে`);
                }
            });
        } else {
            showToast(`${item.m} এর ${bn(item.kg)} kg এন্ট্রি মুছে ফেলা হয়েছে`);
        }
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
    const vName = (id: string, fallbackName?: string) => fallbackName || vendors[id]?.name || id;
    const pct = (o: Order) => calcPct(o.done, o.qty);
    const etaOf = (o: Order, m = o.machines.length, r = o.rate) => calcEta(o, m, r);
    const stPill = (o: Order) => (
        <select
            value={o.status}
            onChange={(e) => {
                e.stopPropagation();
                handleUpdateOrderStatus(o.id, e.target.value as any);
            }}
            className={`pill ${o.status === 'run' ? 'p-acc' : o.status === 'wait' ? 'p-yarn' : 'p-ok'}`}
            style={{
                cursor: 'pointer',
                border: 'none',
                fontWeight: 700,
                fontSize: '.75rem',
                padding: '2px 8px',
                borderRadius: '999px',
                outline: 'none',
                background: 'inherit',
                color: 'inherit'
            }}
            title="অবস্থা পরিবর্তন করতে ক্লিক করুন"
        >
            <option value="run" style={{ background: '#fff', color: '#000' }}>চলমান</option>
            <option value="wait" style={{ background: '#fff', color: '#000' }}>সুতার অপেক্ষায়</option>
            <option value="done" style={{ background: '#fff', color: '#000' }}>সম্পন্ন</option>
        </select>
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
                    {list.length === 0 ? (
                        <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                কোনো অর্ডার পাওয়া যায়নি। নতুন অর্ডার যুক্ত করতে "+ নতুন অর্ডার তৈরি করুন" বাটনে ক্লিক করুন।
                            </td>
                        </tr>
                    ) : (
                        list.map(o => {
                        const e = etaOf(o);
                        return (
                            <tr
                                key={o.id}
                                className="click"
                                onClick={() => handleSelectOrder(o.id)}
                            >
                                <td className="mono">
                                    <b style={{ color: 'var(--accent)' }}>{o.title || o.fabric}</b>
                                    <div className="small muted">{o.id}</div>
                                </td>
                                <td>{o.vendorName || vName(o.v)}</td>
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
                                <td
                                    className="n click"
                                    title="মেশিন বরাদ্দ করতে ক্লিক করুন"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenAssignModal(o.id);
                                    }}
                                >
                                    {o.machines.length > 0 ? (
                                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{bn(o.machines.length)}টি ⚙️</span>
                                    ) : (
                                        <span className="small muted">+ অ্যাসাইন</span>
                                    )}
                                </td>
                                <td className="mono small">
                                    {o.status === 'done' ? '—' : e ? fmtD(e.date) : 'সুতা এলে'}
                                </td>
                                <td>{stPill(o)}</td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
        </div>
    );

    // Screen: Order Detail
    const renderDetail = (readonly: boolean) => {
        const o = (role === 'ven'
            ? (vendorOrders.find(x => x.id === curOrder) || orders.find(x => x.id === curOrder))
            : (orders.find(x => x.id === curOrder) || vendorOrders.find(x => x.id === curOrder))
        ) || orders[0] || vendorOrders[0];
        if (!o) {
            return (
                <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                    <h3>কোনো অর্ডার পাওয়া যায়নি</h3>
                    <Link href="/knitkhata/orders" className="btn sm">সব অর্ডারে ফিরে যান</Link>
                </div>
            );
        }
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
                            {o.title || o.fabric} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>({o.id})</span>
                        </h2>
                        <p>{o.vendorName || vName(o.v)} · শুরু {o.start}</p>
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
    const todayKg = prodLog.filter(p => p.d === entryDate).reduce((a, p) => a + p.kg, 0);
    const mRun = runningMyMachinesCount;
    const cls = (s: string) => (s.startsWith('run') ? 'run' : s);

    // Dynamic Bangla Date and Active Shift for Dashboard
    const todayBanglaDate = new Date().toLocaleDateString('bn-BD', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const currentActiveShift = factoryShifts.find(s => s.code === entrySh) || factoryShifts.find(s => s.status === 'active') || factoryShifts[0];
    const currentShiftDisplayName = currentActiveShift ? currentActiveShift.name : (entrySh ? `শিফট ${entrySh}` : 'শিফট A');

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
                        <b>{o.title || o.fabric}</b> ({o.id}) · {o.gsm ? `${o.gsm} GSM` : ''}<br />
                        আজ: 1,100 kg · মোট {pct(o)}%<br />
                        মেশিন: {o.machines.length}টি · শেষ হবে ~{etaOf(o) ? fmtD(etaOf(o)!.date) : '০৮ Oct'}<br />
                        QC: ১টি রোল বাতিল (needle mark)<br /><br />
                        <b>{o2.title || o2.fabric}</b> ({o2.id})<br />
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
                                .filter(p => p.o === o.id && p.d === entryDate)
                                .reduce((a, p) => a + p.kg, 0);
                            const e = etaOf(o);
                            return (
                                <tr key={o.id}>
                                    <td><b>{o.title || o.fabric}</b> <span className="small muted">({o.id})</span></td>
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
                    : view === 'shifts'
                    ? 'আমার শিফট'
                    : 'নিটখাতা প্রোটোটাইপ'
            }
        >
            {/* SCREEN: DASHBOARD */}
            {view === 'dash' && (() => {
                const waitingOrders = orders.filter(o => o.status === 'wait');
                const nearDoneOrders = orders.filter(o => o.status === 'run' && (o.qty - o.done) <= 500);
                const downMachines = allMyMachines.filter(m => m.status === 'down');
                const qcIssues = orders.flatMap(o => (o.qc || []).filter(q => q.s !== 'ok').map(q => ({ o, q })));
                const openQcList = qcIssues;

                return (
                    <>
                        <div className="head">
                            <div>
                                <h2>আজকের অবস্থা</h2>
                                <p>{todayBanglaDate} · {currentShiftDisplayName} চলমান</p>
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
                                <b>{bn(run.length)}</b>
                                <i>{bn(waitingOrders.length)}টি সুতার অপেক্ষায়</i>
                            </div>
                            <div className="kpi">
                                <span>আজকের প্রোডাকশন</span>
                                <b>{bn(todayKg)} kg</b>
                                <i>{currentShiftDisplayName} পর্যন্ত</i>
                            </div>
                            <div className="kpi">
                                <span>মেশিন চলছে</span>
                                <b>{bn(runningMyMachinesCount)} / {bn(totalMyMachinesCount)}</b>
                                <i>{bn(downMyMachinesCount)}টি মেরামত, {bn(idleMyMachinesCount)}টি খালি</i>
                            </div>
                            <div className="kpi">
                                <span>QC সমস্যা (খোলা)</span>
                                <b>{bn(openQcList.length)}</b>
                                <i>{openQcList.length > 0 ? `${bn(openQcList.length)}টি রোল পর্যালোচনায়` : 'সব রোল মানসম্মত (OK)'}</i>
                            </div>
                            <div className="kpi">
                                <span>কারখানা সক্ষমতা</span>
                                <b>{bn(totalDailyCapacityKg)} kg</b>
                                <i>দৈনিক পূর্ণ সক্ষমতা ({bn(totalMyMachinesCount)}টি মেশিন)</i>
                            </div>
                        </div>

                        <div className="grid g2">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0 }}>মেশিন বোর্ড</h3>
                                    <Link href="/knitkhata/my-machines" className="btn sm" style={{ textDecoration: 'none', fontSize: '.78rem', padding: '3px 10px' }}>
                                        সব মেশিন ({bn(totalMyMachinesCount)}টি) →
                                    </Link>
                                </div>
                                <div className="machines">
                                    {allMyMachines.map(m => {
                                        const st = m.status;
                                        const targetOid = m.assignedOrder;
                                        return (
                                            <div
                                                key={m.code}
                                                className={`mc ${st === 'run' ? 'run' : st}`}
                                                title={`${m.code} (${m.type}) - ${st === 'run' ? `চলমান: ${targetOid}` : st === 'down' ? 'ব্রেকডাউন' : st === 'wait' ? 'রিজার্ভ' : 'খালি'}`}
                                                onClick={() => {
                                                    if (st === 'run' && targetOid) {
                                                        handleSelectOrder(targetOid);
                                                    } else {
                                                        router.visit('/knitkhata/my-machines');
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <b>{m.code}</b>
                                                {st === 'run' && targetOid
                                                    ? (targetOid.startsWith('SC-') ? targetOid.slice(-3) : targetOid)
                                                    : st === 'down'
                                                    ? 'মেরামত'
                                                    : st === 'wait'
                                                    ? 'রিজার্ভ'
                                                    : 'খালি'}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="legend">
                                    <span style={{ '--c': 'var(--accent)' } as React.CSSProperties}>
                                        অর্ডারে চলছে ({bn(runningMyMachinesCount)}টি)
                                    </span>
                                    <span style={{ '--c': 'var(--yarn)' } as React.CSSProperties}>
                                        রিজার্ভ ({bn(waitMyMachinesCount)}টি)
                                    </span>
                                    <span style={{ '--c': 'var(--bad)' } as React.CSSProperties}>
                                        মেরামত ({bn(downMyMachinesCount)}টি)
                                    </span>
                                    <span style={{ '--c': 'var(--idle)' } as React.CSSProperties}>
                                        খালি ({bn(idleMyMachinesCount)}টি)
                                    </span>
                                </div>
                            </div>

                            <div className="card">
                                <h3>নজর দেওয়া দরকার (Alerts)</h3>
                                {qcIssues.length > 0 && qcIssues.slice(0, 2).map(({ o, q }, idx) => (
                                    <div key={`qc-${idx}`} className="alert click" onClick={() => handleSelectOrder(o.id)}>
                                        <i className="dot" style={{ background: 'var(--bad)' }} />
                                        <div>
                                            <b>{o.title || o.fabric}</b> — {q.d || 'ফল্ট চিহ্নিত'}: {q.issue || 'সমস্যা'} ({q.roll ? `রোল ${q.roll}` : '১টি রোল'} / {q.kg || 20} kg)। বায়ার: {o.vendorName || vName(o.v)} ({o.id})।
                                        </div>
                                    </div>
                                ))}

                                {waitingOrders.length > 0 && waitingOrders.slice(0, 2).map(o => (
                                    <div key={`wait-${o.id}`} className="alert click" onClick={() => handleSelectOrder(o.id)}>
                                        <i className="dot" style={{ background: 'var(--warn)' }} />
                                        <div>
                                            <b>{o.title || o.fabric}</b> — {o.vendorName || vName(o.v)} এর সুতা এখনো কারখানায় পৌঁছায়নি ({bn(o.qty)} kg)। সুতা রিসিভ এন্ট্রি করুন।
                                        </div>
                                    </div>
                                ))}

                                {nearDoneOrders.length > 0 && nearDoneOrders.slice(0, 2).map(o => (
                                    <div key={`near-${o.id}`} className="alert click" onClick={() => handleSelectOrder(o.id)}>
                                        <i className="dot" style={{ background: 'var(--accent)' }} />
                                        <div>
                                            <b>{o.title || o.fabric}</b> — আর মাত্র {bn(Math.max(0, o.qty - o.done))} kg বাকি ({pct(o)}% সম্পন্ন · {o.vendorName || vName(o.v)})। ডেলিভারি চালান ও গাড়ি প্রস্তুত করুন।
                                        </div>
                                    </div>
                                ))}

                                {downMachines.length > 0 && downMachines.slice(0, 1).map(m => (
                                    <div key={`down-${m.code}`} className="alert click" onClick={() => router.visit('/knitkhata/my-machines')}>
                                        <i className="dot" style={{ background: 'var(--bad)' }} />
                                        <div>
                                            <b>{m.code}</b> — কারিগরি মেরামত চলছে ({m.brand})। টেকনিশিয়ান দায়িত্বপ্রাপ্ত।
                                        </div>
                                    </div>
                                ))}

                                {qcIssues.length === 0 && waitingOrders.length === 0 && nearDoneOrders.length === 0 && downMachines.length === 0 ? (
                                    <div className="alert" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                                        <i className="dot" style={{ background: '#10b981' }} />
                                        <div style={{ color: '#065f46' }}>
                                            <b>সবকিছু স্বাভাবিক চলছে!</b> কোনো অর্ডার বা মেশিনে জরুরি ফল্ট নেই।
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert">
                                        <i className="dot" style={{ background: 'var(--accent)' }} />
                                        <div>কারখানার শিফট লক্ষ্যমাত্রা ও ফ্লোর প্রোডাকশন এন্ট্রি নিয়মিত আপডেট রাখুন।</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0 }}>চলমান অর্ডারের অগ্রগতি</h3>
                                <Link href="/knitkhata/orders" className="btn sm" style={{ textDecoration: 'none', fontSize: '.78rem', padding: '3px 10px' }}>
                                    সব সাব-কন্ট্রাক্ট অর্ডার দেখুন →
                                </Link>
                            </div>
                            {renderOrderTable(orders.filter(o => o.status !== 'done'))}
                        </div>
                    </>
                );
            })()}

            {/* SCREEN: ORDERS (SUBCONTRACT ORDERS) */}
            {view === 'orders' && (
                <>
                    {/* DUAL-ROLE SUBCONTRACT TABS (FACTORY VIEW: TAKE SUBCONTRACT vs VENDOR VIEW: GIVE SUBCONTRACT) */}
                    {/* <div className="subcontract-role-tabs">
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
                                <b>{bn(vendorOrders.length)}টি</b>
                                <span>পোস্ট করা অর্ডার</span>
                            </div>
                        </button>
                    </div> */}

                    {/* ROLE 1: FACTORY VIEW (TAKE SUBCONTRACT: ORDERS I BID / TAKEN) */}
                    {role === 'fac' && (
                        <>
                            {/* PAGE HEADER & QUICK ACTIONS */}
                            <div className="head">
                                <div>
                                    <h2>সাব-কন্ট্রাক্ট অর্ডার</h2>
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



                            {/* MAIN ORDERS SECTION WITH FILTERS, SEARCH, SORT & TABLE */}
                            <div className="card">
                                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                    {/* 3 Filter Tabs: চলমান, সম্পন্ন, সব অর্ডার */}
                                    <div className="roleswitch" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <button
                                            type="button"
                                            className={orderFilter === 'run' ? 'on' : ''}
                                            onClick={() => setOrderFilter('run')}
                                        >
                                            চলমান ({bn(runningOrdersCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={orderFilter === 'done' ? 'on' : ''}
                                            onClick={() => setOrderFilter('done')}
                                        >
                                            সম্পন্ন ({bn(doneOrdersCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={orderFilter === 'all' ? 'on' : ''}
                                            onClick={() => setOrderFilter('all')}
                                        >
                                            সব অর্ডার ({bn(orders.length)})
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
                                                                <div style={{ fontWeight: 600 }}>{o.title || o.fabric}</div>
                                                                <div className="small muted" style={{ fontWeight: 'normal' }}>
                                                                    {o.id} · {o.start}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <b>{o.vendorName || vName(o.v)}</b>
                                                                <div className="small muted">{o.vendorPhone || vendors[o.v]?.phone}</div>
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
                                                            <td
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenAssignModal(o.id);
                                                                }}
                                                                title="মেশিন বরাদ্দ বা পরিবর্তন করতে ক্লিক করুন"
                                                            >
                                                                {o.machines.length > 0 ? (
                                                                    <div className="row" style={{ gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                        {o.machines.map(m => (
                                                                            <span key={m} className="pill p-acc" style={{ fontSize: '.72rem', padding: '1px 6px' }}>
                                                                                {m}
                                                                            </span>
                                                                        ))}
                                                                        <span style={{ fontSize: '.75rem', color: 'var(--accent)', marginLeft: '2px' }} title="মেশিন এডিট করুন">✏️</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        style={{ fontSize: '.72rem', padding: '1px 6px', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenAssignModal(o.id);
                                                                        }}
                                                                    >
                                                                        + অ্যাসাইন করুন
                                                                    </button>
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
                                                                <div className="row" style={{ flexWrap: 'nowrap', gap: '4px', alignItems: 'center' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={() => handleSelectOrder(o.id)}
                                                                        title="অর্ডারের বিস্তারিত দেখুন"
                                                                    >
                                                                        বিস্তারিত
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

                                                                    {/* THREE DOT (⋮) BUTTON FOR ASSIGN MACHINES */}
                                                                    <button
                                                                        type="button"
                                                                        className="btn sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenAssignModal(o.id);
                                                                        }}
                                                                        title="মেশিন অ্যাসাইন করুন (Assign Machines)"
                                                                        style={{
                                                                            padding: '0 8px',
                                                                            fontSize: '1.25rem',
                                                                            fontWeight: 900,
                                                                            lineHeight: '1.2',
                                                                            color: 'var(--accent)',
                                                                            borderColor: 'var(--accent)',
                                                                            background: '#f0fdf4'
                                                                        }}
                                                                    >
                                                                        ⋮
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
                            {/* <div className="vbanner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    আপনি <b>{auth?.user?.name || 'ব্যবহারকারী'}</b> হিসেবে লগইন আছেন — <b>{factory?.business_name || auth?.user?.name || 'সাব-কন্ট্রাক্ট দাতা'} (বায়ার / সাব-কন্ট্রাক্ট দাতা)</b>।
                                    <div style={{ fontSize: '.84rem', marginTop: '3px', opacity: 0.9 }}>
                                        এখানে কেবল আপনার দেওয়া সাব-কন্ট্রাক্ট অর্ডারসমূহ, অনুমোদিত কারখানায় নিটিং অগ্রগতি, সুতা সরবরাহ হিসাব ও ফিনিশ ফেব্রিক ডেলিভারি চালানের লাইভ ট্র্যাকিং দেখা যাচ্ছে।
                                    </div>
                                </div>
                                <span className="pill p-acc" style={{ fontSize: '.76rem', background: '#ffffff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                                    🔒 ভেন্ডর কনফিডেনশিয়াল ভিউ
                                </span>
                            </div> */}

                            {/* VENDOR PAGE HEADER & ACTIONS */}
                            <div className="head">
                                <div>
                                    <h2>আমার দেওয়া সাব-কন্ট্রাক্ট অর্ডার</h2>
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
                                            const running = vendorOrders.find(o => o.status === 'run') || vendorOrders[0];
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
                                        onClick={handleExportVendorCsv}
                                        title="Excel / CSV রিপোর্ট ডাউনলোড"
                                    >
                                        এক্সপোর্ট Excel
                                    </button>
                                </div>
                            </div>

                            {/* VENDOR EXECUTIVE KPIS */}
                            <div className="kpis">
                                <div className="kpi">
                                    <span>আমার দেওয়া মোট অর্ডার</span>
                                    <b>{bn(vendorOrders.length)}টি</b>
                                    <i>সর্বমোট {bn(vendorTotalQty)} kg</i>
                                </div>
                                <div className="kpi">
                                    <span>ফ্যাক্টরিতে চলমান</span>
                                    <b>{bn(vendorRunningCount)}টি</b>
                                    <i>অনুমোদিত মিলে নিটিং রানিং</i>
                                </div>

                                <div className="kpi">
                                    <span>সম্পন্ন / ডেলিভার্ড</span>
                                    <b>{bn(vendorDoneCount)}টি</b>
                                    <i>উৎপাদন ও ডেলিভারি সম্পন্ন</i>
                                </div>
                                <div className="kpi">
                                    <span>মোট ডেলিভারি পেয়েছি</span>
                                    <b>{bn(vendorDoneQty)} kg</b>
                                    <i>{bn(vendorProgressPct)}% ডেলিভার্ড</i>
                                </div>
                                <div className="kpi">
                                    <span>মোট প্রদেয় নিটিং বিল</span>
                                    <b>৳ {bn(vendorTotalBill)}</b>
                                    <i>গড় ৳২২-২৪/kg</i>
                                </div>
                            </div>


                            {/* MAIN ORDERS CARD */}
                            <div className="card">
                                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                    {/* 3 FILTER TABS: চলমান, সম্পন্ন, সব অর্ডার */}
                                    <div className="roleswitch" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        <button
                                            type="button"
                                            className={vendorOrderFilter === 'run' ? 'on' : ''}
                                            onClick={() => setVendorOrderFilter('run')}
                                        >
                                            চলমান ({bn(vendorRunningCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={vendorOrderFilter === 'done' ? 'on' : ''}
                                            onClick={() => setVendorOrderFilter('done')}
                                        >
                                            সম্পন্ন ({bn(vendorDoneCount)})
                                        </button>
                                        <button
                                            type="button"
                                            className={vendorOrderFilter === 'all' ? 'on' : ''}
                                            onClick={() => setVendorOrderFilter('all')}
                                        >
                                            সব অর্ডার ({bn(vendorOrders.length)})
                                        </button>
                                    </div>

                                    {/* Factory Selector & Sort & Search */}
                                    <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
                                        <select
                                            value={vendorFactoryFilter}
                                            onChange={e => setVendorFactoryFilter(e.target.value)}
                                            style={{
                                                padding: '7px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--surface2)',
                                                color: 'var(--ink)'
                                            }}
                                        >
                                            <option value="all">সব কারখানা</option>
                                            {Object.entries(subcontractorFactories).map(([k, fac]: [string, any]) => (
                                                <option key={k} value={k}>{fac.name}</option>
                                            ))}

                                        </select>

                                        <select
                                            value={vendorOrderSort}
                                            onChange={e => setVendorOrderSort(e.target.value as any)}
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
                                            placeholder="অর্ডার নং, মিলের নাম, ফেব্রিক, রঙ বা সুতা লট..."
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

                                {/* ORDERS TABLE */}
                                <div className="tw">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>অর্ডার নং ও তারিখ</th>
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
                                                    <td colSpan={13} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                                                        <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>কোনো সাব-কন্ট্রাক্ট অর্ডার পাওয়া যায়নি</div>
                                                        <Link href="/dashboard?create=1" className="btn pri sm" style={{ textDecoration: 'none' }}>
                                                            + নতুন সাব-কন্ট্রাক্ট পোস্ট করুন
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredVendorOrders.map(o => {
                                                    const e = etaOf(o);
                                                    const p = pct(o);
                                                    const remKg = Math.max(0, o.qty - o.done);
                                                    const bill = o.qty * (o.rateTk || 22);
                                                    const lot = o.yarnIn.length > 0 ? o.yarnIn[0].lot : (o.status === 'wait' ? 'সুতা পাঠানো বাকি' : 'সুতা রিসিভড');

                                                    return (
                                                        <tr key={o.id}>
                                                            <td
                                                                className="mono click"
                                                                onClick={() => handleSelectOrder(o.id)}
                                                                style={{ fontWeight: 600, color: 'var(--accent)' }}
                                                                title="অর্ডারের লাইভ অগ্রগতি দেখতে ক্লিক করুন"
                                                            >
                                                                <div style={{ fontWeight: 600 }}>{o.title || o.fabric}</div>
                                                                <div className="small muted" style={{ fontWeight: 'normal' }}>
                                                                    {o.id} · {o.start}
                                                                </div>
                                                                {o.category && (
                                                                    <span className="pill p-acc" style={{ fontSize: '.68rem', padding: '1px 5px', textTransform: 'capitalize' }}>
                                                                        {o.category.replace('_', ' ')}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {o.accepted_factory ? (
                                                                    <div>
                                                                        <span className="pill p-ok" style={{ fontSize: '.76rem', fontWeight: 600, padding: '2px 8px', marginBottom: '3px', display: 'inline-block' }}>
                                                                            ✓ {o.accepted_factory?.business_name || o.vendorName}
                                                                        </span>
                                                                        <div className="small muted">
                                                                            📍 {o.factory_location || o.accepted_factory?.location || 'নারায়ণগঞ্জ'} · {o.accepted_factory?.phone || o.vendorPhone || ''}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <span className="pill p-yarn" style={{ fontSize: '.76rem', fontWeight: 600, padding: '2px 8px', marginBottom: '3px', display: 'inline-block' }}>
                                                                            দরপত্র আহ্বান চলছে
                                                                        </span>
                                                                        <div className="small muted">
                                                                            {(o.quotations_count || 0) > 0 ? (
                                                                                <Link
                                                                                    href={`/quotations/compare/${o.db_id}`}
                                                                                    style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                                                                                >
                                                                                    {bn(o.quotations_count || 0)}টি দরপত্র জমা পড়েছে →
                                                                                </Link>
                                                                            ) : (
                                                                                'এখনো কোনো দরপত্র আসেনি'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{o.fabric}</div>
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
                                                                {o.status === 'done' ? 'ডেলিভারি সম্পন্ন' : (o.deadline ? formatDeadline(o.deadline) : (e ? fmtD(e.date) : 'সুতা পৌঁছালে'))}
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

                                                                    {(o.quotations_count || 0) > 0 && !o.is_awarded && (
                                                                        <Link
                                                                            href={`/quotations/compare/${o.db_id}`}
                                                                            className="btn sm pri"
                                                                            style={{ textDecoration: 'none' }}
                                                                            title="দরপত্রসমূহ তুলনা ও অনুমোদন করুন"
                                                                        >
                                                                            দরপত্র ({o.quotations_count})
                                                                        </Link>
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
                                        মোট {bn(filteredVendorOrders.length)}টি সাব-কন্ট্রাক্ট অর্ডার প্রদর্শিত হচ্ছে
                                    </span>
                                    <span className="small muted" style={{ color: 'var(--muted)' }}>
                                        🔒 গোপনীয়তা ও সিকিউরিটি: কেবল আপনার অ্যাকাউন্টের মাধ্যমে পোস্টকৃত সাব-কন্ট্রাক্ট কাজ ও অনুমোদিত কারখানার ডেটাই প্রদর্শিত হচ্ছে।
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
                                            {(orders.length > 0 ? orders : vendorOrders).map(o => (
                                                <option key={o.id} value={o.id}>
                                                    {o.title || o.fabric} — {o.vendorName || vendors[o.v]?.name} ({bn(o.done)}/{bn(o.qty)} kg) · {o.id}
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

                    {/* MODAL: ASSIGN MACHINES TO ORDER */}
                    {showAssignModal && (
                        <div
                            className="modal-backdrop"
                            onClick={() => setShowAssignModal(false)}
                            style={{ zIndex: 1000 }}
                        >
                            <div
                                className="modal-box"
                                onClick={e => e.stopPropagation()}
                                style={{ maxWidth: '780px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                            >
                                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '12px' }}>
                                    <div>
                                        <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>অর্ডারে মেশিন বরাদ্দ (Assign Machines)</h3>
                                        </div>
                                        <p style={{ margin: '6px 0 0 0', fontSize: '.88rem', color: 'var(--muted)' }}>
                                            {(() => {
                                                const target = orders.find(o => o.id === assignOrderId) || vendorOrders.find(o => o.id === assignOrderId);
                                                return (
                                                    <>
                                                        অর্ডার: <b style={{ color: 'var(--accent)' }}>{target?.title || target?.fabric || assignOrderId}</b>
                                                        {target && (
                                                            <span> · বায়ার: {target.vendorName || vName(target.v)} · {bn(target.qty)} kg ({assignOrderId})</span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn sm"
                                        onClick={() => setShowAssignModal(false)}
                                        style={{ fontSize: '1rem', padding: '2px 8px' }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                                    {/* Search & Filter Bar */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="assign-search-input"
                                                placeholder="🔍 মেশিন কোড (যেমন M-01), টাইপ, ডায়ামিটার বা ব্র্যান্ড..."
                                                value={assignMachineSearch}
                                                onChange={e => setAssignMachineSearch(e.target.value)}
                                            />
                                            {assignMachineSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAssignMachineSearch('')}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--muted)',
                                                        fontSize: '1rem',
                                                        padding: 0
                                                    }}
                                                    title="মুছে ফেলুন"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                className={`btn sm ${assignMachineFilter === 'all' ? 'pri' : ''}`}
                                                onClick={() => setAssignMachineFilter('all')}
                                                style={{ fontSize: '.8rem', padding: '4px 10px' }}
                                            >
                                                সকল ({bn(allMyMachines.length)})
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn sm ${assignMachineFilter === 'idle' ? 'pri' : ''}`}
                                                onClick={() => setAssignMachineFilter('idle')}
                                                style={{ fontSize: '.8rem', padding: '4px 10px' }}
                                            >
                                                খালি / প্রস্তুত ({bn(idleMyMachinesCount)})
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn sm ${assignMachineFilter === 'assigned' ? 'pri' : ''}`}
                                                onClick={() => setAssignMachineFilter('assigned')}
                                                style={{ fontSize: '.8rem', padding: '4px 10px' }}
                                            >
                                                নির্বাচিত ({bn(selectedMachines.length)})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats Strip */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'var(--surface, #f8fafc)',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border, #e2e8f0)',
                                        marginBottom: '14px'
                                    }}>
                                        <span style={{ fontSize: '.83rem', color: 'var(--ink)' }}>
                                            মোট মেশিন: <b>{bn(allMyMachines.length)}</b>টি · সচল: <b>{bn(runningMyMachinesCount)}</b>টি · খালি: <b>{bn(idleMyMachinesCount)}</b>টি
                                        </span>
                                        <span className="pill p-acc" style={{ fontWeight: 700, fontSize: '.8rem' }}>
                                            নির্বাচিত: {bn(selectedMachines.length)}টি মেশিন
                                        </span>
                                    </div>

                                    {/* Machine Grid */}
                                    {(() => {
                                        const modalFilteredMachines = allMyMachines.filter(m => {
                                            if (assignMachineFilter === 'idle' && m.status !== 'idle') return false;
                                            if (assignMachineFilter === 'assigned' && !selectedMachines.includes(m.code)) return false;
                                            if (!assignMachineSearch.trim()) return true;
                                            const q = assignMachineSearch.toLowerCase().trim();
                                            return (
                                                m.code.toLowerCase().includes(q) ||
                                                m.type.toLowerCase().includes(q) ||
                                                m.dia.toLowerCase().includes(q) ||
                                                m.brand.toLowerCase().includes(q) ||
                                                (m.op && m.op.toLowerCase().includes(q))
                                            );
                                        });

                                        if (modalFilteredMachines.length === 0) {
                                            return (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '36px 16px',
                                                    background: 'var(--surface, #f8fafc)',
                                                    borderRadius: '8px',
                                                    border: '1px dashed var(--border, #cbd5e1)',
                                                    color: 'var(--muted)',
                                                    marginBottom: '16px'
                                                }}>
                                                    <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔍</div>
                                                    <b>কোনো মেশিন পাওয়া যায়নি</b>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: '.85rem' }}>
                                                        {assignMachineSearch ? `"${assignMachineSearch}" সার্চের সাথে মিল পাওয়া যায়নি।` : 'এই ফিল্টারে কোনো মেশিন নেই।'}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="btn sm"
                                                        style={{ marginTop: '10px' }}
                                                        onClick={() => {
                                                            setAssignMachineSearch('');
                                                            setAssignMachineFilter('all');
                                                        }}
                                                    >
                                                        ফিল্টার রিসেট করুন
                                                    </button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                                                gap: '12px',
                                                marginBottom: '16px'
                                            }}>
                                                {modalFilteredMachines.map(m => {
                                                    const isSelected = selectedMachines.includes(m.code);
                                                    const isCurrentOrder = m.assignedOrder === assignOrderId;
                                                    const isBusyOther = m.status === 'run' && !isCurrentOrder;
                                                    const busyO = isBusyOther ? (orders.find(o => o.id === m.assignedOrder) || vendorOrders.find(o => o.id === m.assignedOrder)) : null;

                                                    return (
                                                        <div
                                                            key={m.code}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setSelectedMachines(prev => prev.filter(c => c !== m.code));
                                                                } else {
                                                                    setSelectedMachines(prev => [...prev, m.code]);
                                                                }
                                                            }}
                                                            style={{
                                                                border: isSelected ? '2px solid var(--accent, #059669)' : '1px solid var(--border, #e2e8f0)',
                                                                background: isSelected ? '#ecfdf5' : '#fff',
                                                                borderRadius: '10px',
                                                                padding: '12px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s ease',
                                                                boxShadow: isSelected ? '0 3px 10px rgba(5, 150, 105, 0.18)' : 'none',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                                <div className="row" style={{ gap: '6px', alignItems: 'center' }}>
                                                                    <span style={{ fontSize: '.9rem' }}>⚙</span>
                                                                    <b style={{ fontSize: '1.05rem', color: isSelected ? 'var(--accent, #059669)' : 'var(--ink)' }}>
                                                                        {m.code}
                                                                    </b>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        accentColor: 'var(--accent, #059669)',
                                                                        width: '18px',
                                                                        height: '18px'
                                                                    }}
                                                                />
                                                            </div>

                                                            <div style={{ fontSize: '.8rem', color: 'var(--ink)', fontWeight: 500, marginBottom: '2px' }}>
                                                                {m.type}
                                                            </div>
                                                            <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginBottom: '6px' }}>
                                                                {m.dia} · {m.brand}
                                                            </div>

                                                            <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginBottom: '8px' }}>
                                                                ক্ষমতা: <b>{m.cph} kg/ঘণ্টা</b> (~{bn(Math.round(m.cph * 24))} kg/দিন)
                                                            </div>

                                                            <div>
                                                                {isCurrentOrder ? (
                                                                    <span className="pill p-acc" style={{ fontSize: '.7rem', padding: '1px 6px' }}>
                                                                        • এই অর্ডারে সচল
                                                                    </span>
                                                                ) : isBusyOther ? (
                                                                    <span className="pill" style={{ fontSize: '.7rem', padding: '1px 6px', background: '#fef3c7', color: '#92400e' }}>
                                                                        • অন্য অর্ডারে ব্যস্ত ({busyO?.title || busyO?.fabric || m.assignedOrder || 'রানিং'})
                                                                    </span>
                                                                ) : m.status === 'down' ? (
                                                                    <span className="pill" style={{ fontSize: '.7rem', padding: '1px 6px', background: '#fee2e2', color: '#b91c1c' }}>
                                                                        • মেরামত / ডাউন
                                                                    </span>
                                                                ) : (
                                                                    <span className="pill p-ok" style={{ fontSize: '.7rem', padding: '1px 6px' }}>
                                                                        • প্রস্তুত / খালি
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border, #e5e7eb)', paddingTop: '14px' }}>
                                    <div style={{ fontSize: '.88rem' }}>
                                        মোট নির্বাচিত: <b style={{ color: 'var(--accent)', fontSize: '1rem' }}>{bn(selectedMachines.length)}</b>টি মেশিন
                                        {selectedMachines.length > 0 && (
                                            <span style={{ color: 'var(--muted)', marginLeft: '8px', fontSize: '.82rem' }}>
                                                (সম্মিলিত ক্ষমতা: ~{bn(Math.round(allMyMachines.filter(m => selectedMachines.includes(m.code)).reduce((s, m) => s + m.cph * 24, 0)))} kg/দিন)
                                            </span>
                                        )}
                                    </div>
                                    <div className="row" style={{ gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setShowAssignModal(false)}
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="button"
                                            className="btn pri"
                                            onClick={handleAssignSubmit}
                                        >
                                            ✓ মেশিন বরাদ্দ সেভ করুন
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SCREEN: DETAIL */}
            {view === 'detail' && renderDetail(role === 'ven')}

            {/* SCREEN: SHIFT ENTRY */}
            {view === 'entry' && (() => {
                // Determine current shift options dynamically from factoryShifts or fallback to presets
                const currentShiftList = factoryShifts.filter(s => s.status === 'active').length > 0
                    ? factoryShifts.filter(s => s.status === 'active').map(s => ({
                        id: s.code,
                        name: s.name,
                        time: `${s.startTime} - ${s.endTime} (${bn(s.durationHours)} ঘণ্টা)`
                    }))
                    : (shiftMode === 1
                        ? [{ id: 'Day', name: 'ডে শিফট (Day)', time: 'সকাল ৮:০০ - বিকাল ৫:০০ (৯ ঘণ্টা)' }]
                        : shiftMode === 2
                        ? [
                            { id: 'A', name: 'শিফট A (ডে)', time: 'সকাল ৮:০০ - রাত ৮:০০ (১২ ঘণ্টা)' },
                            { id: 'B', name: 'শিফট B (নাইট)', time: 'রাত ৮:০০ - সকাল ৮:০০ (১২ ঘণ্টা)' }
                        ]
                        : [
                            { id: 'A', name: 'শিফট A (মর্নিং)', time: 'সকাল ৬:০০ - দুপুর ২:০০ (৮ ঘণ্টা)' },
                            { id: 'B', name: 'শিফট B (ইভনিং)', time: 'দুপুর ২:০০ - রাত ১০:০০ (৮ ঘণ্টা)' },
                            { id: 'C', name: 'শিফট C (নাইট)', time: 'রাত ১০:০০ - সকাল ৬:০০ (৮ ঘণ্টা)' }
                        ]);

                // Selected order for bulk entry
                const selectedBulkOrder = entryOrderId ? orders.find(o => o.id === entryOrderId) : null;
                const orderAssignedMachines = selectedBulkOrder?.machines && selectedBulkOrder.machines.length > 0
                    ? allMyMachines.filter(m => selectedBulkOrder.machines?.includes(m.code))
                    : [];

                // Active floor machines based on scope
                const activeFloorMachines = allMyMachines.filter(m => m.status === 'run');
                const displayFloorMachines = bulkMachineScope === 'assigned' && orderAssignedMachines.length > 0
                    ? orderAssignedMachines
                    : bulkMachineScope === 'run'
                    ? (activeFloorMachines.length > 0 ? activeFloorMachines : allMyMachines)
                    : allMyMachines;

                // Active running orders available for assignment
                const runningOrders = orders.filter(o => o.status === 'run');

                // Calculate bulk totals currently typed
                let currentBulkKgTotal = 0;
                let currentBulkRollsTotal = 0;
                let filledMachinesCount = 0;
                Object.values(bulkEntries).forEach(e => {
                    const k = parseFloat(e.kg) || 0;
                    const r = parseInt(e.rolls) || 0;
                    if (k > 0) {
                        currentBulkKgTotal += k;
                        currentBulkRollsTotal += r;
                        filledMachinesCount++;
                    }
                });

                // Today's total logged production
                const todayTotalKg = prodLog.filter(p => p.d === entryDate).reduce((a, b) => a + b.kg, 0);
                const todayTotalRolls = prodLog.filter(p => p.d === entryDate).reduce((a, b) => a + b.rolls, 0);
                const activeMachinesCount = activeFloorMachines.length > 0 ? activeFloorMachines.length : 1;
                const avgKgPerMachine = Math.round(todayTotalKg / activeMachinesCount);

                // Filtered history list
                const filteredHistory = prodLog.filter(p => {
                    if (historyShiftFilter !== 'all' && p.sh !== historyShiftFilter) return false;
                    return true;
                });

                return (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Header with Entry Mode Selector */}
                            <div className="head" style={{ marginBottom: 0 }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <span>🧵</span> দৈনিক প্রোডাকশন এন্ট্রি (Daily Shift Production)
                                    </h2>
                                    <p style={{ margin: '2px 0 0 0' }}>ফ্লোর বাল্ক শিট ও সিঙ্গেল মেশিন উৎপাদন হিসাব</p>
                                </div>

                                {/* Entry Mode Switcher (Single vs Bulk Floor Sheet) */}
                                <div style={{ background: 'var(--surface, #fff)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--muted)' }}>
                                        এন্ট্রি মোড:
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            type="button"
                                            className={`shift-mode-chip ${entryMode === 'single' ? 'active' : ''}`}
                                            onClick={() => setEntryMode('single')}
                                            style={{ fontSize: '.82rem', padding: '5px 12px', fontWeight: 700 }}
                                        >
                                            ⚡ সিঙ্গেল মেশিন এন্ট্রি
                                        </button>
                                        <button
                                            type="button"
                                            className={`shift-mode-chip ${entryMode === 'bulk' ? 'active' : ''}`}
                                            onClick={() => setEntryMode('bulk')}
                                            style={{ fontSize: '.82rem', padding: '5px 12px', fontWeight: 700 }}
                                        >
                                            📋 ফ্লোর শিট (বাল্ক এন্ট্রি)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Top Control Bar: Date, Order & Shift Selection */}
                            <div className="card" style={{ padding: '8px 12px', margin: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px 14px' }}>
                                    {/* Left: Date, Order & Active Shift Picker */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <label style={{ fontSize: '.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                            <span>📅 তারিখ:</span>
                                            <input
                                                type="text"
                                                className="prod-input"
                                                value={entryDate}
                                                onChange={e => setEntryDate(e.target.value)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '.85rem',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </label>

                                        {/* 2. Subcontract Order Picker (Only my orders taken by login factory) */}
                                        <label style={{ fontSize: '.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                            <span>📦 সাব-কন্ট্রাক্ট অর্ডার:</span>
                                            <select
                                                className="prod-input"
                                                value={entryOrderId}
                                                onChange={e => handleTopOrderChange(e.target.value)}
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '.85rem',
                                                    fontWeight: 600,
                                                    minWidth: '220px',
                                                    maxWidth: '380px',
                                                    borderColor: entryOrderId ? 'var(--accent, #059669)' : undefined,
                                                    background: entryOrderId ? '#f0fdf4' : undefined,
                                                    color: entryOrderId ? '#166534' : undefined
                                                }}
                                            >
                                                <option value="">-- সাব-কন্ট্রাক্ট অর্ডার নির্বাচন করুন --</option>
                                                {orders.map(o => (
                                                    <option key={o.id} value={o.id}>
                                                        {o.title || o.fabric} — {o.vendorName || vName(o.v)} ({o.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--muted)' }}>
                                                চলমান শিফট:
                                            </span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {currentShiftList.map(sh => (
                                                    <button
                                                        key={sh.id}
                                                        type="button"
                                                        onClick={() => setEntrySh(sh.id)}
                                                        className={`btn sm ${entrySh === sh.id ? 'pri' : ''}`}
                                                        style={{
                                                            padding: '5px 12px',
                                                            fontWeight: 700,
                                                            borderRadius: '6px',
                                                            fontSize: '.82rem'
                                                        }}
                                                    >
                                                        {sh.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Shift timing info & link to profile shifts */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="pill p-info" style={{ fontSize: '.78rem', fontWeight: 600, padding: '3px 8px' }}>
                                            🕒 শিফট সময়: {currentShiftList.find(s => s.id === entrySh)?.time || '—'}
                                        </span>
                                        <a
                                            href="/factory/profile"
                                            className="btn sm"
                                            style={{ fontSize: '.76rem', padding: '4px 8px', textDecoration: 'none', color: 'var(--muted)' }}
                                            title="কারখানার প্রোফাইলে শিফট ও কর্মঘণ্টা পরিবর্তন করুন"
                                        >
                                            ⚙️ শিফট সেটিংস
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* MODE 1: BULK FLOOR SHEET ENTRY */}
                            {entryMode === 'bulk' && (
                                <form className="card" onSubmit={handleSaveBulkEntry} style={{ padding: '12px 16px', margin: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📋</span> ফ্লোর বাল্ক শিট — {currentShiftList.find(s => s.id === entrySh)?.name || `শিফট ${entrySh}`} ({entryDate})
                                            </h3>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>
                                                শিফট শেষে ফ্লোরের মেশিনগুলোর উৎপাদিত ওজন ও রোল এক টেবিলে দ্রুত ইনপুট করুন
                                            </p>
                                        </div>

                                        {/* Action toolbar */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {/* Scope toggle: Assigned vs Running vs All */}
                                            <div style={{ background: 'var(--surface2, #f1f5f9)', padding: '2px', borderRadius: '6px', display: 'flex', gap: '2px' }}>
                                                {orderAssignedMachines.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className={`btn sm ${bulkMachineScope === 'assigned' ? 'pri' : ''}`}
                                                        onClick={() => setBulkMachineScope('assigned')}
                                                        style={{ fontSize: '.76rem', padding: '3px 8px' }}
                                                        title="শুধুমাত্র এই অর্ডারে বরাদ্দকৃত মেশিনসমূহ দেখান"
                                                    >
                                                        🎯 অর্ডারের মেশিন ({bn(orderAssignedMachines.length)})
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className={`btn sm ${bulkMachineScope === 'run' ? 'pri' : ''}`}
                                                    onClick={() => setBulkMachineScope('run')}
                                                    style={{ fontSize: '.76rem', padding: '3px 8px' }}
                                                >
                                                    চলমান ({bn(activeFloorMachines.length)})
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn sm ${bulkMachineScope === 'all' ? 'pri' : ''}`}
                                                    onClick={() => setBulkMachineScope('all')}
                                                    style={{ fontSize: '.76rem', padding: '3px 8px' }}
                                                >
                                                    সব মেশিন ({bn(allMyMachines.length)})
                                                </button>
                                            </div>

                                        <button
                                            type="button"
                                            className="btn sm"
                                            onClick={handleAutofillBulkOperators}
                                            style={{ fontSize: '.78rem', padding: '4px 10px' }}
                                            title="মেশিন অনুযায়ী ডিফল্ট অপারেটর নাম স্বয়ংক্রিয় পূরণ করুন"
                                        >
                                            👤 অপারেটর অটো-ফিল
                                        </button>

                                        <button
                                            type="button"
                                            className="btn sm"
                                            onClick={() => setBulkEntries({})}
                                            style={{ fontSize: '.78rem', padding: '4px 10px', color: 'var(--muted)' }}
                                            title="সব ইনপুট ক্লিয়ার করুন"
                                        >
                                            ✕ ক্লিয়ার
                                        </button>

                                        <span className="pill p-acc" style={{ fontSize: '.82rem', fontWeight: 700, padding: '4px 10px' }}>
                                            ইনপুট: {bn(filledMachinesCount)}টি মেশিন | {bn(currentBulkKgTotal)} kg ({bn(currentBulkRollsTotal)} রোল)
                                        </span>
                                    </div>
                                </div>

                                {/* Selected Order Highlights Banner */}
                                {selectedBulkOrder && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '10px',
                                        padding: '12px 16px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span className="pill p-ok" style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 8px' }}>
                                                    ✓ নির্বাচিত অর্ডার
                                                </span>
                                                <b style={{ fontSize: '1.05rem', color: '#166534' }}>
                                                    {selectedBulkOrder.title || selectedBulkOrder.fabric}
                                                </b>
                                                <span style={{ fontSize: '.84rem', color: '#15803d', fontWeight: 600 }}>
                                                    ({selectedBulkOrder.id})
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '.82rem', color: '#166534', marginTop: '6px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span>🏢 বায়ার: <b>{selectedBulkOrder.vendorName || vName(selectedBulkOrder.v)}</b></span>
                                                <span>🧵 ফেব্রিক: <b>{selectedBulkOrder.fabric} {selectedBulkOrder.gsm ? `(${selectedBulkOrder.gsm} GSM)` : ''}</b></span>
                                                <span>🎯 লক্ষ্য: <b>{bn(selectedBulkOrder.qty)} kg</b></span>
                                                <span>✓ সম্পন্ন: <b>{bn(selectedBulkOrder.done)} kg ({pct(selectedBulkOrder)}%)</b></span>
                                                <span>📦 সুতার লট: <b>{selectedBulkOrder.yarnIn?.[0]?.lot || '—'}</b></span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn sm"
                                                onClick={() => handleOpenAssignModal(selectedBulkOrder.id)}
                                                style={{ background: '#fff', borderColor: '#86efac', color: '#15803d', fontSize: '.78rem', fontWeight: 600 }}
                                                title="মেশিন বরাদ্দ দেখতে বা পরিবর্তন করতে ক্লিক করুন"
                                            >
                                                ⚙️ মেশিন বরাদ্দ ({selectedBulkOrder.machines?.length || 0}টি)
                                            </button>
                                            <button
                                                type="button"
                                                className="btn sm"
                                                onClick={() => setEntryOrderId('')}
                                                style={{ background: '#fff', border: '1px solid #cbd5e1', color: 'var(--muted)', fontSize: '.78rem' }}
                                                title="অন্য অর্ডার নির্বাচন করতে এটি ক্লিয়ার করুন"
                                            >
                                                ✕ পরিবর্তন
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="tw" style={{ border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table>
                                        <thead>
                                            <tr style={{ background: 'var(--surface2, #f8fafc)' }}>
                                                <th style={{ width: '95px' }}>মেশিন নং</th>
                                                <th style={{ minWidth: '180px' }}>অর্ডার ও বায়ার</th>
                                                <th style={{ minWidth: '160px' }}>লট</th>
                                                <th style={{ width: '130px' }}>অপারেটর</th>
                                                <th style={{ width: '130px' }}>উৎপাদন (kg) *</th>
                                                <th style={{ width: '95px' }}>রোল নাম্বার</th>
                                                <th style={{ width: '135px' }}>কোয়ালিটি / ফল্ট</th>
                                                <th style={{ minWidth: '120px' }}>মন্তব্য</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayFloorMachines.map(m => {
                                                const mState = bulkEntries[m.code] || { kg: '', rolls: '', op: m.op !== '—' ? m.op : '', lot: '', issue: 'না', orderId: '', remarks: '' };
                                                const defaultAssignedO = orders.find(o => o.machines?.includes(m.code)) || orders.find(o => o.status === 'run') || orders[0];
                                                const activeO = (mState.orderId ? orders.find(o => o.id === mState.orderId) : null) || defaultAssignedO;
                                                const isFilled = parseFloat(mState.kg) > 0;

                                                return (
                                                    <tr key={m.code} style={{ background: isFilled ? '#f0fdf4' : 'inherit', transition: 'background 0.15s ease' }}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="pill p-acc" style={{ fontWeight: 700, fontSize: '.8rem', padding: '2px 8px' }}>
                                                                    ⚙ {m.code}
                                                                </span>
                                                            </div>
                                                            <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '2px' }}>
                                                                {m.type}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {runningOrders.length > 0 ? (
                                                                <select
                                                                    className="prod-input"
                                                                    value={activeO?.id || ''}
                                                                    onChange={e => handleBulkEntryChange(m.code, 'orderId', e.target.value)}
                                                                    style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', fontSize: '.82rem', fontWeight: 600 }}
                                                                >
                                                                    {runningOrders.map(ro => (
                                                                        <option key={ro.id} value={ro.id}>
                                                                            {ro.title || ro.fabric} — {ro.vendorName || vName(ro.v)} ({ro.id})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : activeO ? (
                                                                <>
                                                                    <b style={{ color: 'var(--accent)', fontSize: '.88rem' }}>{activeO.title || activeO.fabric}</b>
                                                                    <div style={{ fontSize: '.78rem', color: 'var(--ink)' }}>
                                                                        {activeO.vendorName || vName(activeO.v)}
                                                                        <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '4px' }}>({activeO.id})</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <span className="small muted">অর্ডার বরাদ্দ নেই</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {activeO ? (
                                                                <input
                                                                    type="text"
                                                                    className="prod-input"
                                                                    placeholder={activeO.yarnIn?.[0]?.lot ? `লট: ${activeO.yarnIn[0].lot}` : 'সুতার লট (ঐচ্ছিক)'}
                                                                    value={mState.lot}
                                                                    onChange={e => handleBulkEntryChange(m.code, 'lot', e.target.value)}
                                                                    style={{ width: '100%', padding: '6px 8px', fontSize: '.82rem', marginTop: '4px', borderRadius: '4px' }}
                                                                    title="সুতার লট নম্বর ইনপুট বা পরিবর্তন করুন"
                                                                />
                                                            ) : (
                                                                <span className="small muted">—</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="prod-input"
                                                                placeholder={m.op !== '—' ? m.op : 'অপারেটর'}
                                                                value={mState.op}
                                                                onChange={e => handleBulkEntryChange(m.code, 'op', e.target.value)}
                                                                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '.82rem' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                className="prod-input prod-input-num"
                                                                placeholder=""
                                                                value={mState.kg}
                                                                onChange={e => handleBulkEntryChange(m.code, 'kg', e.target.value)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '6px 8px',
                                                                    borderRadius: '6px',
                                                                    border: isFilled ? '2px solid var(--accent, #0E6B66)' : undefined,
                                                                    fontSize: '.92rem',
                                                                    background: isFilled ? '#ffffff' : undefined
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="prod-input prod-input-num"
                                                                placeholder=""
                                                                value={mState.rolls}
                                                                onChange={e => handleBulkEntryChange(m.code, 'rolls', e.target.value)}
                                                                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '.85rem' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="prod-input"
                                                                value={mState.issue}
                                                                onChange={e => handleBulkEntryChange(m.code, 'issue', e.target.value)}
                                                                style={{ width: '100%', padding: '6px 6px', borderRadius: '6px', fontSize: '.8rem' }}
                                                            >
                                                                <option value="না">ঠিক আছে (OK)</option>
                                                                <option value="Hole">Hole (ছিদ্র)</option>
                                                                <option value="Needle mark">Needle mark (দাগ)</option>
                                                                <option value="Barre">Barre (ব্যারে)</option>
                                                                <option value="Oil spot">Oil spot (তেল দাগ)</option>
                                                                <option value="Lycra out">Lycra out</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="prod-input"
                                                                placeholder="মন্তব্য (ঐচ্ছিক)"
                                                                value={mState.remarks || ''}
                                                                onChange={e => handleBulkEntryChange(m.code, 'remarks', e.target.value)}
                                                                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '.82rem' }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Save Strip */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border, #e2e8f0)', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ fontSize: '.9rem' }}>
                                        এই শিফটে মোট এন্ট্রি: <b style={{ color: 'var(--accent)', fontSize: '1.15rem' }}>{bn(currentBulkKgTotal)} kg</b>
                                        <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>
                                            ({bn(currentBulkRollsTotal)} রোল · {bn(filledMachinesCount)}টি মেশিন)
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={() => setBulkEntries({})}
                                        >
                                            রিসেট
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn pri"
                                            style={{ fontSize: '.82rem', padding: '5px 14px', fontWeight: 600 }}
                                        >
                                            ✓ {currentShiftList.find(s => s.id === entrySh)?.name || `শিফট ${entrySh}`} এর সমস্ত এন্ট্রি সেভ করুন
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* MODE 2: SINGLE MACHINE ENTRY */}
                        {entryMode === 'single' && (() => {
                            const singleSelectedMachine = allMyMachines.find(m => m.code === entryM) || allMyMachines[0];
                            const singleActiveOrder = (entryOrderId ? (orders.find(o => o.id === entryOrderId) || vendorOrders.find(o => o.id === entryOrderId)) : null)
                                || (entryM ? (orders.find(o => o.machines?.includes(entryM)) || vendorOrders.find(o => o.machines?.includes(entryM))) : null)
                                || orders.find(o => o.status === 'run')
                                || vendorOrders.find(o => o.status === 'run')
                                || orders[0]
                                || vendorOrders[0];
                            const isFilled = parseFloat(entryKg) > 0;

                            return (
                                <form className="card" onSubmit={handleSaveEntry} style={{ padding: '12px 16px', margin: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>⚡</span> সিঙ্গেল মেশিন প্রোডাকশন এন্ট্রি — {currentShiftList.find(s => s.id === entrySh)?.name || `শিফট ${entrySh}`} ({entryDate})
                                            </h3>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>
                                                একটি নির্দিষ্ট মেশিনের উৎপাদিত কাপড়ের সঠিক ওজন ও বিস্তারিত ইনপুট করুন
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="pill p-acc" style={{ fontSize: '.82rem', fontWeight: 700, padding: '4px 10px' }}>
                                                চলমান শিফট: {currentShiftList.find(s => s.id === entrySh)?.name || `শিফট ${entrySh}`} ({entryDate})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Selected Order Highlights Banner (Same as Floor Sheet / Bulk Entry) */}
                                    {singleActiveOrder && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                            border: '1px solid #bbf7d0',
                                            borderRadius: '10px',
                                            padding: '12px 16px',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '12px'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span className="pill p-ok" style={{ fontSize: '.75rem', fontWeight: 700, padding: '2px 8px' }}>
                                                        ✓ নির্বাচিত অর্ডার
                                                    </span>
                                                    <b style={{ fontSize: '1.05rem', color: '#166534' }}>
                                                        {singleActiveOrder.title || singleActiveOrder.fabric}
                                                    </b>
                                                    <span style={{ fontSize: '.84rem', color: '#15803d', fontWeight: 600 }}>
                                                        ({singleActiveOrder.id})
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '.82rem', color: '#166534', marginTop: '6px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <span>🏢 বায়ার: <b>{singleActiveOrder.vendorName || vName(singleActiveOrder.v)}</b></span>
                                                    <span>🧵 ফেব্রিক: <b>{singleActiveOrder.fabric} {singleActiveOrder.gsm ? `(${singleActiveOrder.gsm} GSM)` : ''}</b></span>
                                                    <span>🎯 লক্ষ্য: <b>{bn(singleActiveOrder.qty)} kg</b></span>
                                                    <span>✓ সম্পন্ন: <b>{bn(singleActiveOrder.done)} kg ({pct(singleActiveOrder)}%)</b></span>
                                                    <span>📦 সুতার লট: <b>{singleActiveOrder.yarnIn?.[0]?.lot || '—'}</b></span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="btn sm"
                                                    onClick={() => handleOpenAssignModal(singleActiveOrder.id)}
                                                    style={{ background: '#fff', borderColor: '#86efac', color: '#15803d', fontSize: '.78rem', fontWeight: 600 }}
                                                    title="মেশিন বরাদ্দ দেখতে বা পরিবর্তন করতে ক্লিক করুন"
                                                >
                                                    ⚙️ মেশিন বরাদ্দ ({singleActiveOrder.machines?.length || 0}টি)
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn sm"
                                                    onClick={() => handleSingleOrderChange('')}
                                                    style={{ background: '#fff', border: '1px solid #cbd5e1', color: 'var(--muted)', fontSize: '.78rem' }}
                                                    title="অন্য অর্ডার নির্বাচন করতে এটি ক্লিয়ার করুন"
                                                >
                                                    ✕ পরিবর্তন
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                        {/* 1. মেশিন নির্বাচন */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>মেশিন নং *</span>
                                            <select
                                                className="prod-input"
                                                value={entryM}
                                                onChange={e => handleSingleMachineChange(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem', fontWeight: 600 }}
                                            >
                                                <option value="">-- মেশিন নির্বাচন করুন --</option>
                                                {allMyMachines.map(m => (
                                                    <option key={m.code} value={m.code}>
                                                        ⚙ {m.code} — {m.type} {m.status === 'run' ? '(চলমান)' : `(${m.status === 'wait' ? 'অপেক্ষমাণ' : m.status === 'down' ? 'ত্রুটি' : 'বন্ধ'})`}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        {/* 2. অর্ডার ও বায়ার */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>অর্ডার ও বায়ার *</span>
                                            <select
                                                className="prod-input"
                                                value={singleActiveOrder?.id || ''}
                                                onChange={e => handleSingleOrderChange(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem', fontWeight: 600 }}
                                            >
                                                <option value="">-- অর্ডার নির্বাচন করুন --</option>
                                                {runningOrders.length > 0 ? (
                                                    runningOrders.map(ro => (
                                                        <option key={ro.id} value={ro.id}>
                                                            {ro.title || ro.fabric} — {ro.vendorName || vName(ro.v)} ({ro.id})
                                                        </option>
                                                    ))
                                                ) : (
                                                    orders.map(o => (
                                                        <option key={o.id} value={o.id}>
                                                            {o.title || o.fabric} — {o.vendorName || vName(o.v)} ({o.id})
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </label>

                                        {/* 4. সুতার লট নাম্বার */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>সুতার লট (Yarn Lot)</span>
                                            <input
                                                type="text"
                                                className="prod-input"
                                                placeholder={singleActiveOrder?.yarnIn?.[0]?.lot || 'যেমন: SQ-88412'}
                                                value={entryLot}
                                                onChange={e => setEntryLot(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem' }}
                                            />
                                        </label>

                                        {/* 5. অপারেটর */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>অপারেটর</span>
                                            <input
                                                type="text"
                                                className="prod-input"
                                                placeholder={singleSelectedMachine?.op && singleSelectedMachine.op !== '—' ? singleSelectedMachine.op : 'অপারেটর'}
                                                value={entryOp}
                                                onChange={e => setEntryOp(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem' }}
                                            />
                                        </label>

                                        {/* 6. উৎপাদন (kg) * */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>উৎপাদন (kg) *</span>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                className="prod-input prod-input-num"
                                                placeholder="যেমন: ১৮০"
                                                value={entryKg}
                                                onChange={e => setEntryKg(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '7px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '.95rem',
                                                    fontWeight: 700,
                                                    border: isFilled ? '2px solid var(--accent, #0E6B66)' : undefined,
                                                    background: isFilled ? '#ffffff' : undefined
                                                }}
                                            />
                                        </label>

                                        {/* 7. রোল সংখ্যা */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>রোল নাম্বার</span>
                                            <input
                                                type="number"
                                                className="prod-input prod-input-num"
                                                placeholder="যেমন: ৮"
                                                value={entryR}
                                                onChange={e => setEntryR(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem' }}
                                            />
                                        </label>

                                        {/* 8. কোয়ালিটি / ফল্ট (বাল্ক এন্ট্রির সাথে সম্পূর্ণ অভিন্ন) */}
                                        <label className="f" style={{ margin: 0 }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>কোয়ালিটি / ফল্ট</span>
                                            <select
                                                className="prod-input"
                                                value={entryIss}
                                                onChange={e => setEntryIss(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem' }}
                                            >
                                                <option value="না">ঠিক আছে (OK)</option>
                                                <option value="Hole">Hole (ছিদ্র)</option>
                                                <option value="Needle mark">Needle mark (দাগ)</option>
                                                <option value="Barre">Barre (ব্যারে)</option>
                                                <option value="Oil spot">Oil spot (তেল দাগ)</option>
                                                <option value="Lycra out">Lycra out</option>
                                            </select>
                                        </label>

                                        {/* 9. মন্তব্য */}
                                        <label className="f" style={{ margin: 0, gridColumn: '1 / -1' }}>
                                            <span style={{ fontWeight: 600, fontSize: '.84rem' }}>মন্তব্য</span>
                                            <input
                                                type="text"
                                                className="prod-input"
                                                placeholder="মন্তব্য (ঐচ্ছিক)"
                                                value={entryRemarks}
                                                onChange={e => setEntryRemarks(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', fontSize: '.88rem' }}
                                            />
                                        </label>
                                    </div>

                                    {/* Save Strip: exactly like Bulk Entry */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border, #e2e8f0)', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ fontSize: '.9rem' }}>
                                            {isFilled ? (
                                                <span>
                                                    নির্বাচিত এন্ট্রি: <b style={{ color: 'var(--accent)', fontSize: '1.15rem' }}>{bn(parseFloat(entryKg))} kg</b>
                                                    {entryR && <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>({bn(parseInt(entryR))} রোল)</span>}
                                                    {entryM && <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>· মেশিন {entryM}</span>}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--muted)' }}>মেশিন ও উৎপাদনের সঠিক ওজন (kg) লিখুন</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => {
                                                    setEntryKg('');
                                                    setEntryR('');
                                                    setEntryRemarks('');
                                                }}
                                            >
                                                রিসেট
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn pri"
                                                style={{ padding: '8px 22px', fontSize: '.95rem', fontWeight: 700 }}
                                            >
                                                ✓ {currentShiftList.find(s => s.id === entrySh)?.name || `শিফট ${entrySh}`} এর এন্ট্রি সেভ করুন
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            );
                        })()}
                    </div>

                    {/* KPI METRIC CARDS */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--accent, #0E6B66)' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>আজকের মোট উৎপাদন</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                                    {bn(todayTotalKg)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    শিফটভিত্তিক মোট হিসাব
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>মোট রোল নাম্বার</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>
                                    {bn(todayTotalRolls)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>টি রোল</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    ফ্লোর থেকে প্রাপ্ত রোল
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>চলমান মেশিন</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                                    {bn(activeFloorMachines.length)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>টি</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    ফ্লোরে সক্রিয়ভাবে রানিং
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>গড় আউটপুট / মেশিন</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                                    {bn(avgKgPerMachine)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    মেশিনপ্রতি গড় উৎপাদন
                                </div>
                            </div>
                        </div>

                        {/* SHIFT SUMMARY & TODAY'S LOGS */}
                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>আজকের এন্ট্রি ও শিফটভিত্তিক হিসাব</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '.84rem', color: 'var(--muted)' }}>
                                        লগ থেকে যেকোনো ভুলের ক্ষেত্রে সরাসরি মুছে দিলে অর্ডারের প্রগ্রেস স্বয়ংক্রিয় অ্যাডজাস্ট হবে
                                    </p>
                                </div>

                                {/* Shift filter pills for table */}
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className={`btn sm ${historyShiftFilter === 'all' ? 'pri' : ''}`}
                                        onClick={() => setHistoryShiftFilter('all')}
                                        style={{ fontSize: '.78rem', padding: '3px 10px' }}
                                    >
                                        সব শিফট ({bn(prodLog.length)})
                                    </button>
                                    {currentShiftList.map(sh => {
                                        const count = prodLog.filter(p => p.sh === sh.id).length;
                                        return (
                                            <button
                                                key={sh.id}
                                                type="button"
                                                className={`btn sm ${historyShiftFilter === sh.id ? 'pri' : ''}`}
                                                onClick={() => setHistoryShiftFilter(sh.id)}
                                                style={{ fontSize: '.78rem', padding: '3px 10px' }}
                                            >
                                                {sh.name} ({bn(count)})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="tw">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>তারিখ</th>
                                            <th>শিফট</th>
                                            <th>মেশিন</th>
                                            <th>অর্ডার ও বায়ার</th>
                                            <th className="n">প্রোডাকশন(kg)</th>
                                            <th className="n">রোল নাম্বার</th>
                                            <th>লট নং</th>
                                            <th>অপারেটর</th>
                                            <th>সমস্যা / স্ট্যাটাস</th>
                                            <th style={{ minWidth: '110px' }}>মন্তব্য</th>
                                            <th style={{ width: '60px' }}>অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                                    এই শিফটে এখনো কোনো এন্ট্রি করা হয়নি।
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredHistory.map((p, idx) => {
                                                const relatedO = orders.find(o => o.id === p.o) || vendorOrders.find(o => o.id === p.o);
                                                return (
                                                    <tr key={idx}>
                                                        <td className="small">{p.d}</td>
                                                        <td>
                                                            <span className="pill p-acc" style={{ fontSize: '.75rem', padding: '2px 8px' }}>
                                                                শিফট {p.sh}
                                                            </span>
                                                        </td>
                                                        <td className="mono" style={{ fontWeight: 700 }}>{p.m}</td>
                                                        <td>
                                                            <b style={{ color: 'var(--accent)', fontSize: '.88rem' }}>
                                                                {relatedO?.title || p.order_title || relatedO?.fabric || p.o}
                                                            </b>
                                                            <div className="small muted">
                                                                {relatedO?.vendorName || (relatedO ? vName(relatedO.v) : '—')}
                                                                <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '4px' }}>({p.o})</span>
                                                            </div>
                                                        </td>
                                                        <td className="n" style={{ fontWeight: 700, color: 'var(--ok)' }}>
                                                            {bn(p.kg)}
                                                        </td>
                                                        <td className="n">{bn(p.rolls)}</td>
                                                        <td className="mono small">{p.lot || '—'}</td>
                                                        <td>{p.op}</td>
                                                        <td>
                                                            {p.issue && p.issue !== 'না' ? (
                                                                <span className="pill" style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '.72rem', padding: '1px 6px' }}>
                                                                    ⚠️ {p.issue}
                                                                </span>
                                                            ) : (
                                                                <span className="pill p-ok" style={{ fontSize: '.72rem', padding: '1px 6px' }}>
                                                                    ✓ ঠিক আছে
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="small muted" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.notes || p.remarks || ''}>
                                                            {p.notes || p.remarks || '—'}
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn sm"
                                                                onClick={() => handleDeleteProdLog(idx)}
                                                                title="মুছে ফেলুন"
                                                                style={{ padding: '2px 6px', color: '#dc2626' }}
                                                            >
                                                                ✕
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                );
            })()}

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

                                        {isRun && m.assignedOrder && (() => {
                                            const assignedO = orders.find(o => o.id === m.assignedOrder) || vendorOrders.find(o => o.id === m.assignedOrder);
                                            return (
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
                                                    <b style={{ color: 'var(--accent)' }}>{assignedO?.title || assignedO?.fabric || m.assignedOrder}</b>
                                                    <div className="small muted">
                                                        {assignedO && <span>বায়ার: {assignedO.vendorName || vName(assignedO.v)} · </span>}
                                                        অপারেটর: {m.op} ({m.sh})
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {isWait && (() => {
                                            const assignedO = orders.find(o => o.id === m.assignedOrder) || vendorOrders.find(o => o.id === m.assignedOrder);
                                            const orderTitle = assignedO?.title || assignedO?.fabric || m.assignedOrder;
                                            return (
                                                <div style={{ background: 'var(--yarn-soft)', color: 'var(--yarn)', padding: '6px 10px', borderRadius: '6px', fontSize: '.83rem' }}>
                                                    {orderTitle ? <b>{orderTitle}</b> : <b>অর্ডার</b>} এর সুতা গ্রহণের অপেক্ষায়
                                                </div>
                                            );
                                        })()}

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

            {/* SCREEN: SHIFTS (Factory Shift Management) */}
            {view === 'shifts' && (() => {
                const activeShiftsCount = factoryShifts.filter(s => s.status === 'active').length;
                const totalHoursCoverage = factoryShifts.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.durationHours || 0), 0);
                const totalTargetOutputKg = factoryShifts.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.targetOutputKg || 0), 0);

                return (
                    <>
                        <div className="head">
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⏱️</span> আমার শিফট ব্যবস্থাপনা (Factory Shifts)
                                </h2>
                                <p>
                                    কারখানা: <b>{factoryDisplayName}</b> · আপনার ফ্যাক্টরির শিফট শিডিউল, কার্যঘণ্টা ও ফ্লোর ইনচার্জ পরিচালনা করুন
                                </p>
                            </div>
                            <div className="row" style={{ gap: '8px' }}>
                                <button
                                    type="button"
                                    className="btn pri"
                                    onClick={handleOpenAddShift}
                                >
                                    + নতুন শিফট যোগ করুন
                                </button>
                                <Link
                                    href="/knitkhata/production-entry"
                                    className="btn"
                                    style={{ textDecoration: 'none' }}
                                >
                                    দৈনিক প্রোডাকশন এন্ট্রি
                                </Link>
                            </div>
                        </div>

                        {/* STANDARD PRESET TEMPLATES BAR */}
                        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'var(--surface2, #f8fafc)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <b style={{ fontSize: '.9rem' }}>কারখানা অনুযায়ী স্ট্যান্ডার্ড শিফট প্রিসেট:</b>
                                    <p className="small muted" style={{ margin: '2px 0 0 0' }}>
                                        এক ক্লিকে আপনার কারখানার শিফট কাঠামো প্রস্তুত করুন (পরে প্রয়োজনমতো এডিট বা ডিলিট করতে পারবেন)
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className={`btn sm ${factoryShifts.length === 1 ? 'pri' : ''}`}
                                        onClick={() => handleApplyShiftPreset(1)}
                                    >
                                        ⚡ ১টি শিফট প্রিসেট (Day 9h)
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn sm ${factoryShifts.length === 2 ? 'pri' : ''}`}
                                        onClick={() => handleApplyShiftPreset(2)}
                                    >
                                        ⚡ ২টি শিফট প্রিসেট (Day/Night 12h)
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn sm ${factoryShifts.length === 3 ? 'pri' : ''}`}
                                        onClick={() => handleApplyShiftPreset(3)}
                                    >
                                        ⚡ ৩টি শিফট প্রিসেট (8h Rotation)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* KPIS SUMMARY */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--accent, #0E6B66)' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>মোট শিফট সংখ্যা</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                                    {bn(factoryShifts.length)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>টি</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    নিবন্ধিত শিফট কাঠামো
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>সক্রিয় শিফট</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                                    {bn(activeShiftsCount)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>টি</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    বর্তমানে উৎপাদনে কার্যকর
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>দৈনিক ফ্লোর কভারেজ</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>
                                    {bn(totalHoursCoverage)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>ঘণ্টা</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    ২৪ ঘণ্টার মধ্যে কভার
                                </div>
                            </div>
                            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                                <div style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 600 }}>শিফট দৈনিক লক্ষ্যমাত্রা</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                                    {bn(totalTargetOutputKg)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    সকল সক্রিয় শিফট মিলিয়ে
                                </div>
                            </div>
                        </div>

                        {/* SHIFTS TABLE CARD */}
                        <div className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>কারখানার কার্যকর শিফট তালিকা</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '.84rem', color: 'var(--muted)' }}>
                                        এখানে নির্ধারিত শিফটগুলো সরাসরি দৈনিক প্রোডাকশন এন্ট্রি এবং ফ্লোর বাল্ক শিটে ব্যবহৃত হবে
                                    </p>
                                </div>
                                <span className="pill p-ok">
                                    মোট সক্রিয়: {bn(activeShiftsCount)}টি শিফট
                                </span>
                            </div>

                            <div className="tw" style={{ border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', overflow: 'hidden' }}>
                                <table>
                                    <thead>
                                        <tr style={{ background: 'var(--surface2, #f8fafc)' }}>
                                            <th style={{ width: '100px' }}>শিফট কোড</th>
                                            <th style={{ minWidth: '180px' }}>শিফটের নাম</th>
                                            <th style={{ minWidth: '160px' }}>সময়সূচী (শুরু — শেষ)</th>
                                            <th style={{ width: '110px' }} className="n">সময়কাল</th>
                                            <th style={{ minWidth: '160px' }}>ফ্লোর ইনচার্জ / সুপারভাইজার</th>
                                            <th style={{ width: '130px' }} className="n">টার্গেট আউটপুট</th>
                                            <th style={{ width: '100px' }}>অবস্থা</th>
                                            <th style={{ width: '130px' }}>অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {factoryShifts.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: 'var(--muted)' }}>
                                                    এখনো কোনো শিফট কনফিগার করা হয়নি। উপরের প্রিসেট থেকে অথবা "+ নতুন শিফট যোগ করুন" বাটনে ক্লিক করুন।
                                                </td>
                                            </tr>
                                        ) : (
                                            factoryShifts.map(s => {
                                                const isActive = s.status === 'active';
                                                return (
                                                    <tr key={s.id} style={{ opacity: isActive ? 1 : 0.65 }}>
                                                        <td>
                                                            <span className="pill p-acc" style={{ fontWeight: 700, fontSize: '.85rem', padding: '3px 10px' }}>
                                                                শিফট {s.code}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <b style={{ color: 'var(--accent)', fontSize: '.92rem' }}>{s.name}</b>
                                                            {s.notes && (
                                                                <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: '2px' }}>
                                                                    {s.notes}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '.88rem' }}>
                                                                <span>⏰ {s.startTime}</span>
                                                                <span style={{ color: 'var(--muted)' }}>—</span>
                                                                <span>{s.endTime}</span>
                                                            </div>
                                                        </td>
                                                        <td className="n" style={{ fontWeight: 700 }}>
                                                            {bn(s.durationHours)} ঘণ্টা
                                                        </td>
                                                        <td>
                                                            {s.inCharge ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span>👤</span>
                                                                    <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{s.inCharge}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="small muted">অ্যাসাইন করা নেই</span>
                                                            )}
                                                        </td>
                                                        <td className="n" style={{ fontWeight: 700, color: 'var(--ok)' }}>
                                                            {s.targetOutputKg ? `${bn(s.targetOutputKg)} kg` : '—'}
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className={`switch ${isActive ? 'on' : ''}`}
                                                                onClick={() => handleToggleShiftStatus(s.id)}
                                                                aria-label={`${s.name} সক্রিয়/নিষ্ক্রিয়`}
                                                                title={isActive ? 'সক্রিয় (ক্লিক করে বন্ধ করুন)' : 'নিষ্ক্রিয় (ক্লিক করে চালু করুন)'}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn sm"
                                                                    onClick={() => handleOpenEditShift(s)}
                                                                    style={{ padding: '3px 8px', fontSize: '.78rem' }}
                                                                    title="শিফট সম্পাদন করুন"
                                                                >
                                                                    ✏️ এডিট
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn sm"
                                                                    onClick={() => handleDeleteShift(s.id, s.name)}
                                                                    style={{ padding: '3px 8px', fontSize: '.78rem', color: '#dc2626' }}
                                                                    title="শিফট মুছে ফেলুন"
                                                                >
                                                                    🗑️
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
                        </div>

                        {/* MODAL: ADD / EDIT SHIFT */}
                        {showShiftModal && (
                            <div
                                className="modal-backdrop"
                                onClick={() => setShowShiftModal(false)}
                            >
                                <div
                                    className="modal-box"
                                    onClick={e => e.stopPropagation()}
                                    style={{ maxWidth: '520px' }}
                                >
                                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>⏱️</span> {editingShiftId ? 'শিফট সম্পাদনা করুন' : 'নতুন শিফট যোগ করুন'}
                                        </h3>
                                        <button
                                            type="button"
                                            className="btn sm"
                                            onClick={() => setShowShiftModal(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <form onSubmit={handleSaveShiftModal}>
                                        <div className="grid g2" style={{ gap: '12px' }}>
                                            <label className="f">
                                                শিফটের নাম *
                                                <input
                                                    className="prod-input"
                                                    required
                                                    placeholder="যেমন: শিফট A (ডে)"
                                                    value={shiftFormName}
                                                    onChange={e => setShiftFormName(e.target.value)}
                                                />
                                            </label>

                                            <label className="f">
                                                শিফট কোড / ট্যাগ *
                                                <input
                                                    className="prod-input"
                                                    required
                                                    placeholder="যেমন: A, B, C বা Day"
                                                    value={shiftFormCode}
                                                    onChange={e => setShiftFormCode(e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="grid g3" style={{ gap: '10px', marginTop: '10px' }}>
                                            <label className="f">
                                                শুরুর সময় *
                                                <input
                                                    type="time"
                                                    className="prod-input"
                                                    required
                                                    value={shiftFormStart}
                                                    onChange={e => setShiftFormStart(e.target.value)}
                                                />
                                            </label>

                                            <label className="f">
                                                শেষের সময় *
                                                <input
                                                    type="time"
                                                    className="prod-input"
                                                    required
                                                    value={shiftFormEnd}
                                                    onChange={e => setShiftFormEnd(e.target.value)}
                                                />
                                            </label>

                                            <label className="f">
                                                মোট সময় (ঘণ্টা) *
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    className="prod-input prod-input-num"
                                                    required
                                                    value={shiftFormDuration}
                                                    onChange={e => setShiftFormDuration(e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="grid g2" style={{ gap: '12px', marginTop: '10px' }}>
                                            <label className="f">
                                                ফ্লোর ইনচার্জ / সুপারভাইজার
                                                <input
                                                    className="prod-input"
                                                    placeholder="যেমন: মো. রফিকুল ইসলাম"
                                                    value={shiftFormInCharge}
                                                    onChange={e => setShiftFormInCharge(e.target.value)}
                                                />
                                            </label>

                                            <label className="f">
                                                শিফট আউটপুট টার্গেট (kg)
                                                <input
                                                    type="number"
                                                    className="prod-input prod-input-num"
                                                    placeholder="যেমন: ১৪০০"
                                                    value={shiftFormTargetKg}
                                                    onChange={e => setShiftFormTargetKg(e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="grid g2" style={{ gap: '12px', marginTop: '10px' }}>
                                            <label className="f">
                                                শিফটের অবস্থা
                                                <select
                                                    className="prod-input"
                                                    value={shiftFormStatus}
                                                    onChange={e => setShiftFormStatus(e.target.value as any)}
                                                >
                                                    <option value="active">সক্রিয় (Active)</option>
                                                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                                                </select>
                                            </label>

                                            <label className="f">
                                                বিবরণ বা কাজের নোট
                                                <input
                                                    className="prod-input"
                                                    placeholder="যেমন: ১২ ঘণ্টা মূল উৎপাদন শিফট"
                                                    value={shiftFormNotes}
                                                    onChange={e => setShiftFormNotes(e.target.value)}
                                                />
                                            </label>
                                        </div>

                                        <div className="row" style={{ justifyContent: 'flex-end', marginTop: '18px', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => setShowShiftModal(false)}
                                            >
                                                বাতিল
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn pri"
                                                style={{ padding: '8px 22px' }}
                                            >
                                                {editingShiftId ? '✓ শিফট আপডেট করুন' : '✓ শিফট সেভ করুন'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}

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
