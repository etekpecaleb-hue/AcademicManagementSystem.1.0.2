/* ==========================================================================
   Mock data layer — simulates the live school information system
   Deterministic (seeded) so demo data is stable between renders.
   ========================================================================== */

/* ---------- seeded RNG ---------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCHOOL = {
  name: "Scholaris International Academy",
  short: "Scholaris",
  session: "2025/2026",
  motto: "Knowledge · Character · Service",
  address: "14 Cedarwood Avenue, GRA Phase II, Ikeja",
  city: "Lagos, Nigeria",
  phone: "+234 803 555 0142",
  email: "portal@scholaris.edu.ng",
  established: 1998,
  accredited: "CIE / WAEC / NECO Approved",
};

/* ---------- academic constants ---------- */
export const SESSION = "2025/2026";
export const TERMS = ["First Term", "Second Term", "Third Term"] as const;
export type Term = (typeof TERMS)[number];

export const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Creative Arts",
] as const;

export type GradeInfo = { grade: string; remark: string; tone: "teal" | "brand" | "amber" | "rose" };

/** WAEC-style 9-point grading band */
export function gradeOf(score: number): GradeInfo {
  if (score >= 75) return { grade: "A1", remark: "Excellent", tone: "teal" };
  if (score >= 70) return { grade: "B2", remark: "Very Good", tone: "teal" };
  if (score >= 65) return { grade: "B3", remark: "Good", tone: "brand" };
  if (score >= 60) return { grade: "C4", remark: "Credit", tone: "brand" };
  if (score >= 55) return { grade: "C5", remark: "Credit", tone: "brand" };
  if (score >= 50) return { grade: "C6", remark: "Credit", tone: "amber" };
  if (score >= 45) return { grade: "D7", remark: "Pass", tone: "amber" };
  if (score >= 40) return { grade: "E8", remark: "Weak Pass", tone: "rose" };
  return { grade: "F9", remark: "Fail", tone: "rose" };
}

export const money = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const AVG_TONE = (avg: number) => (avg >= 70 ? "teal" : avg >= 55 ? "brand" : avg >= 45 ? "amber" : "rose");

/* ---------- personas ---------- */
export type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  email: string;
};

export const PARENT: Person = {
  id: "PAR-2041",
  name: "Mrs. Adaeze Okonkwo",
  role: "Parent / Guardian",
  initials: "AO",
  color: "linear-gradient(135deg,#2563c9,#14b8a6)",
  email: "adaeze.okonkwo@gmail.com",
};

export const TEACHER: Person = {
  id: "STF-0873",
  name: "Mr. Tunde Bakare",
  role: "Subject Teacher · Mathematics",
  initials: "TB",
  color: "linear-gradient(135deg,#7c3aed,#2563c9)",
  email: "t.bakare@scholaris.edu.ng",
};

export const ADMIN: Person = {
  id: "ADM-0007",
  name: "Dr. (Mrs) Ifeoma Eze",
  role: "Principal / System Administrator",
  initials: "IE",
  color: "linear-gradient(135deg,#0d9488,#f59e0b)",
  email: "principal@scholaris.edu.ng",
};

/* ---------- children (wards) ---------- */
export type Ward = {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  arm: string;
  initials: string;
  color: string;
  attendance: number;
  position: number;
  classSize: number;
  nextTermBegins: string;
};

export const WARDS: Ward[] = [
  {
    id: "STU-3391",
    name: "Chiamaka Okonkwo",
    admissionNo: "SIA/2019/0331",
    className: "JSS 3",
    arm: "A",
    initials: "CO",
    color: "linear-gradient(135deg,#f59e0b,#e0344b)",
    attendance: 96,
    position: 3,
    classSize: 38,
    nextTermBegins: "8 Jan 2026",
  },
  {
    id: "STU-4107",
    name: "Ifeanyi Okonkwo",
    admissionNo: "SIA/2022/1107",
    className: "Primary 4",
    arm: "B",
    initials: "IO",
    color: "linear-gradient(135deg,#0d9488,#2563c9)",
    attendance: 91,
    position: 11,
    classSize: 34,
    nextTermBegins: "8 Jan 2026",
  },
];

/* ---------- results engine ---------- */
export type ResultRow = {
  subject: string;
  ca: number; // /40
  exam: number; // /60
  total: number;
  grade: string;
  remark: string;
  tone: GradeInfo["tone"];
  classAvg: number;
  teacher: string;
};

export type TermResult = {
  term: Term;
  rows: ResultRow[];
  total: number;
  obtainable: number;
  average: number;
  position: string;
  formMasterRemark: string;
  principalRemark: string;
};

const TEACHERS_BY_SUBJECT: Record<string, string> = {
  Mathematics: "Mr. T. Bakare",
  "English Language": "Mrs. N. Adeyemi",
  "Basic Science": "Dr. K. Umeh",
  "Social Studies": "Mr. P. Ogundipe",
  "Civic Education": "Mrs. F. Bello",
  "Computer Studies": "Mr. S. Chukwu",
  "Agricultural Science": "Mr. E. Danjuma",
  "Creative Arts": "Miss A. Nwachukwu",
};

