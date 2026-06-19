# Valence: The M&A Due Diligence War Room 🚀

> Next-generation AI-driven orchestration, automated document processing, and real-time stakeholder coordination for high-stakes Mergers & Acquisitions.

[![Band of Agents Hackathon](https://img.shields.io/badge/Hackathon-Band%20of%20Agents-blueviolet?style=for-the-badge)](https://lablab.ai/ai-hackathons/band-of-agents-hackathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Powered by n8n](https://img.shields.io/badge/Automation-n8n-EA4B0B.svg)](https://n8n.io/)
[![Powered by Band.ai](https://img.shields.io/badge/Agent%20Orchestration-Band.ai-FF6B6B.svg)](https://band.ai/)

---

## 🎯 Overview

Valence is an **AI-powered agent orchestration system** designed to revolutionize M&A due diligence workflows. It acts as the central intelligence hub (The War Room) for high-stakes corporate transactions.

By combining **autonomous agent orchestration**, **workflow automation**, and **real-time collaborative intelligence**, Valence eliminates human latency and administrative bottlenecks during the critical due diligence phase.

### 💡 The Problem

Traditional M&A due diligence is a bottleneck:
- **Manual document review** slows closing timelines
- **Siloed teams** create communication gaps and missed red flags
- **Static checklists** miss context-aware risk vectors
- **Follow-up delays** compound as stakeholders juggle competing priorities

### ✅ The Solution

Valence deploys a **coordinated band of AI agents** that work together to:
1. **Ingest & Parse** documents at scale (VDR scraping, OCR, text extraction)
2. **Analyze & Flag** risks with context-aware intelligence
3. **Coordinate & Synthesize** findings through a unified chat-based memory system
4. **Report & Recommend** with executive-grade decision support in real-time

---

## 🏗️ Architecture: The Band of Agents

Valence operates through **five specialized AI agents** that coordinate through a Band.ai chat room (shared memory system). Agents are triggered via mentions, enabling asynchronous collaboration with full conversation history.

### Core Workflow
1. **n8n Orchestration** listens for Firestore document triggers using thenvoi
2. **Thenvoi Trigger** initiates n8n workflows with document data
3. **Featherless AI Agents** (Gemma 4 models via Featherless API) process documents
4. **Band.ai Chat Room** serves as the shared memory layer for agent coordination
5. **Firestore Output** captures completed analysis and stores findings

### Five Specialized Agents

#### 1. **Document Triager** (@document-triager)
- **Role:** Intake coordinator - reads everything first, organizes for everyone else
- **Responsibilities:**
  - Classifies incoming documents by type and relevance
  - Extracts key metadata and document summaries
  - Routes findings to specialized agents via chat room mentions
  - Creates the initial transaction context
- **Output:** Classification report, metadata extraction, routing decisions

#### 2. **Financial Forensic Agent** (@financial-forensic-agent)
- **Role:** Deep financial analysis and preliminary valuation
- **Responsibilities:**
  - Receives financial documents and triage report
  - Calculates key financial ratios
  - Identifies anomalies against industry benchmarks
  - Produces preliminary valuation range using revenue multiples
  - Flags concerns for the Valuation Adjustment Agent
- **Output:** Financial analysis report, ratio analysis, preliminary valuation (marked as preliminary)

#### 3. **Legal Compliance Analyst** (@legal-compliance-analyst)
- **Role:** Contract and compliance risk assessment
- **Responsibilities:**
  - Receives legal contracts and triage report
  - Scans for red flag clauses (uncapped liability, IP ambiguity, GDPR gaps, unfavorable renewal terms)
  - Assigns severity ratings to each risk
  - Quantifies financial exposure in dollars for every risk
  - Produces detailed legal risk matrix
- **Output:** Legal risk report, severity-rated findings, financial impact quantification

#### 4. **Risk Synthesis Agent** (@risk-synthesis-agent)
- **Role:** Unified risk aggregation and scoring
- **Responsibilities:**
  - Receives all prior agent outputs from chat history
  - Builds unified risk matrix with three dimensions: Financial (35%), Legal (40%), Valuation (25%)
  - Calculates weighted overall risk score from 0 to 100
  - Ranks top 3 issues requiring resolution before signing
  - Synthesizes only findings from prior agents (no new analysis)
- **Output:** Unified risk matrix, weighted risk score, prioritized action items

#### 5. **Executive Arbitrator** (@executive-arbitrator)
- **Role:** Final decision authority and deal recommendation
- **Responsibilities:**
  - Receives Agent 4's risk matrix and all prior reports via chat history
  - Produces one-page executive brief (plain English, CEO audience, no jargon)
  - Issues final recommendation: **GO**, **CONDITIONAL GO**, or **NO-GO**
  - If risk score exceeds 70, automatically escalates requiring Legal Counsel and CFO sign-off
  - Delivers recommendation back to n8n workflow
- **Output:** Executive brief, deal recommendation, escalation flags

---

## 🔄 System Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Firestore Document Trigger                 │
│                  (n8n Webhook / Thenvoi)                     │
└────────────────────────┬─────────────────────────────────────┘
                         │ Document Data
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              N8N ORCHESTRATION (Thenvoi Trigger)             │
│  ──────────────────────────────────────────────────────────  │
│  • Read from Firestore input node                            │
│  • Route document to Featherless AI pipeline                 │
│  • Manage workflow state & transitions                       │
└────────────────────────┬─────────────────────────────────────┘
                         │ Document Content
                         ▼
┌──────────────────────────────────────────────────────────────┐
│         BAND.AI CHAT ROOM (Shared Agent Memory)              │
│  ──────────────────────────────────────────────────────────  │
│  @Document-Triager (Gemma 4 via Featherless)                │
│      ↓ mentions @Financial-Forensic-Agent                   │
│  @Financial-Forensic-Agent → @Legal-Compliance-Analyst      │
│      ↓ mentions @Risk-Synthesis-Agent                       │
│  @Risk-Synthesis-Agent → @Executive-Arbitrator              │
│      ↓ Final recommendation                                  │
│  [Full conversation history available to all agents]        │
└────────────────────────┬─────────────────────────────────────┘
                         │ Analysis Complete
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  CREATE FIRESTORE OUTPUT DOCUMENT            │
│          (Final analysis, risk scores, recommendation)       │
└────────────────────────┬─────────────────────────────────────┘
                         │ Store Results
                         ▼
┌──────────────────────────────────────────────────────────────┐
│      MASTER TRANSACTION LEDGER & WAR ROOM DASHBOARD          │
│              Real-Time Progress & Analytics                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Key Features

### Automated Document Processing
- **Instant Firestore Ingestion:** Webhook-triggered document processing via thenvoi
- **Intelligent Classification:** Auto-categorizes financials, legal, IP, tax, and compliance docs
- **Structured Data Extraction:** Extracts key fields and metadata from documents

### AI-Powered Risk Analysis
- **Multi-Agent Collaboration:** Five specialized agents working in concert via Band.ai chat room
- **Context-Aware Intelligence:** Each agent understands full transaction context from chat history
- **Risk Quantification:** Financial impact calculated in dollars for every identified risk

### Shared Memory & Coordination
- **Chat Room Memory System:** All agent communications stored in Band.ai chat room
- **Asynchronous Collaboration:** Agents triggered via mentions, enabling flexible workflows
- **Full Conversation History:** Every agent has access to all prior analysis and findings

### Transaction Tracking & Analytics
- **Live Due Diligence Dashboard:** Real-time completion percentages by analysis type
- **Risk Heatmaps:** Weighted risk scoring across Financial, Legal, and Valuation dimensions
- **Deal Recommendations:** Automated GO/NO-GO/CONDITIONAL GO decisions with escalation triggers

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **n8n** instance (self-hosted or cloud)
- **Band.ai** account with agent configuration
- **Featherless API** account for Gemma 4 models
- **Firebase/Firestore** database for document storage
- **AIML API** account for Claude Sonnet 4.6 (webapp AI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muyonii/valence-band-agent.git
   cd valence-band-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:

   ```env
   # Core Server Configuration
   PORT=8080
   VALENCE_ENVIRONMENT=development
   VALENCE_LOG_LEVEL=info

   # n8n Workflow Engine Integration
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/valence-due-diligence
   N8N_API_KEY=your_n8n_api_key_here
   N8N_INSTANCE_URL=https://your-n8n-instance.com

   # Thenvoi Trigger
   THENVOI_API_KEY=your_thenvoi_api_key_here

   # Band.ai Agent Orchestration
   BAND_AI_API_KEY=your_band_ai_api_key_here
   BAND_AI_CHAT_ROOM_ID=your_chat_room_id_here
   BAND_AI_AGENTS=[
     "@paulsamson1101/document-triager",
     "@paulsamson1101/financial-forensic-agent",
     "@paulsamson1101/legal-compliance-analyst",
     "@paulsamson1101/risk-synthesis-agent",
     "@paulsamson1101/executive-arbitrator"
   ]

   # Featherless API (Gemma 4 Models for Agents)
   FEATHERLESS_API_KEY=your_featherless_api_key_here
   FEATHERLESS_MODEL=gemma-4-gemma-2b

   # AIML API (Claude Sonnet 4.6 for Webapp)
   AIML_API_KEY=your_aiml_api_key_here
   AIML_MODEL=claude-sonnet-4.6

   # Firestore Configuration
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIRESTORE_INPUT_COLLECTION=documents_to_process
   FIRESTORE_OUTPUT_COLLECTION=analysis_results

   # Logging & Analytics
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The War Room dashboard will be accessible at `http://localhost:8080`

---

## 📋 Configuration

### n8n Workflow Setup

1. Log into your n8n instance
2. Create a new workflow with **Thenvoi Trigger**
3. Configure workflow nodes:
   - **Firestore Read:** Listen to input collection for new documents
   - **Featherless AI Call:** Route documents to appropriate agent
   - **Band.ai Chat Dispatch:** Trigger agent mentions in chat room
   - **Firestore Write:** Store completed analysis to output collection
   - **Error Handling:** Escalation and retry logic

### Band.ai Chat Room Setup

1. Create a new Band.ai chat room for your transaction
2. Create or import the five specialized agents:
   - `@paulsamson1101/document-triager`
   - `@paulsamson1101/financial-forensic-agent`
   - `@paulsamson1101/legal-compliance-analyst`
   - `@paulsamson1101/risk-synthesis-agent`
   - `@paulsamson1101/executive-arbitrator`
3. Configure agent system prompts with M&A context and role definitions
4. Set up mention-based triggers for sequential agent workflow
5. Configure callback webhook to return final recommendation to n8n

### Firestore Configuration

Valence uses two collections:
- **Input Collection** (`documents_to_process`): Receives documents needing analysis
- **Output Collection** (`analysis_results`): Stores completed analysis documents with risk scores and recommendations

Document schema for input:
```json
{
  "transaction_id": "string",
  "document_type": "financial|legal|ip|tax|compliance",
  "file_url": "string",
  "uploaded_at": "timestamp",
  "metadata": {}
}
```

---

## 📊 Usage Examples

### Scenario 1: Financial Analysis & Valuation
```
1. Finance team uploads Q3 2024 revenue ledger to Firestore
2. n8n triggers thenvoi workflow, reads from Firestore input
3. @Document-Triager classifies as financial document
4. @Financial-Forensic-Agent calculates ratios and valuation range
5. Both findings recorded in Band.ai chat room
6. n8n writes preliminary valuation to Firestore output collection
```

### Scenario 2: Legal Risk Identification
```
1. Legal team uploads vendor contracts to Firestore
2. n8n triggers workflow via thenvoi
3. @Document-Triager extracts document summary
4. @Legal-Compliance-Analyst scans for red flags
   → Detects uncapped liability clause (HIGH severity, $2.5M exposure)
5. Finding stored in Band.ai chat room with quantified impact
6. Risk is automatically escalated if score exceeds threshold
```

### Scenario 3: End-to-End Deal Recommendation
```
1. Multiple documents uploaded for deal review
2. n8n orchestrates sequential agent analysis
3. Agents collaborate through Band.ai chat room:
   - Document-Triager → Financial-Forensic-Agent
   - Financial-Forensic-Agent → Legal-Compliance-Analyst
   - Both → Risk-Synthesis-Agent
   - Risk-Synthesis-Agent → Executive-Arbitrator
4. Executive-Arbitrator produces one-page brief with GO/NO-GO
5. If risk > 70, automatic escalation alert issued
6. Final recommendation written to Firestore and War Room dashboard
```

---

## 🎓 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Orchestration** | n8n | Workflow automation, Firestore integration, thenvoi triggers |
| **Agent Orchestration** | Band.ai | Shared chat room memory, agent coordination, mention-based workflow |
| **AI Agents** | Featherless (Gemma 4) | Specialized agent models for analysis tasks |
| **Webapp AI** | AIML API (Claude Sonnet 4.6) | Natural language interface for War Room dashboard |
| **Document Storage** | Firestore | Input/output document management |
| **Frontend** | React / TypeScript | War Room dashboard, real-time updates |
| **Backend** | Node.js / Express | API server, webhook handling |
| **Database** | PostgreSQL | Transaction ledger, audit trails |
| **Logging** | Sentry / ELK Stack | Error tracking, performance monitoring |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Submitting bug reports
- Proposing new features
- Creating pull requests
- Code style and testing standards

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🏆 Band of Agents Hackathon

This project is a submission to the **[Band of Agents Hackathon](https://lablab.ai/ai-hackathons/band-of-agents-hackathon)**, showcasing the power of coordinated AI agents working together to solve real-world enterprise problems.

**Key Innovation:** Valence demonstrates how **five specialized AI agents** (Document Triager, Financial Forensic Agent, Legal Compliance Analyst, Risk Synthesis Agent, and Executive Arbitrator) can orchestrate seamlessly through a shared Band.ai chat room memory system to deliver sophisticated M&A due diligence automation.

---

## 📞 Support & Contact

- **Issues & Bugs:** [GitHub Issues](https://github.com/muyonii/valence-band-agent/issues)
- **Discussions:** [GitHub Discussions](https://github.com/muyonii/valence-band-agent/discussions)

---

## 🙏 Acknowledgments

Built for the **Band of Agents Hackathon** on lablab.ai. Thanks to the n8n, Band.ai, Featherless, and AIML API teams for their powerful platforms and support.

---

**Valence: Accelerating M&A with AI-powered agent orchestration. 🚀**
