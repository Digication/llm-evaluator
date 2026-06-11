/**
 * Passthrough provider — returns the pre-recorded assistant_response directly.
 * Promptfoo expects a provider that calls a model, but our data is pre-recorded.
 * This makes Promptfoo evaluate the stored responses instead of calling an LLM.
 */
module.exports = class PassthroughProvider {
  id() {
    return "passthrough";
  }

  async callApi(_prompt, context) {
    return { output: context.vars.assistant_response };
  }
};
