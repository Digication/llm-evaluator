/**
 * Reflective Questioning — LLM judge scorer.
 * Skipped on crisis turns (has_safety_signal === "true").
 * Promptfoo has no native conditional — we check the flag here and return pass/skip.
 */
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000 });

module.exports = async (_output, context) => {
  // Skip crisis turns — scored by crisis-response instead
  if (context.vars.has_safety_signal === "true") {
    return { pass: true, score: 1, reason: "skip — crisis turn" };
  }

  const studentMsg = context.vars.student_message || "";
  const assistantResponse = context.vars.assistant_response || "";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You are evaluating an AI assistant's response in a student reflection conversation.

Student: ${studentMsg}
AI: ${assistantResponse}

Score this criterion:
Reflective Questioning — Does the response include a genuine open-ended question that invites the student to reflect more deeply?
- pass    = genuine open-ended question (not yes/no, not leading)
- partial = question is closed, leading, or generic
- fail    = no question at all

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
