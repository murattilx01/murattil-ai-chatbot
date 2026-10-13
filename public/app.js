/* app.js
 * -----------------------------------------------------------------------------
 * Browser-side logic for the chat UI.
 *
 * It does three things:
 *   1. Reads what the user types and adds it to the screen.
 *   2. Sends the message to our backend via fetch('POST /api/chat').
 *   3. Shows the backend's reply.
 *
 * IMPORTANT: the API key is NOT here. The browser only ever talks to OUR
 * server; our server holds the key and talks to the AI provider.
 * -----------------------------------------------------------------------------
 */

// Grab the elements we need from index.html.
const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chat-form');
const inputEl = document.getElementById('chat-input');
const sendButtonEl = document.getElementById('send-button');

/**
 * addMessage(text, sender)
 * Creates a message bubble and appends it to the screen.
 * sender is 'user' or 'bot'.
 * Returns the bubble element so we can remove/update it later (e.g. typing).
 */
function addMessage(text, sender) {
  const row = document.createElement('div');
  row.className = `message ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text; // textContent (not innerHTML) avoids XSS issues

  row.appendChild(bubble);
  messagesEl.appendChild(row);

  // Keep the newest message in view.
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return bubble;
}

/**
 * sendMessage(message)
 * Sends the user's message to the backend and renders the reply.
 */
async function sendMessage(message) {
  // 1. Show the user's message immediately.
  addMessage(message, 'user');

  // 2. Show a temporary "typing..." bubble while we wait.
  const typingBubble = addMessage('...', 'bot');
  typingBubble.classList.add('typing');

  // 3. Disable the input so the user can't spam requests mid-flight.
  inputEl.disabled = true;
  sendButtonEl.disabled = true;

  try {
    // 4. Call our backend. It returns JSON like { reply: "..." }.
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    // If the server responded with an error status, surface it.
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed (${response.status})`);
    }

    const data = await response.json();

    // 5. Replace the typing bubble with the real reply.
    typingBubble.classList.remove('typing');
    typingBubble.textContent = data.reply;
  } catch (err) {
    // Show a friendly error inside the chat instead of breaking the UI.
    typingBubble.classList.remove('typing');
    typingBubble.textContent = `Sorry, something went wrong: ${err.message}`;
  } finally {
    // 6. Re-enable the input no matter what happened.
    inputEl.disabled = false;
    sendButtonEl.disabled = false;
    inputEl.focus();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

// Handle form submission (covers both clicking Send and pressing Enter).
formEl.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading

  const message = inputEl.value.trim();
  if (!message) return; // ignore empty messages

  inputEl.value = ''; // clear the input box
  sendMessage(message); // fire off the request (no await needed here)
});

// Greet the user once the page loads.
addMessage('Hi! I am your chatbot. Type a message to begin. (mock mode)', 'bot');
