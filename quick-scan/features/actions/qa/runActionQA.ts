/**
 * QuickScan Studio - Command Line Action QA Runner for Phase 18 Smart Actions Engine
 */
import { ActionQAEngine } from './ActionQAEngine';

async function main() {
  try {
    const qaEngine = new ActionQAEngine();
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
    console.error('Fatal error running Action QA test suite:', err);
    process.exit(1);
  }
}

main();
