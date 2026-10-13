/**
 * server.js
 * -----------------------------------------------------------------------------
 * The backend API. Responsibilities:
 *   1. Serve the static frontend files from the `public/` folder.
 *   2. Expose POST /api/chat, which receives a message from the browser,
 *      asks the AI (aiClient.getReply), and returns the reply as JSON.
 *
 * The API key (added in Stage 3) lives ONLY on this server, never in the
 * browser. This is the standard, safe way to talk to an AI provider.
 * -----------------------------------------------------------------------------
 */

// Load environment variables from a local `.env` file into process.env.
// (We don't require the .env to exist yet — mock mode needs no keys.)
require('dotenv').config();

const express = require('express');
const path = require('path');
const { getReply } = require('./aiClient');

const app = express();

// Read the port from .env, defaulting to 3000. In GitHub Codespaces, port
// 3000 is auto-forwarded so you can open the app in a browser tab.
const PORT = process.env.PORT || 3000;

// Middleware: let Express parse JSON bodies sent by fetch() from the browser.
// Without this, req.body would be undefined.
app.use(express.json());

// Serve the frontend (index.html, app.js, style.css) from /public.
app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /api/chat
 * Body: { "message": "hello" }
 * Response: { "reply": "..." }
 *
 * Flow: browser sends a message -> we build a small message history ->
 * ask the AI -> send the reply back as JSON.
 */
app.post('/api/chat', async (req, res) => {
  try {
    // 1. Read the user's message from the request body.
    const userMessage = (req.body && req.body.message ? String(req.body.message) : '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // 2. Build the conversation in the standard {role, content} shape.
    //    For now we only track the single incoming message; Stage 4 will keep
    //    full history so the model has context across turns.
    const messages = [{ role: 'user', content: userMessage }];

    // 3. Ask the AI module for a reply (mock today, real provider in Stage 3).
    const reply = await getReply(messages);

    // 4. Send the reply back to the browser as JSON.
    res.json({ reply });
  } catch (err) {
    // Always handle errors so the server never crashes on a bad request and
    // the browser gets a clear, structured error.
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

// Start listening. The callback just confirms we're up in the terminal.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
