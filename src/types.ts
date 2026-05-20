export type BusinessFocus =
  | "MACRO"
  | "GLOBAL_NAT"
  | "MARKET_OPPORTUNITY"
  | "SUPPLY_DEMAND"
  | "GTM_STRATEGY"
  | "STRUCTURE"
  | "TRANSITION_MODEL"
  | "OPS_MODEL"
  | "DIGITAL_COVERAGE"
  | "COMPETITOR"
  | "TAM_SAM_SOM"
  | "CAC_LTV";

export interface FocusConfig {
  id: BusinessFocus;
  title: string;
  description: string;
  concept: string;
  badge: string;
  iconName: string;
  placeholderQuestion: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface JournalOutput {
  title: string;
  abstract: string;
  keywords: string[];
  introduction: string;
  methodology: string;
  findings: string;
  discussion: string;
  conclusion: string;
}

export interface WordOutput {
  title: string;
  subtitle: string;
  executiveSummary: string;
  detailedAnalysis: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskMitigation: string;
  actionPlan: string[];
}

export interface PptSlide {
  slideNumber: number;
  title: string;
  layout: "hero" | "bullets" | "two_columns" | "matrix" | string;
  points: string[];
  highlightMetric: string;
}

export interface PptOutput {
  presentationTitle: string;
  presentationSubtitle: string;
  slides: PptSlide[];
}

export interface ExcelRow {
  id: string;
  itemName: string;
  category: string;
  value1: number;
  value2: number;
  totalCalculated: number;
  notes: string;
}

export interface ExcelOutput {
  sheetName: string;
  description: string;
  headers: string[];
  rows: ExcelRow[];
  summaryMetrics: {
    totalSum1: number;
    totalSum2: number;
    totalCalculatedSum: number;
    conclusionMetric: string;
  };
}

export interface ProjectContext {
  name: string;
  description: string;
  budget?: string;
  industry?: string;
}
