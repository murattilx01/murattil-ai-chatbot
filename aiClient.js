/**
 * aiClient.js
 * -----------------------------------------------------------------------------
 * The ONLY place that knows how to produce a reply from the AI.
 *
 * Today (Stage 1) it returns a MOCK reply so the app works end-to-end
 * with no API key and no cost.
 *
 * Later (Stage 3) we replace ONLY the body of getReply() with a real call
 * to a provider (e.g. Groq / Gemini / OpenAI) using the key from `.env`.
 * The rest of the app (server.js + frontend) will NOT need to change.
 * -----------------------------------------------------------------------------
 */

/**
 * getReply(messages) -> string
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 *   The conversation so far, oldest first. We keep this shape because every
 *   real chat API expects a list of {role, content} messages, so switching to
 *   a provider later needs no reshaping.
 *
 * @returns {Promise<string>} The assistant's reply text.
 *   It's async on purpose: real providers are network calls, so making it
 *   async now means Stage 3 won't change how the caller awaits it.
 */
async function getReply(messages) {
  // Find the most recent user message so our mock can echo something useful.
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUserMessage ? lastUserMessage.content.trim() : '';

  // --- MOCK behaviour (temporary) -------------------------------------------
  // Small built-in responses so the chat feels alive before a real model is
  // connected. Anything unrecognized gets a generic acknowledgement.
  const lower = userText.toLowerCase();

  if (!userText) {
    return "Hi! I'm your chatbot. Say something and I'll respond. (mock mode)";
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! How can I help you today? (mock mode)';
  }
  if (lower.includes('how are you')) {
    return "I'm just code for now, but thanks for asking! (mock mode)";
  }
  if (lower.includes('your name')) {
    return "I'm murattil-ai-chatbot, still learning. (mock mode)";
  }

  // Default: echo what the user said, clearly labelled as a mock.
  return `You said: "${userText}". A real AI will answer this in Stage 3. (mock mode)`;
}

module.exports = { getReply };
