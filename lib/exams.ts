export type EducationLevel =
  | "10th"
  | "12th"
  | "ITI / Diploma"
  | "Graduate"
  | "Postgraduate"
  | "Professional degree";

export type GovernmentLevel = "Central" | "State";

export type ExamType =
  | "Civil Services & Administration"
  | "Banking & Finance"
  | "Armed Forces"
  | "Police & CAPF"
  | "Railways"
  | "Health & Medical"
  | "Technical & Trades"
  | "Teaching & Education"
  | "Specialist & Professional";

export type StatusTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "slate";

export type TimelineState =
  | "completed"
  | "current"
  | "scheduled"
  | "tentative"
  | "postponed";

export type ExamEvent = {
  label: string;
  date: string;
  displayDate: string;
  state: TimelineState;
  note?: string;
};

export type VacancyRow = {
  label: string;
  ur?: number;
  ews?: number;
  obc?: number;
  sc?: number;
  st?: number;
  total: number;
};

export type OfficialLink = {
  label: string;
  url: string;
  type: "notice" | "apply" | "calendar" | "result" | "website";
};

export type Exam = {
  slug: string;
  title: string;
  shortTitle: string;
  aliases: string[];
  organisation: string;
  governmentLevel: GovernmentLevel;
  jurisdiction: string;
  state?: string;
  stateCode?: string;
  cycle: string;
  notificationNumber?: string;
  sector: string;
  examTypes: ExamType[];
  education: EducationLevel[];
  status: {
    label: string;
    tone: StatusTone;
    nextAction: string;
    detail: string;
  };
  summary: string;
  vacancies?: number;
  vacancyLabel: string;
  vacancyNote: string;
  vacancyBreakdown?: VacancyRow[];
  age: string;
  qualification: string;
  fee: string;
  pay: string;
  timeline: ExamEvent[];
  eligibility: string[];
  relaxations: string[];
  selectionStages: string[];
  syllabus: string[];
  documents: string[];
  officialLinks: OfficialLink[];
  sourceTitle: string;
  sourceUrl: string;
  sourcePublished: string;
  lastVerified: string;
  changeLog: { date: string; text: string }[];
  featured?: boolean;
};

const commonDocuments = [
  "Recent passport-size photograph and scanned signature",
  "Government photo ID with the same name used in the application",
  "Education certificates and marksheets",
  "Category, EWS, PwBD or ex-serviceman certificate, if claimed",
  "Domicile or language proof where the notification requires it",
];

function exam(
  value: Omit<Exam, "documents" | "relaxations" | "changeLog"> &
    Partial<Pick<Exam, "documents" | "relaxations" | "changeLog">>,
): Exam {
  return {
    documents: commonDocuments,
    relaxations: [
      "SC/ST, OBC-NCL, PwBD and ex-servicemen relaxations follow the applicable notification.",
      "Always check the certificate format and cut-off date in the official notice.",
    ],
    changeLog: [],
    ...value,
  };
}

