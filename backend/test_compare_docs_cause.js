const docService = require('./src/services/documentService');
const textExtractor = require('./src/rag/textExtractor');
const llmService = require('./src/services/llmService');

const docAId = "dfe7cf3d-7b2d-4dd0-82a9-e3101c1c5070";
const docBId = "ffd6422a-0752-4f1d-83ea-31bdaf9d7149";

async function main() {
  const docA = await docService.getDocument(docAId, "4d817cf9-ff31-4429-85e8-b64bded92f09");
  const docB = await docService.getDocument(docBId, "4d817cf9-ff31-4429-85e8-b64bded92f09");
  
  const pagesA = await textExtractor.extract(docA.filePath, docA.originalFilename);
  const textA = pagesA.map(p => p.text).join('\n');
  
  const pagesB = await textExtractor.extract(docB.filePath, docB.originalFilename);
  const textB = pagesB.map(p => p.text).join('\n');
  
  console.log("Executing comparison...");
  try {
    await llmService.compareDocuments(textA, textB);
  } catch (err) {
    console.error("Comparison failed!");
    console.error("Error Message:", err.message);
    if (err.cause) {
      console.error("Error Cause (raw socket/fetch details):", err.cause);
    } else {
      console.error("No cause attached to error.");
    }
    process.exit(1);
  }
}

main().catch(console.error);
