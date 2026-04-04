const fs = require('fs');
const path = require('path');
const { moveFile } = require('./backend/src/utils/helpers');

async function test() {
  const src = path.join(__dirname, 'test_src.txt');
  const dest = path.join(__dirname, 'test_dest.txt');

  try {
    // 1. Test Normal Move
    fs.writeFileSync(src, 'test content');
    console.log('Testing normal move...');
    await moveFile(src, dest);
    if (fs.existsSync(dest) && !fs.existsSync(src)) {
      console.log('✅ Normal move SUCCESS');
    } else {
      console.error('❌ Normal move FAILED');
    }
    if (fs.existsSync(dest)) fs.unlinkSync(dest);

    // 2. Test EXDEV Fallback
    fs.writeFileSync(src, 'test content');
    console.log('Testing EXDEV move fallback...');
    
    // Mock fs.promises.rename to throw EXDEV
    const originalRename = fs.promises.rename;
    fs.promises.rename = async () => {
      const err = new Error('EXDEV: cross-device link not permitted');
      err.code = 'EXDEV';
      throw err;
    };

    try {
      await moveFile(src, dest);
      if (fs.existsSync(dest) && !fs.existsSync(src)) {
        console.log('✅ EXDEV fallback SUCCESS');
      } else {
        console.error('❌ EXDEV fallback FAILED (files missing or src still exists)');
      }
    } catch (err) {
      console.error('❌ EXDEV fallback FAILED with error:', err);
    } finally {
      fs.promises.rename = originalRename;
    }

  } catch (err) {
    console.error('Unexpected error during test:', err);
  } finally {
    if (fs.existsSync(src)) fs.unlinkSync(src);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
  }
}

test();
