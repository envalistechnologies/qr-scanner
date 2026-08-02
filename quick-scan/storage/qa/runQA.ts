/**
 * QuickScan Studio - Command Line QA Runner for Phase 17 Storage Engine
 */
import { StorageQAEngine } from './StorageQAEngine';

async function main() {
  try {
    const qaEngine = new StorageQAEngine();
    const report = await qaEngine.runFullTestSuite();
    console.log('\n\n=========================================================');
    console.log('                 FINAL QA TESTING REPORT                 ');
    console.log('=========================================================\n');
    console.log(report.formattedText);

    if (report.failedTests.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error running QA test suite:', err);
    process.exit(1);
  }
}

main();
