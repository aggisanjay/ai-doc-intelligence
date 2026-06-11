const { GoogleGenAI } = require('@google/genai');
const config = require('./src/config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

async function main() {
  console.log("Listing available models...");
  const list = await ai.models.list();
  const models = list.pageInternal || [];
  console.log(`Found ${models.length} models:`);
  models.forEach(m => {
    console.log(`- Model Name (pass to SDK): "${m.name.replace('models/', '')}"`);
    console.log(`  Display Name: ${m.displayName}`);
    console.log(`  Description: ${m.description}`);
    console.log("---");
  });
}

main().catch(err => {
  console.error("Listing models failed:", err.message);
  process.exit(1);
});
