import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  PackageCheck,
  Rocket,
  GitMerge,
  Milestone,
  Cpu,
  Laptop,
  ShieldAlert,
  Sigma,
  Wallet,
  Send,
  FileText,
  Presentation,
  Grid,
  LogOut,
  User,
  Lock,
  Plus,
  Compass,
  CheckCircle,
  Copy,
  FileDown,
  X,
  ChevronRight,
  BookOpen,
  PieChart,
  Layers,
  Sparkles,
  HelpCircle,
  Printer,
  ChevronLeft,
  Settings,
  Flame,
  Briefcase,
  Image
} from "lucide-react";
import { FOCUS_AREAS } from "./data";
import { BusinessFocus, ChatMessage, JournalOutput, WordOutput, PptOutput, ExcelOutput } from "./types";
import pptxgen from "pptxgenjs";

const convertSvgToPng = (svgString: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const svgClean = svgString.trim();
      const svgBlob = new Blob([svgClean], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // standard resolution for illustrations in slides
        canvas.width = 640;
        canvas.height = 380;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#111827"; // Dark background default
          ctx.fillRect(0, 0, 640, 380);
          ctx.drawImage(img, 0, 0, 640, 380);
        }
        const dataUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        console.warn("Could not load SVG as image for PPTX export.");
        resolve("");
      };
      img.src = url;
    } catch (e) {
      console.error("Error converting SVG to PNG:", e);
      resolve("");
    }
  });
};

