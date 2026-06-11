const { PrismaClient } = require('@prisma/client');
const documentService = require('./src/services/documentService');
const vectorStore = require('./src/rag/vectorStore');

const prisma = new PrismaClient();

async function main() {
  const documents = await prisma.document.findMany({});
  console.log(`Found ${documents.length} documents to reprocess...`);

  for (const doc of documents) {
    console.log(`Reprocessing document: ${doc.originalFilename} (ID: ${doc.id}, Owner: ${doc.ownerId})...`);
    
    // Clear old vectors first to avoid duplication
    try {
      await vectorStore.deleteDocumentVectors(doc.ownerId, doc.id);
      console.log(`- Cleared old vectors`);
    } catch (err) {
      console.error(`- Failed to clear old vectors: ${err.message}`);
    }

    // Reprocess document (extracts text, chunks it, embeds it and updates DB state)
    try {
      await documentService.processDocument(doc.id, doc.ownerId);
      console.log(`- Reprocessed successfully`);
    } catch (err) {
      console.error(`- Failed to reprocess: ${err.message}`);
    }
  }

  console.log("All documents reprocessed.");
}

main()
  .catch(err => {
    console.error("Critical error in reprocess script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
