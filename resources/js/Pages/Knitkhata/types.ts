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

export interface Order {
    id: string;
    v: string; // vendor key e.g. 'abc', 'xyz', 'nobo'
    fabric: string;
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
    yarnIn: YarnIntake[];
    qc: QcIssue[];
}

export interface ProductionLogItem {
    d: string;
    sh: 'A' | 'B';
    m: string;
    o: string;
    kg: number;
    rolls: number;
    op: string;
}

export interface UserItem {
    n: string;
    r: string;
    org: string;
    on: boolean;
    last: string;
    vendor: boolean;
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
    | 'users' 
    | 'wa' 
    | 'plan' 
    | 'vorders' 
    | 'vreport';

export interface KnitkhataProps {
    factory?: any;
    auth: {
        user: any;
    };
    initialTab?: KnitkhataViewTab;
    initialRole?: RoleMode;
    initialOrderId?: string;
}
