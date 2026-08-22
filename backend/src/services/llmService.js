'use strict';
const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
const MODEL = config.geminiModel || 'gemini-3.6-flash';
const GROQ_MODEL = config.groqModel || 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are DocAI, an expert AI document intelligence assistant. Your role is to accurately, clearly, and thoroughly answer user questions based on the provided document context.

GOAL:
Directly and accurately explain concepts, answer questions, and summarize information using the facts contained in the provided document context.

GUIDELINES:
1. Direct and Comprehensive Explanations: Explain the topic thoroughly and accurately based on the document. When asked about concepts, definitions, or questions in the document, provide clear, comprehensive, and well-explained answers.
2. Clean & Natural Tone: Answer naturally as a knowledgeable assistant. Do NOT write meta-analytical statements about chunks (e.g., avoid "As stated in chunk 1" or "This is indicated by the title of the document").
3. DO NOT include raw source citations or brackets like "[Source: document_name, Page X]" or "(Source: ...)" in your text — the application interface automatically renders dedicated interactive citation cards below the response.
4. Structured Formatting: Use clean Markdown formatting:
   - Use bold text for key terms and emphasis.
   - Use ### for meaningful sub-headings.
   - Use bullet points, numbered steps, or markdown tables for readability.
   - Use formatted code blocks for programming code when relevant.
5. Accuracy & Grounding: Ground all information strictly in the provided document context. If the document does not contain enough information to answer the question, state: "I don't have enough information in the provided documents to answer this question."

CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{chatHistory}`;

function buildContextString(chunks) {
  if (!chunks.length) return 'No relevant document context found.';
  return chunks.map((c, i) => {
    const { sourceFile = 'Unknown', pageNumber = 'N/A' } = c.metadata || {};
    return `═══ [Document: ${sourceFile} | Page: ${pageNumber} | Chunk ${i + 1} | Relevance: ${c.score.toFixed(2)}] ═══\n${c.text}`;
  }).join('\n\n');
}

function buildHistoryString(messages, max = 6) {
  if (!messages.length) return 'No previous conversation.';
  return messages.slice(-max).map(m => {
    const content = m.content.length > 500 ? m.content.slice(0, 500) + '...' : m.content;
    return `${m.role.toUpperCase()}: ${content}`;
  }).join('\n');
}

async function generateGroqResponse(query, chunks, history = []) {
  const systemInstruction = SYSTEM_PROMPT
    .replace('{context}', buildContextString(chunks))
    .replace('{chatHistory}', buildHistoryString(history));

  const groqApiKey = config.groqApiKey;
  if (!groqApiKey) {
    throw new Error('Groq API Key not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
      max_tokens: 4096,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function* generateGroqStreamingResponse(query, chunks, history = []) {
  console.log('[LLMService] Falling back to Groq streaming...');
  const systemInstruction = SYSTEM_PROMPT
    .replace('{context}', buildContextString(chunks))
    .replace('{chatHistory}', buildHistoryString(history));

  const groqApiKey = config.groqApiKey;
  if (!groqApiKey) {
    throw new Error('Groq API Key not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
      max_tokens: 4096,
      stream: true,
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last partial line in the buffer

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      if (cleanLine === 'data: [DONE]') continue;
      if (cleanLine.startsWith('data: ')) {
        try {
          const data = JSON.parse(cleanLine.substring(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            yield `data: ${JSON.stringify({ type: 'content', data: content })}\n\n`;
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    }
  }
}

async function generateResponse(query, chunks, history = []) {
  try {
    const systemInstruction = SYSTEM_PROMPT
      .replace('{context}', buildContextString(chunks))
      .replace('{chatHistory}', buildHistoryString(history));

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    });

    return { answer: response.text, tokensUsed: null };
  } catch (err) {
    console.error('[LLMService] Gemini generateResponse failed, falling back to Groq:', err.message);
    try {
      const answer = await generateGroqResponse(query, chunks, history);
      return { answer, tokensUsed: null };
    } catch (groqErr) {
      console.error('[LLMService] Groq fallback failed as well:', groqErr.message);
      if (err.message?.includes('429') || err.message?.includes('quota') || groqErr.message?.includes('429')) {
        throw new Error('AI Rate Limit Exceeded: The free tier request quota is temporarily exhausted. Please retry in 1 minute or update your API key in Settings.');
      }
      throw err;
    }
  }
}

async function* generateStreamingResponse(query, chunks, history = []) {
  let geminiFailed = false;
  try {
    const systemInstruction = SYSTEM_PROMPT
      .replace('{context}', buildContextString(chunks))
      .replace('{chatHistory}', buildHistoryString(history));

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield `data: ${JSON.stringify({ type: 'content', data: chunk.text })}\n\n`;
      }
    }
    yield `data: ${JSON.stringify({ type: 'done' })}\n\n`;
  } catch (err) {
    console.error('[LLMService] Gemini streaming failed, trying Groq fallback:', err.message);
    geminiFailed = true;
  }

  if (geminiFailed) {
    try {
      for await (const sseChunk of generateGroqStreamingResponse(query, chunks, history)) {
        yield sseChunk;
      }
      yield `data: ${JSON.stringify({ type: 'done' })}\n\n`;
    } catch (groqErr) {
      console.error('[LLMService] Groq streaming fallback failed:', groqErr.message);
      const isRateLimit = groqErr.message?.includes('429') || groqErr.message?.includes('quota');
      const friendlyMsg = isRateLimit 
        ? 'AI Quota / Rate Limit Exceeded: The request quota is temporarily exhausted. Please wait 1 minute before retrying, or configure your API key in Settings.'
        : `AI Service Notice: ${groqErr.message}`;
      yield `data: ${JSON.stringify({ type: 'error', data: friendlyMsg })}\n\n`;
    }
  }
}

async function generateConversationTitle(query, answer) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Question: ${query}\nAnswer: ${answer.slice(0, 200)}`,
      config: {
        systemInstruction: 'Generate a short title (max 6 words) for this conversation. Return ONLY the title, nothing else.',
        temperature: 0.5,
        maxOutputTokens: 20,
      },
    });
    return response.text.trim().replace(/^"|"$/g, '');
  } catch {
    return query.length > 50 ? query.slice(0, 50) + '...' : query;
  }
}