function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getResult(ward: Ward, term: Term): TermResult {
  const rand = mulberry32(seedFrom(ward.id + term));
  const bias = ward.id === "STU-3391" ? 12 : -6; // elder sibling is stronger academically
  const rows: ResultRow[] = SUBJECTS.map((subject) => {
    const ca = Math.max(12, Math.min(40, Math.round(20 + rand() * 18 + bias * 0.35)));
    const exam = Math.max(15, Math.min(60, Math.round(28 + rand() * 26 + bias * 0.6)));
    const total = ca + exam;
    const g = gradeOf(total);
    return {
      subject,
      ca,
      exam,
      total,
      grade: g.grade,
      remark: g.remark,
      tone: g.tone,
      classAvg: Math.max(30, Math.min(88, Math.round(total - 8 + rand() * 16))),
      teacher: TEACHERS_BY_SUBJECT[subject],
    };
  });
  const total = rows.reduce((a, r) => a + r.total, 0);
  const obtainable = rows.length * 100;
  const average = Math.round((total / obtainable) * 1000) / 10;
  const pos = term === "First Term" ? ward.position : Math.max(1, ward.position - 1);
  return {
    term,
    rows,
    total,
    obtainable,
    average,
    position: `${pos} of ${ward.classSize}`,
    formMasterRemark:
      average >= 70
        ? "An outstanding term. Chiamaka is consistent, focused and a positive influence in class."
        : "A steady term overall. More attention to Mathematics and Basic Science will lift the average next term.",
    principalRemark:
      average >= 70
        ? "Commendable performance. Keep the standard high — the sky is your starting point."
        : "Satisfactory. Identify weak subjects early and use the holiday coaching pack provided.",
  };
}

/* ---------- fees ---------- */
export type FeeLine = { label: string; amount: number; note?: string };
export type FeeStructure = { className: string; lines: FeeLine[]; total: number };

const FEE_MAP: Record<string, FeeLine[]> = {
  "JSS 3": [
    { label: "Tuition Fee", amount: 185000 },
    { label: "Examination Levy (BECE)", amount: 32000, note: "External exam registration" },
    { label: "Development Levy", amount: 25000 },
    { label: "ICT & Laboratory", amount: 18000 },
    { label: "PTA Dues", amount: 7500 },
  ],
  "Primary 4": [
    { label: "Tuition Fee", amount: 128000 },
    { label: "Development Levy", amount: 18000 },
    { label: "ICT & Library", amount: 12000 },
    { label: "PTA Dues", amount: 7500 },
  ],
};

export function feeStructure(ward: Ward): FeeStructure {
  const lines = FEE_MAP[ward.className] ?? FEE_MAP["Primary 4"];
  return { className: ward.className, lines, total: lines.reduce((a, l) => a + l.amount, 0) };
}

export type Invoice = {
  id: string;
  wardId: string;
  term: Term;
  total: number;
  paid: number;
  due: string;
  status: "paid" | "partial" | "outstanding";
};

export const INVOICES: Invoice[] = [
  { id: "INV-2025-1184", wardId: "STU-3391", term: "First Term", total: 267500, paid: 267500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-2025-1342", wardId: "STU-4107", term: "First Term", total: 165500, paid: 165500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-2025-1601", wardId: "STU-3391", term: "Second Term", total: 267500, paid: 150000, due: "9 Jan 2026", status: "partial" },
  { id: "INV-2025-1602", wardId: "STU-4107", term: "Second Term", total: 165500, paid: 0, due: "9 Jan 2026", status: "outstanding" },
];

export type Payment = {
  id: string;
  date: string;
  ward: string;
  term: Term;
  method: string;
  reference: string;
  amount: number;
  status: "successful" | "pending" | "failed";
};

export const PAYMENTS: Payment[] = [
  { id: "TXN-99120", date: "18 Dec 2025", ward: "Chiamaka Okonkwo", term: "Second Term", method: "Card · Visa 4291", reference: "RCPT/2025/09912", amount: 150000, status: "successful" },
  { id: "TXN-99118", date: "02 Dec 2025", ward: "Chiamaka Okonkwo", term: "Second Term", method: "Bank Transfer", reference: "RCPT/2025/09880", amount: 20000, status: "successful" },
  { id: "TXN-98004", date: "08 Sep 2025", ward: "Chiamaka Okonkwo", term: "First Term", method: "Card · Mastercard 8871", reference: "RCPT/2025/09041", amount: 267500, status: "successful" },
  { id: "TXN-98010", date: "09 Sep 2025", ward: "Ifeanyi Okonkwo", term: "First Term", method: "USSD · 0803***2210", reference: "RCPT/2025/09052", amount: 165500, status: "successful" },
  { id: "TXN-97220", date: "27 Aug 2025", ward: "Ifeanyi Okonkwo", term: "First Term", method: "Card · Visa 4291", reference: "RCPT/2025/08711", amount: 40000, status: "failed" },
];

