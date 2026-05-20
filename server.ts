import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Initialize Google Gen AI
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// Helpler to call Gemini for structured generation
async function generateBusinessFramework(
  projectName: string,
  projectDesc: string,
  focusArea: string,
  docType: "journal" | "word" | "ppt" | "excel",
  additionalContext: string = ""
) {
  if (!ai) {
    throw new Error("Gemini API Client is not initialized. Please configure GEMINI_API_KEY.");
  }

  const focusPrompts: Record<string, string> = {
    MACRO: "fokus secara makro dan menyeluruh (seluruh aspek bisnis/ide proyek sekaligus)",
    GLOBAL_NAT: "GLOBAL / NAT OVERVIEW (Visi nasional & global proyek, pengaruh regulasi, skalabilitas pasar)",
    MARKET_OPPORTUNITY: "MARKET OPPORTUNITY (Ukuran pasar, target market, celah pasar, trend industri)",
    SUPPLY_DEMAND: "SUPPLY & DEMAND (Analis rantai pasok, kesiapan produksi, kelangkaan material/talenta, volume permintaan)",
    GTM_STRATEGY: "GO TO MARKET STRATEGY (Strategi peluncuran, pricing model, akuisisi pelanggan awal, target audiens)",
    STRUCTURE: "STRUCTURE (Tata kelola lembaga/perusahaan internal, struktur departemen, pembagian wewenang)",
    TRANSITION_MODEL: "TRANSITION MODEL (Fase implementasi sistem baru, timeline perubahan, migrasi operasional)",
    OPS_MODEL: "OPS MODEL (Revenue stream, model operasional harian, struktur biaya, efisiensi proses)",
    DIGITAL_COVERAGE: "DIGITAL COVERAGE (Teknologi yang digunakan, otomasi bisnis, AI stack, platform digital)",
    COMPETITOR: "COMPETITOR (Analisis pesaing langsung/tidak langsung, keunggulan kompetitif unik / USP)",
    TAM_SAM_SOM: "TAM, SAM, SOM (Total Addressable Market, Serviceable Addressable Market, Serviceable Obtainable Market dengan perkiraan angka)",
    CAC_LTV: "CAC & LTV (Customer Acquisition Cost, Lifetime Value, analisis retensi pelanggan, unit economics)"
  };

  const selectedFocusDesc = focusPrompts[focusArea] || focusPrompts.MACRO;

  let fileTemplatePrompt = "";
  let responseSchema: any = {};

  if (docType === "journal") {
    fileTemplatePrompt = `Hasilkan laporan ilmiah / kertas analisis JURNAL strategis dalam Bahasa Indonesia yang berfokus pada: ${selectedFocusDesc}. Laporan harus menyertakan visualisasi konseptual, struktur akademis yang ketat, judul menarik, abstrak, metodologi yang realistis, pembahasan, dan kesimpulan strategis.`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        abstract: { type: Type.STRING },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        introduction: { type: Type.STRING },
        methodology: { type: Type.STRING },
        findings: { type: Type.STRING },
        discussion: { type: Type.STRING },
        conclusion: { type: Type.STRING }
      },
      required: ["title", "abstract", "keywords", "introduction", "methodology", "findings", "discussion", "conclusion"]
    };
  } else if (docType === "word") {
    fileTemplatePrompt = `Hasilkan dokumen proposal EXECUTIVE WORD (dokumen teks laporan terstruktur) dalam Bahasa Indonesia yang berfokus pada: ${selectedFocusDesc}. Dokumen harus ditargetkan untuk dewan direksi/investor, dengan tata bahasa profesional, executive summary, detail sub-strategi, analisis SWOT terperinci, mitigasi risiko, serta rencana aksi taktis 10 langkah (action plan).`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        executiveSummary: { type: Type.STRING },
        detailedAnalysis: { type: Type.STRING },
        swot: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["strengths", "weaknesses", "opportunities", "threats"]
        },
        riskMitigation: { type: Type.STRING },
        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "subtitle", "executiveSummary", "detailedAnalysis", "swot", "riskMitigation", "actionPlan"]
    };
  } else if (docType === "ppt") {
    fileTemplatePrompt = `Hasilkan outline presentasi PPT (PowerPoint minimal 6 slides) dalam Bahasa Indonesia yang berfokus pada: ${selectedFocusDesc}. Format output dalam data transparan terstruktur untuk slide-by-slide rendering. Setiap slide harus memiliki tipe layout visual (seperti 'hero', 'bullets', 'two_columns', atau 'matrix'), judul slide, bullet points (poin-poin penjelas singkat), dan statistik kunci atau kutipan penting.`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        presentationTitle: { type: Type.STRING },
        presentationSubtitle: { type: Type.STRING },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slideNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              layout: { type: Type.STRING, description: "pilih dari: 'hero', 'bullets', 'two_columns', 'matrix'" },
              points: { type: Type.ARRAY, items: { type: Type.STRING } },
              highlightMetric: { type: Type.STRING, description: "contoh: '85% Market Share' atau kutipan penting" }
            },
            required: ["slideNumber", "title", "layout", "points", "highlightMetric"]
          }
        }
      },
      required: ["presentationTitle", "presentationSubtitle", "slides"]
    };
  } else {
    // excel
    fileTemplatePrompt = `Hasilkan model keuangan atau kalkulasi SPREADSHEET EXCEL dalam Bahasa Indonesia untuk fokus: ${selectedFocusDesc}. Buat dataset terstruktur yang logis dan memiliki kalkulasi numerik (formulasi/nilai) realistis. Output harus memiliki judul sheet, deskripsi sheet, kolom-kolom (headers), dan minimal 8 baris data transaksi atau proyeksi finansial lengkap dengan total agregat di bagian akhir.`;
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        sheetName: { type: Type.STRING },
        description: { type: Type.STRING },
        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              itemName: { type: Type.STRING },
              category: { type: Type.STRING },
              value1: { type: Type.NUMBER, description: "Nilai finansial utama (cth: pendapatan, volume, biaya)" },
              value2: { type: Type.NUMBER, description: "Nilai finansial sekunder (cth: margin, biaya operasional, target)" },
              totalCalculated: { type: Type.NUMBER, description: "Kalkulasi/Total baris bersangkutan" },
              notes: { type: Type.STRING }
            },
            required: ["id", "itemName", "category", "value1", "value2", "totalCalculated", "notes"]
          }
        },
        summaryMetrics: {
          type: Type.OBJECT,
          properties: {
            totalSum1: { type: Type.NUMBER },
            totalSum2: { type: Type.NUMBER },
            totalCalculatedSum: { type: Type.NUMBER },
            conclusionMetric: { type: Type.STRING }
          },
          required: ["totalSum1", "totalSum2", "totalCalculatedSum", "conclusionMetric"]
        }
      },
      required: ["sheetName", "description", "headers", "rows", "summaryMetrics"]
    };
  }

  const prompt = `Nama Proyek/Bisnis: ${projectName}
Deskripsi Proyek: ${projectDesc}
Area Fokus: ${focusArea} (${selectedFocusDesc})
Tambahan Konteks / Pertanyaan Khusus: ${additionalContext}

TUGAS UTAMA:
${fileTemplatePrompt}

Harap berikan respon dalam format JSON murni sesuai dengan skema respon yang ditentukan. Pastikan semua penjelasan, judul, dan data numerik logis dan relevan untuk ide bisnis "${projectName}".`;

  const response = await ai!.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
      systemInstruction: "Anda adalah konsultan strategi bisnis papan atas, analis keuangan makro, dan asisten spesialis pemodelan bisnis nasional/global. Berikan rekomendasi yang taktis, realistis, dan berbobot akademis maupun profesional tinggi."
    }
  });

  return JSON.parse(response.text || "{}");
}

