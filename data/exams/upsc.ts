import { exam, listedExam, NOT_ANNOUNCED, type Authority, type Exam } from "@/lib/exam-types";

// upsc recruitment records.
// Every record must cite an official host listed in `authorities` below.

export const authorities: Authority[] = [
  {
    id: "upsc",
    name: "Union Public Service Commission",
    level: "Central",
    allowedHosts: ["www.upsc.gov.in","upsc.gov.in","upsconline.nic.in"],
    watchUrls: ["https://www.upsc.gov.in/examinations/active-exams"],
  },
];

function activeUpscExam(value: {
  slug: string;
  title: string;
  shortTitle: string;
  aliases: string[];
  sector: string;
  examTypes: Exam["examTypes"];
  education: Exam["education"];
  nextAction: string;
  summary: string;
  /** The exam's own page under upsc.gov.in/examinations/..., confirmed to exist. */
  examPageUrl: string;
  keywords?: string[];
  /**
   * Optional standing-scheme detail. These stay on a `listed` record because the
   * cycle's own dated notice is the source: the published scheme of examination,
   * eligibility conditions and fee are stable facts, while the record still makes
   * no claim about vacancies or remaining stage dates. Each string names the
   * notice it comes from.
   */
  age?: string;
  qualification?: string;
  fee?: string;
  pay?: string;
  eligibility?: string[];
  selectionStages?: string[];
  syllabus?: string[];
  /**
   * The dated stages the exam's own official page publishes for this cycle
   * (notification, application deadline, examination, written result, later
   * stage notices). Supplying them makes the record `verified`, because those
   * dates are read from a dated cycle-specific official page rather than from
   * the standing scheme. Vacancies stay unclaimed either way.
   */
  timeline?: Exam["timeline"];
  status?: Exam["status"];
  /** Extra cycle documents to link beside the exam page, newest first. */
  extraLinks?: Exam["officialLinks"];
  sourceTitle?: string;
  sourceUrl?: string;
  sourcePublished?: string;
  lastVerified?: string;
  changeLog?: Exam["changeLog"];
}) {
  const { examPageUrl, keywords, timeline, status, extraLinks, sourceTitle, sourceUrl, sourcePublished, lastVerified, changeLog, ...rest } = value;
  const officialLinks: Exam["officialLinks"] = [
    { label: "Official examination page", url: examPageUrl, type: "notice" },
    ...(extraLinks ?? []),
    { label: "UPSC active examinations", url: "https://www.upsc.gov.in/examinations/active-exams", type: "website" },
    { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "notice" },
  ];
  const shared = {
    ...rest,
    keywords,
    organisation: "Union Public Service Commission",
    governmentLevel: "Central" as const,
    jurisdiction: "All India",
    cycle: "2026",
    year: 2026,
    status: status ?? {
      label: "Officially active",
      tone: "violet" as const,
      nextAction: value.nextAction,
      detail: "UPSC lists this cycle as active. Open the official examination page for the latest stage-specific notice.",
    },
    officialLinks,
    sourceTitle: sourceTitle ?? "UPSC active examinations — 2026 cycle listing",
    sourceUrl: sourceUrl ?? "https://www.upsc.gov.in/examinations/active-exams",
    sourcePublished: sourcePublished ?? "Active list checked 19 Aug 2026",
    lastVerified: lastVerified ?? "19 Aug 2026, 22:15 IST",
  };
  if (!timeline) {
    return listedExam({
      ...shared,
      timeline: [{ label: "Next official update", displayDate: "Not announced", state: "current" }],
    });
  }
  return exam({
    ...shared,
    verification: "verified",
    vacancyLabel: NOT_ANNOUNCED,
    vacancyNote: "UPSC publishes the vacancy count for this cycle separately; none is claimed here.",
    age: value.age ?? "As prescribed in the notification.",
    qualification: value.qualification ?? "See the official notification; no current-cycle qualification is asserted here.",
    fee: value.fee ?? "See the official notification",
    pay: value.pay ?? "See the official notification",
    eligibility: value.eligibility ?? [
      "Confirm education, age, nationality, domicile and category rules in the official current-cycle notice.",
    ],
    selectionStages: value.selectionStages ?? [
      "See the official notification; no current-cycle selection stages are asserted here.",
    ],
    syllabus: value.syllabus ?? ["Use only the official current-cycle syllabus when it is published."],
    timeline,
    changeLog: changeLog ?? [],
  });
}

