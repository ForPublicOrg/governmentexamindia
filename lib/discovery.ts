import type { ExamType } from "@/lib/exam-types";

export type IndiaRegion = {
  code: string;
  name: string;
  slug: string;
  kind: "State" | "Union territory";
  mapName: string;
};

export const indiaRegions: IndiaRegion[] = [
  { code: "AP", name: "Andhra Pradesh", slug: "andhra-pradesh", kind: "State", mapName: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh", slug: "arunachal-pradesh", kind: "State", mapName: "Arunachal Pradesh" },
  { code: "AS", name: "Assam", slug: "assam", kind: "State", mapName: "Assam" },
  { code: "BR", name: "Bihar", slug: "bihar", kind: "State", mapName: "Bihar" },
  { code: "CG", name: "Chhattisgarh", slug: "chhattisgarh", kind: "State", mapName: "Chhattisgarh" },
  { code: "GA", name: "Goa", slug: "goa", kind: "State", mapName: "Goa" },
  { code: "GJ", name: "Gujarat", slug: "gujarat", kind: "State", mapName: "Gujarat" },
  { code: "HR", name: "Haryana", slug: "haryana", kind: "State", mapName: "Haryana" },
  { code: "HP", name: "Himachal Pradesh", slug: "himachal-pradesh", kind: "State", mapName: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand", slug: "jharkhand", kind: "State", mapName: "Jharkhand" },
  { code: "KA", name: "Karnataka", slug: "karnataka", kind: "State", mapName: "Karnataka" },
  { code: "KL", name: "Kerala", slug: "kerala", kind: "State", mapName: "Kerala" },
  { code: "MP", name: "Madhya Pradesh", slug: "madhya-pradesh", kind: "State", mapName: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra", slug: "maharashtra", kind: "State", mapName: "Maharashtra" },
  { code: "MN", name: "Manipur", slug: "manipur", kind: "State", mapName: "Manipur" },
  { code: "ML", name: "Meghalaya", slug: "meghalaya", kind: "State", mapName: "Meghalaya" },
  { code: "MZ", name: "Mizoram", slug: "mizoram", kind: "State", mapName: "Mizoram" },
  { code: "NL", name: "Nagaland", slug: "nagaland", kind: "State", mapName: "Nagaland" },
  { code: "OD", name: "Odisha", slug: "odisha", kind: "State", mapName: "Odisha" },
  { code: "PB", name: "Punjab", slug: "punjab", kind: "State", mapName: "Punjab" },
  { code: "RJ", name: "Rajasthan", slug: "rajasthan", kind: "State", mapName: "Rajasthan" },
  { code: "SK", name: "Sikkim", slug: "sikkim", kind: "State", mapName: "Sikkim" },
  { code: "TN", name: "Tamil Nadu", slug: "tamil-nadu", kind: "State", mapName: "Tamil Nadu" },
  { code: "TG", name: "Telangana", slug: "telangana", kind: "State", mapName: "Telangana" },
  { code: "TR", name: "Tripura", slug: "tripura", kind: "State", mapName: "Tripura" },
  { code: "UP", name: "Uttar Pradesh", slug: "uttar-pradesh", kind: "State", mapName: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand", slug: "uttarakhand", kind: "State", mapName: "Uttarakhand" },
  { code: "WB", name: "West Bengal", slug: "west-bengal", kind: "State", mapName: "West Bengal" },
  { code: "AN", name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands", kind: "Union territory", mapName: "Andaman & Nicobar" },
  { code: "CH", name: "Chandigarh", slug: "chandigarh", kind: "Union territory", mapName: "Chandigarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-nagar-haveli-daman-diu", kind: "Union territory", mapName: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi", slug: "delhi", kind: "Union territory", mapName: "Delhi" },
  { code: "JK", name: "Jammu and Kashmir", slug: "jammu-and-kashmir", kind: "Union territory", mapName: "Jammu & Kashmir" },
  { code: "LA", name: "Ladakh", slug: "ladakh", kind: "Union territory", mapName: "Ladakh" },
  { code: "LD", name: "Lakshadweep", slug: "lakshadweep", kind: "Union territory", mapName: "Lakshadweep" },
  { code: "PY", name: "Puducherry", slug: "puducherry", kind: "Union territory", mapName: "Puducherry" },
];

export const examTypeOptions: { value: ExamType; slug: string; description: string }[] = [
  { value: "Civil Services & Administration", slug: "civil-services-administration", description: "UPSC, SSC and state public service commission recruitments" },
  { value: "Banking & Finance", slug: "banking-finance", description: "Public-sector bank officer and specialist recruitment" },
  { value: "Armed Forces", slug: "armed-forces", description: "Officer-entry examinations for the armed forces" },
  { value: "Police & CAPF", slug: "police-capf", description: "Police, constable and central armed police force recruitment" },
  { value: "Railways", slug: "railways", description: "Railway Recruitment Board posts and stages" },
  { value: "Health & Medical", slug: "health-medical", description: "Nursing, pharmacy and other health-service posts" },
  { value: "Technical & Trades", slug: "technical-trades", description: "ITI, diploma, engineering and trade-based recruitment" },
  { value: "Teaching & Education", slug: "teaching-education", description: "School, lecturer and education-department posts" },
  { value: "Specialist & Professional", slug: "specialist-professional", description: "Domain-specific roles in law, statistics, IT and more" },
  { value: "Judiciary & Legal", slug: "judiciary-legal", description: "Judicial service, prosecution, legal officer and court recruitment" },
  { value: "Public Sector Undertakings", slug: "public-sector-undertakings", description: "Technical, management and specialist recruitment by public-sector enterprises" },
];

export function getRegion(slug: string) {
  return indiaRegions.find((region) => region.slug === slug);
}

export function getExamType(slug: string) {
  return examTypeOptions.find((type) => type.slug === slug);
}