// REST Api point to process business generation
app.post("/api/generate", async (req, res) => {
  try {
    const { projectName, projectDesc, focusArea, docType, additionalContext } = req.body;
    if (!projectName || !projectDesc || !focusArea || !docType) {
      return res.status(400).json({ error: "Missing required parameters: projectName, projectDesc, focusArea, docType" });
    }

    if (!ai) {
      return res.status(503).json({ error: "Gemini API is not configured. Please add GEMINI_API_KEY inside Settings > Secrets." });
    }

    const data = await generateBusinessFramework(projectName, projectDesc, focusArea, docType, additionalContext);
    res.json(data);
  } catch (error: any) {
    console.error("Error generating business data from Gemini:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Endpoint to generate a context-rich illustrative SVG graphic corresponding to text
app.post("/api/generate-illustration", async (req, res) => {
  try {
    const { title, prompt } = req.body;
    if (!title && !prompt) {
      return res.status(400).json({ error: "Missing required parameters: title and/or prompt" });
    }

    if (!ai) {
      return res.status(503).json({ error: "Gemini API is not configured. Please add GEMINI_API_KEY inside Settings > Secrets." });
    }

    const systemInstruction = "Anda adalah desainer grafis senior, desainer UI/UX, dan ahli ilustrasi vektor SVG profesional. Anda terbiasa membuat infografis bisnis, visualisasi alur strategis, dan dashboard data dalam format SVG yang sangat bersih, minimalis, dan modern.";

    const aiPrompt = `Buatlah kode tag SVG murni lengkap (viewBox="0 0 500 300") yang responsive, modern, mewah, dan sangat estetik yang menggambarkan visual ilustrasi profesional untuk topik ini:
JUDUL BAHASAN: "${title || 'Strategi Analisis'}"
DESKRIPSI: "${prompt || 'Analisis operasional'}"

KETENTUAN SVGA:
1. Skema warna: Latar belakang transparan, menggunakan skema warna modern (emerald #10b981, neon teal #14b8a6, royal blue #3b82f6, indigo/ungu #6366f1, premium slate #475569 dengan gradasi linier mewah).
2. Elemen visual: Bergantung pada topik, gambar diagram alur bergradasi, dashboard analitik mini dengan chart garis/batang yang rapi, arsitektur node yang saling terkoneksi, atau visual ikon bento-grid konseptual yang memukau. gunakan drop-shadow, lingkar ornamen abstrak, dan garis putus-putus modern untuk kedalaman estetika.
3. Responsif dan bersih: Harus menggunakan path, circle, rect, atau text svg dengan font-family="sans-serif" yang terbaca.
4. ATURAN FORMAT SANGAT KETAT: Kembalikan HANYA teks kode SVG mentah yang valid. JANGAN sertakan tanda penjelasan apa pun di luar kode SVG, dan JANGAN bungkus dalam markdown code block (seperti \`\`\`xml atau \`\`\`html). Kode harus dimulai langsung dengan <svg ...> dan ditutup dengan </svg>.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    let rawSvg = response.text || "";
    // Sanitize in case model returned markdown blocks
    rawSvg = rawSvg.trim();
    if (rawSvg.startsWith("```")) {
      rawSvg = rawSvg.replace(/^```[a-zA-Z0-9]*\n/, "");
      rawSvg = rawSvg.replace(/\n```$/, "");
      rawSvg = rawSvg.trim();
    }

    res.json({ svg: rawSvg });
  } catch (error: any) {
    console.error("Error generating SVG illustration:", error);
    res.status(500).json({ error: error?.message || "Gagal membuat gambar ilustrasi" });
  }
});

// Chat support api with the Macro AI
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, focusArea, projectName, projectDesc } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid messages array" });
    }

    if (!ai) {
      return res.status(503).json({ error: "Gemini API is not configured. Please add GEMINI_API_KEY inside Settings > Secrets." });
    }

    // Format chat contents
    const contents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const focusHints = {
      MACRO: "asisten makro yang membantu semua fokus sekaligus",
      GLOBAL_NAT: "asisten fokus Visi Nasional & Global Proyek",
      MARKET_OPPORTUNITY: "asisten fokus Market Opportunity (Celah & Ukuran Pasar)",
      SUPPLY_DEMAND: "asisten fokus Supply & Demand",
      GTM_STRATEGY: "asisten fokus Go-to-Market Strategy & Launch Pricing",
      STRUCTURE: "asisten fokus Tata Kelola Internal & Struktur",
      TRANSITION_MODEL: "asisten fokus Fase Implementasi & Transisi",
      OPS_MODEL: "asisten fokus Model Operasional & Revenue Stream",
      DIGITAL_COVERAGE: "asisten fokus Digital Coverage & Otomasi Bisnis",
      COMPETITOR: "asisten fokus Analisis Kompetitor",
      TAM_SAM_SOM: "asisten fokus Hitungan TAM, SAM, SOM",
      CAC_LTV: "asisten fokus CAC & LTV dan Unit Economics"
    };

    const currentFocusHint = focusHints[focusArea as keyof typeof focusHints] || focusHints.MACRO;

    const systemInstruction = `Anda adalah Asisten Bisnis Macro Proyek "${projectName || "Proyek Baru"}" (${projectDesc || "Belum ada deskripsi"}).
Saat ini Anda bertindak sebagai: ${currentFocusHint}.
Berikan saran taktis, bimbingan bisnis, dan ide-ide aplikatif dalam Bahasa Indonesia. Jawab dengan gaya modern, profesional, ramah dan pragmatis.`;

    const lastMessage = contents[contents.length - 1];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in AI Chat endpoint:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Configure Vite or Static Serve
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

initServer();