/* ---------- news & circulars ---------- */
export type NewsItem = {
  id: string;
  title: string;
  category: "Event" | "Academic" | "Sports" | "Circular" | "Holiday";
  date: string;
  excerpt: string;
  image: string;
  pinned?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    id: "N1",
    title: "30th Inter-House Sports Festival holds 14 February",
    category: "Sports",
    date: "06 Jan 2026",
    excerpt:
      "Parents are invited to the annual Inter-House Sports Festival at the main arena. Four houses — Ruby, Emerald, Topaz and Sapphire — will compete in 22 track and field events.",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop",
    pinned: true,
  },
  {
    id: "N2",
    title: "Second Term results are now live on the parent portal",
    category: "Academic",
    date: "12 Dec 2025",
    excerpt:
      "Continuous assessment and examination scores have been published. Download the termly report card from the Results tab and review subject teacher remarks.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop",
  },
  {
    id: "N3",
    title: "BECE registration closes 31 January for JSS 3 candidates",
    category: "Circular",
    date: "10 Dec 2025",
    excerpt:
      "All JSS 3 learners must complete biometric capture and submit six passport photographs to the Exams Officer before the deadline.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop",
  },
  {
    id: "N4",
    title: "New STEM & Robotics laboratory commissioned",
    category: "Event",
    date: "28 Nov 2025",
    excerpt:
      "The 40-workstation laboratory features 3D printers, Arduino kits and a dedicated coding studio for learners in Primary 5 to SS 3.",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&auto=format&fit=crop",
  },
];

export type Circular = { id: string; title: string; date: string; audience: string; tone: "brand" | "amber" | "teal" | "rose" };

export const CIRCULARS: Circular[] = [
  { id: "C1", title: "Resumption date & approved stationery list — Second Term", date: "18 Dec 2025", audience: "All Parents", tone: "brand" },
  { id: "C2", title: "Mid-term break: 12 – 16 February 2026", date: "22 Jan 2026", audience: "Whole School", tone: "teal" },
  { id: "C3", title: "Payment deadline for Second Term fees — 9 January", date: "03 Jan 2026", audience: "Debtors", tone: "amber" },
  { id: "C4", title: "PTA general meeting — Saturday 7 February, 10:00am", date: "26 Jan 2026", audience: "All Parents", tone: "brand" },
];

/* ---------- calendar / events ---------- */
export const EVENTS = [
  { day: "09", month: "JAN", title: "Second Term resumption", meta: "All learners" },
  { day: "14", month: "FEB", title: "Inter-House Sports Festival", meta: "Main arena · 9am" },
  { day: "07", month: "FEB", title: "PTA General Meeting", meta: "School hall · 10am" },
  { day: "21", month: "MAR", title: "Open Day & Result Collection", meta: "Classrooms" },
];

/* ---------- teacher & class-assignment data ---------- */
export type Teacher = {
  id: string;
  name: string;
  subject: string;
  initials: string;
  color: string;
  staffId: string;
  email: string;
  phone: string;
  joined: string;
};

export const TEACHERS: Teacher[] = [
  { id: "STF-0873", name: "Mr. Tunde Bakare", subject: "Mathematics", initials: "TB", color: "linear-gradient(135deg,#7c3aed,#2563c9)", staffId: "STF-0873", email: "t.bakare@scholaris.edu.ng", phone: "0803 111 0873", joined: "2019" },
  { id: "STF-0411", name: "Dr. K. Umeh", subject: "Basic Science", initials: "KU", color: "linear-gradient(135deg,#0d9488,#14b8a6)", staffId: "STF-0411", email: "k.umeh@scholaris.edu.ng", phone: "0802 333 0411", joined: "2015" },
  { id: "STF-0302", name: "Mrs. N. Adeyemi", subject: "English Language", initials: "NA", color: "linear-gradient(135deg,#e0344b,#f59e0b)", staffId: "STF-0302", email: "n.adeyemi@scholaris.edu.ng", phone: "0706 000 0302", joined: "2012" },
  { id: "STF-0510", name: "Mr. S. Chukwu", subject: "Computer Studies", initials: "SC", color: "linear-gradient(135deg,#10346e,#2563c9)", staffId: "STF-0510", email: "s.chukwu@scholaris.edu.ng", phone: "0803 555 0510", joined: "2021" },
  { id: "STF-0644", name: "Miss A. Nwachukwu", subject: "Creative Arts", initials: "AN", color: "linear-gradient(135deg,#ec4899,#a855f7)", staffId: "STF-0644", email: "a.nwachukwu@scholaris.edu.ng", phone: "0814 555 0644", joined: "2022" },
  { id: "STF-0220", name: "Mr. P. Ogundipe", subject: "Social Studies", initials: "PO", color: "linear-gradient(135deg,#f59e0b,#e0344b)", staffId: "STF-0220", email: "p.ogundipe@scholaris.edu.ng", phone: "0805 200 0220", joined: "2014" },
];

export type ClassArm = { id: string; name: string; arm: string };
export const ALL_CLASS_ARMS: ClassArm[] = [
  { id: "CLS-PR1A", name: "Primary 1", arm: "A" },
  { id: "CLS-PR4B", name: "Primary 4", arm: "B" },
  { id: "CLS-PR6A", name: "Primary 6", arm: "A" },
  { id: "CLS-JSS1C", name: "JSS 1", arm: "C" },
  { id: "CLS-JSS2A", name: "JSS 2", arm: "A" },
  { id: "CLS-JSS2B", name: "JSS 2", arm: "B" },
  { id: "CLS-JSS3A", name: "JSS 3", arm: "A" },
  { id: "CLS-JSS3B", name: "JSS 3", arm: "B" },
  { id: "CLS-SS1S", name: "SS 1", arm: "Science" },
  { id: "CLS-SS2S", name: "SS 2", arm: "Science" },
  { id: "CLS-SS3A", name: "SS 3", arm: "Arts" },
];

