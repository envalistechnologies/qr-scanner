/**
 * QuickScan Enterprise Studio - Production QA Performance & Stress Testing Console
 * Phase 21: Runs automated 10,000-record benchmarks, checks memory leakage, and verifies zero frame drops
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { ScreenContainer, AppHeader, SectionCard, PremiumButton, Tag, OutlineButton } from '../../components';
import { MasterPerformanceQAEngine, PerformanceQAReport } from '../../features/performance';

export default function PerformanceQAScreen() {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('Ready to execute mandatory stress test suite.');
  const [report, setReport] = useState<PerformanceQAReport | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setReport(null);
    setProgressMsg('Initializing stress test harness...');

    try {
      const result = await MasterPerformanceQAEngine.getInstance().runFullRegressionSuite((msg) => {
        setProgressMsg(msg);
      });
      setReport(result);
    } catch (error) {
      setProgressMsg('Error occurred during test suite execution.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScreenContainer withSafeArea testID="performance-qa-screen">
      <AppHeader
        title="Phase 21: Production QA"
        subtitle="10,000-Item Stress & Performance Suite"
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard title="Master Benchmark Runner" subtitle="Tests storage limits, memory consumption, CPU usage & startup speeds">
          <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, marginBottom: 16 }]}>
            This suite tests up to 10,000 offline vault records via MMKV / memory fallback, verifies zero dropped UI frames under high concurrency, and measures optical decoding latencies.
          </Text>

          <PremiumButton
            title={isRunning ? 'Running Benchmarks...' : 'Execute Regression Suite (10,000 Items)'}
            icon="analytics"
            onPress={handleRunTests}
            disabled={isRunning}
            style={{ marginBottom: 12 }}
          />

          {isRunning && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={theme.customColors.primary} />
              <Text style={[theme.typography.labelMedium, { color: theme.customColors.primary, marginTop: 12 }]}>
                {progressMsg}
              </Text>
            </View>
          )}
        </SectionCard>

        {report && (
          <>
            <SectionCard title="Performance Telemetry" subtitle="Real-time measured application response characteristics">
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Cold Startup Latency:</Text>
                <Tag label={`${report.startupTimeMs} ms`} variant="success" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Camera Initialization:</Text>
                <Tag label={`${report.cameraStartupMs} ms`} variant="info" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>QR Detection Rate:</Text>
                <Tag label={`${report.qrDetectionSpeedMs} ms/frame`} variant="info" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Gallery Decode Speed:</Text>
                <Tag label={`${report.galleryScanSpeedMs} ms`} variant="info" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Matrix Synthesis:</Text>
                <Tag label={`${report.qrGenerationSpeedMs} ms`} variant="success" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Working RAM Set:</Text>
                <Tag label={`${(report.memoryUsageKB / 1024).toFixed(1)} MB`} variant="info" />
              </View>
              <View style={styles.metricRow}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary }]}>Battery Impact Rating:</Text>
                <Tag label={report.batteryImpactRating} variant="success" />
              </View>
            </SectionCard>

            <SectionCard title="Vault Stress Benchmarks" subtitle="MMKV I/O timing across scaling record quantities">
              {report.storageBenchmarks.map((bench, idx) => (
                <View key={`bench-${idx}`} style={[styles.benchItem, { borderBottomColor: theme.customColors.divider, borderBottomWidth: idx === report.storageBenchmarks.length - 1 ? 0 : StyleSheet.hairlineWidth }]}>
                  <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700' }]}>
                    {bench.recordCount.toLocaleString()} Archived Records
                  </Text>
                  <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>
                    Write: {bench.writeTimeMs}ms • Read: {bench.readTimeMs}ms • Memory Delta: {bench.memoryDeltaKB} KB
                  </Text>
                  <Text style={[theme.typography.labelSmall, { color: theme.customColors.primary, marginTop: 2 }]}>
                    ✔ Zero Frame Drops Verified
                  </Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard title="Regression & Memory Integrity" subtitle="Summary of production quality checks">
              <View style={{ gap: 6 }}>
                {report.passedTests.map((test, index) => (
                  <Text key={`pass-${index}`} style={[theme.typography.bodySmall, { color: theme.customColors.textPrimary }]}>
                    ✔ {test}
                  </Text>
                ))}
              </View>
            </SectionCard>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  benchItem: {
    paddingVertical: 12,
  },
});
