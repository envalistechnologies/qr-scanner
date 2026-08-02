/**
 * QuickScan Studio - Phase 19 CLI Test Executable
 * Runs automated Settings QA Verification suite via Node TSX
 */
import { SettingsQAEngine } from './SettingsQAEngine';

async function run() {
  try {
    const qa = new SettingsQAEngine();
    const result = await qa.runFullVerificationSuite();
    if (result.failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('[runSettingsQA] Unhandled test exception:', err);
    process.exit(1);
  }
}

run();