export default function App() {
  // Authentication & Session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Business project profile state
  const [projectName, setProjectName] = useState<string>("PRAMA ( Project Management Analitic )");
  const [projectDesc, setProjectDesc] = useState<string>(
    "Sistem rantai pasok logistik bahan pangan organik berbasis IoT dan AI guna mereduksi pemborosan pangan dari ladang petani lokal hingga pusat distribusi kota besar di Indonesia."
  );
  const [isEditingProject, setIsEditingProject] = useState<boolean>(false);

  // Active focus state
  const [selectedFocus, setSelectedFocus] = useState<BusinessFocus>("MACRO");

  // Document Generator state
  const [docType, setDocType] = useState<"journal" | "word" | "ppt" | "excel">("journal");
  const [docPromptNotes, setDocPromptNotes] = useState<string>("");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState<boolean>(false);
  
  // Storage for generated documents
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, { type: string; data: any; focusTitle: string }>>({});
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Chat message state per focus
  const [chats, setChats] = useState<Record<BusinessFocus, ChatMessage[]>>(() => {
    const initialChats = {} as Record<BusinessFocus, ChatMessage[]>;
    FOCUS_AREAS.forEach((f) => {
      initialChats[f.id] = [
        {
          id: "welcome",
          role: "assistant",
          content: `Halo! Saya adalah AI Asisten Spesialis **${f.title}** untuk proyek **PRAMA ( Project Management Analitic )**. \n\n${f.concept}\n\nAda aspek strategis apa tentang fokus ini yang ingin Anda diskusikan atau tanyakan?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
    return initialChats;
  });
  const [chatInput, setChatInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // AI Illustrative image states
  const [illustrations, setIllustrations] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem("prama_illustrations");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [generatingIllustrationKey, setGeneratingIllustrationKey] = useState<string | null>(null);

  // PPT Export / Download Option configurations
  const [pptTheme, setPptTheme] = useState<'midnight' | 'ocean' | 'minimal' | 'emerald' | 'sunlight' | 'lavender'>('midnight');
  const [pptIncludeIllustrations, setPptIncludeIllustrations] = useState<boolean>(true);
  const [isPptDownloadOpen, setIsPptDownloadOpen] = useState<boolean>(false);

  // Save illustrations to localStorage when updated
  useEffect(() => {
    localStorage.setItem("prama_illustrations", JSON.stringify(illustrations));
  }, [illustrations]);

  // Handler to generate illustration in full SVG format
  const handleGenerateIllustration = async (docKey: string, sectionIndexOrId: string, title: string, promptText: string) => {
    const key = `${docKey}_${sectionIndexOrId}`;
    setGeneratingIllustrationKey(key);
    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt: promptText })
      });
      const data = await res.json();
      if (data.svg) {
        setIllustrations(prev => ({ ...prev, [key]: data.svg }));
      } else {
        alert(data.error || "Gagal membuat gambar ilustrasi. Coba lagi.");
      }
    } catch (err) {
      console.error("Gagal melakukan generate gambar ilustrasi:", err);
      // Fallback elegant SVG if network fails
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#111827" rx="12"/>
        <defs>
          <linearGradient id="fallbackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        <circle cx="250" cy="130" r="60" fill="url(#fallbackGrad)" opacity="0.3"/>
        <g stroke="url(#fallbackGrad)" stroke-width="2" fill="none">
          <circle cx="250" cy="130" r="40" />
          <circle cx="250" cy="130" r="20" />
          <line x1="150" y1="130" x2="350" y2="130" stroke-dasharray="4,4"/>
          <line x1="250" y1="50" x2="250" y2="210" stroke-dasharray="4,4"/>
        </g>
        <text x="250" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
        <text x="250" y="260" font-family="sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">Ilustrasi Vektor Strategis (${sectionIndexOrId})</text>
      </svg>`;
      setIllustrations(prev => ({ ...prev, [key]: fallbackSvg }));
    } finally {
      setGeneratingIllustrationKey(null);
    }
  };

  // Ref for auto-scrolling chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load auth state from localStorage on init
  useEffect(() => {
    const storedUser = localStorage.getItem("workspace_ai_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch (err) {
        localStorage.removeItem("workspace_ai_user");
      }
    }

    // Load any offline mock generated docs if exists
    const storedDocs = localStorage.getItem("workspace_ai_docs");
    if (storedDocs) {
      try {
        setGeneratedDocs(JSON.parse(storedDocs));
      } catch (e) {}
    }
  }, []);

  // Sync chats for custom project names
  useEffect(() => {
    setChats(prev => {
      const updated = { ...prev };
      FOCUS_AREAS.forEach(f => {
        if (updated[f.id] && updated[f.id].length > 0 && updated[f.id][0].id === "welcome") {
          updated[f.id][0].content = `Halo! Saya adalah AI Asisten Spesialis **${f.title}** untuk proyek **${projectName}**. \n\n${f.concept}\n\nAda aspek strategis apa tentang fokus ini yang ingin Anda diskusikan atau tanyakan?`;
        }
      });
      return updated;
    });
  }, [projectName]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedFocus]);

  // Auth operations
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError("Email dan Password wajib diisi.");
      return;
    }

    if (authTab === "signup") {
      if (!fullName) {
        setAuthError("Nama Lengkap wajib diisi untuk mendaftar.");
        return;
      }
      // Create user and store
      const newUser = { name: fullName, email };
      localStorage.setItem("workspace_ai_user", JSON.stringify(newUser));
      setUser(newUser);
      setAuthSuccess("Pendaftaran berhasil! Mengalihkan...");
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    } else {
      // Basic login pass-through
      if (password.length < 4) {
        setAuthError("Password minimal harus 4 karakter.");
        return;
      }
      const existingUser = { name: email.split("@")[0].toUpperCase(), email };
      localStorage.setItem("workspace_ai_user", JSON.stringify(existingUser));
      setUser(existingUser);
      setAuthSuccess("Login berhasil! Selamat datang kembali.");
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("workspace_ai_user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // Chat Submission to Gemini server endpoint
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsgText = chatInput;
    setChatInput("");

    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message
    const currentFocusChats = chats[selectedFocus] || [];
    setChats((prev) => ({
      ...prev,
      [selectedFocus]: [...currentFocusChats, newMsg]
    }));

    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentFocusChats, newMsg].map(m => ({ role: m.role, content: m.content })),
          focusArea: selectedFocus,
          projectName,
          projectDesc
        })
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan asisten AI. Pastikan GEMINI_API_KEY sudah dikonfigurasi.");
      }

      const resData = await response.json();
      const aiReply: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: resData.answer || "Maaf, sistem tidak mengembalikan jawaban yang valid.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats((prev) => ({
        ...prev,
        [selectedFocus]: [...prev[selectedFocus], aiReply]
      }));

    } catch (err: any) {
      console.error(err);
      const aiErrorReply: ChatMessage = {
        id: "msg-err-" + Date.now(),
        role: "assistant",
        content: `⚠️ **Gagal mengirim pesan ke AI:** ${err.message || "Kesalahan server internal"}\n\n*Harap periksa kecocokan Server port serta kunci GEMINI_API_KEY di dashboard Settings.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats((prev) => ({
        ...prev,
        [selectedFocus]: [...prev[selectedFocus], aiErrorReply]
      }));
    } finally {
      setIsSendingChat(false);
    }
  };

  // Document strategic generation using Gemini API endpoint
  const handleGenerateDocument = async () => {
    if (isGeneratingDoc) return;
    setIsGeneratingDoc(true);

    const targetFocusConfig = FOCUS_AREAS.find(f => f.id === selectedFocus) || FOCUS_AREAS[0];
    const docKey = `${selectedFocus}-${docType}`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          projectDesc,
          focusArea: selectedFocus,
          docType,
          additionalContext: docPromptNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghasilkan dokumen lewat model AI.");
      }

      const data = await response.json();

      const newDocRecord = {
        type: docType,
        data: data,
        focusTitle: targetFocusConfig.title
      };

      const updatedDocs = {
        ...generatedDocs,
        [docKey]: newDocRecord
      };

      setGeneratedDocs(updatedDocs);
      localStorage.setItem("workspace_ai_docs", JSON.stringify(updatedDocs));
      setSelectedDocKey(docKey);
      setDocPromptNotes(""); // Clear the custom notes on success
    } catch (error: any) {
      alert(`Error membuat dokumen: ${error?.message || error}`);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // Helper to copy text to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Export document with format selection (TXT, HTML, JSON, CSV, PPT)
  const handleExportDocument = async (format: 'txt' | 'html' | 'json' | 'csv' | 'ppt') => {
    if (!selectedDocKey || !generatedDocs[selectedDocKey]) return;
    const doc = generatedDocs[selectedDocKey];
    const { type, data, focusTitle } = doc;
    
    let fileContent = "";
    let mimeType = "text/plain";
    let fileExtension: string = format;

    const cleanProjectNameForFile = projectName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanFocusForFile = focusTitle.replace(/[^a-zA-Z0-9]/g, "_");
    let filename = `${cleanProjectNameForFile}_${cleanFocusForFile}_${type}.${fileExtension}`;

    if (format === 'ppt') {
      if (type !== 'ppt') {
        alert("Ekspor PPT hanya tersedia untuk jenis dokumen PPT Slides.");
        return;
      }
      fileExtension = 'pptx';
      filename = `${cleanProjectNameForFile}_${cleanFocusForFile}_Presentation.pptx`;
    }

    if (format === 'json') {
      fileContent = JSON.stringify(data, null, 2);
      mimeType = "application/json";
    } else if (format === 'csv') {
      if (type !== 'excel') {
        alert("Ekspor CSV hanya tersedia untuk jenis dokumen Excel/Spreadsheet.");
        return;
      }
      const excelData = data as any;
      const headers = excelData.headers && excelData.headers.length > 0 
        ? excelData.headers 
        : ["ID", "Nama Item", "Kategori", "Nilai Utama", "Nilai Sekunder", "Total", "Catatan"];
      
      const csvRows = [headers.join(",")];
      
      if (excelData.rows && Array.isArray(excelData.rows)) {
        excelData.rows.forEach((row: any) => {
          const values = [
            `"${row.id || ''}"`,
            `"${(row.itemName || '').replace(/"/g, '""')}"`,
            `"${(row.category || '').replace(/"/g, '""')}"`,
            row.value1,
            row.value2,
            row.totalCalculated,
            `"${(row.notes || '').replace(/"/g, '""')}"`
          ];
          csvRows.push(values.join(","));
        });
      }

      // Add summary metrics
      if (excelData.summaryMetrics) {
        csvRows.push("");
        csvRows.push(",,,Total Revenue / Target,Total Cost,Grand Total");
        csvRows.push(`,,,${excelData.summaryMetrics.totalSum1 || 0},${excelData.summaryMetrics.totalSum2 || 0},${excelData.summaryMetrics.totalCalculatedSum || 0}`);
        csvRows.push(`,,,,Kesimpulan,,"${(excelData.summaryMetrics.conclusionMetric || '').replace(/"/g, '""')}"`);
      }

      fileContent = csvRows.join("\n");
      mimeType = "text/csv";
    } else if (format === 'txt') {
      mimeType = "text/plain";

      if (type === 'journal') {
        const journal = data as any;
        fileContent = `============================================================
JURNAL NASIONAL & GLOBAL SISTEM STRATEGI BISNIS MAKRO
============================================================
PROYEK   : ${projectName}
FOKUS    : ${focusTitle}
JUDUL    : ${journal.title || ''}
KATA KUNCI: ${(journal.keywords || []).join(", ")}

------------------------------------------------------------
ABSTRAK
------------------------------------------------------------
${journal.abstract || ''}

------------------------------------------------------------
1. PENDAHULUAN & LATAR BELAKANG
------------------------------------------------------------
${journal.introduction || ''}

------------------------------------------------------------
2. METODOLOGI ANALISIS
------------------------------------------------------------
${journal.methodology || ''}

------------------------------------------------------------
3. TEMUAN HASIL RISET (FINDINGS)
------------------------------------------------------------
${journal.findings || ''}

------------------------------------------------------------
4. DISKUSI KOMPREHENSIF
------------------------------------------------------------
${journal.discussion || ''}

------------------------------------------------------------
5. KESIMPULAN & REKOMENDASI MASA DEPAN
------------------------------------------------------------
${journal.conclusion || ''}
`;
      } else if (type === 'word') {
        const word = data as any;
        fileContent = `============================================================
LAPORAN PROPOSAL EKSEKUTIF (EXECUTIVE PROPOSAL)
============================================================
PROYEK   : ${projectName}
FOKUS    : ${focusTitle}
JUDUL    : ${word.title || ''}
SUBJUDUL : ${word.subtitle || ''}

------------------------------------------------------------
RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
------------------------------------------------------------
${word.executiveSummary || ''}

------------------------------------------------------------
ANALISIS STRATEGIS MENDALAM
------------------------------------------------------------
${word.detailedAnalysis || ''}

------------------------------------------------------------
MATRIKS KARAKTERISTIK SWOT
------------------------------------------------------------
KEKUATAN (STRENGTHS):
${(word.swot?.strengths || []).map((s: string, idx: number) => `  ${idx + 1}. ${s}`).join("\n")}

KELEMAHAN (WEAKNESSES):
${(word.swot?.weaknesses || []).map((w: string, idx: number) => `  ${idx + 1}. ${w}`).join("\n")}

PELUANG (OPPORTUNITIES):
${(word.swot?.opportunities || []).map((o: string, idx: number) => `  ${idx + 1}. ${o}`).join("\n")}

ANCAMAN (THREATS):
${(word.swot?.threats || []).map((t: string, idx: number) => `  ${idx + 1}. ${t}`).join("\n")}

------------------------------------------------------------
RESTRUKTURISASI RECOVERY & MITIGASI RISIKO
------------------------------------------------------------
${word.riskMitigation || ''}

------------------------------------------------------------
10 LANGKAH RENCANA AKSI SEGERA (ACTION PLAN)
------------------------------------------------------------
${(word.actionPlan || []).map((step: string, idx: number) => `  Langkah ${idx + 1}: ${step}`).join("\n")}
`;
      } else if (type === 'ppt') {
        const ppt = data as any;
        fileContent = `============================================================
GARIS BESAR PRESTASI SLIDE PRESENTASI (PPT OUTLINE)
============================================================
PROYEK   : ${projectName}
FOKUS    : ${focusTitle}
JUDUL    : ${ppt.presentationTitle || ''}
SUBJUDUL : ${ppt.presentationSubtitle || ''}

------------------------------------------------------------
OUTLINE SLIDE-BY-SLIDE
------------------------------------------------------------
${(ppt.slides || []).map((slide: any) => `
SLIDE ${slide.slideNumber}: ${slide.title}
------------------------------------------------------------
Layout Visual   : [${(slide.layout || 'standard').toUpperCase()}]
Sorotan Penting : ${slide.highlightMetric || '-'}

Poin Penjelasan Utama:
${(slide.points || []).map((p: string) => `  - ${p}`).join("\n")}
`).join("\n\n")}
`;
      } else {
        // excel text format
        const excel = data as any;
        fileContent = `============================================================
PEMODELAN EXCEL FINANSIAL & OPERASIONAL
============================================================
PROYEK   : ${projectName}
FOKUS    : ${focusTitle}
SHEET    : ${excel.sheetName || ''}
DESKRIPSI: ${excel.description || ''}

DATAGRID DAN HASIL PERHITUNGAN:
------------------------------------------------------------
${(excel.headers || []).join("\t")}
------------------------------------------------------------
${(excel.rows || []).map((row: any) => `${row.id}\t${row.itemName}\t${row.category}\t${row.value1}\t${row.value2}\t${row.totalCalculated}\t${row.notes}`).join("\n")}
------------------------------------------------------------

RINGKASAN METRIK DAN AGREGAT:
- Total Revenue/Target : ${excel.summaryMetrics?.totalSum1 || 0}
:- Total Cost           : ${excel.summaryMetrics?.totalSum2 || 0}
- Total Akumulatif    : ${excel.summaryMetrics?.totalCalculatedSum || 0}
- Kesimpulan Analisis : ${excel.summaryMetrics?.conclusionMetric || ''}
`;
      }
    } else if (format === 'html') {
      mimeType = "text/html";
      const printElement = document.getElementById("document-print-area");
      const printableHTML = printElement ? printElement.innerHTML : "<h1>No data available</h1>";

      fileContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ekspor ${projectName} - ${focusTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0d0f12; color: #cbd5e1; font-family: ui-sans-serif, system-ui, sans-serif; padding: 2rem; }
    .swot-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    @media (min-width: 768px) { .swot-grid { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body class="bg-[#0d0f12] text-slate-300">
  <div class="max-w-4xl mx-auto">
    <div class="mb-4 text-xs text-slate-500 font-mono flex justify-between items-center border-b border-slate-800 pb-2">
      <span>Ekspor Dokumen Otomatis &bull; Macro Business AI Planner</span>
      <span>Tanggal: ${new Date().toLocaleDateString('id-ID')}</span>
    </div>
    <div class="bg-[#13171e] border border-slate-800 rounded-xl p-8 shadow-2xl">
      ${printableHTML}
    </div>
  </div>
</body>
</html>`;
    } else if (format === 'ppt') {
      const pptData = data as any;
      const slides = pptData.slides || [];
      const title = pptData.presentationTitle || "Outline Presentasi Bisnis";
      const subtitle = pptData.presentationSubtitle || "Ringkasan Tiap Slide untuk Presentasi Investor";

      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";

      // Map pptTheme to colors
      let mainBg = "090C10";
      let cardBg = "121620";
      let titleColor = "FFFFFF";
      let textColor = "CBD5E1";
      let accentColor = "10B981"; // Emerald

      if (pptTheme === 'midnight') {
        mainBg = "090C10";
        cardBg = "121620";
        titleColor = "FFFFFF";
        textColor = "CBD5E1";
        accentColor = "10B981";
      } else if (pptTheme === 'ocean') {
        mainBg = "0B111E";
        cardBg = "0F172A";
        titleColor = "38BDF8";
        textColor = "CBD5E1";
        accentColor = "0EA5E9";
      } else if (pptTheme === 'emerald') {
        mainBg = "F0FBF7";
        cardBg = "FFFFFF";
        titleColor = "065F46";
        textColor = "1E293B";
        accentColor = "10B981";
      } else if (pptTheme === 'sunlight') {
        mainBg = "FFFDF5";
        cardBg = "FFFFFF";
        titleColor = "854D0E";
        textColor = "1E293B";
        accentColor = "D97706";
      } else if (pptTheme === 'lavender') {
        mainBg = "FAF8FF";
        cardBg = "FFFFFF";
        titleColor = "5B21B6";
        textColor = "1E293B";
        accentColor = "8B5CF6";
      } else if (pptTheme === 'minimal') {
        mainBg = "F8FAFC";
        cardBg = "FFFFFF";
        titleColor = "0F172A";
        textColor = "334155";
        accentColor = "475569";
      }

      // Slide 1: Welcome/Title Slide
      const slide0 = pptx.addSlide();
      slide0.background = { color: mainBg };

      // Outer border box container
      slide0.addShape("rect", {
        x: 0.5, y: 0.5, w: 9.0, h: 4.625,
        fill: { color: cardBg },
        line: { color: accentColor, width: 2 }
      });

      // Accent top string
      slide0.addText("PROJECT MODEL DECK • POWERPOINT EXPORT", {
        x: 1.0, y: 0.9, w: 8.0, h: 0.4,
        fontSize: 10,
        color: accentColor,
        bold: true,
        align: "center",
        fontFace: "Arial"
      });

      // Big Title
      slide0.addText(title.toUpperCase(), {
        x: 1.0, y: 1.5, w: 8.0, h: 1.5,
        fontSize: 26,
        bold: true,
        color: titleColor,
        align: "center",
        fontFace: "Arial"
      });

      // Subtitle
      slide0.addText(subtitle, {
        x: 1.0, y: 3.1, w: 8.0, h: 0.8,
        fontSize: 13,
        color: textColor,
        align: "center",
        fontFace: "Arial"
      });

      // Bottom AI credit tag
      slide0.addText("ELEGANT PRESENTATION • DIBUAT DENGAN PRAMA AI", {
        x: 1.0, y: 4.2, w: 8.0, h: 0.4,
        fontSize: 9,
        color: textColor,
        align: "center",
        fontFace: "Arial"
      });

      // Slide-by-slide Generation
      for (let idx = 0; idx < slides.length; idx++) {
        const slide = slides[idx];
        const newSlide = pptx.addSlide();
        newSlide.background = { color: mainBg };

        // Background container shape representing Gamma-like cards
        newSlide.addShape("rect", {
          x: 0.4, y: 0.4, w: 9.2, h: 4.825,
          fill: { color: cardBg },
          line: { color: "334155", width: 1 }
        });

        // Slide Title header left-spaced
        newSlide.addText(slide.title.toUpperCase(), {
          x: 0.7, y: 0.6, w: 6.0, h: 0.6,
          fontSize: 18,
          bold: true,
          color: titleColor,
          fontFace: "Arial"
        });

        // Unique high-impact statistic/highlightMetric badge
        if (slide.highlightMetric) {
          newSlide.addShape("roundRect", {
            x: 6.8, y: 0.6, w: 2.3, h: 0.45,
            fill: { color: mainBg },
            line: { color: accentColor, width: 1 }
          });
          newSlide.addText(slide.highlightMetric, {
            x: 6.8, y: 0.6, w: 2.3, h: 0.45,
            fontSize: 10,
            bold: true,
            color: accentColor,
            align: "center",
            fontFace: "Arial"
          });
        }

        const illustrationKey = `${selectedDocKey}_slide_${idx}`;
        const illustrationSvg = illustrations[illustrationKey];
        const hasIllustration = pptIncludeIllustrations && !!illustrationSvg;

        if (hasIllustration) {
          // Dynamic conversion of SVG illustrations into crisp embedded PNGs
          let bulletY = 1.3;
          const points = slide.points || [];
          points.forEach((pt: string) => {
            newSlide.addText(`•  ${pt}`, {
              x: 0.7, y: bulletY, w: 5.0, h: 0.9,
              fontSize: 12,
              color: textColor,
              align: "left",
              fontFace: "Arial"
            });
            bulletY += 0.95;
          });

          try {
            const pngDataUrl = await convertSvgToPng(illustrationSvg);
            if (pngDataUrl) {
              newSlide.addImage({
                data: pngDataUrl,
                x: 5.8,
                y: 1.3,
                w: 3.4,
                h: 2.8
              });
            }
          } catch (imgErr) {
            console.error("Failed to render illustration image onto PowerPoint slide index:", idx, imgErr);
          }
        } else {
          // No illustration layouts
          const points = slide.points || [];
          if (slide.layout === 'two_columns' || points.length > 3) {
            const midIndex = Math.ceil(points.length / 2);
            const leftCol = points.slice(0, midIndex);
            const rightCol = points.slice(midIndex);

            let bulletY = 1.4;
            leftCol.forEach((pt: string) => {
              newSlide.addText(`•  ${pt}`, {
                x: 0.7, y: bulletY, w: 4.1, h: 0.9,
                fontSize: 12, color: textColor, fontFace: "Arial"
              });
              bulletY += 0.95;
            });

            bulletY = 1.4;
            rightCol.forEach((pt: string) => {
              newSlide.addText(`•  ${pt}`, {
                x: 5.1, y: bulletY, w: 4.1, h: 0.9,
                fontSize: 12, color: textColor, fontFace: "Arial"
              });
              bulletY += 0.95;
            });
          } else {
            // Full width bullet points
            let bulletY = 1.4;
            points.forEach((pt: string) => {
              newSlide.addText(`•  ${pt}`, {
                x: 0.7, y: bulletY, w: 8.6, h: 0.8,
                fontSize: 13, color: textColor, fontFace: "Arial"
              });
              bulletY += 0.9;
            });
          }
        }

        // Standard Elegant Slide Numbers
        newSlide.addText(`SLIDE 0${idx + 1} / 0${slides.length + 1}  •  ${projectName.toUpperCase()}  •  PRAMA AI SYSTEM`, {
          x: 0.7, y: 4.8, w: 8.6, h: 0.3,
          fontSize: 8.5,
          color: textColor,
          fontFace: "Courier New"
        });
      }

      await pptx.writeFile({ fileName: filename });
      return;
    } else if (format === 'legacy_ppt') {
      mimeType = "text/html";
      const pptData = data as any;
      const slides = pptData.slides || [];
      const title = pptData.presentationTitle || "Outline Presentasi Bisnis";
      const subtitle = pptData.presentationSubtitle || "Ringkasan Tiap Slide untuk Presentasi Investor";

      // 1. Configure visual theme classes dynamically
      const isDarkTheme = pptTheme === 'midnight' || pptTheme === 'ocean';
      let bgWrapperClass = "bg-[#090c10]";
      let cardBgClass = "bg-[#121620] border-slate-800 text-slate-300";
      let titleColorClass = "text-white";
      let highlightBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      let highlightMetricClass = "text-emerald-400 font-bold";
      let subTitleClass = "text-slate-400";
      let pBgClass = "bg-slate-900/30 border border-slate-800";
      let textNormalClass = "text-slate-300";
      let layoutLabelClass = "text-slate-500";
      let bulletBgClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      let buttonPrimaryClass = "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white";
      let accentOrbs = `
        <div class="absolute -right-20 -top-20 w-84 h-84 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-84 h-84 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      `;

      if (pptTheme === 'ocean') {
        bgWrapperClass = "bg-[#0b111e]";
        cardBgClass = "bg-[#0f172a] border-slate-800 text-slate-300";
        titleColorClass = "text-white";
        highlightBadgeClass = "bg-blue-500/10 text-blue-400 border-blue-400/20";
        highlightMetricClass = "text-blue-400 font-bold";
        subTitleClass = "text-slate-400";
        pBgClass = "bg-slate-900/40 border border-slate-800";
        textNormalClass = "text-slate-300";
        layoutLabelClass = "text-slate-500";
        bulletBgClass = "bg-blue-500/10 text-blue-400 border border-blue-400/20";
        buttonPrimaryClass = "bg-blue-600 border-blue-500 hover:bg-blue-500 text-white";
        accentOrbs = `
          <div class="absolute -right-20 -top-20 w-84 h-84 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-84 h-84 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        `;
      } else if (pptTheme === 'emerald') {
        bgWrapperClass = "bg-[#f0fbf7]";
        cardBgClass = "bg-white border-teal-100 text-slate-700 shadow-xl shadow-teal-500/5";
        titleColorClass = "text-[#115e59] font-bold";
        highlightBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        highlightMetricClass = "text-emerald-700 font-bold";
        subTitleClass = "text-slate-600";
        pBgClass = "bg-emerald-50/30 border border-teal-100";
        textNormalClass = "text-slate-700";
        layoutLabelClass = "text-slate-400";
        bulletBgClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
        buttonPrimaryClass = "bg-[#0d9488] border-teal-600 hover:bg-[#14b8a6] text-white";
        accentOrbs = `
          <div class="absolute -right-20 -top-20 w-84 h-84 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-84 h-84 bg-teal-500/3 rounded-full blur-3xl pointer-events-none"></div>
        `;
      } else if (pptTheme === 'sunlight') {
        bgWrapperClass = "bg-[#fffdf5]";
        cardBgClass = "bg-white border-amber-100 text-slate-800 shadow-xl shadow-amber-500/5";
        titleColorClass = "text-amber-800 font-extrabold";
        highlightBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
        highlightMetricClass = "text-amber-600 font-bold";
        subTitleClass = "text-slate-600";
        pBgClass = "bg-amber-50/20 border border-amber-100";
        textNormalClass = "text-slate-700";
        layoutLabelClass = "text-amber-500/70";
        bulletBgClass = "bg-amber-50 text-amber-700 border border-amber-200";
        buttonPrimaryClass = "bg-amber-600 border-amber-600 hover:bg-amber-500 text-white";
        accentOrbs = `
          <div class="absolute -right-20 -top-20 w-84 h-84 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-84 h-84 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
        `;
      } else if (pptTheme === 'lavender') {
        bgWrapperClass = "bg-[#faf8ff]";
        cardBgClass = "bg-white border-[#f3e8ff] text-slate-800 shadow-xl shadow-purple-500/5";
        titleColorClass = "text-purple-950 font-black";
        highlightBadgeClass = "bg-[#f3e8ff] text-purple-700 border-purple-200";
        highlightMetricClass = "text-fuchsia-600 font-extrabold";
        subTitleClass = "text-slate-600";
        pBgClass = "bg-purple-50/20 border border-purple-100";
        textNormalClass = "text-slate-750";
        layoutLabelClass = "text-purple-400";
        bulletBgClass = "bg-purple-50 text-purple-700 border border-purple-200";
        buttonPrimaryClass = "bg-purple-600 border-purple-500 hover:bg-purple-550 text-white";
        accentOrbs = `
          <div class="absolute -right-20 -top-20 w-84 h-84 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 w-84 h-84 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        `;
      } else if (pptTheme === 'minimal') {
        bgWrapperClass = "bg-[#f8fafc]";
        cardBgClass = "bg-white border-slate-200 text-slate-800 shadow-md";
        titleColorClass = "text-slate-900 font-extrabold";
        highlightBadgeClass = "bg-slate-100 text-slate-800 border-slate-300";
        highlightMetricClass = "text-slate-900 font-bold";
        subTitleClass = "text-slate-500";
        pBgClass = "bg-slate-50 border border-slate-200";
        textNormalClass = "text-slate-850";
        layoutLabelClass = "text-slate-400";
        bulletBgClass = "bg-slate-100 text-slate-800 border-slate-200";
        buttonPrimaryClass = "bg-slate-900 border-slate-900 hover:bg-slate-800 text-white";
        accentOrbs = ""; // Minimal theme is entirely clean
      }

      // 2. Build slide-by-slide elements with modular options & illustration injection
      const slideElements = slides.map((slide: any, idx: number) => {
        const layout = slide.layout || 'bullets';
        const points = slide.points || [];
        const isHeroLayout = layout === 'hero' || layout === 'title';
        const isMatrixLayout = layout === 'matrix' || layout === 'grid';
        const isTwoCols = layout === 'two_columns' || layout === 'split';
        
        // Retrieve vector SVG illustration if generated and enabled
        const illustrationKey = `${selectedDocKey}_slide_${idx}`;
        const illustrationSvg = illustrations[illustrationKey];
        const hasIllustration = pptIncludeIllustrations && !!illustrationSvg;

        let innerContent = "";

        if (isHeroLayout) {
          innerContent = `
            <div class="flex flex-col items-center justify-center text-center flex-1 py-4">
              <span class="px-3 py-1 ${highlightBadgeClass} rounded-full font-mono text-[11px] mb-4 tracking-wider uppercase">
                Fokus Utama Sorotan
              </span>
              <h2 class="text-3xl font-extrabold ${titleColorClass} leading-tight max-w-2xl mb-3">
                ${slide.title}
              </h2>
              ${slide.highlightMetric ? `
                <div class="my-3 font-mono text-5xl font-black ${highlightMetricClass} tracking-tight">
                  ${slide.highlightMetric}
                </div>
              ` : ''}
              <div class="max-w-xl ${subTitleClass} text-sm mt-2">
                ${points.length > 0 ? points[0] : 'Sistem Analisis Terpadu'}
              </div>
            </div>
          `;
        } else {
          // Standard core content (matrix, columns, bullets)
          let bodyContent = "";

          if (isMatrixLayout) {
            bodyContent = `
              <div class="grid grid-cols-2 gap-3 flex-1">
                ${points.map((p: string, i: number) => `
                  <div class="${pBgClass} p-3 rounded-xl flex flex-col justify-between">
                    <span class="${highlightMetricClass} text-[10px] font-bold uppercase tracking-wider block mb-1">
                      Aspek 0${i + 1}
                    </span>
                    <p class="text-[11px] ${textNormalClass} leading-snug">
                      ${p}
                    </p>
                  </div>
                `).join('')}
              </div>
            `;
          } else if (isTwoCols) {
            const halfLength = Math.ceil(points.length / 2);
            const col1 = points.slice(0, halfLength);
            const col2 = points.slice(halfLength);

            bodyContent = `
              <div class="grid grid-cols-2 gap-4 flex-1 items-start">
                <div class="space-y-2">
                  ${col1.map((p: string) => `
                    <div class="flex gap-2 items-start text-xs ${pBgClass} p-2.5 rounded-lg">
                      <span class="${highlightMetricClass} font-mono">&bull;</span>
                      <span class="${textNormalClass} leading-relaxed">${p}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="space-y-2">
                  ${col2.length > 0 ? col2.map((p: string) => `
                    <div class="flex gap-2 items-start text-xs ${pBgClass} p-2.5 rounded-lg">
                      <span class="${highlightMetricClass} font-mono">&bull;</span>
                      <span class="${textNormalClass} leading-relaxed">${p}</span>
                    </div>
                  `).join('') : `<p class="text-[10px] ${subTitleClass} italic">Data pendukung sedang dianalisis</p>`}
                </div>
              </div>
            `;
          } else {
            // Standard static bullets layout
            bodyContent = `
              <div class="space-y-2.5 flex-1">
                ${points.map((p: string, i: number) => `
                  <div class="flex gap-3 items-start ${pBgClass} p-3 rounded-xl">
                    <span class="h-5 w-5 rounded-full ${bulletBgClass} text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                      ${i + 1}
                    </span>
                    <p class="text-xs ${textNormalClass} leading-relaxed">${p}</p>
                  </div>
                `).join('')}
              </div>
            `;
          }

          // Combine text body and illustration graphic if we have inline SVG
          if (hasIllustration) {
            innerContent = `
              <div class="flex-1 flex flex-col justify-between py-1">
                <div class="flex justify-between items-start mb-3 border-b border-slate-700/20 pb-2">
                  <h2 class="text-xl font-bold ${titleColorClass} uppercase tracking-wide">
                    ${slide.title}
                  </h2>
                  ${slide.highlightMetric ? `
                    <span class="px-2.5 py-1 ${highlightBadgeClass} text-[10px] font-bold rounded">
                      ${slide.highlightMetric}
                    </span>
                  ` : ''}
                </div>
                
                <!-- Split columns layout: Left is core bullets, Right is vector SVG -->
                <div class="flex flex-col md:flex-row gap-4 items-center flex-1">
                  <div class="w-full md:w-[55%] flex flex-col justify-center">
                    ${bodyContent}
                  </div>
                  <div class="w-full md:w-[45%] h-full flex items-center justify-center bg-slate-900/10 p-2.5 rounded-2xl border border-slate-500/15 shadow-inner">
                    <div class="w-full h-full max-h-[190px] flex items-center justify-center">
                      ${illustrationSvg}
                    </div>
                  </div>
                </div>
              </div>
            `;
          } else {
            // General full breadth layout
            innerContent = `
              <div class="flex-1 flex flex-col justify-between py-1">
                <div class="flex justify-between items-start border-b border-slate-700/20 pb-3 mb-3">
                  <h2 class="text-xl font-bold ${titleColorClass} uppercase tracking-wide">
                    ${slide.title}
                  </h2>
                  ${slide.highlightMetric ? `
                    <span class="px-2.5 py-1 ${highlightBadgeClass} text-[10px] font-mono font-bold rounded">
                      ${slide.highlightMetric}
                    </span>
                  ` : ''}
                </div>
                ${bodyContent}
              </div>
            `;
          }
        }

        return `
          <div class="slide ${idx === 0 ? 'active' : 'hidden'} flex-1 flex flex-col justify-between h-full w-full">
            <div class="flex justify-between items-center text-[10px] ${layoutLabelClass} font-mono tracking-wider border-b border-slate-700/20 pb-2 mb-2">
              <span>PRESENTASI AKTIF &bull; ${projectName.toUpperCase()}</span>
              <span>SLIDE 0${idx + 1} / 0${slides.length + 1}</span>
            </div>
            ${innerContent}
            <div class="text-[9px] ${layoutLabelClass} font-mono text-right mt-2 pt-1 border-t border-slate-705/10">
              PRAMA AI (Project Management Analitic) &bull; Presenter Slide Deck
            </div>
          </div>
        `;
      }).join('');

      // Package full web frame
      fileContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PPT Presentasi: ${projectName} - ${focusTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      background-color: ${pptTheme === 'midnight' ? '#090c10' : pptTheme === 'ocean' ? '#0b111e' : pptTheme === 'emerald' ? '#f0fbf7' : pptTheme === 'sunlight' ? '#fffdf5' : pptTheme === 'lavender' ? '#faf8ff' : '#f8fafc'}; 
      color: ${isDarkTheme ? '#cbd5e1' : '#334155'}; 
      font-family: ui-sans-serif, system-ui, sans-serif; 
      height: 100vh; 
      display: flex; 
      flex-direction: column; 
      overflow: hidden; 
      margin: 0; 
    }
    .slide.active { display: flex !important; }
    svg { width: 100%; height: auto; max-height: 100%; }
    @media print {
      body { height: auto !important; overflow: visible !important; background-color: white !important; color: black !important; }
      .slide { display: flex !important; page-break-after: always !important; height: auto !important; border: none !important; margin: 2rem 0 !important; }
      .nav-panel { display: none !important; }
    }
  </style>
</head>
<body class="select-none flex flex-col h-screen">

  <!-- Interactive Slide Show Area -->
  <div class="flex-1 flex items-center justify-center p-4 md:p-8">
    <div class="w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] ${cardBgClass} p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
      
      <!-- Gradient Orbs -->
      ${accentOrbs}

      <!-- TITLE/WELCOME SLIDE -->
      <div class="slide active flex-1 flex flex-col justify-between h-full w-full">
        <div class="flex justify-between items-center text-[10px] ${layoutLabelClass} font-mono tracking-wider border-b border-slate-700/25 pb-2 mb-2">
          <span>PRESENTASI AKTIF &bull; SLIDE PEMBUKA</span>
          <span>SLIDE INTERAKTIF</span>
        </div>
        
        <div class="my-auto text-center py-6">
          <span class="px-2.5 py-1 ${highlightBadgeClass} text-[9px] font-bold uppercase rounded-md tracking-widest font-mono mb-2.5 inline-block">
            PowerPoint Slide Deck
          </span>
          <h1 class="text-3xl sm:text-4xl font-black ${titleColorClass} tracking-tight leading-tight mb-2 uppercase">
            ${title}
          </h1>
          <p class="text-sm ${subTitleClass} font-medium max-w-xl mx-auto leading-relaxed">
            ${subtitle}
          </p>
          
          <div class="mt-8 pt-6 border-t border-slate-200/20 max-w-sm mx-auto flex items-center justify-center gap-1.5 text-[10px] ${layoutLabelClass}">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Mulai presentasi dengan tombol navigasi di bawah</span>
          </div>
        </div>

        <div class="text-[9px] ${layoutLabelClass} font-mono text-right mt-2 pt-1 border-t border-slate-720/10">
          PRAMA (Project Management Analitic) &bull; Presenter Slide Deck
        </div>
      </div>

      <!-- PPT SECTIONS CONTENT -->
      ${slideElements}

    </div>
  </div>

  <!-- BOTTOM NAVIGATION CONTROLS PANEL -->
  <div class="nav-panel ${pptTheme === 'midnight' ? 'bg-[#121620] border-slate-800' : pptTheme === 'ocean' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'} border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-presentation"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
      </div>
      <div>
        <h3 class="text-xs font-bold ${pptTheme === 'midnight' || pptTheme === 'ocean' ? 'text-white' : 'text-slate-800'}">Presentasi Slide Deck PRAMA</h3>
        <p class="text-[10px] ${layoutLabelClass}">Gunakan tombol atau tombol arah Keyboard (&larr; &rarr;)</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button id="prev-btn" class="px-3.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-25 text-xs font-mono font-bold cursor-pointer transition-all">
        &larr; BACK
      </button>
      
      <div class="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs flex items-center gap-1 text-white">
        <span id="current-slide">1</span>
        <span class="text-slate-600">/</span>
        <span>${slides.length + 1}</span>
      </div>

      <button id="next-btn" class="px-3.5 py-1.5 rounded ${buttonPrimaryClass} text-xs font-mono font-bold cursor-pointer transition-all">
        NEXT &rarr;
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button id="fullscreen-btn" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
        <span>Fullscreen</span>
      </button>
      <button onclick="window.print()" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/><path d="M8 6h8v4H8z"/></svg>
        <span>Cetak/PDF</span>
      </button>
    </div>
  </div>

  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentIndicator = document.getElementById('current-slide');

    function updateSlides() {
      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('active');
          slide.classList.remove('hidden');
        } else {
          slide.classList.remove('active');
          slide.classList.add('hidden');
        }
      });
      if (currentIndicator) {
        currentIndicator.textContent = currentSlide + 1;
      }
      if (prevBtn) prevBtn.disabled = currentSlide === 0;
      if (nextBtn) nextBtn.disabled = currentSlide === slides.length - 1;
    }

    prevBtn?.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlides();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlides();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        if (currentSlide < slides.length - 1) {
          e.preventDefault();
          currentSlide++;
          updateSlides();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        if (currentSlide > 0) {
          e.preventDefault();
          currentSlide--;
          updateSlides();
        }
      }
    });

    const fbtn = document.getElementById('fullscreen-btn');
    fbtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log("Mode Fullscreen diabaikan di iFrame browser", err);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // Initialize state
    updateSlides();
  </script>
</body>
</html>`;
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Render proper icon component dynamically
  const getIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "LayoutDashboard": return <LayoutDashboard className={className} />;
      case "Globe": return <Globe className={className} />;
      case "TrendingUp": return <TrendingUp className={className} />;
      case "PackageCheck": return <PackageCheck className={className} />;
      case "Rocket": return <Rocket className={className} />;
      case "GitMerge": return <GitMerge className={className} />;
      case "Milestone": return <Milestone className={className} />;
      case "Cpu": return <Cpu className={className} />;
      case "Laptop": return <Laptop className={className} />;
      case "ShieldAlert": return <ShieldAlert className={className} />;
      case "Sigma": return <Sigma className={className} />;
      case "Wallet": return <Wallet className={className} />;
      default: return <Compass className={className} />;
    }
  };

  const activeFocusConfig = FOCUS_AREAS.find((f) => f.id === selectedFocus) || FOCUS_AREAS[0];

  // Raw Login / Signup interface
  if (!isLoggedIn) {
    return (
      <div id="auth-screen-root" className="min-h-screen bg-[#0d0f12] text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans transition-all ease-in-out duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

        <div className="w-full max-w-md bg-[#13171e] rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col z-10">
          
          {/* Form Header */}
          <div className="p-6 text-center border-b border-slate-800 bg-[#161b24]">
            <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-xl mb-3 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-8 h-8 animate-pulse text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Macro Business AI Planner</h1>
            <p className="text-xs text-slate-400">Interactive business developer with multi-focal AI intelligence</p>
          </div>

          {/* Form Tab selectors */}
          <div className="flex border-b border-slate-800">
            <button
              id="tab-login-btn"
              onClick={() => { setAuthTab("login"); setAuthError(null); }}
              className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-all ${
                authTab === "login"
                  ? "text-emerald-400 bg-[#13171e] border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200 bg-[#10141b]/50"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              id="tab-signup-btn"
              onClick={() => { setAuthTab("signup"); setAuthError(null); }}
              className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-all ${
                authTab === "signup"
                  ? "text-emerald-400 bg-[#13171e] border-b-2 border-emerald-500"
                  : "text-slate-400 hover:text-slate-200 bg-[#10141b]/50"
              }`}
            >
              Buat Akun baru (Daftar)
            </button>
          </div>

          {/* Form content */}
          <form id="auth-form-body" onSubmit={handleAuthSubmit} className="p-6 space-y-4 flex-1">
            
            {authError && (
              <div id="auth-alert-err" className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div id="auth-alert-success" className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                ✓ {authSuccess}
              </div>
            )}

            {authTab === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 align-middle">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    id="signup-fullname"
                    type="text"
                    placeholder="Nama Lengkap Anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1b212c] border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Alamat Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-500">@</span>
                <input
                  id="auth-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1b212c] border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Kata Sandi (Password)</label>
                {authTab === "login" && (
                  <span className="text-xs text-slate-500 hover:text-slate-400 cursor-not-allowed">Lupa password?</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="auth-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1b212c] border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Gunakan password minimal 4 karakter untuk simulasi otentikasi.</p>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm tracking-wide rounded-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-emerald-950/40 transition-all"
            >
              {authTab === "login" ? "Masuk ke Sistem" : "Buat Akun Baru"}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                {authTab === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  type="button"
                  onClick={() => setAuthTab(authTab === "login" ? "signup" : "login")}
                  className="text-emerald-400 hover:underline font-medium focus:outline-none"
                >
                  {authTab === "login" ? "Daftar di sini" : "Login sekarang"}
                </button>
              </span>
            </div>
          </form>

          {/* Quick Sandbox Login helper details */}
          <div className="p-4 bg-[#10141b] border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">Sandbox Mode Aktif. Anda dapat menggunakan sembarang email/password untuk login simulasi instan.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Login Dashboard view
  return (
    <div id="dashboard-root" className="min-h-screen bg-[#0d0f12] text-slate-300 font-sans flex flex-col selection:bg-emerald-500 selection:text-white transition-all">
      
      {/* Dynamic header navigation */}
      <header id="main-header" className="bg-[#13171e] border-b border-slate-800 align-middle sticky top-0 z-40 transition-shadow">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-lg text-white shadow-md shadow-emerald-950/50">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Macro Business AI Planner
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  v3.5 Build
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Interactive Strategic Business Generator & Modeling Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-2 bg-[#1c222c] px-3 py-1.5 rounded-lg border border-slate-700/40 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Pengguna:</span>
              <span className="text-emerald-400 font-semibold">{user?.name || user?.email}</span>
            </div>

            <button
              id="logout-button"
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              title="Keluar dari sistem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main id="main-content-layout" className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (Lg: 8 grid span): Project config + Strategic grid + Generated document preview */}
        <section id="workspace-primary-col" className="lg:col-span-8 flex flex-col gap-6">

          {/* Project Profile configuration segment */}
          <div id="project-profile-card" className="bg-[#13171e] rounded-xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-slate-600 hidden md:inline-block">PROYEK ID: MD-2026</div>
            
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#22c55e]">INFORMASI PROYEK UTAMA</h2>
                  <p className="text-[10px] text-slate-500">Sesuaikan profil bisnis atau ide Anda di bawah ini</p>
                </div>
              </div>

              <button
                id="edit-project-toggle"
                onClick={() => setIsEditingProject(!isEditingProject)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  isEditingProject
                    ? "bg-slate-700 text-white border-slate-600"
                    : "bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {isEditingProject ? "Selesai Mengedit" : "Edit Parameter Proyek"}
              </button>
            </div>

            {isEditingProject ? (
              <div id="project-editing-pane" className="space-y-3 pt-2 bg-[#1b202a]/60 p-4 rounded-lg border border-slate-700/60 transition-all">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Nama Proyek / Ide Bisnis</label>
                  <input
                    id="project-name-input"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121620] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Deskripsi & Ruang Lingkup Proyek</label>
                  <textarea
                    id="project-desc-input"
                    rows={3}
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121620] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    placeholder="Contoh: Rantai pasok rill bensin ramah lingkungan..."
                  />
                </div>
              </div>
            ) : (
              <div id="project-view-pane" className="space-y-1.5 transition-all">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {projectName}
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans bg-[#10141b]/40 p-3 rounded-lg border border-slate-800/80">
                  {projectDesc}
                </p>
              </div>
            )}
          </div>

          {/* Strategic Focus Grid Selection Panel */}
          <div id="strategic-grid-container" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-extrabold tracking-wider text-slate-200 uppercase">PILIHAN FOKUS ASISTEN & STRATEGI</h3>
                  <p className="text-[10px] text-slate-500">Pilih salah satu dari 12 node taktis untuk fokus bimbingan AI & output.</p>
                </div>
              </div>
            </div>

            <div id="focus-bento-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {FOCUS_AREAS.map((f) => {
                const isSelected = selectedFocus === f.id;
                return (
                  <button
                    id={`focus-node-${f.id}`}
                    key={f.id}
                    onClick={() => {
                      setSelectedFocus(f.id);
                      // Auto switch current preview selection of doc too if exists
                      const correspondingDocKey = `${f.id}-${docType}`;
                      if (generatedDocs[correspondingDocKey]) {
                        setSelectedDocKey(correspondingDocKey);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-[120px] transition-all cursor-pointer relative group overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-[#1b2533] to-[#121c2b] border-[#22c55e]/90 shadow-lg shadow-emerald-950/20"
                        : "bg-[#13171e] border-slate-800 hover:border-slate-700/80 hover:bg-[#151c27]"
                    }`}
                  >
                    {/* Visual accent bar for active focus */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#22c55e]" />
                    )}

                    <div className="flex justify-between items-start gap-2 mb-2 w-full">
                      <div className={`p-1.5 rounded-lg border ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800/40 text-slate-400 border-slate-700/60"
                      }`}>
                        {getIcon(f.iconName, "w-4.5 h-4.5")}
                      </div>
                      
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {f.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1 mb-0.5">{f.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{f.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Generation Action Board & Template Selector */}
          <div id="doc-generation-center" className="bg-[#13171e] rounded-xl border border-slate-800 p-5 shadow-lg relative">
            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800/80 pb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-blue-400">PILIH & BUAT FORMULASI DOKUMEN</h3>
                <p className="text-[10px] text-slate-500">Buat draf Jurnal, proposal Word, slide PPT, atau model Excel secara instan dengan fokus pilihan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Type Select buttons */}
              <div className="md:col-span-8 space-y-3.5">
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: "journal", label: "📄 JURNAL", desc: "Kertas Ilmiah / Analisis Akademis" },
                    { id: "word", label: "📝 WORD", desc: "Proposal Eksekutif & SWOT" },
                    { id: "ppt", label: "📊 Slide PPT", desc: "Garis Besar Kerangka Slides" },
                    { id: "excel", label: "📂 EXCEL", desc: "Perhitungan Model Finansial" }
                  ].map((doc) => (
                    <button
                      id={`doc-type-selector-${doc.id}`}
                      key={doc.id}
                      onClick={() => setDocType(doc.id as any)}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer h-[75px] transition-all ${
                        docType === doc.id
                          ? "bg-slate-800/80 border-blue-500 shadow-md text-emerald-400"
                          : "bg-[#161a24] border-slate-800 hover:border-slate-700/60 hover:bg-[#181e2b] text-slate-400"
                      }`}
                    >
                      <span className="text-xs font-bold">{doc.label}</span>
                      <span className="text-[8px] text-slate-500 leading-none">{doc.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Additional contextual notes to steer document */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Instruksi Tambahan (Opsional)
                    </label>
                    <span className="text-[10px] text-slate-500">Berikan catatan penyesuaian khusus</span>
                  </div>
                  <input
                    id="doc-context-notes"
                    type="text"
                    value={docPromptNotes}
                    onChange={(e) => setDocPromptNotes(e.target.value)}
                    placeholder="Contoh: fokuskan pasar kelas menengah ke bawah, gunakan asurnsi inflasi tahunan 4.5%..."
                    className="w-full px-3 py-1.5 bg-[#1b212d] border border-slate-750 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Launcher execution trigger */}
              <div className="md:col-span-4 h-full flex flex-col justify-end">
                <button
                  id="launcher-generator-btn"
                  onClick={handleGenerateDocument}
                  disabled={isGeneratingDoc}
                  className={`w-full py-6 rounded-xl border font-bold text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-2 cursor-pointer transition-all shadow-md group ${
                    isGeneratingDoc
                      ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-[#161b24] hover:bg-slate-800/85 text-emerald-400 hover:text-emerald-300 border-emerald-500/40 hover:border-emerald-500 bg-gradient-to-tr from-emerald-500/5 to-slate-900"
                  }`}
                >
                  {isGeneratingDoc ? (
                    <>
                      <div className="relative w-7 h-7">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                      </div>
                      <span className="animate-pulse">Sedang Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-center">BUAT {docType.toUpperCase()}<br/>FOKUS {activeFocusConfig.title.split(" ")[0].toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Hint message */}
            <div className="mt-3.5 p-2 bg-[#10141b]/50 border border-slate-800 rounded-lg flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono text-slate-500">PILIHAN SAAT INI: Focus: {activeFocusConfig.title} &rarr; Format: {docType.toUpperCase()}</span>
              <span>Memanfaatkan kecerdasan Gemini 3.5-Flash</span>
            </div>
          </div>

          {/* Document Preview Playground Frame */}
          <div id="document-playground-frame" className="bg-[#13171e] rounded-xl border border-slate-800 p-5 shadow-lg flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-slate-200">KOTAK INTERAKTIF HASIL DOKUMEN</h3>
                  <p className="text-[10px] text-slate-500">Hasil formulasi rill draf akademis & operasional dari model AI</p>
                </div>
              </div>

              {/* Dropdown list of already generated documents */}
              <div className="flex items-center gap-2">
                {Object.keys(generatedDocs).length > 0 && (
                  <select
                    id="doc-selector-dropdown"
                    value={selectedDocKey || ""}
                    onChange={(e) => setSelectedDocKey(e.target.value)}
                    className="bg-[#1a202a] border border-slate-700 text-xs text-slate-300 px-2 py-1 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="" disabled>-- Pilih Dokumen yang Terarsip --</option>
                    {Object.keys(generatedDocs).map((key) => {
                      const item = generatedDocs[key];
                      return (
                        <option key={key} value={key}>
                          [{item.type.toUpperCase()}] {item.focusTitle}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* Document display board */}
            {selectedDocKey && generatedDocs[selectedDocKey] ? (
              (() => {
                const doc = generatedDocs[selectedDocKey];
                const type = doc.type;
                const data = doc.data;

                // Action controls for calculated document with comprehensive exports
                const headerControls = (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 bg-[#181d28] p-3 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400">Jenis Dokumen:</span>{" "}
                      <span className="text-emerald-400 font-bold uppercase mr-2">{type}</span> |{" "}
                      <span className="font-semibold text-slate-400 ml-2">Aspek Fokus:</span>{" "}
                      <span className="text-blue-400 font-bold uppercase">{doc.focusTitle}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline mr-1">Ekspor:</span>
                      
                      {/* TXT Download */}
                      <button
                        onClick={() => handleExportDocument('txt')}
                        className="px-2 py-1 rounded text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-[#12221b] flex items-center gap-1 transition-all cursor-pointer text-[10px] font-semibold"
                        title="Ekspor sebagai file teks (.txt)"
                      >
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>TXT</span>
                      </button>

                      {/* HTML Standalone Download */}
                      <button
                        onClick={() => handleExportDocument('html')}
                        className="px-2 py-1 rounded text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-[#121c2b] flex items-center gap-1 transition-all cursor-pointer text-[10px] font-semibold"
                        title="Ekspor halaman web mandiri (.html)"
                      >
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>HTML</span>
                      </button>

                      {/* JSON Raw Download */}
                      <button
                        onClick={() => handleExportDocument('json')}
                        className="px-2 py-1 rounded text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-purple-500 hover:bg-[#1f162b] flex items-center gap-1 transition-all cursor-pointer text-[10px] font-semibold"
                        title="Ekspor rill data struktur (.json)"
                      >
                        <Cpu className="w-3 h-3 text-purple-400" />
                        <span>JSON</span>
                      </button>

                      {/* CSV Table Option if spreadsheet type */}
                      {type === 'excel' && (
                        <button
                          onClick={() => handleExportDocument('csv')}
                          className="px-2 py-1 rounded text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-amber-500 hover:bg-[#2c2016] flex items-center gap-1 transition-all cursor-pointer text-[10px] font-semibold"
                          title="Ekspor sebagai tabel spreadsheet (.csv)"
                        >
                          <Grid className="w-3 h-3 text-amber-500" />
                          <span>CSV (Excel)</span>
                        </button>
                      )}

                      {/* PPT Slides Presentation Option if ppt type */}
                      {type === 'ppt' && (
                        <button
                          onClick={() => handleExportDocument('ppt')}
                          className="px-2 py-1 rounded text-slate-300 hover:text-white bg-[#10132a] border border-slate-700 hover:border-indigo-500 hover:bg-[#161a38] flex items-center gap-1 transition-all cursor-pointer text-[10px] font-semibold"
                          title="Ekspor sebagai PPT/Slide Presentasi Interaktif (.html)"
                        >
                          <Presentation className="w-3 h-3 text-indigo-400" />
                          <span>UNDUH PPT (SLIDES)</span>
                        </button>
                      )}

                      <div className="h-4 w-[1px] bg-slate-850 mx-1 hidden sm:block" />

                      {/* Copy code structure */}
                      <button
                        onClick={() => handleCopyToClipboard(JSON.stringify(data, null, 2))}
                        className="px-2 py-1 rounded text-slate-400 hover:text-white bg-slate-850 border border-slate-800/80 flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
                        title="Salin salinan struktur JSON ke clipboard"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </button>

                      <button
                        onClick={() => {
                          const element = document.getElementById("document-print-area");
                          if (element) {
                            const printWindow = window.open("", "_blank");
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>[Cetak] ${projectName} - ${doc.focusTitle}</title>
                                    <style>
                                      body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                                      h1 { color: #111; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
                                      h2 { color: #222; margin-top: 30px; }
                                      pre { background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; }
                                      .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                                      .swot-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                                      .slide-card { border: 2px solid #333; padding: 20px; border-radius: 5px; margin-bottom: 15px; page-break-inside: avoid; }
                                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                      th { background-color: #f2f2f2; }
                                    </style>
                                  </head>
                                  <body>
                                    ${element.innerHTML}
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }
                        }}
                        className="px-2 py-1 rounded text-slate-400 hover:text-white bg-slate-850 border border-slate-800/80 flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
                        title="Cetak langsung menggunakan printer web"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  </div>
                );

                return (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {headerControls}

                      {copiedNotification && (
                        <div className="mb-3 p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-center text-[10px] text-emerald-400 rounded">
                          ✓ Salinan data srukrtur berhasil dikloning ke clipboard Anda!
                        </div>
                      )}
                    </div>

                    {/* Standard layout parser based on customized type */}
                    <div id="document-print-area" className="flex-1 overflow-y-auto max-h-[550px] pr-2 font-sans text-slate-300">
                      
                      {/* 1. JOURNAL TYPE LAYOUT */}
                      {type === "journal" && (
                        <div className="bg-[#181d28] border border-slate-800/80 rounded-xl p-6 shadow-md font-sans">
                          {/* Formal header */}
                          <div className="text-center border-b border-slate-700/60 pb-5 mb-5">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#22c55e] block mb-1">
                              JURNAL NASIONAL & GLOBAL SISTEM STRATEGI BISNIS MAKRO
                            </span>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                              {data.title || "Kajian Terpadu Pola Operasional Bisnis Terpadu"}
                            </h2>
                            <p className="text-xs text-slate-400 italic font-mono mb-2">
                              Oleh Ekosistem AI Strategis &mdash; Makro Business AI Planner
                            </p>
                            <p className="text-[10px] text-[#22c55e] font-semibold">
                              Proyek Inti: {projectName}
                            </p>
                          </div>

                          {/* Abstract panel */}
                          <div className="bg-[#121620] border border-slate-700/60 rounded-lg p-4 mb-6 leading-relaxed">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Abstrak</h4>
                            <p className="text-xs text-slate-300 italic">
                              {data.abstract || "Abstrak belum diformulasikan."}
                            </p>
                            
                            {data.keywords && Array.isArray(data.keywords) && (
                              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] text-[#22c55e] font-bold uppercase tracking-wider mr-1">Kata Kunci:</span>
                                {data.keywords.map((kw: string, i: number) => (
                                  <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Academic Content section */}
                          <div className="space-y-6 pt-2 font-serif text-slate-300 leading-relaxed text-sm">
                            <div>
                              <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-2 mb-2 uppercase tracking-wide">
                                1. Pendahuluan & Latar Belakang
                              </h3>
                              <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed pl-2 bg-[#121620]/30 py-2 rounded">
                                {data.introduction}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-2 mb-2 uppercase tracking-wide">
                                2. Metodologi Analisis
                              </h3>
                              <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed pl-2 bg-[#121620]/30 py-2 rounded">
                                {data.methodology}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-2 mb-2 uppercase tracking-wide">
                                3. Temuan Hasil Riset (Findings)
                              </h3>
                              <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed pl-2 bg-[#121620]/30 py-2 rounded">
                                {data.findings}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-2 mb-2 uppercase tracking-wide">
                                4. Diskusi Komprehensif
                              </h3>
                              <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed pl-2 bg-[#121620]/30 py-2 rounded">
                                {data.discussion}
                              </p>
                            </div>

                            <div className="border-t border-slate-800 pt-5 mt-5">
                              <h3 className="text-sm font-bold text-white border-l-2 border-emerald-500 pl-2 mb-2 uppercase tracking-wide">
                                5. Kesimpulan & Rekomendasi Masa Depan
                              </h3>
                              <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed pl-2 bg-[#121620]/30 py-2 rounded">
                                {data.conclusion}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. WORD EXECUTIVE PROPOSAL LAYOUT */}
                      {type === "word" && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 font-sans">
                          {/* Banner accent */}
                          <div className="border-b-4 border-emerald-500 pb-4 mb-5">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{data.title || "Laporan Proposal Eksekutif"}</h2>
                            <p className="text-xs text-slate-400 mt-1">{data.subtitle || "Draf Kerja Solusi Bisnis & Evaluasi Taktis"}</p>
                          </div>

                          <div className="space-y-5">
                            {/* Executive Summary */}
                            <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                              <h3 className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Ringkasan Eksekutif (Executive Summary)
                              </h3>
                              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                                {data.executiveSummary}
                              </p>
                            </div>

                            {/* Detailed analysis info */}
                            <div>
                              <h3 className="text-xs uppercase font-extrabold text-white tracking-widest mb-1.5 border-b border-slate-800 pb-1">
                                Analisis Strategis Mendalam
                              </h3>
                              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                                {data.detailedAnalysis}
                              </p>
                            </div>

                            {/* SWOT Grid representation */}
                            {data.swot && (
                              <div className="py-2">
                                <h3 className="text-xs uppercase font-extrabold text-white tracking-widest mb-2.5">
                                  Matriks Karakteristik SWOT
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  
                                  {/* Strengths */}
                                  <div className="bg-[#12221b] border border-emerald-900/40 p-3.5 rounded-lg">
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                      Kekuatan (Strengths)
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                                      {data.swot.strengths?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      )) || <li>Aspek kekuatan belum dijabarkan</li>}
                                    </ul>
                                  </div>

                                  {/* Weaknesses */}
                                  <div className="bg-[#29171b] border border-rose-900/40 p-3.5 rounded-lg">
                                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                                      Kelemahan (Weaknesses)
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                                      {data.swot.weaknesses?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      )) || <li>Aspek kelemahan belum dijabarkan</li>}
                                    </ul>
                                  </div>

                                  {/* Opportunities */}
                                  <div className="bg-[#121c2c] border border-blue-900/40 p-3.5 rounded-lg">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                                      Peluang (Opportunities)
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                                      {data.swot.opportunities?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      )) || <li>Aspek peluang belum dijabarkan</li>}
                                    </ul>
                                  </div>

                                  {/* Threats */}
                                  <div className="bg-[#211a14] border border-amber-900/40 p-3.5 rounded-lg">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                                      Ancaman (Threats)
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                                      {data.swot.threats?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      )) || <li>Aspek ancaman belum dijabarkan</li>}
                                    </ul>
                                  </div>

                                </div>
                              </div>
                            )}

                            {/* Risk Mitigation */}
                            <div>
                              <h3 className="text-xs uppercase font-extrabold text-rose-400 tracking-widest mb-1.5">
                                Mitigasi Resiko Bisnis (Risk Mitigation)
                              </h3>
                              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-rose-500 bg-[#29171b]/10 py-1.5 rounded">
                                {data.riskMitigation}
                              </p>
                            </div>

                            {/* Action Plan */}
                            {data.actionPlan && Array.isArray(data.actionPlan) && (
                              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                                <h3 className="text-xs uppercase font-extrabold text-white tracking-widest mb-3 flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  10 Langkah Peta Rencana Aksi Kerja (Action Plan)
                                </h3>
                                <div className="space-y-2">
                                  {data.actionPlan.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-3 items-start bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                                      <span className="text-[10px] h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center font-bold font-mono">
                                        {i + 1}
                                      </span>
                                      <span className="text-xs text-slate-300 flex-1">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. PPT PRESENTATION CAROUSEL / SLIDE BY SLIDE RENDERING */}
                      {type === "ppt" && (
                        <div className="space-y-4 font-sans">
                          <div className="bg-gradient-to-tr from-indigo-900/40 to-indigo-950/60 border border-slate-800 rounded-xl p-5 text-center shadow-md">
                            <h2 className="text-lg font-bold text-white uppercase">{data.presentationTitle || "Outline Presentasi Bisnis"}</h2>
                            <p className="text-xs text-slate-400 mt-1">{data.presentationSubtitle || "Ringkasan Tiap Slide untuk Presentasi Investor"}</p>
                          </div>

                          {/* Elegant Customize & Download Options Panel */}
                          <div className="bg-[#121622] rounded-xl border border-slate-800 p-4 space-y-3.5 shadow-sm">
                            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                              <Settings className="w-4 h-4 text-emerald-400" />
                              <h3 className="text-xs uppercase font-extrabold text-[#22c55e] tracking-widest">
                                Opsi & Pengaturan Ekspor PPT Slides
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Color choice */}
                              <div className="space-y-1.5">
                                <span className="text-slate-400 block font-semibold">Skema Warna Slide Deck:</span>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  <button
                                    onClick={() => setPptTheme('midnight')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'midnight' ? 'border-[#22c55e] bg-emerald-500/10 text-emerald-400 font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-slate-755 block shrink-0" style={{backgroundColor: '#090c10'}} />
                                    <span>Carbon Midnight</span>
                                  </button>
                                  <button
                                    onClick={() => setPptTheme('ocean')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'ocean' ? 'border-[#22c55e] bg-emerald-500/10 text-[#22c55e] font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-slate-755 block shrink-0" style={{backgroundColor: '#0b111e'}} />
                                    <span>Ocean Blue</span>
                                  </button>
                                  <button
                                    onClick={() => setPptTheme('emerald')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'emerald' ? 'border-[#22c55e] bg-emerald-500/10 text-emerald-400 font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-slate-755 block shrink-0" style={{backgroundColor: '#f0fbf7'}} />
                                    <span>Corporate Emerald</span>
                                  </button>
                                  <button
                                    onClick={() => setPptTheme('sunlight')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'sunlight' ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-amber-200 block shrink-0" style={{backgroundColor: '#fffdf5'}} />
                                    <span>Sunlit Gold</span>
                                  </button>
                                  <button
                                    onClick={() => setPptTheme('lavender')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'lavender' ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-purple-200 block shrink-0" style={{backgroundColor: '#faf8ff'}} />
                                    <span>Lavender Dream</span>
                                  </button>
                                  <button
                                    onClick={() => setPptTheme('minimal')}
                                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-1.5 cursor-pointer ${pptTheme === 'minimal' ? 'border-[#22c55e] bg-emerald-500/10 text-emerald-400 font-semibold' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-slate-755 block shrink-0" style={{backgroundColor: '#ffffff'}} />
                                    <span>Monochrome Light</span>
                                  </button>
                                </div>
                              </div>

                              {/* Illustration Toggles */}
                              <div className="flex flex-col justify-between">
                                <div className="space-y-1">
                                  <span className="text-slate-400 block font-semibold">Integrasikan Gambar (Vektor):</span>
                                  <label className="flex items-center gap-2 cursor-pointer mt-1 bg-slate-900/40 p-2.5 border border-slate-800 rounded-lg py-1.5 hover:border-slate-700 transition-all select-none">
                                    <input
                                      type="checkbox"
                                      checked={pptIncludeIllustrations}
                                      onChange={(e) => setPptIncludeIllustrations(e.target.checked)}
                                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-[10.5px] text-slate-300 leading-tight">Gunakan gambar ilustrasi SVG AI yang dibuat pada file unduhan</span>
                                  </label>
                                </div>

                                <button
                                  onClick={() => handleExportDocument('ppt')}
                                  className="mt-3.5 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow shadow-emerald-700/20 cursor-pointer text-xs uppercase tracking-wide"
                                >
                                  <Presentation className="w-3.5 h-3.5" />
                                  <span>Unduh Template Slide Deck ({pptTheme.toUpperCase()})</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Render beautiful presentation slides side by side with customizable interactive blocks */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.slides && Array.isArray(data.slides) ? (
                              data.slides.map((slide: any, i: number) => {
                                const illustrationKey = `${selectedDocKey}_slide_${i}`;
                                return (
                                  <div
                                    key={i}
                                    className="bg-[#1c212e] border-2 border-slate-805/80 rounded-xl p-5 flex flex-col justify-between min-h-[310px] h-auto relative hover:border-[#22c55e]/50 transition-colors shadow-md"
                                  >
                                    {/* Absolute slide positioner badge */}
                                    <span className="absolute top-4 right-4 text-[10px] font-bold font-mono text-slate-500 bg-[#161a25] px-2 py-0.5 rounded border border-slate-800 uppercase">
                                      Slide {slide.slideNumber || i + 1}
                                    </span>

                                    <div className="space-y-2">
                                      <h3 className="text-xs uppercase font-extrabold text-[#22c55e] mr-12 tracking-wide truncate">
                                        {slide.title || "Tanpa Judul Slide"}
                                      </h3>
                                      
                                      <ul className="list-disc pl-4 space-y-1.5 text-slate-300 text-[10.5px]">
                                        {slide.points?.slice(0, 3).map((pt: string, idx: number) => (
                                          <li key={idx} className="line-clamp-2 leading-tight">
                                            {pt}
                                          </li>
                                        )) || <li>Belum ada bullet points</li>}
                                      </ul>
                                    </div>

                                    {/* Interactive AI Illustration Card Dock */}
                                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col gap-2 bg-[#121622]/50 p-2.5 rounded-lg border border-slate-800/80">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                                          <Image className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                          <span>Ilustrasi Gambar AI (SVG)</span>
                                        </div>
                                        {illustrations[illustrationKey] && (
                                          <span className="text-[8.5px] bg-[#102219] text-[#22c55e] border border-emerald-500/20 px-1 py-0.5 rounded font-bold uppercase">
                                            ✓ Terintegrasi
                                          </span>
                                        )}
                                      </div>

                                      {illustrations[illustrationKey] ? (
                                        <div className="flex items-center gap-3">
                                          {/* Tiny Vector SVG preview */}
                                          <div 
                                            className="w-16 h-11 border border-slate-700 bg-slate-950 rounded-md overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-emerald-500 hover:scale-[1.03] transition-all p-0.5"
                                            title="Pratinjau visual ilustrasi di tab baru"
                                            dangerouslySetInnerHTML={{ __html: illustrations[illustrationKey] }}
                                            onClick={() => {
                                              const previewWin = window.open("", "_blank");
                                              if (previewWin) {
                                                previewWin.document.write(`
                                                  <html>
                                                    <head>
                                                      <title>Visualisasi PRAMA - Slide ${i + 1}</title>
                                                      <style>
                                                        body { background-color: #0b0f19; zoom: 1.2; display: flex; align-items: center; justify-content: center; height: 100vh; margin:0; color:#fff; font-family:sans-serif; }
                                                        .wrapper { width:90%; max-width:700px; text-align:center; }
                                                        svg { width:100%; border:1px solid #334155; border-radius:12px; background:#0f172a; box-shadow:0 10px 30px rgba(0,0,0,0.6); padding:4px;}
                                                      </style>
                                                    </head>
                                                    <body>
                                                      <div class="wrapper">
                                                        <h2 style="margin-bottom:6px;">${slide.title}</h2>
                                                        <p style="color:#64748b; font-size:12px; margin-top:0; margin-bottom:24px;">Render Vektor SVG Berbasis AI Makro PRAMA</p>
                                                        ${illustrations[illustrationKey]}
                                                      </div>
                                                    </body>
                                                  </html>
                                                `);
                                                previewWin.document.close();
                                              }
                                            }}
                                          />
                                          <div className="flex-1 text-[9px] text-slate-400">
                                            <p className="italic text-slate-300 line-clamp-1">Visualisasi kustom per slide</p>
                                            <button 
                                              disabled={generatingIllustrationKey !== null}
                                              onClick={() => handleGenerateIllustration(selectedDocKey, `slide_${i}`, slide.title, slide.points?.join(', ') || slide.title)}
                                              className="text-[#22c55e] hover:text-emerald-400 font-bold cursor-pointer underline hover:no-underline text-[9px] mt-0.5 inline-block"
                                            >
                                              Regenerate Gambar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          disabled={generatingIllustrationKey !== null}
                                          onClick={() => handleGenerateIllustration(selectedDocKey, `slide_${i}`, slide.title, slide.points?.join(', ') || slide.title)}
                                          className="w-full py-1.5 px-3 bg-[#11221b] hover:bg-[#163327] border border-emerald-500/25 hover:border-emerald-500 text-[10px] text-emerald-400 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                          {generatingIllustrationKey === illustrationKey ? (
                                            <>
                                              <Sparkles className="w-3 h-3 animate-spin text-emerald-400 animate-pulse" />
                                              <span>MENGGAMBAR SVG AI...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                                              <span>BUAT ILUSTRASI TEKS (SVG)</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>

                                    {/* Presentation highlights info */}
                                    <div className="pt-2.5 flex justify-between items-center text-[10px] border-t border-slate-800/60 mt-2">
                                      <span className="text-slate-500 uppercase tracking-widest font-mono text-[8px]">
                                        Layout: {slide.layout || "bullets"}
                                      </span>
                                      
                                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20 rounded font-mono text-[9px]">
                                        {slide.highlightMetric || "KPI Point"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-slate-500 text-center col-span-2">Tidak ada draf slides dalam outline.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. EXCEL FINANCIAL SPREADSHEET MODEL */}
                      {type === "excel" && (
                        <div className="bg-[#10141b] border border-slate-800 rounded-xl overflow-hidden shadow font-mono">
                          
                          {/* Mock Excel title header */}
                          <div className="bg-emerald-800 px-4 py-2 text-white text-xs flex justify-between items-center">
                            <span className="font-bold flex items-center gap-1.5">
                              <Grid className="w-4 h-4" />
                              Microsoft Excel Worksheet: {data.sheetName || "Sheet1"}
                            </span>
                            <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                              READY
                            </span>
                          </div>

                          <div className="p-3.5 border-b border-slate-800 bg-[#141a24]">
                            <p className="text-[11px] text-slate-400">{data.description || "Formula hitung transaksi keuangan bisnis makro proyek."}</p>
                          </div>

                          {/* Real-looking spreadsheet grid style */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-300">
                              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border-b border-slate-800">
                                <tr>
                                  <th className="px-2.5 py-1.5 text-center border-r border-slate-850 bg-[#161b24] w-10">B*</th>
                                  {data.headers && Array.isArray(data.headers) ? (
                                    data.headers.map((hdr: string, i: number) => (
                                      <th key={i} className="px-4 py-2 border-r border-slate-800 font-bold text-[#22c55e]">
                                        {hdr}
                                      </th>
                                    ))
                                  ) : (
                                    <>
                                      <th className="px-4 py-2 border-r border-slate-800">ID Item</th>
                                      <th className="px-4 py-2 border-r border-slate-800">Nama Item</th>
                                      <th className="px-4 py-2 border-r border-slate-800">Kategori</th>
                                      <th className="px-4 py-2 border-r border-slate-800">Nilai Pokok (Val1)</th>
                                      <th className="px-4 py-2 border-r border-slate-800">Operasional (Val2)</th>
                                      <th className="px-4 py-2 border-r border-slate-800">Formula Total</th>
                                      <th className="px-4 py-2">Keterangan</th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850">
                                {data.rows && Array.isArray(data.rows) ? (
                                  data.rows.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-850">
                                      {/* Excel numbered row indicator */}
                                      <td className="px-2.5 py-1.5 text-center bg-[#141922] border-r border-slate-800 text-slate-600 font-bold">
                                        {idx + 1}
                                      </td>
                                      <td className="px-4 py-2 border-r border-slate-800 font-semibold text-white">{row.id || `TXN-${idx}`}</td>
                                      <td className="px-4 py-2 border-r border-slate-800 text-slate-200">{row.itemName || row.item}</td>
                                      <td className="px-4 py-2 border-r border-slate-800 text-slate-400 text-[11px] uppercase">{row.category}</td>
                                      <td className="px-4 py-2 border-r border-slate-800 text-right font-mono text-blue-400">
                                        {typeof row.value1 === 'number' ? row.value1.toLocaleString('id-ID') : row.value1}
                                      </td>
                                      <td className="px-4 py-2 border-r border-slate-800 text-right font-mono text-amber-500">
                                        {typeof row.value2 === 'number' ? row.value2.toLocaleString('id-ID') : row.value2}
                                      </td>
                                      <td className="px-4 py-2 border-r border-slate-800 text-right font-bold font-mono text-emerald-400">
                                        {typeof row.totalCalculated === 'number' ? row.totalCalculated.toLocaleString('id-ID') : row.totalCalculated}
                                      </td>
                                      <td className="px-4 py-2 text-slate-400 text-[10.5px] italic">{row.notes}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-slate-500 text-xs">Belum ada baris kalkulasi.</td>
                                  </tr>
                                )}

                                {/* Total Summary Excel formulas row */}
                                {data.summaryMetrics && (
                                  <tr className="bg-slate-900 font-bold border-t-2 border-emerald-500">
                                    <td className="px-2.5 py-1.5 text-center bg-[#22c55e]/10 text-[#22c55e] border-r border-slate-800 font-bold">
                                      ∑
                                    </td>
                                    <td colSpan={3} className="px-4 py-3 border-r border-slate-800 text-right text-emerald-400 uppercase tracking-wider">
                                      Formula Total Akumulasi (Aggregate SUM):
                                    </td>
                                    <td className="px-4 py-3 border-r border-slate-800 text-right text-blue-400 font-mono">
                                      {typeof data.summaryMetrics.totalSum1 === 'number' ? data.summaryMetrics.totalSum1.toLocaleString('id-ID') : data.summaryMetrics.totalSum1}
                                    </td>
                                    <td className="px-4 py-3 border-r border-slate-800 text-right text-amber-400 font-mono">
                                      {typeof data.summaryMetrics.totalSum2 === 'number' ? data.summaryMetrics.totalSum2.toLocaleString('id-ID') : data.summaryMetrics.totalSum2}
                                    </td>
                                    <td className="px-4 py-3 border-r border-slate-800 text-right text-emerald-300 font-mono">
                                      {typeof data.summaryMetrics.totalCalculatedSum === 'number' ? data.summaryMetrics.totalCalculatedSum.toLocaleString('id-ID') : data.summaryMetrics.totalCalculatedSum}
                                    </td>
                                    <td className="px-4 py-3 text-[#22c55e] text-[10px] uppercase font-bold italic">
                                      {data.summaryMetrics.conclusionMetric || "Status Sehat"}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="bg-[#121620] p-3 text-slate-500 text-[10px] border-t border-slate-850 text-right">
                            *Formula dihitung otomatis: Total Calculated = f(Value1, Value2). Laporan draf finansial eksekutif. Atribusi: Macro Business AI.
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Simple Bottom indicator */}
                    <div className="mt-4 p-4 border border-slate-800 bg-[#161a24] rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Formulasi selesai diarsip di server cloud workspace</span>
                      <span className="text-[10px] text-[#22c55e] font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Sinkronisasi Sukses
                      </span>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div id="no-document-placeholder" className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <FileText className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tidak Ada Pratinjau Dokumen Aktif</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Silakan pilih format di menu panel, ketik instruksi opsional Anda lalu klik tombol **"BUAT..."** di atas untuk merumuskan dokumen strategis.
                </p>
                {Object.keys(generatedDocs).length > 0 && (
                  <p className="text-[10px] text-[#22c55e]">
                    Atau gunakan dropdown di kanan atas untuk memuat arsip proposal yang telah dibuat sebelumnya.
                  </p>
                )}
              </div>
            )}
          </div>

        </section>

        {/* Right column (Lg: 4 grid span): Specialty Interactive AI Chatbot Consultation Center */}
        <section id="workspace-sidebar-col" className="lg:col-span-4 flex flex-col space-y-4 h-full">
          
          <div id="ai-chat-card" className="bg-[#13171e] rounded-xl border border-slate-800 flex flex-col h-[750px] lg:h-[calc(100vh-170px)] shadow-xl relative overflow-hidden">
            
            {/* Chat top header with active focus node */}
            <div className="p-4 bg-[#161b24] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {getIcon(activeFocusConfig.iconName, "w-4 h-4 text-emerald-400")}
                </div>
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                    KONSULTASI AKADEMIK & RISET
                  </h3>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    AI Asisten: {activeFocusConfig.title}
                  </h4>
                </div>
              </div>

              <span className="text-[9px] uppercase bg-slate-800 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                ACTIVE FOCUS
              </span>
            </div>

            {/* Micro strategic concept of selected focus inside drawer */}
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 shrink-0 text-slate-400 font-sans leading-tight">
              <div className="flex gap-2 items-start text-[10px]">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse mt-0.5" />
                <p>
                  <span className="font-bold text-slate-300">Teori Strategis:</span> {activeFocusConfig.concept}
                </p>
              </div>
            </div>

            {/* Chat messages stream element */}
            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {(chats[selectedFocus] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {/* Sender title label */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">
                      {msg.role === "user" ? "Anda" : activeFocusConfig.title}
                    </span>
                    <span className="text-[9px] text-slate-600">&bull; {msg.timestamp}</span>
                  </div>

                  {/* Chat speech bubble */}
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed text-slate-200 select-text break-words ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-md"
                        : "bg-slate-850 border border-slate-800/80 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isSendingChat && (
                <div className="flex flex-col mr-auto items-start max-w-[80%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 font-mono">{activeFocusConfig.title}</span>
                    <span className="text-[9px] text-slate-600">sedang menganalisis...</span>
                  </div>
                  <div className="bg-slate-850 border border-slate-800/80 text-slate-450 rounded-xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" />
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none">AI sedang merajut argumen...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick suggested prompt buttons */}
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-850/80 shrink-0 select-none">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Saran Pertanyaan Taktis:
              </span>
              <button
                onClick={() => setChatInput(activeFocusConfig.placeholderQuestion)}
                className="w-full text-left truncate text-[10px] text-[#22c55e] hover:text-[#22c55e]/80 font-medium bg-slate-900 border border-slate-800 hover:border-slate-700/60 px-2 py-1 rounded-lg cursor-pointer transition-all transition-colors"
                title={activeFocusConfig.placeholderQuestion}
              >
                &ldquo;{activeFocusConfig.placeholderQuestion}&rdquo;
              </button>
            </div>

            {/* Chat bottom input bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-[#161b24] border-t border-slate-800 shrink-0 flex gap-2">
              <input
                id="chat-user-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Konsultasi khusus fokus ${activeFocusConfig.title.split(" ")[0]}...`}
                className="flex-1 bg-[#12161f] border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                id="chat-send-submit-btn"
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                className={`p-2 rounded-lg text-white font-semibold cursor-pointer transition-colors ${
                  !chatInput.trim() || isSendingChat
                    ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Safe indicators */}
            <div className="p-2.5 bg-[#10141b] text-center shrink-0 border-t border-slate-850">
              <p className="text-[9px] text-slate-600 leading-none">Semua bimbingan akademis mematuhi rancangan tata kelola internal perusahaan.</p>
            </div>

          </div>

        </section>

      </main>

      {/* Outer bottom decorative footer */}
      <footer id="outer-footer-copyright" className="bg-[#10141b] border-t border-slate-850 py-4 px-6 text-center select-none shrink-0">
        <p className="text-[10px] text-slate-500 font-mono">
          &copy; 2026 Macro Business AI Planner &mdash; Ditenagai oleh asisten pintar model Gemini 3.5-Flash. Desain responsif sasis 12 pilar taktis.
        </p>
      </footer>

    </div>
  );
}