export const exams: Exam[] = [
  exam({
    slug: "ibps-po-mt-xvi-2026",
    title: "IBPS Probationary Officer / Management Trainee XVI",
    shortTitle: "IBPS PO XVI",
    aliases: ["IBPS PO 2026", "CRP PO MT XVI", "Bank PO"],
    organisation: "Institute of Banking Personnel Selection",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026–27",
    notificationNumber: "CRP PO/MT-XVI",
    sector: "Banking",
    examTypes: ["Banking & Finance"],
    education: ["Graduate"],
    status: {
      label: "Prelims scheduled",
      tone: "blue",
      nextAction: "Prepare for prelims on 22–23 Aug 2026",
      detail:
        "Registration and the correction window are over. Watch the official page for the call-letter link.",
    },
    summary:
      "A common recruitment process for Probationary Officer and Management Trainee posts in participating public-sector banks.",
    vacancies: 7365,
    vacancyLabel: "7,365 indicative vacancies",
    vacancyNote:
      "Revised on 20 July 2026. Counts are indicative and can change as participating banks report vacancies.",
    vacancyBreakdown: [
      { label: "All participating banks", ur: 2936, ews: 721, obc: 2015, sc: 1131, st: 562, total: 7365 },
    ],
    age: "20–30 years as on 1 Jul 2026",
    qualification: "Bachelor’s degree in any discipline from a recognised university.",
    fee: "₹175 SC/ST/PwBD · ₹850 all others",
    pay: "Basic pay starts at ₹48,480; allowances vary by bank and posting.",
    timeline: [
      { label: "Notification", date: "2026-07-01", displayDate: "1 Jul 2026", state: "completed" },
      { label: "Applications closed", date: "2026-07-26", displayDate: "26 Jul 2026", state: "completed" },
      { label: "Preliminary exam", date: "2026-08-22", displayDate: "22–23 Aug 2026", state: "current" },
      { label: "Main exam", date: "2026-10-04", displayDate: "4 Oct 2026", state: "scheduled" },
      { label: "Provisional allotment", date: "2027-01-15", displayDate: "Jan 2027", state: "tentative" },
    ],
    eligibility: [
      "A graduate in any discipline with the result declared by the notification’s cut-off date.",
      "Computer literacy is expected for the online examination and bank role.",
      "Final eligibility is checked by the allotted bank; appearing in the exam does not confirm eligibility.",
    ],
    selectionStages: ["Preliminary exam", "Main exam", "Personality test", "Interview", "Provisional allotment"],
    syllabus: [
      "Prelims: English Language, Quantitative Aptitude and Reasoning Ability.",
      "Mains: Reasoning, Data Analysis, General/Economy/Banking Awareness, English and descriptive writing.",
      "Negative marking applies to wrong objective answers; use the official notice for the exact scheme.",
    ],
    officialLinks: [
      { label: "Updated vacancy annexure", url: "https://www.ibps.in/wp-content/uploads/CRP_PO_XVI_ANNEXURE-I_updated_20.07.2026.pdf", type: "notice" },
      { label: "Official recruitment page", url: "https://www.ibps.in/index.php/management-trainees-xvi/", type: "notice" },
      { label: "IBPS exam calendar", url: "https://www.ibps.in/wp-content/uploads/IBPS_CALENDAR_2026-27_final.pdf", type: "calendar" },
      { label: "IBPS home", url: "https://www.ibps.in/", type: "website" },
    ],
    sourceTitle: "IBPS CRP PO/MT-XVI recruitment page and 2026–27 calendar",
    sourceUrl: "https://www.ibps.in/index.php/management-trainees-xvi/",
    sourcePublished: "1 Jul 2026; vacancy update 20 Jul 2026",
    lastVerified: "4 Aug 2026, 11:30 IST",
    changeLog: [
      { date: "28 Jul 2026", text: "IBPS posted the application edit-window notice." },
      { date: "20 Jul 2026", text: "Indicative vacancies increased from 6,715 to 7,365." },
      { date: "1 Jul 2026", text: "Detailed notification released." },
    ],
    featured: true,
  }),
  exam({
    slug: "ibps-specialist-officer-xvi-2026",
    title: "IBPS Specialist Officer XVI",
    shortTitle: "IBPS SO XVI",
    aliases: ["IBPS SO 2026", "CRP SPL XVI", "Bank Specialist Officer"],
    organisation: "Institute of Banking Personnel Selection",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026–27",
    notificationNumber: "CRP SPL-XVI",
    sector: "Banking",
    examTypes: ["Banking & Finance", "Specialist & Professional"],
    education: ["Graduate", "Postgraduate", "Professional degree"],
    status: {
      label: "Prelims scheduled",
      tone: "blue",
      nextAction: "Prepare for prelims on 29 Aug 2026",
      detail: "Applications are closed. Qualification rules differ for each specialist post.",
    },
    summary:
      "Recruitment for specialist roles including IT, agriculture, law, Rajbhasha, HR and marketing in public-sector banks.",
    vacancies: 1035,
    vacancyLabel: "1,035 revised vacancies",
    vacancyNote:
      "The initial 745 vacancies were revised on 20 July 2026. Post- and bank-wise counts should be read in the update notice.",
    age: "20–30 years as on 1 Jul 2026",
    qualification:
      "Post-specific degree: engineering/technology, agriculture, law, language, HR or marketing qualifications as prescribed.",
    fee: "₹175 SC/ST/PwBD · ₹850 all others",
    pay: "Scale-I basic pay starts at ₹48,480; allowances vary by bank.",
    timeline: [
      { label: "Notification", date: "2026-07-01", displayDate: "1 Jul 2026", state: "completed" },
      { label: "Applications closed", date: "2026-07-26", displayDate: "26 Jul 2026", state: "completed" },
      { label: "Preliminary exam", date: "2026-08-29", displayDate: "29 Aug 2026", state: "current" },
      { label: "Main exam", date: "2026-11-01", displayDate: "1 Nov 2026", state: "scheduled" },
      { label: "Provisional allotment", date: "2027-01-15", displayDate: "Jan 2027", state: "tentative" },
    ],
    eligibility: [
      "IT Officer: specified engineering, technology or postgraduate computing qualification.",
      "Agricultural Field Officer: specified four-year agriculture or allied degree.",
      "Law, Rajbhasha, HR and Marketing posts each have separate essential qualifications.",
    ],
    selectionStages: ["Preliminary exam", "Main professional-knowledge exam", "Interview", "Provisional allotment"],
    syllabus: [
      "Prelims combines reasoning, English/general awareness or quantitative aptitude, and professional knowledge.",
      "The mains scheme varies by post and includes professional knowledge.",
      "Check the official PDF for post-specific paper language, duration and qualifying rules.",
    ],
    officialLinks: [
      { label: "Official recruitment page", url: "https://www.ibps.in/index.php/specialist-officers-xvi/", type: "notice" },
      { label: "Detailed notification PDF", url: "https://www.ibps.in/wp-content/uploads/Detailed-Notification-CRP-SPL-XVI_Final_V1_30.06.2026.pdf", type: "notice" },
      { label: "IBPS exam calendar", url: "https://www.ibps.in/wp-content/uploads/IBPS_CALENDAR_2026-27_final.pdf", type: "calendar" },
    ],
    sourceTitle: "IBPS CRP SPL-XVI official notification and update page",
    sourceUrl: "https://www.ibps.in/index.php/specialist-officers-xvi/",
    sourcePublished: "1 Jul 2026; vacancy update 20 Jul 2026",
    lastVerified: "4 Aug 2026, 11:30 IST",
    changeLog: [
      { date: "28 Jul 2026", text: "IBPS posted the application edit-window notice." },
      { date: "20 Jul 2026", text: "Indicative vacancies increased from 745 to 1,035." },
    ],
    featured: true,
  }),
  exam({
    slug: "upsc-civil-services-main-2026",
    title: "UPSC Civil Services (Main) Examination 2026",
    shortTitle: "UPSC CSE Main 2026",
    aliases: ["IAS 2026", "UPSC CSE 2026", "Civil Services Mains"],
    organisation: "Union Public Service Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    notificationNumber: "CSP/CSM 2026",
    sector: "Civil services",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Timetable released",
      tone: "violet",
      nextAction: "Read the official mains timetable",
      detail: "Only candidates declared qualified in Civil Services Prelims 2026 can proceed to the mains stage.",
    },
    summary:
      "The written mains stage of the Civil Services Examination for services including IAS, IPS and central Group A/B services.",
    vacancies: 933,
    vacancyLabel: "About 933 vacancies",
    vacancyNote: "The Civil Services notice gives an approximate total; service/category allocation is finalised later.",
    age: "Base CSE rules apply; age and attempt limits vary by category.",
    qualification: "Graduate and qualified in UPSC Civil Services Preliminary Examination 2026.",
    fee: "See the Detailed Application Form / mains notice",
    pay: "Service-specific; many Group A services begin at Level 10.",
    timeline: [
      { label: "Prelims", date: "2026-05-24", displayDate: "24 May 2026", state: "completed" },
      { label: "Prelims result", date: "2026-06-15", displayDate: "15 Jun 2026", state: "completed" },
      { label: "Mains timetable", date: "2026-07-10", displayDate: "10 Jul 2026", state: "completed" },
      { label: "Mains examination", date: "2026-08-21", displayDate: "From 21 Aug 2026", state: "current" },
      { label: "Interview", date: "2027-01-15", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "Must appear in the list of candidates qualified in the 2026 preliminary examination.",
      "Detailed Application Form requirements and service preferences must be completed as directed by UPSC.",
      "Medical and service-specific standards apply at later stages.",
    ],
    selectionStages: ["Preliminary exam", "Nine-paper mains examination", "Personality test", "Service allocation"],
    syllabus: [
      "Qualifying Indian language and English papers.",
      "Essay, four General Studies papers and two papers in one optional subject.",
      "The personality test follows for candidates who clear the written mains cut-off.",
    ],
    officialLinks: [
      { label: "Official mains page", url: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Main%29%20Examination%2C%202026", type: "notice" },
      { label: "Official 2026 CSE notice PDF", url: "https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf", type: "notice" },
      { label: "Prelims page and result", url: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Preliminary%29%20Examination%2C%202026", type: "result" },
      { label: "UPSC active examinations", url: "https://www.upsc.gov.in/examinations/active-exams", type: "website" },
    ],
    sourceTitle: "UPSC Civil Services (Main) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Main%29%20Examination%2C%202026",
    sourcePublished: "Timetable uploaded 10 Jul 2026",
    lastVerified: "4 Aug 2026, 11:10 IST",
    changeLog: [{ date: "10 Jul 2026", text: "UPSC uploaded the 2026 mains timetable." }],
    featured: true,
  }),
  exam({
    slug: "upsc-cds-ii-2026",
    title: "UPSC Combined Defence Services Examination II 2026",
    shortTitle: "UPSC CDS II 2026",
    aliases: ["CDS 2 2026", "Combined Defence Services"],
    organisation: "Union Public Service Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    notificationNumber: "CDS-II 2026",
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["Graduate", "Professional degree"],
    status: {
      label: "Exam scheduled",
      tone: "blue",
      nextAction: "Exam on 13 Sep 2026",
      detail: "Applications are closed. Watch the official exam page for the e-admit card.",
    },
    summary: "Officer-entry examination for IMA, INA, Air Force Academy and Officers’ Training Academy courses.",
    vacancies: 451,
    vacancyLabel: "451 tentative vacancies",
    vacancyNote: "The total is split by academy and course; use the official PDF for the current allocation.",
    age: "Course-specific birth-date, marital-status and gender conditions apply.",
    qualification: "Graduate for IMA/OTA; engineering for INA; degree with Physics and Mathematics conditions for AFA.",
    fee: "₹200; women and SC/ST candidates are exempt",
    pay: "Stipend/pay follows the academy and commissioned rank rules.",
    timeline: [
      { label: "Notification", date: "2026-05-20", displayDate: "20 May 2026", state: "completed" },
      { label: "Applications closed", date: "2026-06-09", displayDate: "9 Jun 2026", state: "completed" },
      { label: "Written exam", date: "2026-09-13", displayDate: "13 Sep 2026", state: "current" },
      { label: "Written result", date: "2026-10-15", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "Qualification, date-of-birth window and marital status depend on the academy selected.",
      "Candidates awaiting a degree result should follow the proof deadlines in the notice.",
      "Successful candidates must meet Services Selection Board and medical standards.",
    ],
    selectionStages: ["Written exam", "Services Selection Board interview", "Medical examination", "Final merit"],
    syllabus: [
      "IMA/INA/AFA: English, General Knowledge and Elementary Mathematics.",
      "OTA: English and General Knowledge.",
      "Papers are objective; the official notice defines level, duration and negative marking.",
    ],
    officialLinks: [
      { label: "Official detailed notice", url: "https://www.upsc.gov.in/sites/default/files/Notif-CDS-II-2026-Engl-200526.pdf", type: "notice" },
      { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "website" },
      { label: "UPSC application portal", url: "https://upsconline.nic.in/", type: "apply" },
    ],
    sourceTitle: "UPSC CDS Examination (II), 2026 notification record",
    sourceUrl: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives",
    sourcePublished: "20 May 2026",
    lastVerified: "4 Aug 2026, 11:10 IST",
  }),
  exam({
    slug: "upsc-nda-na-ii-2026",
    title: "UPSC NDA & Naval Academy Examination II 2026",
    shortTitle: "UPSC NDA II 2026",
    aliases: ["NDA 2 2026", "NA II 2026", "National Defence Academy"],
    organisation: "Union Public Service Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    notificationNumber: "NDA/NA-II 2026",
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["12th"],
    status: {
      label: "Exam scheduled",
      tone: "blue",
      nextAction: "Exam on 13 Sep 2026",
      detail: "Applications are closed. Watch the official page for the e-admit card and centre instructions.",
    },
    summary: "Entry examination after Class 12 for the Army, Navy and Air Force wings of NDA and the Naval Academy.",
    vacancyLabel: "Wing-wise seats in notice",
    vacancyNote: "Vacancies are split by wing and include specific allocations; read the official table.",
    age: "Only unmarried candidates within the notification’s date-of-birth window.",
    qualification: "Class 12; Physics, Chemistry and Mathematics are required for Air Force/Naval wings and Naval Academy.",
    fee: "₹100; exemptions apply as stated in the notice",
    pay: "Training stipend and commissioned pay follow defence service rules.",
    timeline: [
      { label: "Notification", date: "2026-05-20", displayDate: "20 May 2026", state: "completed" },
      { label: "Applications closed", date: "2026-06-11", displayDate: "11 Jun 2026, 6 PM", state: "completed" },
      { label: "Written exam", date: "2026-09-13", displayDate: "13 Sep 2026", state: "current" },
      { label: "SSB", date: "2026-11-15", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "Class 12 appearing candidates may apply subject to proof deadlines in the notice.",
      "Air Force, Naval and Naval Academy choices require Physics, Chemistry and Mathematics at 10+2 level.",
      "Physical and medical standards apply after the written examination.",
    ],
    selectionStages: ["Written exam", "SSB interview", "Medical examination", "Final merit and academy allocation"],
    syllabus: [
      "Mathematics paper.",
      "General Ability Test: English and General Knowledge including science, history, geography and current events.",
      "The official notice gives the detailed topic list and paper scheme.",
    ],
    officialLinks: [
      { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "notice" },
      { label: "UPSC application portal", url: "https://upsconline.nic.in/", type: "apply" },
    ],
    sourceTitle: "UPSC NDA & NA Examination (II), 2026 notification record",
    sourceUrl: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives",
    sourcePublished: "20 May 2026",
    lastVerified: "4 Aug 2026, 11:10 IST",
    featured: true,
  }),
  exam({
    slug: "ssc-cgl-2026",
    title: "SSC Combined Graduate Level Examination 2026",
    shortTitle: "SSC CGL 2026",
    aliases: ["CGL 2026", "Combined Graduate Level", "SSC graduate jobs"],
    organisation: "Staff Selection Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    sector: "Administration",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate", "Professional degree"],
    status: {
      label: "Tier-I upcoming",
      tone: "blue",
      nextAction: "Check SSC for the Aug–Sep 2026 Tier-I schedule",
      detail: "Applications are closed. The official announcement places Tier-I tentatively in August–September 2026.",
    },
    summary: "Recruitment to multiple Group B and Group C posts across central ministries, departments and organisations.",
    vacancies: 12256,
    vacancyLabel: "About 12,256 vacancies",
    vacancyNote: "This is the approximate published total; post- and category-wise tentative vacancies can be revised.",
    age: "Post-specific bands, commonly 18–27, 18–30 or up to 32 years.",
    qualification: "Bachelor’s degree; some statistical posts require specified subjects or marks.",
    fee: "₹100; women, SC/ST, PwBD and eligible ex-servicemen are exempt",
    pay: "Post-specific central pay levels, broadly Level 4 to Level 7 for many posts.",
    timeline: [
      { label: "Notification", date: "2026-05-21", displayDate: "21 May 2026", state: "completed" },
      { label: "Applications closed", date: "2026-06-22", displayDate: "22 Jun 2026", state: "completed" },
      { label: "Tier-I", date: "2026-08-15", displayDate: "Aug–Sep 2026", state: "current", note: "Tentative window" },
      { label: "Tier-II", date: "2026-12-01", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "A recognised bachelor’s degree is the common route.",
      "Junior Statistical Officer and Statistical Investigator posts have additional mathematics/statistics conditions.",
      "Age band, department preference and physical/medical standards differ by post.",
    ],
    selectionStages: ["Tier-I computer-based exam", "Tier-II computer-based exam", "Post-specific qualifying modules", "Document verification"],
    syllabus: [
      "Tier-I: General Intelligence and Reasoning, General Awareness, Quantitative Aptitude and English Comprehension.",
      "Tier-II includes Mathematical Abilities, Reasoning, English, General Awareness, Computer Knowledge and post-specific papers.",
    ],
    officialLinks: [
      { label: "Official SSC/PIB announcement", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2264316&lang=2&reg=3", type: "notice" },
      { label: "SSC official website", url: "https://ssc.gov.in/", type: "website" },
      { label: "SSC 2026–27 calendar PDF", url: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf", type: "calendar" },
    ],
    sourceTitle: "SSC CGL 2026 official announcement and examination calendar",
    sourceUrl: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2264316&lang=2&reg=3",
    sourcePublished: "21 May 2026",
    lastVerified: "4 Aug 2026, 12:05 IST",
    featured: true,
  }),
  exam({
    slug: "ssc-chsl-2026",
    title: "SSC Combined Higher Secondary (10+2) Level Examination 2026",
    shortTitle: "SSC CHSL 2026",
    aliases: ["CHSL 2026", "SSC 12th level", "LDC JSA DEO"],
    organisation: "Staff Selection Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    sector: "Administration",
    examTypes: ["Civil Services & Administration"],
    education: ["12th"],
    status: {
      label: "Tier-I window",
      tone: "violet",
      nextAction: "Check SSC for your exact exam date",
      detail: "The official calendar places Tier-I during July–September 2026. Candidate-specific dates come through SSC.",
    },
    summary: "Recruitment for Group C posts such as Lower Division Clerk, Junior Secretariat Assistant and Data Entry Operator.",
    vacancyLabel: "Vacancies in detailed notice",
    vacancyNote: "Tentative vacancies can be revised; department- and category-wise details may be published separately.",
    age: "Typically 18–27 years; use the 2026 notice for cut-off and relaxations.",
    qualification: "Class 12 or equivalent; some DEO posts have subject requirements.",
    fee: "See the 2026 detailed notice",
    pay: "Post-specific central pay levels.",
    timeline: [
      { label: "Notification", date: "2026-04-01", displayDate: "Apr 2026", state: "completed", note: "Calendar month" },
      { label: "Applications closed", date: "2026-05-31", displayDate: "May 2026", state: "completed", note: "Calendar month" },
      { label: "Tier-I", date: "2026-07-01", displayDate: "Jul–Sep 2026", state: "current", note: "Tentative window" },
      { label: "Tier-II", date: "2026-12-01", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "Must have passed Class 12 by the cut-off date stated in the detailed notice.",
      "Data Entry Operator posts in some offices can require Mathematics as a Class 12 subject.",
      "Nationality, age and certificate rules must be checked in the notice.",
    ],
    selectionStages: ["Tier-I computer-based exam", "Tier-II computer-based exam", "Typing/skill test", "Document verification"],
    syllabus: [
      "Tier-I: English, General Intelligence, Quantitative Aptitude and General Awareness.",
      "Tier-II adds mathematical abilities, reasoning, English, general awareness, computer knowledge and skill/typing modules.",
    ],
    officialLinks: [
      { label: "SSC 2026–27 calendar PDF", url: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf", type: "calendar" },
      { label: "SSC official website", url: "https://ssc.gov.in/", type: "website" },
    ],
    sourceTitle: "SSC Tentative Calendar of Examinations 2026–27",
    sourceUrl: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf",
    sourcePublished: "8 Jan 2026",
    lastVerified: "4 Aug 2026, 10:55 IST",
  }),
  exam({
    slug: "ssc-mts-havaldar-2026",
    title: "SSC MTS & Havaldar Examination 2026",
    shortTitle: "SSC MTS 2026",
    aliases: ["MTS 2026", "Havaldar CBIC CBN", "SSC 10th level"],
    organisation: "Staff Selection Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    sector: "Administration",
    examTypes: ["Civil Services & Administration"],
    education: ["10th"],
    status: {
      label: "Exam window announced",
      tone: "violet",
      nextAction: "Prepare for the Sep–Nov 2026 exam window",
      detail: "The calendar window is tentative. Use SSC login/notice board for city and admission-certificate updates.",
    },
    summary: "Recruitment for Multi-Tasking Staff and Havaldar posts in central government offices, CBIC and CBN.",
    vacancyLabel: "Vacancies in detailed notice",
    vacancyNote: "MTS vacancies may be age-group and region based; Havaldar vacancies can be category and zone based.",
    age: "Post-dependent age bands, commonly 18–25 or 18–27 years.",
    qualification: "Matriculation (Class 10) or equivalent by the specified cut-off date.",
    fee: "See the 2026 detailed notice",
    pay: "Usually Pay Level 1; exact post conditions vary.",
    timeline: [
      { label: "Notification", date: "2026-06-01", displayDate: "Jun 2026", state: "completed", note: "Calendar month" },
      { label: "Applications closed", date: "2026-07-31", displayDate: "Jul 2026", state: "completed", note: "Calendar month" },
      { label: "Computer-based exam", date: "2026-09-01", displayDate: "Sep–Nov 2026", state: "current", note: "Tentative window" },
    ],
    eligibility: [
      "Class 10 pass by the date in the notification.",
      "Havaldar applicants must also satisfy the physical test standards.",
      "Age band differs by the post and department; check before applying.",
    ],
    selectionStages: ["Computer-based exam", "Physical Efficiency/Standard Test for Havaldar", "Document verification"],
    syllabus: [
      "Numerical and Mathematical Ability; Reasoning Ability and Problem Solving.",
      "General Awareness and English Language and Comprehension.",
      "Havaldar adds physical efficiency and physical standard tests.",
    ],
    officialLinks: [
      { label: "SSC 2026–27 calendar PDF", url: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf", type: "calendar" },
      { label: "SSC official website", url: "https://ssc.gov.in/", type: "website" },
    ],
    sourceTitle: "SSC Tentative Calendar of Examinations 2026–27",
    sourceUrl: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf",
    sourcePublished: "8 Jan 2026",
    lastVerified: "4 Aug 2026, 10:55 IST",
    featured: true,
  }),
  exam({
    slug: "ssc-gd-constable-2027",
    title: "SSC Constable GD Examination 2027",
    shortTitle: "SSC GD 2027",
    aliases: ["Constable GD 2027", "CAPF GD", "Assam Rifles Rifleman"],
    organisation: "Staff Selection Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2027",
    sector: "Police & defence",
    examTypes: ["Police & CAPF"],
    education: ["10th"],
    status: {
      label: "Notification expected",
      tone: "amber",
      nextAction: "Notification is planned for Sep 2026",
      detail: "The date comes from SSC’s tentative calendar; vacancies and exact eligibility are not announced yet.",
    },
    summary: "Recruitment for Constable GD in CAPFs and related forces, and Rifleman GD in Assam Rifles.",
    vacancyLabel: "Not announced",
    vacancyNote: "Never treat an expected calendar entry as a vacancy announcement.",
    age: "To be confirmed in the 2027 notice.",
    qualification: "Expected Class 10; confirm cut-off and domicile rules in the notification.",
    fee: "Not announced",
    pay: "Post and force-specific; to be confirmed.",
    timeline: [
      { label: "Notification", date: "2026-09-01", displayDate: "Sep 2026", state: "current", note: "Tentative month" },
      { label: "Applications close", date: "2026-10-31", displayDate: "Oct 2026", state: "tentative" },
      { label: "Computer-based exam", date: "2027-01-01", displayDate: "Jan–Mar 2027", state: "tentative" },
    ],
    eligibility: [
      "Wait for the detailed notice before deciding eligibility.",
      "The cycle normally combines education, age, domicile and physical/medical conditions.",
    ],
    selectionStages: ["Computer-based exam", "Physical Efficiency/Standard Test", "Medical examination", "Document verification"],
    syllabus: ["The detailed 2027 syllabus is not yet published in this dataset."],
    officialLinks: [
      { label: "SSC 2026–27 calendar PDF", url: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf", type: "calendar" },
      { label: "SSC official website", url: "https://ssc.gov.in/", type: "website" },
    ],
    sourceTitle: "SSC Tentative Calendar of Examinations 2026–27",
    sourceUrl: "https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf",
    sourcePublished: "8 Jan 2026",
    lastVerified: "4 Aug 2026, 10:55 IST",
  }),
  exam({
    slug: "rrb-ntpc-undergraduate-07-2025",
    title: "RRB NTPC Undergraduate Posts — CEN 07/2025",
    shortTitle: "RRB NTPC Undergraduate",
    aliases: ["Railway NTPC 12th", "CEN 07/2025", "NTPC UG"],
    organisation: "Railway Recruitment Boards",
    governmentLevel: "Central",
    jurisdiction: "All India / RRB-wise",
    cycle: "2025–26",
    notificationNumber: "CEN 07/2025",
    sector: "Railways",
    examTypes: ["Railways"],
    education: ["12th"],
    status: {
      label: "CBT-2 planned",
      tone: "blue",
      nextAction: "Track the tentative CBT-2 date: 17 Sep 2026",
      detail: "The later-stage date is tentative. Centre- and candidate-specific notices can supersede the general schedule.",
    },
    summary: "Recruitment for 10+2-level non-technical railway posts across participating Railway Recruitment Boards.",
    vacancies: 3058,
    vacancyLabel: "3,058 vacancies",
    vacancyNote: "Vacancies are split by post, RRB and reservation category in the CEN.",
    age: "Post/cycle age rules and relaxations are set in CEN 07/2025.",
    qualification: "Class 12 or equivalent; typing proficiency is required for specified posts.",
    fee: "Category-specific with the CBT attendance refund conditions in the CEN.",
    pay: "Post-specific Railway pay levels.",
    timeline: [
      { label: "Notification", date: "2025-10-28", displayDate: "28 Oct 2025", state: "completed" },
      { label: "Applications closed", date: "2025-12-04", displayDate: "4 Dec 2025", state: "completed" },
      { label: "CBT-1", date: "2026-06-01", displayDate: "Completed", state: "completed", note: "See candidate/centre notices" },
      { label: "CBT-2", date: "2026-09-17", displayDate: "17 Sep 2026", state: "current", note: "Tentative" },
    ],
    eligibility: [
      "Class 12 or equivalent by the qualification cut-off date.",
      "Typing skill applies to specified clerk/accounts posts.",
      "Medical standards and RRB choice affect post suitability.",
    ],
    selectionStages: ["CBT-1", "CBT-2", "Typing skill test where applicable", "Document verification", "Medical examination"],
    syllabus: ["Mathematics, General Intelligence and Reasoning, and General Awareness, followed by post-specific skill checks."],
    officialLinks: [
      { label: "Official CEN 07/2025 lifecycle page", url: "https://www.rrbcdg.gov.in/2025-07-ntpcug.php", type: "notice" },
      { label: "Detailed CEN PDF", url: "https://www.rrbcdg.gov.in/uploads/2025/07-NTPCUG/072025NTPCUG-CEN.pdf", type: "notice" },
    ],
    sourceTitle: "RRB Chandigarh — all notices for CEN 07/2025 NTPC Undergraduate",
    sourceUrl: "https://www.rrbcdg.gov.in/2025-07-ntpcug.php",
    sourcePublished: "Recruitment notice 28 Oct 2025; later-stage update Jul 2026",
    lastVerified: "4 Aug 2026, 12:15 IST",
    changeLog: [{ date: "2026", text: "The official lifecycle includes centre-specific and revised examination notices." }],
  }),
  exam({
    slug: "rrb-paramedical-03-2025",
    title: "RRB Paramedical Categories — CEN 03/2025",
    shortTitle: "RRB Paramedical 2025",
    aliases: ["Railway Paramedical", "CEN 03/2025", "Nursing Superintendent RRB"],
    organisation: "Railway Recruitment Boards",
    governmentLevel: "Central",
    jurisdiction: "All India / RRB-wise",
    cycle: "2025–26",
    notificationNumber: "CEN 03/2025",
    sector: "Health",
    examTypes: ["Railways", "Health & Medical"],
    education: ["Professional degree", "ITI / Diploma"],
    status: {
      label: "CBT completed",
      tone: "violet",
      nextAction: "Watch the official CEN page for the result / scrutiny notice",
      detail: "The computer-based test and objection tracker are complete. Later stages are post- and RRB-specific.",
    },
    summary: "Railway recruitment across seven paramedical categories including Nursing Superintendent and Pharmacist.",
    vacancies: 434,
    vacancyLabel: "434 vacancies",
    vacancyNote: "Includes 272 Nursing Superintendent and 105 Pharmacist vacancies, plus five other categories.",
    age: "Post-specific age limits and relaxations in CEN 03/2025.",
    qualification: "Post-specific nursing, pharmacy, laboratory or allied professional qualification and registration.",
    fee: "Category-specific under the CEN",
    pay: "Post-specific Railway pay levels.",
    timeline: [
      { label: "Detailed notice", date: "2025-08-08", displayDate: "8 Aug 2025", state: "completed" },
      { label: "Computer-based test", date: "2026-03-11", displayDate: "Mar 2026", state: "completed" },
      { label: "Objection tracker", date: "2026-03-20", displayDate: "Mar 2026", state: "completed" },
      { label: "Result / scrutiny", date: "2026-08-15", displayDate: "Awaited", state: "current", note: "No exact date inferred" },
    ],
    eligibility: [
      "Match the exact professional qualification and registration council for the selected category.",
      "Post-specific medical standards apply.",
      "Equivalent qualifications are accepted only where the CEN says so.",
    ],
    selectionStages: ["Computer-based test", "Document verification", "Medical examination", "Panel / appointment process"],
    syllabus: ["Professional ability dominates the CBT, with general awareness, arithmetic, reasoning and general science components as prescribed."],
    officialLinks: [
      { label: "Official CEN 03/2025 lifecycle page", url: "https://www.rrbcdg.gov.in/2025-03-pmed.php", type: "notice" },
      { label: "Detailed notification PDF", url: "https://www.rrbcdg.gov.in/uploads/2025/03-PMED/CEN%2003_2025.pdf", type: "notice" },
    ],
    sourceTitle: "RRB Chandigarh — CEN 03/2025 Paramedical lifecycle page",
    sourceUrl: "https://www.rrbcdg.gov.in/2025-03-pmed.php",
    sourcePublished: "Detailed notice 8 Aug 2025",
    lastVerified: "4 Aug 2026, 12:20 IST",
  }),
  exam({
    slug: "rrb-ntpc-graduate-06-2025",
    title: "RRB NTPC Graduate Posts — CEN 06/2025",
    shortTitle: "RRB NTPC Graduate",
    aliases: ["Railway NTPC 2025", "CEN 06/2025", "NTPC Graduate"],
    organisation: "Railway Recruitment Boards",
    governmentLevel: "Central",
    jurisdiction: "All India / RRB-wise",
    cycle: "2025–26",
    notificationNumber: "CEN 06/2025",
    sector: "Railways",
    examTypes: ["Railways"],
    education: ["Graduate"],
    status: {
      label: "CBT-2 completed",
      tone: "violet",
      nextAction: "Watch the official RRB page for the CBT-2 result",
      detail: "CBT-1 ran in March 2026 and CBT-2 was held on 10 July. Post-specific later stages follow.",
    },
    summary: "Recruitment for graduate-level non-technical railway posts across participating Railway Recruitment Boards.",
    vacancies: 5810,
    vacancyLabel: "5,810 vacancies",
    vacancyNote: "Vacancies are split across five posts and RRB/category tables; do not combine one board’s rows with another.",
    age: "Post/cycle age rules with a 1 Jan 2026 reckoning date.",
    qualification: "Bachelor’s degree; post-specific typing or aptitude requirements can apply.",
    fee: "Category-specific, with refund rules after appearing in CBT as stated in the CEN.",
    pay: "Post-specific Railway pay levels.",
    timeline: [
      { label: "Notification", date: "2025-10-21", displayDate: "21 Oct 2025", state: "completed" },
      { label: "Applications closed", date: "2025-11-27", displayDate: "27 Nov 2025", state: "completed" },
      { label: "CBT-1", date: "2026-03-16", displayDate: "16–27 Mar 2026", state: "completed" },
      { label: "Objection tracker closed", date: "2026-04-12", displayDate: "12 Apr 2026", state: "completed" },
      { label: "CBT-2", date: "2026-07-10", displayDate: "10 Jul 2026", state: "completed" },
      { label: "CBT-2 result / next stage", date: "2026-08-15", displayDate: "Awaited", state: "current", note: "No exact date inferred" },
    ],
    eligibility: [
      "A recognised bachelor’s degree by the revised closing date.",
      "Some posts require typing proficiency; Station Master has a computer-based aptitude stage.",
      "Medical standards vary by post and can affect final appointment.",
    ],
    selectionStages: ["CBT-1", "CBT-2", "Typing skill or aptitude test where applicable", "Document verification", "Medical examination"],
    syllabus: [
      "Mathematics, General Intelligence and Reasoning, and General Awareness.",
      "Stage and post-specific qualifying tests follow CBT-2.",
    ],
    officialLinks: [
      { label: "Official CEN 06/2025 updates", url: "https://www.rrbcdg.gov.in/2025-06-ntpcg.php", type: "notice" },
      { label: "Detailed CEN PDF", url: "https://rrbchennai.gov.in/downloads/Final-CEN-06-2025-21-10-2025-Publish.pdf", type: "notice" },
      { label: "RRB employment notices", url: "https://www.rrbcdg.gov.in/employment-notices.php", type: "website" },
    ],
    sourceTitle: "RRB Chandigarh — all notices for CEN 06/2025 NTPC Graduate",
    sourceUrl: "https://www.rrbcdg.gov.in/2025-06-ntpcg.php",
    sourcePublished: "Recruitment notice 21 Oct 2025; latest listed event 6 Apr 2026",
    lastVerified: "4 Aug 2026, 11:20 IST",
    changeLog: [
      { date: "6 Apr 2026", text: "Question paper, responses and objection tracker opened." },
      { date: "19 Nov 2025", text: "Application and modification timelines were extended." },
    ],
    featured: true,
  }),
  exam({
    slug: "tnpsc-technical-diploma-iti-2026",
    title: "TNPSC Combined Technical Services — Diploma / ITI Level 2026",
    shortTitle: "TNPSC Diploma / ITI 2026",
    aliases: ["TNPSC CTS 2026", "Tamil Nadu diploma jobs", "TNPSC ITI exam"],
    organisation: "Tamil Nadu Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Tamil Nadu",
    state: "Tamil Nadu",
    stateCode: "TN",
    cycle: "2026",
    sector: "Technical services",
    examTypes: ["Technical & Trades"],
    education: ["ITI / Diploma"],
    status: {
      label: "Exam scheduled",
      tone: "blue",
      nextAction: "Examination begins 20 Sep 2026",
      detail: "The annual planner schedules seven days of examinations; candidate-specific subjects and dates come from the notification.",
    },
    summary: "Combined Tamil Nadu recruitment for technical posts whose prescribed qualification is at diploma or ITI level.",
    vacancyLabel: "See the 2026 notification",
    vacancyNote: "The annual planner does not publish a vacancy total; post/category distribution belongs to the notification.",
    age: "Post- and community-specific under TNPSC rules.",
    qualification: "Specified diploma or ITI trade/discipline for each technical post.",
    fee: "See the 2026 notification",
    pay: "Post-specific Tamil Nadu pay levels.",
    timeline: [
      { label: "Notification", date: "2026-07-07", displayDate: "7 Jul 2026", state: "completed" },
      { label: "Examination", date: "2026-09-20", displayDate: "From 20 Sep 2026 · 7 days", state: "current", note: "Planner schedule" },
      { label: "Selection schedule", date: "2026-12-01", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "The exact diploma/ITI trade must match the selected post.",
      "Some posts add experience, licence, physical or registration requirements.",
      "Tamil knowledge and state reservation rules apply as prescribed.",
    ],
    selectionStages: ["Computer/OMR examination as notified", "Certificate verification", "Counselling or selection as prescribed"],
    syllabus: ["Post/discipline technical subject plus the common components published by TNPSC for the recruitment."],
    officialLinks: [
      { label: "TNPSC 2026 annual planner", url: "https://www.tnpsc.gov.in/English/annual_planner.html", type: "calendar" },
      { label: "TNPSC official website", url: "https://www.tnpsc.gov.in/", type: "website" },
    ],
    sourceTitle: "TNPSC Annual Planner — Programme of Examinations 2026",
    sourceUrl: "https://www.tnpsc.gov.in/English/annual_planner.html",
    sourcePublished: "3 Dec 2025; notification date listed 7 Jul 2026",
    lastVerified: "4 Aug 2026, 12:25 IST",
    featured: true,
  }),
  exam({
    slug: "bpsc-72nd-cce-2026",
    title: "BPSC Integrated 72nd Combined Competitive Examination",
    shortTitle: "BPSC 72nd CCE",
    aliases: ["72 CCE", "Bihar PCS 2026", "BPSC 72"],
    organisation: "Bihar Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Bihar",
    state: "Bihar",
    stateCode: "BR",
    cycle: "2026",
    sector: "State civil services",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Postponed",
      tone: "red",
      nextAction: "Wait for BPSC’s revised prelims date",
      detail: "BPSC’s official notice board lists the preliminary examination as postponed. Do not rely on the earlier date.",
    },
    summary: "Bihar’s integrated competitive examination for multiple state services and posts.",
    vacancyLabel: "Current total under revision",
    vacancyNote: "BPSC issued a corrigendum deleting 44 Sugarcane Officer vacancies; use the latest vacancy document.",
    age: "Post- and category-specific under Bihar recruitment rules.",
    qualification: "Graduate; some included posts can carry additional requirements.",
    fee: "See the detailed advertisement and payment/refund notices",
    pay: "Post-specific Bihar pay levels.",
    timeline: [
      { label: "Exam calendar date", date: "2026-07-26", displayDate: "26 Jul 2026", state: "postponed" },
      { label: "Revised prelims", date: "2026-09-01", displayDate: "Awaited", state: "current" },
    ],
    eligibility: [
      "Graduate qualification is the common path; verify every selected post.",
      "Bihar reservation, domicile and certificate rules must be matched to the current advertisement.",
      "Use the revised vacancy and postponement notices, not saved copies of the original schedule.",
    ],
    selectionStages: ["Preliminary exam", "Main written exam", "Interview", "Final result"],
    syllabus: ["General Studies preliminary paper followed by the main examination scheme in the official advertisement."],
    officialLinks: [
      { label: "BPSC official notice board", url: "https://bpsc.bihar.gov.in/whats-new/", type: "notice" },
      { label: "BPSC exam calendar", url: "https://bpsc.bihar.gov.in/exam-calendar-2/", type: "calendar" },
    ],
    sourceTitle: "BPSC What’s New and official exam calendar",
    sourceUrl: "https://bpsc.bihar.gov.in/whats-new/",
    sourcePublished: "Postponement notice current on 4 Aug 2026",
    lastVerified: "4 Aug 2026, 11:45 IST",
    changeLog: [
      { date: "Aug 2026", text: "BPSC listed the 72nd CCE preliminary examination as postponed." },
      { date: "2026", text: "A corrigendum deleted 44 Sugarcane Officer vacancies." },
    ],
    featured: true,
  }),
  exam({
    slug: "tnpsc-group-ii-iia-2026",
    title: "TNPSC Combined Civil Services Examination II (Group II & IIA) 2026",
    shortTitle: "TNPSC Group II / IIA",
    aliases: ["TNPSC Group 2 2026", "CCSE II", "Tamil Nadu Group IIA"],
    organisation: "Tamil Nadu Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Tamil Nadu",
    state: "Tamil Nadu",
    stateCode: "TN",
    cycle: "2026",
    sector: "State administration",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Notification soon",
      tone: "amber",
      nextAction: "Notification planned for 11 Aug 2026",
      detail: "The date is from TNPSC’s tentative annual planner. Vacancies and the application deadline await the notification.",
    },
    summary: "Tamil Nadu recruitment for Group II interview and Group IIA non-interview service posts.",
    vacancyLabel: "Not announced",
    vacancyNote: "TNPSC’s planner explicitly says vacancies will be announced in the notification.",
    age: "Post- and community-specific; to be confirmed in the 2026 notification.",
    qualification: "Usually a recognised degree, with post-specific qualifications and Tamil-language requirements.",
    fee: "Not announced",
    pay: "Post-specific Tamil Nadu pay levels.",
    timeline: [
      { label: "Notification", date: "2026-08-11", displayDate: "11 Aug 2026", state: "current", note: "Tentative" },
      { label: "Preliminary exam", date: "2026-10-25", displayDate: "25 Oct 2026", state: "scheduled", note: "Tentative" },
      { label: "Mains", date: "2027-02-01", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "Wait for the 2026 notification before treating past-cycle rules as current.",
      "Post-specific degrees, Tamil eligibility test and reservation rules can differ.",
    ],
    selectionStages: ["Preliminary exam", "Main examination", "Interview for Group II posts where prescribed", "Certificate verification"],
    syllabus: ["TNPSC publishes the scheme and syllabus, but notes they may change up to the notification date."],
    officialLinks: [
      { label: "TNPSC 2026 annual planner", url: "https://www.tnpsc.gov.in/English/annual_planner.html", type: "calendar" },
      { label: "TNPSC official website", url: "https://www.tnpsc.gov.in/", type: "website" },
    ],
    sourceTitle: "TNPSC Annual Planner — Programme of Examinations 2026",
    sourceUrl: "https://www.tnpsc.gov.in/English/annual_planner.html",
    sourcePublished: "3 Dec 2025",
    lastVerified: "4 Aug 2026, 11:40 IST",
    featured: true,
  }),
  exam({
    slug: "tnpsc-group-i-2026",
    title: "TNPSC Combined Civil Services Examination I 2026",
    shortTitle: "TNPSC Group I 2026",
    aliases: ["Tamil Nadu Group 1", "CCSE I 2026", "TNPSC Group One"],
    organisation: "Tamil Nadu Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Tamil Nadu",
    state: "Tamil Nadu",
    stateCode: "TN",
    cycle: "2026",
    sector: "State civil services",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Prelims scheduled",
      tone: "blue",
      nextAction: "Preliminary exam on 6 Sep 2026",
      detail: "The annual planner marks the date as tentative; use the cycle notification for candidate-specific rules.",
    },
    summary: "Tamil Nadu’s competitive examination for senior state service posts.",
    vacancyLabel: "See 2026 notification",
    vacancyNote: "Post and communal reservation tables must be read from the current notification and addenda.",
    age: "Post- and category-specific under TNPSC rules.",
    qualification: "Recognised degree; some posts have preference or physical requirements.",
    fee: "See the 2026 notification",
    pay: "Post-specific Tamil Nadu pay levels.",
    timeline: [
      { label: "Notification", date: "2026-06-23", displayDate: "23 Jun 2026", state: "completed" },
      { label: "Preliminary exam", date: "2026-09-06", displayDate: "6 Sep 2026", state: "current", note: "Planner date" },
      { label: "Main exam", date: "2027-01-15", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "A recognised degree is the common educational path.",
      "Certain posts can add physical, subject or preference conditions.",
      "Tamil eligibility and community-certificate requirements must be checked in the current notice.",
    ],
    selectionStages: ["Preliminary exam", "Main written exam", "Interview", "Certificate verification"],
    syllabus: ["General Studies and aptitude at prelims, followed by descriptive mains papers prescribed by TNPSC."],
    officialLinks: [
      { label: "TNPSC 2026 annual planner", url: "https://www.tnpsc.gov.in/English/annual_planner.html", type: "calendar" },
      { label: "TNPSC official website", url: "https://www.tnpsc.gov.in/", type: "website" },
    ],
    sourceTitle: "TNPSC Annual Planner — Programme of Examinations 2026",
    sourceUrl: "https://www.tnpsc.gov.in/English/annual_planner.html",
    sourcePublished: "3 Dec 2025",
    lastVerified: "4 Aug 2026, 11:40 IST",
  }),
  exam({
    slug: "uppsc-pcs-2026",
    title: "UPPSC Combined State / Upper Subordinate Services Examination 2026",
    shortTitle: "UPPSC PCS 2026",
    aliases: ["UP PCS 2026", "Uttar Pradesh PCS", "A-1/E-1/2026"],
    organisation: "Uttar Pradesh Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Uttar Pradesh",
    state: "Uttar Pradesh",
    stateCode: "UP",
    cycle: "2026",
    notificationNumber: "A-1/E-1/2026",
    sector: "State civil services",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate", "Professional degree"],
    status: {
      label: "Applications closed",
      tone: "slate",
      nextAction: "Watch UPPSC for the prelims schedule",
      detail: "The live advertisement was visible through 3 August 2026. The next candidate action depends on UPPSC notices.",
    },
    summary: "Uttar Pradesh’s combined examination for general and special recruitment to state and subordinate services.",
    vacancyLabel: "Post-wise in advertisement",
    vacancyNote: "Special-recruitment and general posts can carry different eligibility and reservation conditions.",
    age: "Post- and category-specific under the 2026 advertisement.",
    qualification: "Graduate for the common route; some posts require a specified subject or professional qualification.",
    fee: "See advertisement A-1/E-1/2026",
    pay: "Post-specific Uttar Pradesh pay levels.",
    timeline: [
      { label: "Advertisement", date: "2026-07-01", displayDate: "2026", state: "completed" },
      { label: "Live application ended", date: "2026-08-03", displayDate: "3 Aug 2026", state: "completed" },
      { label: "Preliminary exam", date: "2026-12-01", displayDate: "Await official schedule", state: "current" },
    ],
    eligibility: [
      "Check the qualification against each post selected in the advertisement.",
      "UP domicile and category claims require the prescribed certificate and cut-off date.",
      "An OTR number is required for the UPPSC application workflow.",
    ],
    selectionStages: ["Preliminary exam", "Main written exam", "Interview", "Final selection"],
    syllabus: ["General Studies preliminary papers followed by the PCS mains scheme in the official advertisement."],
    officialLinks: [
      { label: "UPPSC important notices", url: "https://uppsc.up.nic.in/OuterPages/NoticeAlert.aspx", type: "notice" },
      { label: "UPPSC official website", url: "https://uppsc.up.nic.in/", type: "website" },
    ],
    sourceTitle: "UPPSC live advertisement and important notices",
    sourceUrl: "https://uppsc.up.nic.in/OuterPages/NoticeAlert.aspx",
    sourcePublished: "Live advertisement visible through 3 Aug 2026",
    lastVerified: "4 Aug 2026, 11:50 IST",
  }),
  exam({
    slug: "mp-esb-police-constable-2025",
    title: "MP ESB Police Constable Recruitment Test 2025",
    shortTitle: "MP Police Constable 2025",
    aliases: ["Madhya Pradesh Police", "MPESB constable", "PCRT 2025"],
    organisation: "Madhya Pradesh Employees Selection Board",
    governmentLevel: "State",
    jurisdiction: "Madhya Pradesh",
    state: "Madhya Pradesh",
    stateCode: "MP",
    cycle: "2025–26",
    sector: "Police & defence",
    examTypes: ["Police & CAPF"],
    education: ["10th", "12th"],
    status: {
      label: "Selection completed",
      tone: "slate",
      nextAction: "Use the official dashboard for final result and unit allotment",
      detail: "The official result trail records the final result on 9 April and unit allotment on 30 April 2026.",
    },
    summary: "Madhya Pradesh recruitment for Police Constable posts through the Employees Selection Board.",
    vacancies: 7500,
    vacancyLabel: "7,500 posts",
    vacancyNote: "Education, category and physical-stage rules differ; use the rulebook’s distribution tables.",
    age: "Category- and domicile-specific under the 2025 rulebook.",
    qualification: "School-level qualification varies by category/post under the MP rulebook.",
    fee: "See the official rulebook and portal",
    pay: "Madhya Pradesh Police pay scale as prescribed in the rulebook.",
    timeline: [
      { label: "Application deadline", date: "2025-10-22", displayDate: "22 Oct 2025 · extended", state: "completed" },
      { label: "Written exam", date: "2025-10-30", displayDate: "30 Oct–15 Dec 2025", state: "completed" },
      { label: "First result", date: "2026-01-25", displayDate: "25 Jan 2026", state: "completed" },
      { label: "Final result", date: "2026-04-09", displayDate: "9 Apr 2026", state: "completed" },
      { label: "Unit allotment", date: "2026-04-30", displayDate: "30 Apr 2026", state: "completed" },
    ],
    eligibility: [
      "Use the category/post row in the rulebook for the precise school qualification.",
      "Physical standards and efficiency tests are part of selection.",
      "MP domicile and reservation certificates must meet the rulebook conditions.",
    ],
    selectionStages: ["Written examination", "Physical measurement/efficiency stages", "Document and medical checks", "Final result and unit allotment"],
    syllabus: ["The rulebook defines written subjects, marking and physical standards for this recruitment."],
    officialLinks: [
      { label: "Official 2025 rulebook", url: "https://esb.mp.gov.in/rulebooks/RB_2025/PCRT_2025_Rulebook.pdf", type: "notice" },
      { label: "MP ESB student dashboard", url: "https://esb.mp.gov.in/student_dashboard.htm", type: "website" },
      { label: "MP ESB results", url: "https://esb.mp.gov.in/results/results_n.htm", type: "result" },
    ],
    sourceTitle: "MP ESB Police Constable 2025 rulebook, dashboard and results",
    sourceUrl: "https://esb.mp.gov.in/student_dashboard.htm",
    sourcePublished: "Final result 9 Apr 2026; unit allotment 30 Apr 2026",
    lastVerified: "4 Aug 2026, 12:35 IST",
  }),
  exam({
    slug: "rpsc-school-lecturer-2025",
    title: "RPSC School Lecturer Examination 2025",
    shortTitle: "RPSC School Lecturer",
    aliases: ["Rajasthan 1st grade teacher", "RPSC Lecturer 2025", "School Education Lecturer"],
    organisation: "Rajasthan Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Rajasthan",
    state: "Rajasthan",
    stateCode: "RJ",
    cycle: "2025–26",
    sector: "Teaching",
    examTypes: ["Teaching & Education"],
    education: ["Postgraduate", "Professional degree"],
    status: {
      label: "Written exams completed",
      tone: "violet",
      nextAction: "Track subject-wise answer key and result notices",
      detail: "The subject examinations ran from 31 May to 16 June 2026. Later notices are subject-specific.",
    },
    summary: "Rajasthan recruitment for School Lecturer posts across 27 subjects in the School Education Department.",
    vacancies: 3225,
    vacancyLabel: "3,225 vacancies",
    vacancyNote: "The advertisement distributes vacancies by subject and reservation category.",
    age: "As prescribed in the 2025 advertisement with Rajasthan-category relaxations.",
    qualification: "Relevant postgraduate degree plus B.Ed or the specified equivalent for the chosen subject.",
    fee: "See the RPSC advertisement and OTR fee rules",
    pay: "Rajasthan pay matrix for School Lecturer posts.",
    timeline: [
      { label: "Advertisement", date: "2025-07-17", displayDate: "17 Jul 2025", state: "completed" },
      { label: "Applications", date: "2025-08-14", displayDate: "14 Aug–12 Sep 2025", state: "completed" },
      { label: "Subject exams", date: "2026-05-31", displayDate: "31 May–16 Jun 2026", state: "completed" },
      { label: "Answer keys / results", date: "2026-08-15", displayDate: "Subject-wise · awaited", state: "current", note: "No exact date inferred" },
    ],
    eligibility: [
      "Relevant postgraduate subject must match the advertised lecturer subject.",
      "B.Ed or the notification’s accepted teaching qualification is generally required.",
      "Read subject-wise vacancy and qualification rows before treating yourself as eligible.",
    ],
    selectionStages: ["Subject-wise written examination", "Eligibility/document scrutiny", "Final merit and recommendation"],
    syllabus: ["General awareness/education components and the selected postgraduate subject as detailed by RPSC."],
    officialLinks: [
      { label: "RPSC advertisement listing", url: "https://rpsc.rajasthan.gov.in/advertisements?Pie=343", type: "notice" },
      { label: "Official advertisement PDF", url: "https://rpsc.rajasthan.gov.in/Static/RecruitmentAdvertisements/9C26ACB4C6014924AF100B4D7FE67C27.pdf", type: "notice" },
      { label: "Official exam dates", url: "https://rpsc.rajasthan.gov.in/proposedexamdate?Pie=343", type: "calendar" },
    ],
    sourceTitle: "RPSC School Lecturer 2025 advertisement and proposed exam dates",
    sourceUrl: "https://rpsc.rajasthan.gov.in/advertisements?Pie=343",
    sourcePublished: "17 Jul 2025",
    lastVerified: "4 Aug 2026, 12:30 IST",
  }),
  exam({
    slug: "rpsc-statistical-officer-2025",
    title: "RPSC Statistical Officer Examination 2025",
    shortTitle: "RPSC Statistical Officer",
    aliases: ["Rajasthan Statistical Officer", "RPSC SO 2025"],
    organisation: "Rajasthan Public Service Commission",
    governmentLevel: "State",
    jurisdiction: "Rajasthan",
    state: "Rajasthan",
    stateCode: "RJ",
    cycle: "2025–26",
    sector: "Statistics",
    examTypes: ["Specialist & Professional"],
    education: ["Postgraduate", "Professional degree"],
    status: {
      label: "Exam scheduled",
      tone: "blue",
      nextAction: "Written exam on 30 Aug 2026",
      detail: "The date appears in RPSC’s consolidated 2026 examination calendar.",
    },
    summary: "Rajasthan recruitment examination for Statistical Officer posts in the Statistics Department.",
    vacancyLabel: "See advertisement 11/2025–26",
    vacancyNote: "Use the recruitment advertisement for category distribution and the calendar only for the exam date.",
    age: "As prescribed in advertisement 11/2025–26.",
    qualification: "Postgraduate/statistics-related qualification as specified in the advertisement.",
    fee: "See the RPSC advertisement",
    pay: "Rajasthan pay matrix as stated in the advertisement.",
    timeline: [
      { label: "Advertisement", date: "2025-10-14", displayDate: "14 Oct 2025", state: "completed" },
      { label: "Exam", date: "2026-08-30", displayDate: "30 Aug 2026", state: "current" },
    ],
    eligibility: [
      "Use the exact subject combinations and experience clauses in advertisement 11/2025–26.",
      "Rajasthan reservation and certificate conditions apply where claimed.",
    ],
    selectionStages: ["Written examination", "Eligibility/document scrutiny", "Final selection"],
    syllabus: ["Statistics-domain syllabus and general components as published by RPSC for this recruitment."],
    officialLinks: [
      { label: "RPSC recruitment advertisements", url: "https://rpsc.rajasthan.gov.in/advertisements", type: "notice" },
      { label: "RPSC 2026 exam calendar", url: "https://rpsc.rajasthan.gov.in/forthcomingexaminations", type: "calendar" },
    ],
    sourceTitle: "RPSC recruitment advertisement list and consolidated 2026 calendar",
    sourceUrl: "https://rpsc.rajasthan.gov.in/forthcomingexaminations",
    sourcePublished: "Calendar released 26 Dec 2025",
    lastVerified: "4 Aug 2026, 11:55 IST",
  }),
];

export const educationOptions: { value: "All" | EducationLevel; label: string; description: string }[] = [
  { value: "All", label: "Any qualification", description: "See the full catalogue" },
  { value: "10th", label: "Class 10", description: "MTS, constable and support roles" },
  { value: "12th", label: "Class 12", description: "CHSL, NDA and 10+2 routes" },
  { value: "ITI / Diploma", label: "ITI / Diploma", description: "Technical and trade recruitments" },
  { value: "Graduate", label: "Any graduate", description: "Civil services, banks and railways" },
  { value: "Postgraduate", label: "Postgraduate", description: "Specialist and research posts" },
  { value: "Professional degree", label: "Professional degree", description: "Engineering, law, medical and domain roles" },
];

export const statusOrder: StatusTone[] = ["red", "green", "amber", "blue", "violet", "slate"];

export function getExam(slug: string) {
  return exams.find((item) => item.slug === slug);
}

export function getSearchText(item: Exam) {
  return [
    item.title,
    item.shortTitle,
    ...item.aliases,
    item.organisation,
    item.jurisdiction,
    item.state,
    item.notificationNumber,
    item.sector,
    ...item.examTypes,
    ...item.education,
    item.qualification,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en-IN");
}

export const calendarEvents = exams
  .flatMap((item) =>
    item.timeline.map((event) => ({
      ...event,
      examSlug: item.slug,
      examTitle: item.shortTitle,
      organisation: item.organisation,
      tone: item.status.tone,
    })),
  )
  .sort((a, b) => a.date.localeCompare(b.date));