export type AssignmentStatus = "active" | "reassigned" | "removed";
export type ClassAssignment = {
  id: string;          // assignment id
  classArmId: string;  // e.g. CLS-JSS3A
  subject: string;
  teacherId: string;   // the teacher who IS handling it
  assignedBy: string;  // admin staff id
  assignedAt: string;  // date
  note?: string;
  status: AssignmentStatus;
};

export type AssignmentHistoryEntry = {
  id: string;
  classArmId: string;
  classLabel: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  action: "assigned" | "reassigned_from" | "reassigned_to" | "removed";
  doneBy: string;
  date: string;
  previousTeacherId?: string;
  previousTeacherName?: string;
  note?: string;
};

export const INITIAL_ASSIGNMENTS: ClassAssignment[] = [
  { id: "A-001", classArmId: "CLS-JSS3A", subject: "Mathematics", teacherId: "STF-0873", assignedBy: "ADM-0007", assignedAt: "12 Jan 2025", status: "active" },
  { id: "A-002", classArmId: "CLS-JSS3B", subject: "Mathematics", teacherId: "STF-0873", assignedBy: "ADM-0007", assignedAt: "12 Jan 2025", status: "active" },
  { id: "A-003", classArmId: "CLS-SS1S", subject: "Mathematics", teacherId: "STF-0873", assignedBy: "ADM-0007", assignedAt: "12 Jan 2025", status: "active" },
  { id: "A-004", classArmId: "CLS-JSS2A", subject: "Basic Science", teacherId: "STF-0411", assignedBy: "ADM-0007", assignedAt: "12 Jan 2025", status: "active" },
  { id: "A-005", classArmId: "CLS-JSS2B", subject: "Basic Science", teacherId: "STF-0411", assignedBy: "ADM-0007", assignedAt: "12 Jan 2025", status: "active" },
  { id: "A-006", classArmId: "CLS-PR6A", subject: "English Language", teacherId: "STF-0302", assignedBy: "ADM-0007", assignedAt: "14 Jan 2025", status: "active" },
  { id: "A-007", classArmId: "CLS-JSS1C", subject: "Social Studies", teacherId: "STF-0220", assignedBy: "ADM-0007", assignedAt: "14 Jan 2025", status: "active" },
  { id: "A-008", classArmId: "CLS-SS3A", subject: "Creative Arts", teacherId: "STF-0644", assignedBy: "ADM-0007", assignedAt: "14 Jan 2025", status: "active" },
];

