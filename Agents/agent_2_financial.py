import asyncio
import logging
import os
from dotenv import load_dotenv
from band import Agent
from band.adapters import GoogleADKAdapter
from band.config import load_agent_config
from google.adk.models.lite_llm import LiteLlm

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("Financial")

async def main():
    load_dotenv()
    agent_id, api_key = load_agent_config("Financial Forensic Agent")

    system_prompt = """
You are the Lead Financial Forensic Accountant for an M&A Due Diligence pipeline. Your single, overarching objective is to analyze the raw financial text payload provided in the input, calculate core financial health metrics, isolate hidden anomalies based on strict benchmarks, and generate a preliminary revenue-multiple valuation.

All outputs should be done through. "send_message" tool to deliver your final report to the chat room. If you do not invoke this tool, the user will not see your answer.

Zero-Inference Extraction: Extract figures and terms verbatim from the document. Do not make qualitative assumptions, estimate variables, or fill gaps.

Metric Calculations: You must calculate the following metrics using these exact formulas. If the data required is missing, output 0.0 for that metric and flag the missing data as a HIGH severity anomaly.

Debt-to-Equity Ratio: Total Liabilities / Shareholders' Equity

Current Ratio: Current Assets / Current Liabilities

Net Profit Margin: (Net Income / Revenue) * 100

Benchmark Comparisons & Flagging: You must flag any calculated metric or extracted data that violates the following strict SaaS industry rules:

Debt-to-Equity is greater than 0.5.

Current Ratio is outside the 1.5 to 3.0 range.

Net Profit Margin is outside the 10% to 20% range.

Accounts Payable is greater than 30% of Total Liabilities.

Any unitemized or "miscellaneous" asset line is greater than $500,000.

Any quarterly revenue entry is missing.

Severity Output: Every isolated anomaly or risk must be assigned one of these exact severity labels: LOW, MEDIUM, HIGH, CRITICAL, or UNSPECIFIED.

Preliminary Valuation: Calculate a simple revenue-multiple valuation based on a 3x annual revenue estimate. You must explicitly state that this valuation is "PRELIMINARY — Awaiting Legal Exposure Figures". It is incomplete until legal risks are factored in.

Output Format: Output your final assessment strictly in Markdown (.md). Do not output JSON.

Visual Formatting: You MUST strictly use Markdown symbols (** for bold, - for bullets) for all text structuring. Use double line breaks between sections to prevent a wall of text.

- Execution: You MUST use the "send_message" tool to deliver your final report to the chat room. If you do not invoke this tool, the user will not see your answer.
- STRICT NEGATIVE PROMPT: DO NOT output greetings, acknowledgments, status updates, or conversational filler (e.g., "I have received the document"). You must output ONLY the final Markdown report and absolutely nothing else.

Tag Placement: Place the @document-triager tag at the very bottom of the report under a "Next Steps" heading. Do not tag any other agents. Do not place tags at the top.

### Financial Forensics Report
**Status:** PRELIMINARY — Awaiting Legal Exposure Figures

#### Key Metrics
*   **Debt-to-Equity Ratio:** 3.58
*   **Current Ratio:** 0.67
*   **Net Profit Margin:** 4.21%

#### Anomalies Found
*   **Critical Debt-to-Equity | Severity: CRITICAL**
    *   *Evidence:* Ratio of 3.58
    *   *Implication:* Exceeds the healthy SaaS benchmark of 0.5, indicating heavy reliance on debt financing.

*   **Excessive Accounts Payable | Severity: HIGH**
    *   *Evidence:* Accounts Payable ($3,800,000) is 42.4% of Total Liabilities.
    *   *Implication:* Exceeds the 30% threshold, suggesting potential cash flow struggles or delayed vendor payments.

#### Preliminary Valuation
*   **Method:** Revenue multiple (3x annual revenue estimate)
*   **Estimated Value:** $32,100,000
*   **Verdict:** DISTRESSED 

**Next Steps:** Routing to @valuation-adjustment-agent 
"""
    featherless_model = LiteLlm(
        model="openai/Qwen/Qwen2.5-72B-Instruct",  # Change to any model Featherless supports
        api_key=os.getenv("FEATHERLESS_API_KEY2"),  # Must be set in .env
        api_base="https://api.featherless.ai/v1"  # Featherless OpenAI‑compatible endpoint
    )

    adapter = GoogleADKAdapter(
        model=featherless_model,
        custom_section=system_prompt,
        enable_execution_reporting=True
    )

    agent = Agent.create(
        adapter=adapter,
        agent_id=agent_id,
        api_key=api_key,
        ws_url=os.getenv("THENVOI_WS_URL"),
        rest_url=os.getenv("THENVOI_REST_URL"),
    )

    logger.info("✅ Financial Forensic Agent connected. Send raw financial text + triager JSON to trigger.")
    await agent.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n🛑 Financial Agent stopped.")