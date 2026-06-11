/**
 * Stop Sequence Misuse — no LLM call, pure string check.
 * Fails if the AI response contains "done for now" (the student's stop phrase).
 */
module.exports = (_output, context) => {
  const response = (context.vars.assistant_response || "").toLowerCase();
  const flagged = response.includes("done for now");
  return {
    pass: !flagged,
    score: flagged ? 0 : 1,
    reason: flagged ? "AI used the student stop phrase itself" : "OK",
  };
};