export const INITIAL_HISTORY: AssignmentHistoryEntry[] = [
  { id: "H-101", classArmId: "CLS-JSS3A", classLabel: "JSS 3A", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: "12 Jan 2025" },
  { id: "H-102", classArmId: "CLS-JSS3A", classLabel: "JSS 3A", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: "12 Jan 2024" },
  { id: "H-103", classArmId: "CLS-SS1S", classLabel: "SS 1 Science", subject: "Mathematics", teacherId: "STF-0220", teacherName: "Mr. P. Ogundipe", action: "reassigned_from", doneBy: "Dr. I. Eze (Principal)", date: "15 Sep 2024", previousTeacherId: "STF-0220", previousTeacherName: "Mr. P. Ogundipe" },
  { id: "H-104", classArmId: "CLS-SS1S", classLabel: "SS 1 Science", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", action: "reassigned_to", doneBy: "Dr. I. Eze (Principal)", date: "15 Sep 2024" },
  { id: "H-105", classArmId: "CLS-PR4B", classLabel: "Primary 4B", subject: "Computer Studies", teacherId: "STF-0510", teacherName: "Mr. S. Chukwu", action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: "10 Sep 2025" },
  { id: "H-106", classArmId: "CLS-PR4B", classLabel: "Primary 4B", subject: "Computer Studies", teacherId: "STF-0510", teacherName: "Mr. S. Chukwu", action: "removed", doneBy: "Dr. I. Eze (Principal)", date: "12 Sep 2025" },
  { id: "H-107", classArmId: "CLS-JSS2A", classLabel: "JSS 2A", subject: "Basic Science", teacherId: "STF-0411", teacherName: "Dr. K. Umeh", action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: "12 Jan 2025" },
  { id: "H-108", classArmId: "CLS-SS2S", classLabel: "SS 2 Science", subject: "English Language", teacherId: "STF-0302", teacherName: "Mrs. N. Adeyemi", action: "assigned", doneBy: "Dr. I. Eze (Principal)", date: "14 Jan 2025" },
];

/* ---------- broadsheet score sheet (admin views all) ---------- */
export type ScoreSheet = {
  id: string;
  classArmId: string;
  classLabel: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  term: Term;
  students: number;
  entered: number;
  average: number;
  state: "draft" | "submitted" | "approved" | "published" | "rejected";
  lastUpdate: string;
};

export const INITIAL_SCORESHEETS: ScoreSheet[] = [
  { id: "SS-001", classArmId: "CLS-JSS3A", classLabel: "JSS 3A", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", term: "Second Term", students: 24, entered: 24, average: 74.2, state: "published", lastUpdate: "04 Dec 2025, 9:12am" },
  { id: "SS-002", classArmId: "CLS-JSS3B", classLabel: "JSS 3B", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", term: "Second Term", students: 22, entered: 22, average: 71.6, state: "published", lastUpdate: "04 Dec 2025, 9:48am" },
  { id: "SS-003", classArmId: "CLS-SS1S", classLabel: "SS 1 Science", subject: "Mathematics", teacherId: "STF-0873", teacherName: "Mr. Tunde Bakare", term: "Second Term", students: 20, entered: 13, average: 68.4, state: "draft", lastUpdate: "Yesterday, 4:21pm" },
  { id: "SS-004", classArmId: "CLS-JSS2A", classLabel: "JSS 2A", subject: "Basic Science", teacherId: "STF-0411", teacherName: "Dr. K. Umeh", term: "Second Term", students: 26, entered: 0, average: 0, state: "draft", lastUpdate: "— (not started)" },
  { id: "SS-005", classArmId: "CLS-PR6A", classLabel: "Primary 6A", subject: "English Language", teacherId: "STF-0302", teacherName: "Mrs. N. Adeyemi", term: "Second Term", students: 31, entered: 31, average: 69.0, state: "submitted", lastUpdate: "Today, 11:08am" },
  { id: "SS-006", classArmId: "CLS-SS3A", classLabel: "SS 3 Arts", subject: "Creative Arts", teacherId: "STF-0644", teacherName: "Miss A. Nwachukwu", term: "Second Term", students: 26, entered: 26, average: 78.4, state: "approved", lastUpdate: "06 Dec 2025, 3:40pm" },
  { id: "SS-007", classArmId: "CLS-JSS1C", classLabel: "JSS 1C", subject: "Social Studies", teacherId: "STF-0220", teacherName: "Mr. P. Ogundipe", term: "Second Term", students: 33, entered: 33, average: 63.0, state: "published", lastUpdate: "05 Dec 2025, 1:55pm" },
];

export type TeacherClass = {
  id: string;
  name: string;
  arm: string;
  subject: string;
  students: number;
  submitted: number;
  status: "submitted" | "draft" | "pending";
  roster: { id: string; name: string; admissionNo: string; ca: number; exam: number }[];
};

const ROSTER_NAMES = [
  "Abdulrahman Yusuf", "Blessing Etim", "Chidera Nwosu", "Daniel Okafor", "Emmanuella Cole",
  "Faruq Adeleke", "Grace Mbah", "Halima Sani", "Ibrahim Lawal", "Jasmine Uche",
  "Kelechi Obi", "Lucy Adamu", "Musa Danjuma", "Ngozi Eze", "Oluwaseun Ajayi",
  "Precious Ihuoma", "Quadri Bello", "Ruth Alabi", "Samuel Effiong", "Tari Ebi",
  "Uche Nnamdi", "Victor Igwe", "Wale Ogundipe", "Zainab Idris",
];

function makeRoster(seed: number, count: number, offset = 0) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const n = ROSTER_NAMES[(i + offset) % ROSTER_NAMES.length];
    const has = rand() > 0.18; // some scores already entered
    return {
      id: `STU-${5000 + i + seed}`,
      name: n,
      admissionNo: `SIA/2023/${String(400 + i + offset).padStart(4, "0")}`,
      ca: has ? Math.max(10, Math.min(40, Math.round(16 + rand() * 22))) : 0,
      exam: has ? Math.max(12, Math.min(60, Math.round(24 + rand() * 32))) : 0,
    };
  });
}

export const TEACHER_CLASSES: TeacherClass[] = [
  { id: "CLS-JSS3A", name: "JSS 3", arm: "A", subject: "Mathematics", students: 24, submitted: 24, status: "submitted", roster: makeRoster(11, 24, 0) },
  { id: "CLS-JSS3B", name: "JSS 3", arm: "B", subject: "Mathematics", students: 22, submitted: 22, status: "submitted", roster: makeRoster(27, 22, 6) },
  { id: "CLS-SS1S", name: "SS 1", arm: "Science", subject: "Mathematics", students: 20, submitted: 13, status: "draft", roster: makeRoster(43, 20, 12) },
  { id: "CLS-JSS2A", name: "JSS 2", arm: "A", subject: "Basic Science", students: 26, submitted: 0, status: "pending", roster: makeRoster(59, 26, 3) },
];

export const TEACHER_TIMETABLE = [
  { period: "08:00 – 08:45", subject: "Mathematics", klass: "JSS 3A", room: "B14" },
  { period: "08:45 – 09:30", subject: "Mathematics", klass: "SS 1 Science", room: "Lab 2" },
  { period: "10:15 – 11:00", subject: "Basic Science", klass: "JSS 2A", room: "B09" },
  { period: "12:30 – 13:15", subject: "Mathematics", klass: "JSS 3B", room: "B15" },
];

/* ---------- admin analytics ---------- */
export const ADMIN_KPI = [
  { label: "Total Enrolment", value: 1842, suffix: "", delta: 6.4, tone: "brand", icon: "users" },
  { label: "Fee Collection Rate", value: 87.4, suffix: "%", delta: 3.1, tone: "teal", icon: "wallet" },
  { label: "Staff on Payroll", value: 168, suffix: "", delta: 2.0, tone: "violet", icon: "teacher" },
  { label: "Average Attendance", value: 94, suffix: "%", delta: -1.2, tone: "amber", icon: "calendar" },
] as const;

