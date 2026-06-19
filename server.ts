import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

// Polyfill fetch for node (if needed, though Node 18+ has native fetch)
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/shorten", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "No text provided to shorten" });
    }

    const apiKey = process.env.AIML_API_KEY;
    if (!apiKey) {
      throw new Error("AIML_API_KEY environment variable is required");
    }

    const openai = new OpenAI({
      baseURL: "https://api.aimlapi.com/v1",
      apiKey: apiKey,
    });

    const prompt = `You are a professional due diligence data condenser.
Your task is to shorten the following VDR (Virtual Data Room) document text aggressively.
Extract ONLY the highly important financial, legal, technical, and operational details that an M&A due diligence agent needs to perform an analysis.

Focus on:
1. Hard metrics (numbers, revenues, margins, liabilities, valuations, progress/timeline dates).
2. Key strategic facts (acquired IPs, critical customer contracts, active lawsuits, major risks, HR issues).
3. Clear lists of assets or key entities.

Rules:
- Strip out all repetitive templates, verbose legal boilerplate, conversational fluff, and filler words.
- Format the condensed output using compact, dense lists and key-value sections in clean markdown.
- Retain exact key names, numbers, figures, and technical terms intact.
- Aim to reduce the token length by 60% to 80% while retaining 100% of the cognitive value.
- Do NOT add any introductory or concluding text (e.g. "Here is the summary"). Begin immediately with the condensed content.

Text to shorten:
${text}
`;

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const condensedText = response.choices[0]?.message?.content || text;
    return res.json({ condensedText });
  } catch (error) {
    console.error("Error condensing text with AIML API Gemini:", error);
    return res.status(500).json({ error: String(error) });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { documents } = req.body; // Array of n8n document contents

    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: "No documents provided" });
    }

    const openai = new OpenAI({
      baseURL: "https://api.aimlapi.com/v1",
      apiKey: process.env.AIML_API_KEY,
    });

    // Combine documents into a massive text for AIML API
    let combinedText = documents.map((doc: any, i: number) => `--- Document ${i + 1} (${doc.id}) ---\n${doc.content}`).join("\n\n");

    const prompt = `You are an orchestration engine executing a sequential 6-agent M&A Due Diligence verification flow on parsed virtual data room (VDR) documents. 
You must simulate and output the results of these 6 specific agents working in sequence:

1. Agent 1: document-triager
   - Role: Intake Coordinator.
   - Task: Reads everything first, organizes documents, and categorizes active assets or flags omissions.
2. Agent 2: financial-forensic-agent
   - Role: Forensic Financial Analyst.
   - Task: Receives financial documents & Agent 1's triage. Calculates ratios, spots accounting/benchmarking anomalies, and proposes a preliminary valuation range using multiples. (Marked explicitly as PRELIMINARY).
3. Agent 3: legal-compliance-analyst
   - Role: Compliance & Contract Attorney.
   - Task: Receives legal contracts & Agent 1's triage. Identifies red flags like uncapped liability, IP ambiguity, missing GDPR references, and unfavorable renewal terms. Assigns severity and quantifies dollar exposure (risk exposure in USD) for EVERY issue.
4. Agent 4: valuation-adjustment-agent
   - Role: PE Pricing Architect.
   - Task: Receives Agent 2's preliminary valuation and Agent 3's legal exposure figures. Applies discount multipliers and writes off liabilities and risk haircuts to calculate the ultimate Adjusted Enterprise Value.
5. Agent 5: risk-synthesis-agent
   - Role: Due Diligence Synthesis Expert.
   - Task: Receives all prior agent outputs and builds a unified risk matrix. Calculates a mathematically weighted Risk Score (0 to 100) using fixed weights: Financial 35%, Legal 40%, and Valuation 25%. Ranks the top 3 critical issues requiring resolution.
6. Agent 6: executive-arbitrator
   - Role: Investment Committee Chair.
   - Task: Compiles a plain English executive brief for C-suite decision makers. Writes a summary of MAXIMUM 3 sentences in the executive summary (punchy, highly declarative, zero jargon). Recommends a final "GO", "CONDITIONAL GO", or "NO-GO". If Agent 5's overall Risk Score exceeds 70, automatically logs a hard escalation requiring Legal Counsel and CFO sign-off.

OUTPUT FORMAT:
Provide the output strictly as a JSON object with the following schema:

{
  "suggestedName": "string",
  "dashboard": {
    "totalValueFound": number,
    "totalValueCurrency": "string",
    "criticalRisksIdentified": number,
    "synergyOpportunities": number,
    "recentActivity": [
       { "action": string, "category": string, "timestamp": string }
    ]
  },
  "workstreams": {
    "financial": { "progress": number, "status": "string (e.g. Low Risk, High Deviation, flagged)", "keyFindings": ["string (containing Agent 2 formulas, benchmarking, or preliminary ranges)"] },
    "legal": { "progress": number, "status": "string (e.g. Critical, High Legal Exposure, clean)", "keyFindings": ["string (stating specific contract clauses, severity, and quantified USD exposure)"] },
    "valuation": { "progress": number, "status": "string", "keyFindings": ["string (stating exactly how Agent 3 liabilities prompted Agent 4 haircuts on Agent 2 multiples)"] },
    "risk": { "progress": number, "status": "string", "keyFindings": ["string (breaking down weighted components: Financial 35%, Legal 40%, Valuation 25%)"] }
  },
  "valuation": {
    "baseEnterpriseValue": number,
    "adjustedEnterpriseValue": number,
    "ebitda": number,
    "multiple": number,
    "adjustments": [
       { "description": string, "amount": number, "type": "positive" | "negative", "category": "Financial" | "Legal" | "Valuation" }
    ]
  },
  "executiveBrief": {
    "executiveSummary": "string (strictly concise, plain English. MAXIMUM 3 SENTENCES TOTAL, NO CEO-facing jargon, confident declarative tone summarizing the overall deal status)",
    "redFlags": ["string (stating the top risks that need remediation)"],
    "goNoGoRecommendation": "GO" | "CONDITIONAL GO" | "NO-GO",
    "confidenceScore": number (This is the weighted Overall Risk Score computed by Agent 5 from 0 to 100),
    "escalationRequired": boolean (true if overall Risk Score computed by Agent 5 exceeds 70, else false),
    "escalationDetails": "string (e.g. ESCALATION TRIGGERED: Risk Score of X exceeds threshold 70. Requires CFO and Legal Counsel written sign-off before proceeding.)"
  }
}

Do not include any other markdown, no markdown fences around JSON. Just valid JSON.
If the documents don't have enough data, make reasonable extrapolations or note them, but ALWAYS provide the full JSON structure matching the schema above.

Documents to analyze:
${combinedText}
`;

    const response = await openai.chat.completions.create({
      model: "anthropic/claude-sonnet-4.6",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content || "{}";
    const data = JSON.parse(text);

    return res.json({ result: data });
  } catch (error) {
    console.error("Error analyzing with AIML API:", error);
    return res.status(500).json({ error: String(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
