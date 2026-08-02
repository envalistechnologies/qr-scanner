/**
 * QuickScan Enterprise Studio - CLI Executable Runner for Phase 20 AdMob QA
 */
import { AdQAEngine } from './AdQAEngine';

async function main() {
  const engine = new AdQAEngine();
  const res = await engine.runFullVerificationSuite();
  if (res.failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[runAdQA] Unhandled fatal exception during test execution:', err);
  process.exit(1);
});
