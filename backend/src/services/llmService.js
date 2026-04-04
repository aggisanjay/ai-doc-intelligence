'use strict';
const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
const MODEL = 'gemini-3-flash-preview';

const SYSTEM_PROMPT = `You are an AI document assistant that answers questions based ONLY on the provided document context.

GOAL:
Provide professional, structured, and easy-to-read responses that directly answer the user's query using the provided document data.

FORMATTING RULES:
1. Use professional Markdown formatting.
2. Use **bold text** for emphasis and key terms.
3. Use ### for meaningful sub-headings to group information.
4. Use bullet points or numbered lists instead of long paragraphs.
5. Use markdown tables (| Column |) where appropriate to present structured data, technical stacks, or comparisons.
6. If the document content allows, organize the response into logical sections (e.g., "Overview", "Key Features", "Technical Stack").

CONTENT RULES:
1. Answer ONLY based on the provided context. If the context doesn't contain enough information, say "I don't have enough information in the provided documents to answer this question."
2. Be precise and cite which parts of the context support your answer.
3. When referencing information, mention the source document name and page number if available.
4. Do NOT make up information or use knowledge outside the provided context.
5. At the end of your response, list the sources you used: [Source: document_name, Page X]

CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{chatHistory}`;

function buildContextString(chunks) {
  if (!chunks.length) return 'No relevant document context found.';
  return chunks.map((c, i) => {
    const { sourceFile = 'Unknown', pageNumber = 'N/A' } = c.metadata || {};
    return `[Chunk ${i + 1}] (Source: ${sourceFile}, Page: ${pageNumber}, Relevance: ${c.score.toFixed(2)})\n${c.text}`;
  }).join('\n---\n');
}

function buildHistoryString(messages, max = 6) {
  if (!messages.length) return 'No previous conversation.';
  return messages.slice(-max).map(m => {
    const content = m.content.length > 500 ? m.content.slice(0, 500) + '...' : m.content;
    return `${m.role.toUpperCase()}: ${content}`;
  }).join('\n');
}

async function generateResponse(query, chunks, history = []) {
  const systemInstruction = SYSTEM_PROMPT
    .replace('{context}', buildContextString(chunks))
    .replace('{chatHistory}', buildHistoryString(history));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: query,
    config: {
      systemInstruction,
      temperature: 0.1,
      maxOutputTokens: 1500,
    },
  });

  return { answer: response.text, tokensUsed: null };
}

async function* generateStreamingResponse(query, chunks, history = []) {
  const systemInstruction = SYSTEM_PROMPT
    .replace('{context}', buildContextString(chunks))
    .replace('{chatHistory}', buildHistoryString(history));

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield `data: ${JSON.stringify({ type: 'content', data: chunk.text })}\n\n`;
      }
    }
    yield `data: ${JSON.stringify({ type: 'done' })}\n\n`;
  } catch (err) {
    console.error('[LLMService] Streaming error:', err.message);
    yield `data: ${JSON.stringify({ type: 'error', data: err.message })}\n\n`;
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

module.exports = { generateResponse, generateStreamingResponse, generateConversationTitle };
