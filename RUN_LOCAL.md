# Run Ashboard OS Max locally (live Gemini, no Vercel)

This runs the whole app on your own machine. No Vercel, no environment scopes,
no project confusion — just one folder, your Gemini key, and a live chat.

You need **Node.js 18+** installed. Then, in a terminal:

```bash
# 1. Get the code (skip the clone if you already have the folder)
git clone https://github.com/maxwest525/agent-puppets.git
cd agent-puppets
git checkout claude/god-mode-desktop-v1-cdNuW

# 2. Install dependencies
npm install

# 3. Add your Gemini key
cp .env.local.example .env.local
#   then open .env.local and paste your key after GOOGLE_GENERATIVE_AI_API_KEY=

# 4. Run it
npm run dev
```

Then open **http://localhost:3000** in your browser. It lands on God Mode.

- Click the company name (top-left) → **Ashboard OS Max**
- Type into **"Ask Ash anything"** and send → you get a real Gemini 3.5 Flash reply.

That's it. Because the key is read straight from `.env.local` on your machine,
there's nothing to deploy and no environment to misconfigure — if the key is
valid, the chat is live immediately.

> The header will say **"Gemini 3.5 Flash"** under the chat when it's live, or
> **"demo mode"** if the key is missing/blank in `.env.local`.
