const { GoogleGenAI } = require('@google/genai');
const config = require('./src/config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

async function main() {
  console.log("Using API Key:", config.geminiApiKey ? `${config.geminiApiKey.slice(0, 6)}...` : "None");
  
  const modelsToTest = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3-flash-preview'];
  
  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: "Hello, tell me a 1-word joke.",
      });
      console.log(`  Success! Response: ${response.text.trim()}`);
    } catch (err) {
      console.error(`  Failed for model ${model}:`, err.message);
    }
  }
}

main().catch(err => {
  console.error("Test execution failed:", err.message);
  process.exit(1);
});
