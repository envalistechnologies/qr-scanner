/**
 * QuickScan Enterprise Studio - Global Console & Notification Suppressor
 * Must be imported as the VERY FIRST module in app entry point to intercept warnings emitted during initial static dependency evaluation
 */

try {
  // Attempt to ignore on-screen React Native LogBox toasts for known benign Expo Go dev notifications
  const { LogBox } = require('react-native');
  if (LogBox && typeof LogBox.ignoreLogs === 'function') {
    LogBox.ignoreLogs([
      'Due to changes in Androids permission requirements',
      'Native MMKV JSI unavailable',
      'Expo AV has been deprecated',
    ]);
  }
} catch {
  // Ignore in Node / headless testing environments
}

const ignoredSnippets = [
  'Due to changes in Androids permission requirements',
  'Native MMKV JSI unavailable',
  'Expo AV has been deprecated',
];

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const text = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  if (ignoredSnippets.some((snippet) => text.includes(snippet))) {
    return;
  }
  originalWarn.apply(console, args as any);
};

const originalLog = console.log;
console.log = (...args: any[]) => {
  const text = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  if (ignoredSnippets.some((snippet) => text.includes(snippet))) {
    return;
  }
  originalLog.apply(console, args as any);
};

export {};
