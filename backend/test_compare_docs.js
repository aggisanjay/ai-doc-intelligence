const docService = require('./src/services/documentService');
const textExtractor = require('./src/rag/textExtractor');
const llmService = require('./src/services/llmService');

const docAId = "dfe7cf3d-7b2d-4dd0-82a9-e3101c1c5070";
const docBId = "ffd6422a-0752-4f1d-83ea-31bdaf9d7149";

async function main() {
  console.log("Loading document records from database...");
  const docA = await docService.getDocument(docAId, "4d817cf9-ff31-4429-85e8-b64bded92f09");
  const docB = await docService.getDocument(docBId, "4d817cf9-ff31-4429-85e8-b64bded92f09");
  
  console.log(`Document A: ${docA.originalFilename} (Status: ${docA.status})`);
  console.log(`Document B: ${docB.originalFilename} (Status: ${docB.status})`);
  
  console.log("Extracting text for Document A...");
  const pagesA = await textExtractor.extract(docA.filePath, docA.originalFilename);
  const textA = pagesA.map(p => p.text).join('\n');
  console.log(`  Extracted ${textA.length} characters.`);
  
  console.log("Extracting text for Document B...");
  const pagesB = await textExtractor.extract(docB.filePath, docB.originalFilename);
  const textB = pagesB.map(p => p.text).join('\n');
  console.log(`  Extracted ${textB.length} characters.`);
  
  console.log("Executing comparison via Gemini LLM Service...");
  const result = await llmService.compareDocuments(textA, textB);
  console.log("Comparison completed!");
  console.log("Result keys:", Object.keys(result));
  console.log("Similarity Score:", result.similarityScore);
  console.log("Summary:", result.executiveSummary);
}

main().catch(err => {
  console.error("Comparison execution failed:");
  console.error(err.stack);
  process.exit(1);
});