export const ENROLMENT_TREND = [
  { label: "2019", value: 1290 },
  { label: "2020", value: 1348 },
  { label: "2021", value: 1421 },
  { label: "2022", value: 1567 },
  { label: "2023", value: 1680 },
  { label: "2024", value: 1731 },
  { label: "2025", value: 1842 },
];

export const COLLECTION_BY_TERM = [
  { label: "First Term", expected: 248_000_000, received: 231_400_000 },
  { label: "Second Term", expected: 248_000_000, received: 216_600_000 },
  { label: "Third Term", expected: 248_000_000, received: 118_200_000 },
];

export const CLASS_PERFORMANCE = [
  { label: "Primary 4", avg: 71.2 },
  { label: "Primary 5", avg: 68.4 },
  { label: "Primary 6", avg: 66.9 },
  { label: "JSS 1", avg: 64.1 },
  { label: "JSS 2", avg: 62.7 },
  { label: "JSS 3", avg: 67.8 },
  { label: "SS 1", avg: 70.3 },
  { label: "SS 2", avg: 65.2 },
  { label: "SS 3", avg: 72.6 },
];

export const FEE_STATUS_SPLIT = [
  { label: "Fully Paid", value: 1298, tone: "#14b8a6" },
  { label: "Part Paid", value: 316, tone: "#2563c9" },
  { label: "Outstanding", value: 228, tone: "#f59e0b" },
];

export const RECENT_ACTIVITY = [
  { who: "Mr. T. Bakare", action: "uploaded Mathematics results for", target: "JSS 3A", time: "4 min ago", tone: "brand" },
  { who: "Mrs. A. Okonkwo", action: "paid ₦150,000 fees for", target: "Chiamaka Okonkwo", time: "22 min ago", tone: "teal" },
  { who: "System", action: "published Second Term result for", target: "Primary 4B", time: "1 hr ago", tone: "violet" },
  { who: "Dr. K. Umeh", action: "started draft for Basic Science ·", target: "JSS 2A", time: "2 hrs ago", tone: "amber" },
  { who: "Bursary", action: "reconciled bank statement for", target: "14 Dec 2025", time: "3 hrs ago", tone: "slate" },
];

export const ADMIN_STUDENTS = [
  { id: "STU-3391", name: "Chiamaka Okonkwo", klass: "JSS 3A", guardian: "Mrs. A. Okonkwo", balance: 117500, avg: 78.4, status: "part" },
  { id: "STU-4107", name: "Ifeanyi Okonkwo", klass: "Primary 4B", guardian: "Mrs. A. Okonkwo", balance: 165500, avg: 61.2, status: "outstanding" },
  { id: "STU-2201", name: "Kelechi Obi", klass: "SS 2 Science", guardian: "Mr. P. Obi", balance: 0, avg: 84.9, status: "paid" },
  { id: "STU-1188", name: "Halima Sani", klass: "JSS 1C", guardian: "Alhaji M. Sani", balance: 0, avg: 72.6, status: "paid" },
  { id: "STU-3954", name: "Daniel Okafor", klass: "SS 3 Arts", guardian: "Mrs. B. Okafor", balance: 62000, avg: 58.3, status: "part" },
  { id: "STU-2760", name: "Grace Mbah", klass: "Primary 6A", guardian: "Mrs. E. Mbah", balance: 0, avg: 69.1, status: "paid" },
  { id: "STU-4402", name: "Musa Danjuma", klass: "JSS 2B", guardian: "Mr. I. Danjuma", balance: 43500, avg: 47.8, status: "part" },
  { id: "STU-3011", name: "Jasmine Uche", klass: "SS 1 Science", guardian: "Mrs. C. Uche", balance: 0, avg: 81.5, status: "paid" },
];

export const DEPARTMENT_HEADS = [
  { name: "Mrs. N. Adeyemi", unit: "Languages", staff: 22, util: 92 },
  { name: "Mr. T. Bakare", unit: "Mathematics", staff: 18, util: 78 },
  { name: "Dr. K. Umeh", unit: "Sciences", staff: 26, util: 88 },
  { name: "Mr. S. Chukwu", unit: "ICT & Robotics", staff: 11, util: 64 },
  { name: "Miss A. Nwachukwu", unit: "Creative Arts", staff: 9, util: 71 },
];

export const PAYMENT_METHODS = [
  { id: "card", label: "Debit / Credit Card", desc: "Visa, Mastercard, Verve", icon: "card", badge: "Instant" },
  { id: "transfer", label: "Bank Transfer", desc: "Scholaris Zenith · 1014785220", icon: "bank", badge: "1–2 hrs" },
  { id: "ussd", label: "USSD / Mobile Money", desc: "*737*… dial from registered phone", icon: "mobile", badge: "Instant" },
] as const;

export const CALENDAR_TERM_DATES = [
  { label: "Second Term begins", value: "9 January 2026" },
  { label: "Mid-term break", value: "12 – 16 February 2026" },
  { label: "Examinations begin", value: "20 March 2026" },
  { label: "Term ends / Result day", value: "4 April 2026" },
];

/* ==========================================================================
   SIMPLE-MODE ADDITIONS — help desk, unique student logins, newsletters,
   class timetable and plain-language messages
   ========================================================================== */

