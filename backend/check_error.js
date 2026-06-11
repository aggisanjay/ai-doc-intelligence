const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent documents and failure states:");
  docs.forEach(d => {
    console.log(`- Filename: ${d.originalFilename}`);
    console.log(`  Status: ${d.status}`);
    console.log(`  Error Message: ${d.errorMessage}`);
    console.log(`  File Path: ${d.filePath}`);
    const fs = require('fs');
    console.log(`  File exists on disk: ${fs.existsSync(d.filePath)}`);
  });
}

main().catch(err => {
  console.error("Failed to check errors:", err.message);
  process.exit(1);
});
