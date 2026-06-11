/**
 * Summary Quality — LLM judge scorer.
 * Only activates on summary turns (is_summary === "true").
 * Requires full_conversation column pre-assembled in the CSV.
 */
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000 });

module.exports = async (_output, context) => {
  if (context.vars.is_summary !== "true") {
    return { pass: true, score: 1, reason: "skip — not a summary turn" };
  }

  const fullConvo = context.vars.full_conversation || "";
  const assistantResponse = context.vars.assistant_response || "";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are evaluating a closing TORI summary in a student reflection conversation.

Full conversation:
${fullConvo}

The AI's closing summary:
${assistantResponse}

Score on all four criteria:
1. Affirming Tone — warm and celebratory, not clinical
2. Student Voice — uses the student's own words and framing
3. No New Advice — does not introduce suggestions not raised during the conversation
4. TORI Tags Justified — category tags match their bullet points

- pass    = all four criteria met
- partial = most criteria met, one has a clear issue
- fail    = two or more criteria have clear issues

Return JSON: {"score": "pass|partial|fail", "reason": "one sentence"}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content);
  const scoreMap = { pass: 1.0, partial: 0.5, fail: 0.0 };
  const score = scoreMap[result.score] ?? 0;

  return { pass: score >= 0.5, score, reason: result.reason || "" };
};