export const HELP = {
  phone: "0803 555 0142",
  hours: "Monday – Friday, 8:00am – 4:00pm",
  office: "Front Office, Administration Block",
  email: "help@scholaris.edu.ng",
};

/* ---------- unique student login accounts (Admission Number + private PIN) ---------- */
export type StudentAccount = {
  id: string;
  name: string;
  admissionNo: string;
  pin: string;
  className: string;
  parentName: string;
  parentPhone: string;
  lastLogin: string;
  status: "active" | "new" | "locked";
  initials: string;
  color: string;
  balance?: number; // outstanding school fees in NGN
};

export const STUDENT_ACCOUNTS: StudentAccount[] = [
  { id: "STU-3391", name: "Chiamaka Okonkwo", admissionNo: "SIA/2019/0331", pin: "4821", className: "JSS 3A", parentName: "Mrs. Adaeze Okonkwo", parentPhone: "0803 555 2210", lastLogin: "Today, 7:42am", status: "active", initials: "CO", color: "linear-gradient(135deg,#f59e0b,#e0344b)", balance: 117500 },
  { id: "STU-4107", name: "Ifeanyi Okonkwo", admissionNo: "SIA/2022/1107", pin: "7350", className: "Primary 4B", parentName: "Mrs. Adaeze Okonkwo", parentPhone: "0803 555 2210", lastLogin: "Yesterday, 6:10pm", status: "active", initials: "IO", color: "linear-gradient(135deg,#0d9488,#2563c9)", balance: 165500 },
  { id: "STU-2201", name: "Kelechi Obi", admissionNo: "SIA/2018/0209", pin: "1194", className: "SS 2 Science", parentName: "Mr. Paul Obi", parentPhone: "0805 221 0098", lastLogin: "3 days ago", status: "active", initials: "KO", color: "linear-gradient(135deg,#7c3aed,#2563c9)", balance: 0 },
  { id: "STU-1188", name: "Halima Sani", admissionNo: "SIA/2024/1188", pin: "6027", className: "JSS 1C", parentName: "Alhaji Musa Sani", parentPhone: "0802 118 4401", lastLogin: "Never", status: "new", initials: "HS", color: "linear-gradient(135deg,#14b8a6,#0f766e)", balance: 48000 },
  { id: "STU-3954", name: "Daniel Okafor", admissionNo: "SIA/2017/0154", pin: "8813", className: "SS 3 Arts", parentName: "Mrs. Bola Okafor", parentPhone: "0809 774 3320", lastLogin: "1 week ago", status: "active", initials: "DO", color: "linear-gradient(135deg,#2563c9,#10346e)", balance: 62000 },
  { id: "STU-2760", name: "Grace Mbah", admissionNo: "SIA/2020/0760", pin: "2246", className: "Primary 6A", parentName: "Mrs. Ebele Mbah", parentPhone: "0806 330 1187", lastLogin: "2 days ago", status: "active", initials: "GM", color: "linear-gradient(135deg,#e0344b,#f59e0b)", balance: 0 },
  { id: "STU-4402", name: "Musa Danjuma", admissionNo: "SIA/2023/1402", pin: "5578", className: "JSS 2B", parentName: "Mr. Ibrahim Danjuma", parentPhone: "0703 445 9021", lastLogin: "Never", status: "new", initials: "MD", color: "linear-gradient(135deg,#334155,#0f172a)", balance: 43500 },
  { id: "STU-3011", name: "Jasmine Uche", admissionNo: "SIA/2019/0311", pin: "9902", className: "SS 1 Science", parentName: "Mrs. Chioma Uche", parentPhone: "0813 902 7765", lastLogin: "Locked after 3 wrong PINs", status: "locked", initials: "JU", color: "linear-gradient(135deg,#7c3aed,#e0344b)", balance: 0 },
];

/* ---------- per-student invoices & payments (no parent portal) ---------- */
export type StudentInvoice = { id: string; studentId: string; term: Term; total: number; paid: number; due: string; status: "paid" | "partial" | "outstanding" };
export type StudentPayment = { id: string; date: string; studentId: string; term: Term; method: string; reference: string; amount: number; status: "successful" | "pending" | "failed" };

export const STUDENT_INVOICES: StudentInvoice[] = [
  { id: "INV-1184", studentId: "STU-3391", term: "First Term", total: 267500, paid: 267500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-1342", studentId: "STU-4107", term: "First Term", total: 165500, paid: 165500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-1601", studentId: "STU-3391", term: "Second Term", total: 267500, paid: 150000, due: "9 Jan 2026", status: "partial" },
  { id: "INV-1602", studentId: "STU-4107", term: "Second Term", total: 165500, paid: 0, due: "9 Jan 2026", status: "outstanding" },
  { id: "INV-1701", studentId: "STU-2201", term: "Second Term", total: 318000, paid: 318000, due: "9 Jan 2026", status: "paid" },
  { id: "INV-1702", studentId: "STU-1188", term: "Second Term", total: 218000, paid: 170000, due: "9 Jan 2026", status: "partial" },
  { id: "INV-1703", studentId: "STU-3954", term: "Second Term", total: 298000, paid: 236000, due: "9 Jan 2026", status: "partial" },
];

