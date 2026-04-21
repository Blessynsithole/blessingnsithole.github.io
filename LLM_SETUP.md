# LLM Setup Guide for Portfolio Chat

This guide explains how to set up and use the AI-powered chat feature on Blessing's portfolio.

## Overview

The portfolio now includes an intelligent chat assistant that can answer questions about Blessing, their skills, projects, and general topics. The chat feature uses **open-source language models** that run locally on your computer for privacy and control.

## Quick Start

### Option 1: Ollama (Recommended & Easiest)

Ollama is the simplest way to get started. It provides a local LLM server that runs on your machine.

#### Installation

1. **Download Ollama** from [ollama.ai](https://ollama.ai)
2. **Install** following the instructions for your OS (Mac, Windows, or Linux)
3. **Run Ollama** by opening it (it runs in the background)
4. **Pull a Model** - Open terminal/command prompt and run:
   ```bash
   ollama pull mistral
   ```
   Other models you can try:
   - `ollama pull llama2` (7B version, faster but less capable)
   - `ollama pull neural-chat` (Optimized for chat)

5. **Start the Server**:
   ```bash
   ollama serve
   ```
   The server will run on `http://localhost:11434`

6. **Use the Chat**:
   - Visit the portfolio website
   - Click the chat icon/button
   - Start chatting!

#### Stopping Ollama

- **Mac/Linux**: Press `Ctrl+C` in the terminal
- **Windows**: Close the Ollama app

---

### Option 2: Hugging Face Inference API

Use the free Hugging Face Inference API for cloud-based LLMs (no local installation needed).

#### Setup

1. **Create a Hugging Face Account**:
   - Go to [huggingface.co](https://huggingface.co)
   - Sign up for a free account
   - Verify your email

2. **Get an API Token**:
   - Visit [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "New Token"
   - Name it "Portfolio Chat"
   - Select "Read" permission
   - Copy the token

3. **Use on Portfolio**:
   - Visit the chat page
   - Click "Check Connection"
   - Paste your API token when prompted
   - The token is stored locally in your browser (not sent anywhere else)

#### Benefits
- ✅ No local installation required
- ✅ Access to multiple models
- ✅ No server required
- ℹ️ Limited free API calls (check Hugging Face quota)

---

## Features

### Chat Page (`/chat.html`)
- Dedicated full-page chat interface
- Setup instructions if LLM is not available
- Suggested questions to get started
- Message history in current session
- Real-time typing indicators

### Widget (All Pages)
- Floating chat button (bottom-right)
- Minimize/maximize functionality
- Same AI capabilities as the dedicated page
- Persistent across page navigation
- Anonymous analytics (no data stored)

### AI Capabilities
- **Portfolio Q&A**: Ask about Blessing's skills, experience, projects
- **General Questions**: Ask any question and get helpful responses
- **Code Discussion**: Share code snippets and get explanations
- **Learning Help**: Get explanations and tutorials

---

## How It Works

### Privacy & Data

✅ **What happens locally:**
- If using Ollama: Everything runs on your computer
- LLM processing happens in your browser
- No chat messages are stored on servers

✅ **What data is tracked:**
- Anonymous event tracking (page visits, chat usage)
- No personal information or chat content stored
- You can disable analytics in browser DevTools

❌ **What's NOT stored:**
- Chat message content
- Your personal information
- Your browsing history
- Identifiable information

### Architecture

```
Browser (Your Computer)
    ↓
Open-Source LLM (Local Ollama OR Cloud HF)
    ↓
Portfolio Context (embedded in prompts)
    ↓
Chat Response
```

---

## Troubleshooting

### "Chat not available" message

**Problem**: No LLM provider detected

**Solutions**:
1. Check if Ollama is running:
   - Mac/Linux: Look for Ollama in taskbar
   - Windows: Check if Ollama.exe is running

2. Verify Ollama is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return a list of models

3. Try Hugging Face instead:
   - Get an API key from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click "Check Connection" on chat page
   - Paste your API token

### Chat is slow

**Reasons**:
- Model is too large for your computer (8GB RAM minimum for 7B models)
- Internet is slow (if using Hugging Face)
- Ollama server hasn't fully started

**Solutions**:
- Try a smaller model: `ollama pull neural-chat`
- Wait a few seconds for Ollama to initialize
- Check internet connection if using Hugging Face
- Reduce background applications consuming CPU

### Responses don't mention Blessing

**This is expected behavior**. The AI is designed to:
- Provide general helpful answers to any question
- Reference portfolio information when relevant
- Not force portfolio context into unrelated questions

To get portfolio information, try asking:
- "Tell me about Blessing"
- "What are Blessing's skills?"
- "What projects has Blessing worked on?"

### API Key not working (Hugging Face)

**Check**:
1. Token is correct (copy-paste from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))
2. Token has "Read" permission
3. Your account has API access enabled
4. Try regenerating a new token

---

## Advanced Configuration

### Changing the LLM Model

**For Ollama:**
```bash
# Pull a different model
ollama pull llama2:13b
ollama pull mistral
ollama pull neural-chat

# Then refresh the portfolio - it will auto-detect available models
```

**For Hugging Face:**
Models are automatically selected. Different tokens may give access to different models depending on your account tier.

### Disabling Analytics

The analytics are completely anonymous, but if you want to disable tracking:

1. Open browser DevTools (F12)
2. Go to Console
3. Run:
   ```javascript
   localStorage.removeItem('portfolio_chat_analytics')
   ```

### Clearing Chat History

The widget stores messages temporarily during a session. To clear:
- Reload the page (chat history clears)
- Close and reopen the browser
- Use browser's Clear Site Data

---

## Performance Tips

### For Ollama Users

1. **First Run Optimization**:
   - First startup might be slow (downloading model)
   - Subsequent requests are faster
   - Keep Ollama running in background for quick responses

2. **System Requirements**:
   - **Minimum**: 4GB RAM
   - **Recommended**: 8GB+ RAM for smooth operation
   - **For larger models**: 16GB+ RAM

3. **Model Selection**:
   ```bash
   # Fastest (less capable)
   ollama pull neural-chat
   
   # Balanced
   ollama pull mistral
   
   # Most capable (slowest)
   ollama pull llama2:13b
   ```

### For Hugging Face Users

- Keep API quota in mind (free tier has limits)
- Response time depends on internet connection
- Suitable for lighter usage

---

## FAQ

**Q: Is my chat data safe?**
A: Yes. With Ollama, nothing leaves your computer. With Hugging Face, only your question is sent (not stored). No chat history is kept.

**Q: Can I use this on mobile?**
A: Yes, the chat page and widget are mobile-responsive. For Ollama, ensure your local network allows connections from your phone.

**Q: What if I don't want to set up anything?**
A: The portfolio still works perfectly without the chat feature. Chat is optional and only available when an LLM is configured.

**Q: Can I contribute improvements?**
A: Yes! The portfolio is open source. Check out the GitHub repository.

**Q: Which model should I use?**
A: Start with `mistral` on Ollama - it's fast and capable. If your computer is slower, try `neural-chat`.

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your LLM provider is running
3. Try the alternate provider (Ollama vs Hugging Face)
4. Check browser console for error messages (F12 → Console tab)

---

## Technical Details

- **Chat Framework**: Vanilla JavaScript (no dependencies)
- **LLM Integration**: Custom client wrapper supporting multiple providers
- **Storage**: Browser localStorage for analytics only
- **Security**: No external API calls except to configured LLM provider
- **Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

---

Enjoy chatting with Blessing's AI assistant! 🚀