async function runDocumentAction(text, action) {
  const prompts = {
    summary: "Generate an executive summary of this document. Keep it concise, professional, and highlight key takeaways.",
    study_notes: "Generate comprehensive study notes for this document. Use headings, bullet points, and highlight key definitions.",
    faq: "Generate a list of frequently asked questions (FAQs) and their answers based on this document.",
    insights: "Extract key insights from this document. What are the most important conclusions and findings?",
    action_items: "Extract a checklist of action items, next steps, or tasks from this document.",
    topic_breakdown: "Provide a structured breakdown of the topics discussed in this document.",
    explain_beginners: "Explain the content of this document in simple terms suitable for beginners. Use analogies if helpful.",
    concepts: "Identify and explain the most important concepts, terms, or acronyms in this document.",
    knowledge_map: "Create a knowledge map or concept hierarchy of the main ideas in this document.",
    critical_sections: "Highlight the critical sections, warnings, or highly important details of this document.",
  };

  const instruction = prompts[action] || prompts.summary;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Document content:\n${text.slice(0, 150000)}\n\nInstruction: ${instruction}`,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  });

  return response.text;
}

async function compareDocuments(textA, textB) {
  const groqApiKey = config.groqApiKey;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is not configured in your backend .env file. Please add your Groq API key.');
  }

  const prompt = `You are an expert document analyst. Compare the following two documents.
     
Document A (Original):
${textA.slice(0, 3000)}

---

Document B (New/Revised):
${textB.slice(0, 3000)}

---

Instructions:
1. Compare the two documents for additions, removals, and modifications.
2. Limit the 'changedSections' array to the top 5 most significant modifications to keep the comparison concise and readable.
3. Return your response ONLY as a JSON object matching this schema:
{
  "similarityScore": number (0 to 100),
  "executiveSummary": "string summarizing the comparison",
  "keyDifferences": ["string"],
  "addedInformation": ["string"],
  "removedInformation": ["string"],
  "changedSections": [
    {
      "sectionTitle": "string",
      "originalContent": "string",
      "newContent": "string",
      "explanation": "string describing what changed and why"
    }
  ]
}
Return ONLY valid raw JSON. Do not wrap in markdown block styling.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error("Groq comparison execution failed:", err.message);
    throw new Error(`Failed to compare documents using Groq: ${err.message}`);
  }
}

module.exports = { generateResponse, generateStreamingResponse, generateConversationTitle, runDocumentAction, compareDocuments };