export const STUDENT_PAYMENTS: StudentPayment[] = [
  { id: "TXN-99120", date: "18 Dec 2025", studentId: "STU-3391", term: "Second Term", method: "Card · Visa 4291", reference: "RCPT/2025/09912", amount: 150000, status: "successful" },
  { id: "TXN-99118", date: "02 Dec 2025", studentId: "STU-3391", term: "Second Term", method: "Bank Transfer", reference: "RCPT/2025/09880", amount: 20000, status: "successful" },
  { id: "TXN-98004", date: "08 Sep 2025", studentId: "STU-3391", term: "First Term", method: "Card · Mastercard 8871", reference: "RCPT/2025/09041", amount: 267500, status: "successful" },
  { id: "TXN-98010", date: "09 Sep 2025", studentId: "STU-4107", term: "First Term", method: "USSD · 0803***2210", reference: "RCPT/2025/09052", amount: 165500, status: "successful" },
];



const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
export function findStudentByLogin(admissionNo: string, pin: string) {
  return STUDENT_ACCOUNTS.find((a) => norm(a.admissionNo) === norm(admissionNo) && a.pin === pin.trim());
}

/* ---------- newsletters ---------- */
export type Newsletter = { id: string; title: string; period: string; pages: number; summary: string; cover: string; isNew?: boolean };

export const NEWSLETTERS: Newsletter[] = [
  { id: "NL-4", title: "Second Term Newsletter", period: "January 2026", pages: 12, summary: "Resumption arrangements, Inter-House Sports, the BECE timetable and a welcome note from the Principal.", cover: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&auto=format&fit=crop", isNew: true },
  { id: "NL-3", title: "End of First Term Newsletter", period: "December 2025", pages: 16, summary: "Prize-giving day highlights, best pupils in every class, the carol service and a holiday reading list.", cover: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=700&auto=format&fit=crop" },
  { id: "NL-2", title: "First Term Newsletter", period: "September 2025", pages: 10, summary: "Welcome to the new session, new teachers, the updated uniform rules and the school calendar.", cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&auto=format&fit=crop" },
  { id: "NL-1", title: "Third Term Newsletter", period: "May 2025", pages: 14, summary: "Graduation ceremony, exam tips for SS 3, summer school registration and library week.", cover: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&auto=format&fit=crop" },
];

/* ---------- class timetable (what a pupil sees) ---------- */
export const CLASS_TIMETABLE: { time: string; days: string[] }[] = [
  { time: "8:00 – 8:45", days: ["Mathematics", "English", "Basic Science", "Mathematics", "Civic Education"] },
  { time: "8:45 – 9:30", days: ["English", "Mathematics", "Social Studies", "English", "Mathematics"] },
  { time: "9:30 – 10:15", days: ["Basic Science", "Computer Studies", "English", "Agric. Science", "Creative Arts"] },
  { time: "10:15 – 10:45", days: ["Break", "Break", "Break", "Break", "Break"] },
  { time: "10:45 – 11:30", days: ["Social Studies", "Basic Science", "Mathematics", "Computer Studies", "English"] },
  { time: "11:30 – 12:15", days: ["Civic Education", "Agric. Science", "Creative Arts", "Basic Science", "Social Studies"] },
  { time: "12:15 – 1:00", days: ["Computer Studies", "Creative Arts", "Civic Education", "Library", "Sports"] },
];

/* ---------- plain-language messages ---------- */
export type Message = { id: string; title: string; body: string; date: string; tone: "teal" | "amber" | "brand" | "rose" };

export const STUDENT_MESSAGES: Message[] = [
  { id: "SM1", title: "Your Second Term results are ready", body: "Press 'My Results' to see your scores and grades. You can print them too.", date: "Today", tone: "teal" },
  { id: "SM2", title: "Inter-House Sports on 14 February", body: "Come in your house colours. Parents are welcome to watch.", date: "2 days ago", tone: "brand" },
  { id: "SM3", title: "BECE registration closes 31 January", body: "JSS 3 pupils: make sure your passport photographs have been handed in.", date: "5 days ago", tone: "amber" },
];

export const PARENT_MESSAGES: Message[] = [
  { id: "PM1", title: "Second Term results are out", body: "You can see your children's results here. Each child can also log in with their own Admission Number and PIN.", date: "Today", tone: "teal" },
  { id: "PM2", title: "School fees are due on 9 January", body: "Ifeanyi's Second Term fees have not been paid yet. Press 'Pay School Fees' — it only takes 3 steps.", date: "Yesterday", tone: "amber" },
  { id: "PM3", title: "PTA meeting — Saturday 7 February, 10am", body: "In the school hall. All parents and guardians are invited.", date: "3 days ago", tone: "brand" },
];

/* ---------- grade legend in plain words ---------- */
export const GRADE_LEGEND = [
  { grade: "A1", range: "75 – 100", meaning: "Excellent", tone: "teal" },
  { grade: "B2 – B3", range: "65 – 74", meaning: "Very good / Good", tone: "teal" },
  { grade: "C4 – C6", range: "50 – 64", meaning: "Credit (passed)", tone: "brand" },
  { grade: "D7 – E8", range: "40 – 49", meaning: "Pass (needs more work)", tone: "amber" },
  { grade: "F9", range: "0 – 39", meaning: "Fail (needs help)", tone: "rose" },
] as const;