export const exams: Exam[] = [
  exam({
    slug: "upsc-civil-services-main-2026",
    title: "UPSC Civil Services (Main) Examination 2026",
    shortTitle: "UPSC CSE Main 2026",
    aliases: ["IAS 2026", "UPSC CSE 2026", "Civil Services Mains"],
    organisation: "Union Public Service Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    year: 2026,
    verification: "verified",
    notificationNumber: "05/2026-CSE",
    sector: "Civil services",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Admit card released",
      tone: "blue",
      nextAction: "Download the mains e-admit card",
      detail:
        "The press note of 19 Aug 2026 confirms the mains sittings on 21–23 and 29–30 Aug 2026. Only candidates declared qualified in Civil Services Prelims 2026 can proceed to the mains stage.",
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
      { label: "e-Admit card", date: "2026-08-14", displayDate: "14 Aug 2026", state: "completed" },
      { label: "Mains examination", date: "2026-08-21", displayDate: "21–23 Aug and 29–30 Aug 2026", state: "current" },
      { label: "Question paper representation portal", date: "2026-08-31", displayDate: "31 Aug – 4 Sep 2026", state: "scheduled" },
      { label: "Interview", displayDate: "To be announced", state: "tentative" },
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
      { label: "Press note dated 19 Aug 2026", url: "https://www.upsc.gov.in/sites/default/files/PressNote-CSM-2026-Engl-190826.pdf", type: "notice" },
      { label: "Mains examination time table", url: "https://www.upsc.gov.in/sites/default/files/TT-CSM-2026-Engl-100726.pdf", type: "notice" },
      { label: "Official 2026 CSE notice PDF", url: "https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf", type: "notice" },
      { label: "Prelims page and result", url: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Preliminary%29%20Examination%2C%202026", type: "result" },
      { label: "UPSC active examinations", url: "https://www.upsc.gov.in/examinations/active-exams", type: "website" },
    ],
    sourceTitle: "UPSC Civil Services (Main) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Civil%20Services%20%28Main%29%20Examination%2C%202026",
    sourcePublished: "Press note dated 19 Aug 2026; e-admit card uploaded 14 Aug 2026",
    lastVerified: "19 Aug 2026, 22:15 IST",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "UPSC's press note of 19 Aug 2026 confirms the mains sittings on 21–23 and 29–30 Aug 2026 and opens the question-paper representation portal from 31 Aug to 4 Sep 2026. The e-admit card was uploaded on 14 Aug 2026.",
      },
      { date: "2026-07-10", displayDate: "10 Jul 2026", text: "UPSC uploaded the 2026 mains timetable." },
    ],
    keywords: [
      "IAS mains",
      "IPS mains",
      "IFS mains",
      "IRS mains",
      "Group A and Group B central services",
      "संघ लोक सेवा आयोग",
      "सिविल सेवा मुख्य परीक्षा",
      "UPSC mains",
      "civil services exam",
      "UPSC CSE mains",
      "Indian Administrative Service",
      "Indian Police Service",
      "Indian Foreign Service",
      "optional subject paper",
    ],
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
    year: 2026,
    verification: "verified",
    notificationNumber: "11/2026-CDS-II",
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["Graduate", "Professional degree"],
    status: {
      label: "Timetable released",
      tone: "blue",
      nextAction: "Exam on 13 Sep 2026",
      detail: "Applications are closed. UPSC uploaded the examination time table on 10 Aug 2026; the e-admit card follows on the same page.",
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
      { label: "Applications closed", date: "2026-06-11", displayDate: "11 Jun 2026, 6 PM", state: "completed" },
      { label: "Examination time table", date: "2026-08-10", displayDate: "10 Aug 2026", state: "completed" },
      { label: "Written exam", date: "2026-09-13", displayDate: "13 Sep 2026", state: "scheduled" },
      { label: "Written result", displayDate: "To be announced", state: "tentative" },
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
      { label: "Official examination page", url: "https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination%20%28II%29%2C%202026", type: "notice" },
      { label: "Examination time table", url: "https://www.upsc.gov.in/sites/default/files/TT-CDSE-II-2026-Engl-100826.pdf", type: "notice" },
      { label: "Official detailed notice", url: "https://www.upsc.gov.in/sites/default/files/Notif-CDS-II-2026-Engl-200526.pdf", type: "notice" },
      { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "website" },
      { label: "UPSC application portal", url: "https://upsconline.nic.in/", type: "apply" },
    ],
    sourceTitle: "UPSC Combined Defence Services Examination (II), 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination%20%28II%29%2C%202026",
    sourcePublished: "Examination time table uploaded 10 Aug 2026",
    lastVerified: "20 Aug 2026, 02:30 IST",
    changeLog: [
      {
        date: "2026-08-10",
        displayDate: "10 Aug 2026",
        text: "UPSC uploaded the CDS II 2026 examination time table for the 13 Sep 2026 sitting.",
      },
    ],
    keywords: [
      "Indian Military Academy",
      "Indian Naval Academy",
      "Air Force Academy",
      "Officers Training Academy",
      "SSB interview",
      "संयुक्त रक्षा सेवा परीक्षा",
      "CDS 2 exam",
      "combined defense services",
      "OTA Chennai",
      "IMA Dehradun",
      "army officer entry",
      "short service commission exam",
    ],
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
    year: 2026,
    verification: "verified",
    notificationNumber: "10/2026-NDA-II",
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["12th"],
    status: {
      label: "Timetable released",
      tone: "blue",
      nextAction: "Exam on 13 Sep 2026",
      detail: "Applications are closed. UPSC uploaded the examination time table on 12 Aug 2026; the e-admit card and centre instructions follow on the same page.",
    },
    summary: "Entry examination after Class 12 for the Army, Navy and Air Force wings of NDA and the Naval Academy.",
    vacancies: 394,
    vacancyLabel: "394 provisional vacancies",
    vacancyNote: "The official notice splits 370 male and 24 female vacancies by wing; the total remains provisional.",
    age: "Only unmarried candidates within the notification’s date-of-birth window.",
    qualification: "Class 12; Physics, Chemistry and Mathematics are required for Air Force/Naval wings and Naval Academy.",
    fee: "₹100; exemptions apply as stated in the notice",
    pay: "Training stipend and commissioned pay follow defence service rules.",
    timeline: [
      { label: "Notification", date: "2026-05-20", displayDate: "20 May 2026", state: "completed" },
      { label: "Applications closed", date: "2026-06-11", displayDate: "11 Jun 2026, 6 PM", state: "completed" },
      { label: "Examination time table", date: "2026-08-12", displayDate: "12 Aug 2026", state: "completed" },
      { label: "Written exam", date: "2026-09-13", displayDate: "13 Sep 2026", state: "scheduled" },
      { label: "SSB", displayDate: "To be announced", state: "tentative" },
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
      { label: "Official examination page", url: "https://www.upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination%20%28II%29%2C%202026", type: "notice" },
      { label: "Examination time table", url: "https://www.upsc.gov.in/sites/default/files/TimeTable-NDA-%20NA-Exam-II-2026-Engl-120826.pdf", type: "notice" },
      { label: "Official detailed notice", url: "https://www.upsc.gov.in/sites/default/files/Notif-NDA-II-2026-Engl-200526.pdf", type: "notice" },
      { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "website" },
      { label: "UPSC application portal", url: "https://upsconline.nic.in/", type: "apply" },
    ],
    sourceTitle: "UPSC National Defence Academy and Naval Academy Examination (II), 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination%20%28II%29%2C%202026",
    sourcePublished: "Examination time table uploaded 12 Aug 2026",
    lastVerified: "20 Aug 2026, 02:30 IST",
    changeLog: [
      {
        date: "2026-08-12",
        displayDate: "12 Aug 2026",
        text: "UPSC uploaded the NDA & NA II 2026 examination time table for the 13 Sep 2026 sitting.",
      },
    ],
    keywords: [
      "National Defence Academy",
      "Naval Academy Ezhimala",
      "Khadakwasla",
      "10+2 defence entry",
      "राष्ट्रीय रक्षा अकादमी",
      "एनडीए परीक्षा",
      "NDA 2 exam",
      "N.D.A. entrance",
      "after 12th army navy air force",
      "10+2 Cadet Entry Scheme",
      "General Ability Test",
    ],
    featured: true,
  }),
  activeUpscExam({
    slug: "upsc-combined-medical-services-2026",
    title: "UPSC Combined Medical Services Examination 2026",
    shortTitle: "UPSC CMS 2026",
    aliases: ["Combined Medical Services", "UPSC medical officer exam"],
    sector: "Health services",
    examTypes: ["Health & Medical", "Specialist & Professional"],
    education: ["Professional degree"],
    nextAction: "Track the written result after the 2 Aug examination",
    summary: "Recruitment examination for medical officer posts in central health services and participating organisations.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Combined%20Medical%20Services%20Examination%2C%202026",
    status: {
      label: "Result awaited",
      tone: "violet",
      nextAction: "Track the written result after the 2 Aug examination",
      detail:
        "The computer-based examination was held on 2 Aug 2026 and UPSC published the question papers on 3 Aug 2026. No written result has been published yet.",
    },
    timeline: [
      { label: "Notification", date: "2026-03-11", displayDate: "11 Mar 2026", state: "completed" },
      { label: "Applications closed", date: "2026-03-31", displayDate: "31 Mar 2026, 6 PM", state: "completed" },
      { label: "e-Admit card", date: "2026-07-24", displayDate: "24 Jul 2026", state: "completed" },
      { label: "Written examination", date: "2026-08-02", displayDate: "2 Aug 2026", state: "completed" },
      { label: "Written result", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Official detailed notice",
        url: "https://www.upsc.gov.in/sites/default/files/Notification-CMSE-2026-English-110326.pdf",
        type: "notice",
      },
      {
        label: "Press note dated 24 Jul 2026",
        url: "https://www.upsc.gov.in/sites/default/files/PressNote-CMSE-2026-Engl-240726.pdf",
        type: "notice",
      },
    ],
    sourceTitle: "UPSC Combined Medical Services Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Combined%20Medical%20Services%20Examination%2C%202026",
    sourcePublished: "Question papers uploaded 3 Aug 2026; examination held 2 Aug 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own CMS 2026 page, including the 2 Aug 2026 examination; the written result is still awaited.",
      },
    ],
    keywords: [
      "Central Health Service",
      "CHS doctor recruitment",
      "railway medical officer",
      "medical officer post",
      "संयुक्त चिकित्सा सेवा परीक्षा",
      "CMSE",
      "UPSC CMS exam",
      "combined medical service exam",
      "MBBS government job",
      "Assistant Divisional Medical Officer",
      "NDMC medical officer",
      "MCD medical officer",
    ],
    age:
      "Under the CMS 2026 notice (Examination Notice No. 9/2026-CMS), a candidate must not have attained 32 years as on 1 Aug 2026, i.e. born not earlier than 2 Aug 1994; for Medical Officer Grade in the General Duty Medical Officers sub-cadre of the Central Health Service the upper limit is 35 years.",
    qualification:
      "Passed the written and practical parts of the final MBBS examination, as prescribed in the CMS 2026 notice; candidates who have appeared or are yet to appear at the final MBBS may apply provisionally.",
    fee: "₹200 under the CMS 2026 notice; female, SC, ST and PwBD candidates are exempt.",
    pay: "Group A Junior Scale, Pay Matrix Level 10 (₹56,100–₹1,77,500) plus Non-Practising Allowance, as stated in the CMS 2026 notice.",
    eligibility: [
      "Nationality: an Indian citizen, or a subject of Nepal or Bhutan, or a Tibetan refugee who came to India before 1 Jan 1962, or a person of Indian origin who migrated from the countries listed in para 3(I) of the CMS 2026 notice with a certificate of eligibility.",
      "Upper-age relaxation under the CMS 2026 notice: up to 5 years for SC/ST, 3 years for OBC, 3 years for disabled defence services personnel, 5 years for ex-servicemen and ECOs/SSCOs, and 10 years for Persons with Benchmark Disability.",
      "Recruitment covers Category I — Medical Officers Grade in the General Duty Medical Officers sub-cadre of the Central Health Service — and Category II — Assistant Divisional Medical Officer in the Railways, General Duty Medical Officer in the New Delhi Municipal Council and General Duty Medical Officer Grade II in the Municipal Corporation of Delhi.",
      "A candidate may apply for any one or more of the services/posts listed in the notice; eligibility is verified against originals only after qualifying for the Personality Test.",
    ],
    selectionStages: [
      "Part I — written examination of two objective papers, 500 marks in total",
      "Part II — Personality Test, 100 marks",
      "Document verification and appointment formalities — plan published in the CMS 2026 scheme of examination",
    ],
    syllabus: [
      "Paper I (250 marks, two hours, 120 questions): General Medicine — 96 questions — and Paediatrics — 24 questions.",
      "Paper II (250 marks, two hours, 120 questions): Surgery, Gynaecology & Obstetrics and Preventive & Social Medicine, 40 questions from each part.",
      "One-third of the marks assigned to a question is deducted for a wrong answer; unattempted questions carry no penalty — CMS 2026 scheme of examination.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-capf-assistant-commandant-2026",
    title: "UPSC Central Armed Police Forces (Assistant Commandants) Examination 2026",
    shortTitle: "UPSC CAPF AC 2026",
    aliases: ["CAPF AC 2026", "Assistant Commandant exam"],
    sector: "Central armed police forces",
    examTypes: ["Police & CAPF"],
    education: ["Graduate"],
    nextAction: "Track the written result and physical-stage notice",
    summary: "Officer recruitment for Assistant Commandant posts in the central armed police forces.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Central%20Armed%20Police%20Forces%20%28ACs%29%20Examination%2C%202026",
    status: {
      label: "Result awaited",
      tone: "violet",
      nextAction: "Track the written result and physical-stage notice",
      detail:
        "The written examination was held on 19 Jul 2026 and UPSC published the question papers on 20 Jul 2026. No written result has been published yet.",
    },
    timeline: [
      { label: "Notification", date: "2026-02-20", displayDate: "20 Feb 2026", state: "completed" },
      { label: "Applications closed", date: "2026-03-12", displayDate: "12 Mar 2026, 6 PM", state: "completed" },
      { label: "e-Admit card", date: "2026-07-10", displayDate: "10 Jul 2026", state: "completed" },
      { label: "Written examination", date: "2026-07-19", displayDate: "19 Jul 2026", state: "completed" },
      { label: "Written result", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Official detailed notice",
        url: "https://www.upsc.gov.in/sites/default/files/ExamNotifi_CAPF_AC_Exam_2026_Eng_20022026.pdf",
        type: "notice",
      },
      {
        label: "Press note dated 10 Jul 2026",
        url: "https://www.upsc.gov.in/sites/default/files/PressNote-CAPF-2026-Engl-100726.pdf",
        type: "notice",
      },
    ],
    sourceTitle: "UPSC Central Armed Police Forces (ACs) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Central%20Armed%20Police%20Forces%20%28ACs%29%20Examination%2C%202026",
    sourcePublished: "Question papers uploaded 20 Jul 2026; examination held 19 Jul 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own CAPF (ACs) 2026 page, including the 19 Jul 2026 written examination; the result is still awaited.",
      },
    ],
    keywords: [
      "BSF Assistant Commandant",
      "CRPF Assistant Commandant",
      "CISF Assistant Commandant",
      "ITBP Assistant Commandant",
      "SSB Assistant Commandant",
      "Sashastra Seema Bal",
      "केंद्रीय सशस्त्र पुलिस बल",
      "सहायक कमांडेंट परीक्षा",
      "CAPF exam",
      "CPF AC exam",
      "UPSC assistant commandant",
      "paramilitary officer exam",
    ],
    age:
      "Under the CAPF (ACs) 2026 notice (20 Feb 2026), a candidate must have attained 20 years and must not have attained 25 years as on 1 Aug 2026, i.e. born not earlier than 2 Aug 2001 and not later than 1 Aug 2006.",
    qualification:
      "A Bachelor's degree from a university incorporated by an Act of the Central or State Legislature, or an equivalent qualification, as prescribed in the CAPF (ACs) 2026 notice; candidates awaiting a result may apply and must produce proof before the physical tests.",
    fee: "₹200 under the CAPF (ACs) 2026 notice; female, SC and ST candidates are exempt.",
    eligibility: [
      "Both male and female candidates are eligible for the Assistant Commandant post — CAPF (ACs) 2026 notice, para 4(II).",
      "Recruitment is to the Border Security Force, Central Reserve Police Force, Central Industrial Security Force, Indo-Tibetan Border Police and Sashastra Seema Bal, under rules published by the Ministry of Home Affairs.",
      "Upper-age relaxation under the notice: up to 5 years for SC/ST, 3 years for OBC, and up to 5 years for civilian central government servants and ex-servicemen.",
      "Candidates must meet the physical and medical standards set out in Appendix-V of the notice; these are tested after the written examination.",
    ],
    selectionStages: [
      "Written examination — Paper I (250 marks) and Paper II (200 marks)",
      "Physical Standards Test and Physical Efficiency Test",
      "Interview/Personality Test — 150 marks",
      "Medical Standards Test — stage order fixed by the CAPF (ACs) 2026 notice",
    ],
    syllabus: [
      "Paper I — General Ability and Intelligence (250 marks, objective): general mental ability, general science, current events of national and international importance, Indian polity and economy, history of India, and Indian and world geography.",
      "Paper II — General Studies, Essay and Comprehension (200 marks): Part A essay in Hindi or English (80 marks); Part B comprehension, précis writing and other language skills in English only (120 marks).",
      "Paper I is evaluated first and Paper II is evaluated only for candidates who obtain the minimum qualifying marks in Paper I.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-ies-iss-2026",
    title: "UPSC Indian Economic Service / Indian Statistical Service Examination 2026",
    shortTitle: "UPSC IES/ISS 2026",
    aliases: ["Indian Economic Service 2026", "Indian Statistical Service 2026"],
    sector: "Economics and statistics",
    examTypes: ["Specialist & Professional"],
    education: ["Postgraduate"],
    nextAction: "Update the application form before 25 Aug 2026",
    summary: "Specialist recruitment to the Indian Economic Service and Indian Statistical Service.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Indian%20Economic%20Service%20-%20Indian%20Statistical%20Service%20Examination%2C%202026",
    status: {
      label: "Application form window open",
      tone: "violet",
      nextAction: "Update the application form before 25 Aug 2026",
      detail:
        "The written result was declared on 4 Aug 2026. UPSC's notice of 11 Aug 2026 requires every written-qualified candidate to update and finally submit the application form on upsconline.nic.in between 11 Aug and 25 Aug 2026, 6 PM, to generate the e-Summon Letter for the Personality Test.",
    },
    timeline: [
      { label: "Notification", date: "2026-02-11", displayDate: "11 Feb 2026", state: "completed" },
      { label: "Applications closed", date: "2026-03-03", displayDate: "3 Mar 2026, 6 PM", state: "completed" },
      { label: "Written examination", date: "2026-06-19", displayDate: "19–21 Jun 2026", state: "completed" },
      { label: "Written result", date: "2026-08-04", displayDate: "4 Aug 2026", state: "completed" },
      { label: "Application form update window closes", date: "2026-08-25", displayDate: "25 Aug 2026, 6 PM", state: "completed" },
      { label: "Personality Test", displayDate: "To be announced", state: "tentative" },
    ],
    extraLinks: [
      {
        label: "Notice for written-qualified candidates dated 11 Aug 2026",
        url: "https://www.upsc.gov.in/sites/default/files/Notice-AF-Updation-IES-ISS-26-Engl-110826.pdf",
        type: "notice",
      },
      {
        label: "Written result — Indian Economic Service (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-RollList-IES-Exam-26-Engl-040826.pdf",
        type: "result",
      },
      {
        label: "Written result — Indian Statistical Service (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-RollList-ISS-Exam-26-Engl-040826.pdf",
        type: "result",
      },
    ],
    sourceTitle: "UPSC Indian Economic Service / Indian Statistical Service Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Indian%20Economic%20Service%20-%20Indian%20Statistical%20Service%20Examination%2C%202026",
    sourcePublished: "Application-form notice dated 11 Aug 2026; written result declared 4 Aug 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own IES/ISS 2026 page: the written result of 4 Aug 2026 and the application-form update window of 11–25 Aug 2026 opened by the notice of 11 Aug 2026.",
      },
    ],
    keywords: [
      "Indian Economic Service",
      "Indian Statistical Service",
      "economic officer recruitment",
      "statistical officer recruitment",
      "भारतीय आर्थिक सेवा",
      "भारतीय सांख्यिकी सेवा",
      "IES ISS exam",
      "UPSC IES ISS",
      "economics postgraduate government job",
      "statistics government job",
      "Junior Time Scale economist",
    ],
    age:
      "Under the IES/ISS 2026 notice (11 Feb 2026), a candidate must have attained 21 years and must not have attained 30 years as on 1 Aug 2026, i.e. born not earlier than 2 Aug 1996 and not later than 1 Aug 2005.",
    qualification:
      "Indian Economic Service — a postgraduate degree in Economics, Applied Economics, Business Economics or Econometrics. Indian Statistical Service — a Bachelor's degree with Statistics, Mathematical Statistics or Applied Statistics as a subject, or a Master's degree in one of those subjects. Requirements are from the IES/ISS 2026 notice.",
    fee: "₹200 under the IES/ISS 2026 notice; female, SC, ST and PwBD candidates are exempt.",
    pay: "Appointment is to the Junior Time Scale of the Indian Economic Service or the Indian Statistical Service, as stated in the IES/ISS 2026 notice.",
    eligibility: [
      "Recruitment is to the Junior Time Scale of the Indian Economic Service and the Indian Statistical Service — IES/ISS 2026 notice, para 2(a).",
      "The two services carry different degree requirements, so a candidate applies for the service whose qualification they hold.",
      "Upper-age relaxation under the notice: up to 5 years for SC/ST and up to 3 years for OBC candidates, with the further relaxations listed there.",
      "Candidates awaiting a qualifying-examination result may apply and must produce proof of passing before the Interview/Personality Test.",
    ],
    selectionStages: [
      "Part I — written examination of six papers, 1000 marks in total",
      "Part II — viva voce, 200 marks",
      "Final merit from the written and viva voce marks — scheme published in the IES/ISS 2026 notice",
    ],
    syllabus: [
      "Indian Economic Service papers: General English, General Studies, General Economics I, General Economics II, General Economics III and Indian Economics.",
      "Indian Statistical Service papers: General English, General Studies, Statistics I and Statistics II (objective) and Statistics III and Statistics IV (descriptive).",
      "General English and General Studies are common to both services and are subjective papers; the notice sets them at graduate standard.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-engineering-services-2026",
    title: "UPSC Engineering Services Examination 2026",
    shortTitle: "UPSC ESE 2026",
    aliases: ["Engineering Services 2026", "UPSC IES engineering"],
    sector: "Engineering services",
    examTypes: ["Technical & Trades", "Specialist & Professional"],
    education: ["Professional degree"],
    nextAction: "Update the application form before 21 Aug 2026",
    summary: "Recruitment to civil, mechanical, electrical and electronics engineering services of the Union.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Engineering%20Services%20%28Main%29%20Examination%2C%202026",
    status: {
      label: "Application form window open",
      tone: "violet",
      nextAction: "Update the application form before 21 Aug 2026",
      detail:
        "The mains result was declared on 24 Jul 2026. UPSC's notice of 7 Aug 2026 requires every written-qualified candidate to update and finally submit the application form on upsconline.nic.in between 7 Aug and 21 Aug 2026, 6 PM, before the Personality Test.",
    },
    timeline: [
      { label: "Mains examination", date: "2026-06-21", displayDate: "21 Jun 2026", state: "completed" },
      { label: "Mains result", date: "2026-07-24", displayDate: "24 Jul 2026", state: "completed" },
      { label: "Application form update window closes", date: "2026-08-21", displayDate: "21 Aug 2026, 6 PM", state: "completed" },
      { label: "Personality Test", displayDate: "To be announced", state: "tentative" },
    ],
    extraLinks: [
      {
        label: "Notice for written-qualified candidates dated 7 Aug 2026",
        url: "https://www.upsc.gov.in/sites/default/files/AF-Notice-ESEM-2026-English-070826.pdf",
        type: "notice",
      },
      {
        label: "Mains written result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/RollList-WR-ESEM-26-Engl-240726.pdf",
        type: "result",
      },
    ],
    sourceTitle: "UPSC Engineering Services (Main) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Engineering%20Services%20%28Main%29%20Examination%2C%202026",
    sourcePublished: "Application-form notice dated 7 Aug 2026; mains result declared 24 Jul 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own ESE (Main) 2026 page: the mains result of 24 Jul 2026 and the application-form update window of 7–21 Aug 2026 opened by the notice of 7 Aug 2026.",
      },
    ],
    keywords: [
      "Indian Engineering Service",
      "civil engineering service exam",
      "mechanical engineering service exam",
      "electrical and electronics engineering service",
      "अभियांत्रिकी सेवा परीक्षा",
      "ESE exam",
      "IES engineering exam",
      "UPSC ESE mains",
      "Indian Railway Management Service",
      "Central Water Engineering Service",
      "Border Roads Engineering Service",
      "B.Tech government job",
    ],
    age:
      "Under the ESE 2026 notice (26 Sep 2025), a candidate must have attained 21 years and must not have attained 30 years as on 1 Jan 2026, i.e. born not earlier than 2 Jan 1996 and not later than 1 Jan 2005; the upper limit is relaxable to 35 years for the categories of government servants listed in the notice.",
    qualification:
      "A degree in Engineering from a recognised university, or Sections A and B of the Institution of Engineers (India) examinations, or one of the other equivalents listed in the ESE 2026 notice. Indian Naval Armament Service (Electronics posts) and Indian Radio Regulatory Service also accept an M.Sc. with Wireless Communication, Electronics, Radio Physics or Radio Engineering.",
    fee: "₹200 under the ESE 2026 notice; female, SC, ST and PwBD candidates are exempt.",
    eligibility: [
      "Recruitment runs under four categories — Civil Engineering, Mechanical Engineering, Electrical Engineering, and Electronics & Telecommunication Engineering — to Group A and Group B services of the Union, per the ESE 2026 notice.",
      "Participating services include the Central Engineering Service, Central Water Engineering Service, Survey of India Group A Service, Border Roads Engineering Service, Indian Railway Management Service and the Indian Skill Development Service.",
      "Candidates awaiting the qualifying degree result may apply and must produce proof of passing before the Personality Test.",
      "The examination is held under Rules published by the Ministry of Communications, Department of Telecommunications in the Gazette of India Extraordinary dated 26 Sep 2025.",
    ],
    selectionStages: [
      "Stage I — Preliminary examination, two objective papers, 500 marks",
      "Stage II — Main examination, two conventional papers, 600 marks",
      "Stage III — Personality Test, 200 marks",
      "Final ranking counts marks from all three stages — ESE 2026 plan of examination",
    ],
    syllabus: [
      "Stage I Paper I — General Studies and Engineering Aptitude, 200 marks, two hours.",
      "Stage I Paper II — the candidate's engineering discipline, 300 marks; one-third of a question's marks is deducted for a wrong answer.",
      "Stage II — two conventional discipline-specific papers of 300 marks each, three hours each; conventional papers must be answered in English.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-combined-geo-scientist-2026",
    title: "UPSC Combined Geo-Scientist Examination 2026",
    shortTitle: "UPSC Geo-Scientist 2026",
    aliases: ["Combined Geo Scientist 2026", "Geologist examination"],
    sector: "Geoscience",
    examTypes: ["Specialist & Professional"],
    education: ["Postgraduate", "Professional degree"],
    nextAction: "Track the interview notice after the 20 Jul mains result",
    summary: "Specialist recruitment for geology, geophysics, chemistry and hydrogeology posts in central services.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Combined%20Geo-Scientist%20%28Main%29%20Examination%2C%202026",
    status: {
      label: "Interview stage awaited",
      tone: "violet",
      nextAction: "Track the interview notice after the 20 Jul mains result",
      detail: "UPSC declared the Combined Geo-Scientist (Main) 2026 written result on 20 Jul 2026. No interview schedule has been published yet.",
    },
    timeline: [
      { label: "Mains time table", date: "2026-05-11", displayDate: "11 May 2026", state: "completed" },
      { label: "Mains examination", date: "2026-06-20", displayDate: "20–21 Jun 2026", state: "completed" },
      { label: "Mains written result", date: "2026-07-20", displayDate: "20 Jul 2026", state: "completed" },
      { label: "Personality Test", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Mains written result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-RollList-CGeoSntstMain-2026-Engl-200726.pdf",
        type: "result",
      },
    ],
    sourceTitle: "UPSC Combined Geo-Scientist (Main) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Combined%20Geo-Scientist%20%28Main%29%20Examination%2C%202026",
    sourcePublished: "Mains written result declared 20 Jul 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own Combined Geo-Scientist (Main) 2026 page, including the written result of 20 Jul 2026.",
      },
    ],
    keywords: [
      "Geological Survey of India recruitment",
      "geologist exam",
      "geophysicist exam",
      "hydrogeologist exam",
      "संयुक्त भू-वैज्ञानिक परीक्षा",
      "Combined Geoscientist",
      "CGSE exam",
      "UPSC geologist exam",
      "Central Ground Water Board recruitment",
      "Scientist B geophysics",
      "M.Sc geology government job",
    ],
    age:
      "Under the Combined Geo-Scientist 2026 notice (3 Sep 2025), a candidate must have attained 21 years and must not have attained 32 years as on 1 Jan 2026, i.e. born not earlier than 2 Jan 1994 and not later than 1 Jan 2005; each post also carries its own age check.",
    qualification:
      "Post-specific Master's degrees under the Combined Geo-Scientist 2026 notice: Geological Science, Geology or an allied subject for Geologist; Physics, Applied Physics or Geophysics for Geophysicist; Chemistry, Applied Chemistry or Analytical Chemistry for Chemist; and Geology, Applied Geology, Marine Geology or Hydrogeology for Scientist B (Hydrogeology).",
    fee: "₹200 under the Combined Geo-Scientist 2026 notice; female, SC, ST and PwBD candidates are exempt.",
    eligibility: [
      "Category I posts are in the Geological Survey of India under the Ministry of Mines — Geologist, Geophysicist and Chemist, all Group A.",
      "Category II posts are in the Central Ground Water Board — Scientist B in Hydrogeology, Chemical and Geophysics streams, and the Group B Assistant Hydrogeologist, Assistant Chemist and Assistant Geophysicist posts.",
      "Each stream carries its own Master's-degree requirement, so a candidate applies for the stream whose qualification they hold.",
      "Age relaxations for SC/ST, OBC and the other categories are set out in the notice; the Commission may relax qualifications in writing for otherwise well-qualified candidates.",
    ],
    selectionStages: [
      "Stage I — Preliminary examination, two objective papers, 400 marks",
      "Stage II — Main examination, three descriptive papers, 600 marks",
      "Stage III — Personality Test/Interview, 200 marks",
      "Marks from both Stage I and Stage II count towards the final merit — Combined Geo-Scientist 2026 plan of examination",
    ],
    syllabus: [
      "Stage I Paper I — General Studies, 100 marks, two hours, common to every stream.",
      "Stage I Paper II — the candidate's stream: Geology/Hydrogeology, Geophysics or Chemistry, 300 marks, two hours.",
      "Stage II — three stream papers of 200 marks each, three hours each; the Hydrogeology stream takes Geology in Papers I and II and Hydrogeology in Paper III.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-indian-forest-service-2026",
    title: "UPSC Indian Forest Service Examination 2026",
    shortTitle: "UPSC IFoS 2026",
    aliases: ["Indian Forest Service 2026", "IFoS 2026"],
    sector: "Forest services",
    examTypes: ["Civil Services & Administration", "Specialist & Professional"],
    education: ["Graduate", "Professional degree"],
    nextAction: "Track the forest-service mains stage after the common prelims",
    summary: "Recruitment to the Indian Forest Service through the common Civil Services preliminary examination and a separate mains process.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Indian%20Forest%20Service%20%28Preliminary%29%20Examination%2C%202026%20through%20CS%28P%29%20Examination%2C%202026",
    status: {
      label: "Mains stage awaited",
      tone: "violet",
      nextAction: "Track the forest-service mains stage after the common prelims",
      detail: "UPSC declared the Indian Forest Service (Preliminary) 2026 result on 15 Jun 2026. No mains date has been published on the official page yet.",
    },
    timeline: [
      { label: "Notification", date: "2026-02-04", displayDate: "4 Feb 2026", state: "completed" },
      { label: "Applications closed", date: "2026-02-27", displayDate: "27 Feb 2026, 6 PM", state: "completed" },
      { label: "Preliminary examination", date: "2026-05-24", displayDate: "24 May 2026", state: "completed" },
      { label: "Preliminary result", date: "2026-06-15", displayDate: "15 Jun 2026", state: "completed" },
      { label: "Mains examination", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Preliminary result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-IFoSP-2026-RollList-Engl-150626.pdf",
        type: "result",
      },
    ],
    sourceTitle: "UPSC Indian Forest Service (Preliminary) Examination, 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Indian%20Forest%20Service%20%28Preliminary%29%20Examination%2C%202026%20through%20CS%28P%29%20Examination%2C%202026",
    sourcePublished: "Preliminary result declared 15 Jun 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own Indian Forest Service (Preliminary) 2026 page, including the preliminary result of 15 Jun 2026.",
      },
    ],
    keywords: [
      "Indian Forest Service",
      "IFS forest officer",
      "forest service prelims",
      "भारतीय वन सेवा",
      "वन सेवा परीक्षा",
      "IFoS mains",
      "forest ranger officer exam",
      "UPSC forest exam",
      "Assistant Conservator of Forests",
      "forestry government job",
    ],
    age:
      "Under the Indian Forest Service Examination 2026 notice (4 Feb 2026), a candidate must have attained 21 years and must not have attained 32 years as on 1 Aug 2026, i.e. born not earlier than 2 Aug 1994 and not later than 1 Aug 2005.",
    qualification:
      "A Bachelor's degree with at least one of Animal Husbandry & Veterinary Science, Botany, Chemistry, Geology, Mathematics, Physics, Statistics or Zoology, or a Bachelor's degree in Agriculture, Forestry or Engineering, per the Indian Forest Service Examination 2026 notice.",
    fee: "₹100 for the preliminary stage under the IFoS 2026 notice, plus a further ₹200 from candidates admitted to the mains; female, SC, ST and PwBD candidates are exempt from both.",
    eligibility: [
      "Screening is through the common Civil Services (Preliminary) Examination; only candidates declared qualified by the Commission proceed to the Indian Forest Service (Main) Examination.",
      "Six attempts are permitted, nine for OBC candidates, and there is no attempt limit for SC/ST candidates — IFoS 2026 notice, para (iv).",
      "Candidates must be physically fit against the standards in Appendix-III of the Indian Forest Service Examination Rules 2026, published in the Gazette of India on 4 Feb 2026.",
      "Candidates awaiting a qualifying-examination result may apply and must produce proof of passing before the Interview/Personality Test.",
    ],
    selectionStages: [
      "Civil Services (Preliminary) Examination — two objective papers, 400 marks, used as a screening test only",
      "Indian Forest Service (Main) Examination — six written papers",
      "Interview/Personality Test — 300 marks",
      "Final merit is decided by the mains and interview marks; preliminary marks are not counted",
    ],
    syllabus: [
      "Mains Paper I — General English, 300 marks; Paper II — General Knowledge, 300 marks.",
      "Mains Papers III to VI — two optional subjects chosen from the notice's list, each subject carrying two papers of 200 marks.",
      "Optional subjects include Agriculture, Agricultural Engineering, Animal Husbandry & Veterinary Science, Botany, Chemistry, Chemical Engineering, Civil Engineering, Forestry, Geology and Mathematics, among the others listed in the notice.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-cds-i-2026",
    title: "UPSC Combined Defence Services Examination I 2026",
    shortTitle: "UPSC CDS I 2026",
    aliases: ["CDS 1 2026", "Combined Defence Services I"],
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["Graduate", "Professional degree"],
    nextAction: "Track SSB and final-result notices after the written result",
    summary: "The first 2026 officer-entry cycle for IMA, INA, Air Force Academy and Officers’ Training Academy courses.",
    examPageUrl: "https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination%20%28I%29%2C%202026",
    status: {
      label: "SSB stage in progress",
      tone: "violet",
      nextAction: "Track SSB and final-result notices after the written result",
      detail: "The written result was declared on 8 May 2026 and the name list followed on 20 May 2026. Qualified candidates are called by the Services Selection Boards; no final result has been published.",
    },
    timeline: [
      { label: "Notification", date: "2025-12-10", displayDate: "10 Dec 2025", state: "completed" },
      { label: "Applications closed", date: "2025-12-30", displayDate: "30 Dec 2025, 6 PM", state: "completed" },
      { label: "Written examination", date: "2026-04-12", displayDate: "12 Apr 2026", state: "completed" },
      { label: "Written result", date: "2026-05-08", displayDate: "8 May 2026", state: "completed" },
      { label: "SSB interview and final result", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Written result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-RollList-CDSE-I-2026-Engl-080526.pdf",
        type: "result",
      },
      {
        label: "Official detailed notice",
        url: "https://www.upsc.gov.in/sites/default/files/Notif-CDSE-I-2026-Engl-101225.pdf",
        type: "notice",
      },
    ],
    sourceTitle: "UPSC Combined Defence Services Examination (I), 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination%20%28I%29%2C%202026",
    sourcePublished: "Written result name list published 20 May 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own CDS (I) 2026 page, including the written result of 8 May 2026.",
      },
    ],
    keywords: [
      "Indian Military Academy",
      "Indian Naval Academy",
      "Air Force Academy",
      "Officers Training Academy",
      "SSB interview",
      "संयुक्त रक्षा सेवा परीक्षा",
      "CDS 1 exam",
      "combined defense services",
      "OTA Chennai",
      "IMA Dehradun",
      "army officer entry",
      "short service commission exam",
    ],
    age:
      "Course-specific windows under the CDS (I) 2026 notice (10 Dec 2025): unmarried male candidates born 2 Jan 2003–1 Jan 2008 for IMA and the Indian Naval Academy; 20–24 years as on 1 Jan 2027 for the Air Force Academy (born 2 Jan 2003–1 Jan 2007), relaxable to 26 for holders of a current DGCA Commercial Pilot Licence; born 2 Jan 2002–1 Jan 2008 for both Officers' Training Academy courses.",
    qualification:
      "IMA and Officers' Training Academy — a degree of a recognised university. Indian Naval Academy — a degree in Engineering. Air Force Academy — a degree of a recognised university with Physics and Mathematics at 10+2, or a degree in Engineering. Requirements are from the CDS (I) 2026 notice.",
    fee: "₹200 under the CDS (I) 2026 notice; female, SC and ST candidates are exempt.",
    pay: "Stipend during training and pay on commission follow the academy and commissioned-rank rules described in the notice.",
    eligibility: [
      "Only unmarried candidates are eligible for the IMA, Indian Naval Academy and Officers' Training Academy courses; the Air Force Academy allows married candidates aged 25 or above on the conditions in the notice.",
      "Candidates applying for the Officers' Training Academy alongside IMA, the Indian Naval Academy or the Air Force Academy must place OTA as their last preference, and Air Force Academy applicants must place AFA first.",
      "A share of the IMA, Indian Naval Academy and Air Force Academy vacancies is reserved for NCC 'C' Certificate holders of the corresponding wing.",
      "Success in the written examination confers no right of admission; candidates must clear the Services Selection Board and the prescribed medical standards.",
    ],
    selectionStages: [
      "Written examination",
      "Intelligence and personality test at a Services Selection Board",
      "Medical examination",
      "Final merit and academy allocation — CDS (I) 2026 scheme of examination",
    ],
    syllabus: [
      "IMA, Indian Naval Academy and Air Force Academy: English, General Knowledge and Elementary Mathematics, 100 marks and two hours each.",
      "Officers' Training Academy: English and General Knowledge, 100 marks and two hours each.",
      "SSB interview marks equal the written total — 300 for IMA, INA and AFA and 200 for OTA. All papers are objective; Elementary Mathematics is of matriculation standard and the other papers of graduate standard.",
    ],
  }),
  activeUpscExam({
    slug: "upsc-nda-na-i-2026",
    title: "UPSC NDA & Naval Academy Examination I 2026",
    shortTitle: "UPSC NDA I 2026",
    aliases: ["NDA 1 2026", "NA I 2026"],
    sector: "Defence",
    examTypes: ["Armed Forces"],
    education: ["12th"],
    nextAction: "Track SSB and final-result notices after the written result",
    summary: "The first 2026 Class 12 officer-entry cycle for the National Defence Academy and Naval Academy.",
    examPageUrl: "https://www.upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination%20%28I%29%2C%202026",
    status: {
      label: "SSB stage in progress",
      tone: "violet",
      nextAction: "Track SSB and final-result notices after the written result",
      detail: "The written result was declared on 8 May 2026 and the name list followed on 13 May 2026. Qualified candidates are called by the Services Selection Boards; no final result has been published.",
    },
    timeline: [
      { label: "Notification", date: "2025-12-10", displayDate: "10 Dec 2025", state: "completed" },
      { label: "Applications closed", date: "2025-12-30", displayDate: "30 Dec 2025, 6 PM", state: "completed" },
      { label: "Written examination", date: "2026-04-12", displayDate: "12 Apr 2026", state: "completed" },
      { label: "Written result", date: "2026-05-08", displayDate: "8 May 2026", state: "completed" },
      { label: "SSB interview and final result", displayDate: "To be announced", state: "current" },
    ],
    extraLinks: [
      {
        label: "Written result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-RollList-NDA-NA-I-2026-Engl-080526.pdf",
        type: "result",
      },
      {
        label: "Official detailed notice",
        url: "https://www.upsc.gov.in/sites/default/files/Notif-NDA-NA-I-2026-Engl-101225.pdf",
        type: "notice",
      },
    ],
    sourceTitle: "UPSC National Defence Academy and Naval Academy Examination (I), 2026 page",
    sourceUrl: "https://www.upsc.gov.in/examinations/National%20Defence%20Academy%20and%20Naval%20Academy%20Examination%20%28I%29%2C%202026",
    sourcePublished: "Written result name list published 13 May 2026",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Added the dated stages from UPSC's own NDA & NA (I) 2026 page, including the written result of 8 May 2026.",
      },
    ],
    keywords: [
      "National Defence Academy",
      "Naval Academy Ezhimala",
      "Khadakwasla",
      "10+2 defence entry",
      "राष्ट्रीय रक्षा अकादमी",
      "एनडीए परीक्षा",
      "NDA 1 exam",
      "N.D.A. entrance",
      "after 12th army navy air force",
      "10+2 Cadet Entry Scheme",
      "General Ability Test",
    ],
    age:
      "Only unmarried male and female candidates born not earlier than 1 Jul 2007 and not later than 1 Jul 2010 are eligible, under the NDA & NA (I) 2026 notice (10 Dec 2025).",
    qualification:
      "Army wing of the National Defence Academy — Class 12 pass of the 10+2 pattern. Air Force and Naval wings and the 10+2 Cadet Entry Scheme at the Indian Naval Academy — Class 12 with Physics, Chemistry and Mathematics. Candidates appearing in Class 12 may also apply, per the NDA & NA (I) 2026 notice.",
    fee: "₹100 under the NDA & NA (I) 2026 notice; SC and ST candidates, female candidates and the wards of JCOs/NCOs/ORs specified in the notice are exempt.",
    pay: "Training stipend and commissioned pay follow the defence service rules described in the notice.",
    eligibility: [
      "Vacancies cover the Army, Navy and Air Force wings of the National Defence Academy plus the 10+2 Cadet Entry Scheme at the Indian Naval Academy; Air Force vacancies are split between Flying, Ground Duties (Technical) and Ground Duties (Non-Technical).",
      "Men and women are separate entries: written results and final merit lists are prepared separately and in a gender-pure manner against the vacancies notified for each.",
      "Candidates who clear the SSB interview but cannot produce the Matriculation or 10+2 certificate in original at that stage must follow the proof deadlines in the notice.",
      "Physical and medical standards apply after the written examination.",
    ],
    selectionStages: [
      "Written examination — Mathematics and General Ability Test",
      "SSB test/interview — 900 marks",
      "Medical examination",
      "Final merit and academy/wing allocation — NDA & NA (I) 2026 scheme of examination",
    ],
    syllabus: [
      "Mathematics — 300 marks, two and a half hours, objective.",
      "General Ability Test — 600 marks, two and a half hours, covering English and General Knowledge.",
      "All papers are objective; Mathematics and Part B of the General Ability Test are set in both Hindi and English.",
    ],
  }),
  exam({
    slug: "upsc-cisf-ac-exe-ldce-2026",
    title: "UPSC CISF Assistant Commandants (Executive) Limited Departmental Competitive Examination 2026",
    shortTitle: "UPSC CISF AC (EXE) LDCE 2026",
    aliases: ["CISF AC EXE LDCE 2026", "CISF Assistant Commandant LDCE"],
    organisation: "Union Public Service Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "2026",
    year: 2026,
    verification: "verified",
    sector: "Central armed police forces",
    examTypes: ["Police & CAPF"],
    education: ["Graduate"],
    status: {
      label: "Interviews in progress",
      tone: "violet",
      nextAction: "Download the e-Summon Letter for the Personality Test",
      detail:
        "The written result was declared on 13 Apr 2026. UPSC's notice of 29 Jul 2026 began the Personality Test/Interview at Dholpur House, New Delhi with effect from 17 Aug 2026 for candidates found medically fit.",
    },
    summary:
      "Departmental promotion examination for serving CISF Sub-Inspectors and Inspectors (GD) into Assistant Commandant (Executive) posts. It is not open to the general public.",
    vacancies: 20,
    vacancyLabel: "20 tentative vacancies",
    vacancyNote: "The notice gives General 16, SC 3 and ST 1; the Commission calls the total tentative.",
    vacancyBreakdown: [{ label: "Assistant Commandant (Executive), CISF", ur: 16, sc: 3, st: 1, total: 20 }],
    age:
      "A candidate must not have attained 35 years as on 1 Aug 2026, i.e. born not earlier than 2 Aug 1991; relaxable by up to five years for SC and ST candidates.",
    qualification:
      "Graduation from a recognised university, together with four years of regular service as on 1 January of the examination year in the rank of Sub-Inspector (GD) or Inspector (GD) in CISF, including the period of basic training.",
    fee: "The examination notice does not prescribe a fee; follow the instructions on the official notice.",
    pay:
      "The Rules notified by the Ministry of Home Affairs in the Gazette of India on 3 Dec 2025 do not state a pay scale or pay-matrix level for the post; they cover only the vacancies, eligibility, scheme of examination (Appendix-I) and physical and medical standards (Appendix-II). No pay figure is asserted here.",
    timeline: [
      { label: "Notice and Rules published", date: "2025-12-03", displayDate: "3 Dec 2025", state: "completed" },
      { label: "Applications closed", date: "2025-12-23", displayDate: "23 Dec 2025, 6 PM", state: "completed" },
      { label: "Written examination", date: "2026-03-08", displayDate: "8 Mar 2026", state: "completed" },
      { label: "Written result", date: "2026-04-13", displayDate: "13 Apr 2026", state: "completed" },
      { label: "Interview schedule notice", date: "2026-07-29", displayDate: "29 Jul 2026", state: "completed" },
      { label: "Personality Test / Interview", date: "2026-08-17", displayDate: "From 17 Aug 2026", state: "current" },
      { label: "Final merit list", displayDate: "To be announced", state: "tentative" },
    ],
    eligibility: [
      "The examination is restricted to certain categories of departmental candidates of CISF; it is not an open recruitment.",
      "Four years of regular service as on 1 January of the examination year in the rank of Sub-Inspector (GD) or Inspector (GD), including basic training, with a clean service record under CISF Rules 2001.",
      "Three attempts are permitted at the examination.",
      "An NCC 'B' or 'C' certificate is a desirable qualification and is considered only at the Interview/Personality Test.",
      "Candidates must meet the physical and medical standards specified in Appendix-II of the Rules.",
    ],
    relaxations: [
      "The upper age limit is relaxable by up to five years for SC and ST candidates; the Rules provide for no other age relaxation.",
      "Reservation is made for SC and ST candidates against vacancies as fixed by the Government.",
    ],
    selectionStages: [
      "Written examination — Paper I (300 marks) and Paper II (100 marks)",
      "Physical Standards Test and Physical Efficiency Test",
      "Detailed and review medical examination",
      "Interview/Personality Test — 200 marks",
      "Merit list prepared by the Commission",
    ],
    syllabus: [
      "Paper I — General Ability and Intelligence and Professional Skill: 300 marks, 150 objective questions, two and a half hours, set in English and Hindi; Part A General Ability and Intelligence (150 marks) and Part B Professional Skill (150 marks).",
      "Paper II — Essay, Precis Writing and Comprehension: 100 marks, two hours.",
      "The full syllabus, scheme and physical/medical standards are in the Rules notified by the Ministry of Home Affairs in the Gazette of India dated 3 Dec 2025.",
    ],
    officialLinks: [
      { label: "Official examination page", url: "https://www.upsc.gov.in/examinations/CISF%20AC%28EXE%29%20LDCE-2026", type: "notice" },
      {
        label: "Interview schedule notice dated 29 Jul 2026",
        url: "https://www.upsc.gov.in/sites/default/files/Intv-CISFAC-EXE-LDCE-2026-Engl-290726.pdf",
        type: "notice",
      },
      {
        label: "Written result (roll number list)",
        url: "https://www.upsc.gov.in/sites/default/files/WR-CISF-2026-Engl-RollList-130426.pdf",
        type: "result",
      },
      {
        label: "Official examination notice and Rules",
        url: "https://www.upsc.gov.in/sites/default/files/Notif-CISF-AC-EXE-LDCE-26-Engl-031225.pdf",
        type: "notice",
      },
      { label: "UPSC active examinations", url: "https://www.upsc.gov.in/examinations/active-exams", type: "website" },
      { label: "UPSC notification archive", url: "https://www.upsc.gov.in/exams-related-info/exam-notification/archives", type: "notice" },
      { label: "UPSC application portal", url: "https://upsconline.nic.in/", type: "apply" },
    ],
    sourceTitle: "UPSC CISF AC (EXE) LDCE-2026 examination page",
    sourceUrl: "https://www.upsc.gov.in/examinations/CISF%20AC%28EXE%29%20LDCE-2026",
    sourcePublished: "Interview schedule notice dated 29 Jul 2026; written result declared 13 Apr 2026",
    lastVerified: "20 Aug 2026, 02:30 IST",
    changeLog: [
      {
        date: "2026-08-19",
        displayDate: "19 Aug 2026",
        text: "Recorded the stages UPSC had already published: the written result of 13 Apr 2026 and the notice of 29 Jul 2026 starting the Personality Test from 17 Aug 2026.",
      },
    ],
    keywords: [
      "CISF LDCE",
      "CISF departmental exam",
      "Assistant Commandant Executive",
      "Central Industrial Security Force promotion exam",
      "सीआईएसएफ विभागीय परीक्षा",
      "Sub Inspector GD promotion",
      "Inspector GD promotion",
      "limited departmental competitive examination",
    ],
  }),
];
