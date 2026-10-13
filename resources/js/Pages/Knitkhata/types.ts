export interface Vendor {
    name: string;
    phone: string;
    email?: string;
}

export interface YarnIntake {
    count: string;
    spinner: string;
    lot: string;
    bags: number;
    kg: number;
}

export interface QcIssue {
    d: string;
    roll: string;
    m: string;
    issue: string;
    kg: number;
    s: 'ok' | 'bad' | 'warn';
    res: string;
}

export interface DeliveryChallan {
    challanNo: string;
    date: string;
    rolls: number;
    kg: number;
    vehicle?: string;
    driverPhone?: string;
}

export interface Order {
    id: string;
    db_id?: number;
    v: string; // vendor key e.g. 'abc', 'xyz', 'nobo'
    vendorName?: string;
    vendorPhone?: string;
    vendorEmail?: string;
    fabric: string;
    category?: string;
    gsm: number;
    dia: string;
    color: string;
    yarn: string;
    qty: number;
    done: number;
    machines: string[];
    rate: number; // kg/day/machine
    rateTk: number; // Tk/kg
    start: string;
    status: 'run' | 'wait' | 'done';
    db_status?: string;
    yarnIn: YarnIntake[];
    qc: QcIssue[];
    challans?: DeliveryChallan[];
    factory_location?: string;
    is_awarded?: boolean;
    accepted_factory?: any;
    quotations_count?: number;
    deadline?: string;
}

export interface ProductionLogItem {
    d: string;
    sh: string; // 'A' | 'B' | 'C' | 'Day'
    m: string;
    o: string;
    kg: number;
    rolls: number;
    op: string;
    lot?: string;
    issue?: string;
}

export interface UserItem {
    n: string;
    r: string;
    org: string;
    on: boolean;
    last: string;
    vendor: boolean;
}

export interface FactoryShift {
    id: string;
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    inCharge?: string;
    targetOutputKg?: number;
    status: 'active' | 'inactive';
    notes?: string;
}

export type RoleMode = 'fac' | 'ven';

export type KnitkhataViewTab = 
    | 'dash' 
    | 'orders' 
    | 'detail' 
    | 'entry' 
    | 'qc' 
    | 'acc' 
    | 'att' 
    | 'machines'
    | 'shifts'
    | 'users' 
    | 'wa' 
    | 'plan' 
    | 'vorders' 
    | 'vreport';

export interface FactoryMachineItem {
    id: number;
    category?: string;
    no_of_machine: number;
    capacity_per_machine: number;
    total_capacity_per_day: number;
    unit_type: string;
    machine_type: string;
    brand_or_model: string;
}

export interface CustomMachineItem {
    id: number;
    name: string;
    cph?: number | string;
    unit?: string;
    brand_or_model?: string;
    serial_number?: string;
    is_active?: boolean;
    notes?: string;
    machine_type?: {
        id: number;
        name: string;
        brand_or_model?: string;
    };
}

export interface KnitkhataProps {
    factory?: any;
    auth: {
        user: any;
    };
    initialTab?: KnitkhataViewTab;
    initialRole?: RoleMode;
    initialOrderId?: string;
    factoryMachines?: FactoryMachineItem[];
    customMachines?: CustomMachineItem[];
    machineTypes?: any[];
    userPosts?: any[];
    quotationsSubmitted?: any[];
    initialOrders?: Order[];
    initialVendors?: Record<string, Vendor>;
    initialVendorOrders?: Order[];
    subcontractorFactories?: Record<string, any>;
}
