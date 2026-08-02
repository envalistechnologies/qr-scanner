import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { SettingsService } from '../../features/settings/SettingsService';
import { ShareService, ClipboardService } from '../../services';
import { StorageService } from '../../storage/StorageService';
import { SUPPORTED_LOCALES } from '../../features/settings/localization/dictionaries';
import {
  ScreenContainer,
  AppHeader,
  Card,
  SettingRow,
  BottomSheet,
  ListItem,
  Dialog,
  Icon,
  OutlineButton,
} from '../../components';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { t, locale, setLocale, supportedLanguages } = useLocalization();
  const settingsSvc = useMemo(() => SettingsService.getInstance(), []);

  // Preferences interactive state (Synced with offline vault)
  const [autoFlash, setAutoFlash] = useState<boolean>(false);
  const [vibration, setVibration] = useState<boolean>(true);
  const [sound, setSound] = useState<boolean>(true);
  const [animations, setAnimations] = useState<boolean>(true);
  const [compactMode, setCompactMode] = useState<boolean>(false);

  // Dropdown interactive state
  const [defaultScanMode, setDefaultScanMode] = useState<string>('Auto Detect');
  const [defaultQrType, setDefaultQrType] = useState<string>('Website URL');

  // Modal / Sheet visibility states
  const [themeSheetVisible, setThemeSheetVisible] = useState<boolean>(false);
  const [langSheetVisible, setLangSheetVisible] = useState<boolean>(false);
  const [moreSheetVisible, setMoreSheetVisible] = useState<boolean>(false);
  const [scanModeSheetVisible, setScanModeSheetVisible] = useState<boolean>(false);
  const [qrTypeSheetVisible, setQrTypeSheetVisible] = useState<boolean>(false);
  const [exportSheetVisible, setExportSheetVisible] = useState<boolean>(false);
  const [importSheetVisible, setImportSheetVisible] = useState<boolean>(false);
  const [permissionsSheetVisible, setPermissionsSheetVisible] = useState<boolean>(false);
  const [tosSheetVisible, setTosSheetVisible] = useState<boolean>(false);

  // Dialog triggers
  const [activeDialog, setActiveDialog] = useState<
    'none' | 'reset_settings' | 'clear_history' | 'clear_favorites' | 'delete_all' | 'backup_done' | 'restore_confirm' | 'action_success'
  >('none');

  useEffect(() => {
    let isMounted = true;
    const initSettings = async () => {
      if (isMounted) {
        const stored = await settingsSvc.getSettings();
        if (stored) {
          setAutoFlash(Boolean(stored.autoFlash));
          setVibration(stored.vibration ?? true);
          setSound(stored.sound ?? true);
          setAnimations(stored.animationPreference ?? true);

          // Map scan mode to UI readable text
          const sm = stored.defaultScanMode;
          if (sm === 'QR') setDefaultScanMode('QR Matrix Focused');
          else if (sm === 'BARCODE') setDefaultScanMode('Retail Barcode Only');
          else if (sm === 'BATCH') setDefaultScanMode('Batch Vault Scan');
          else setDefaultScanMode('Auto Detect All Codes');

          // Map QR type
          const qt = String(stored.defaultQrType || 'URL');
          if (qt === 'WIFI') setDefaultQrType('Wi-Fi Network Access');
          else if (qt === 'VCARD') setDefaultQrType('vCard 3.0 Contact');
          else if (qt === 'TEXT') setDefaultQrType('Plain Text String');
          else if (qt === 'PHONE') setDefaultQrType('Business Phone Call');
          else if (qt === 'EMAIL') setDefaultQrType('Email Composer');
          else setDefaultQrType('Website URL');
        }
      }
    };
    initSettings();
    return () => {
      isMounted = false;
    };
  }, [settingsSvc]);

  const getThemeSubtitle = () => {
    if (themeMode === 'dark') return 'Dark Theme • OLED Friendly';
    if (themeMode === 'light') return 'Light Theme • Studio Visibility';
    return 'System Default • Automatic OS Matching';
  };

  return (
    <ScreenContainer scrollable withSafeArea testID="settings-main-screen">
      {/* 1. HEADER */}
      <AppHeader
        title={t('settings_header', 'Settings & Preferences')}
        subtitle={t('settings_subtitle', 'QuickScan Studio Configuration')}
        showBack={true}
        showMore={true}
        onMore={() => setMoreSheetVisible(true)}
      />

      {/* 2. PROFILE SECTION */}
      <Card
        variant="elevated"
        elevationLevel={2}
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.customColors.surface,
            borderRadius: theme.radius[20],
            padding: theme.spacing[20],
            marginTop: theme.spacing[16],
            marginBottom: theme.spacing[24],
          },
        ]}
      >
        <Pressable
          onPress={() => router.push('/(screens)/about' as any)}
          style={styles.profileRow}
          accessibilityLabel="Open About QuickScan studio"
        >
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: theme.customColors.primaryContainer, borderRadius: 22 },
            ]}
          >
            <Icon name="myQr" size={38} color={theme.customColors.primary} />
          </View>
          <View style={styles.profileTextWrap}>
            <Text style={[theme.typography.headlineMedium, { color: theme.customColors.textPrimary, fontWeight: '800' }]} numberOfLines={1}>
              {t('app_title', 'QuickScan')}
            </Text>
            <Text style={[theme.typography.labelMedium, { color: theme.customColors.primary, fontWeight: '700', marginTop: 3 }]}>
              Version 1.0.0
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 6 }]} numberOfLines={2}>
              High-speed AI optical scanning, offline archiving & design suite. Software Development & Digital Marketing.
            </Text>
          </View>
        </Pressable>
      </Card>

      {/* 3. GENERAL SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        {t('sec_general', 'GENERAL PREFERENCES')}
      </Text>
      <View style={[styles.sectionGroup, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingVertical: theme.spacing[14], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[28] }]}>
        <SettingRow
          title={t('appearance_theme', 'Appearance Theme')}
          subtitle={getThemeSubtitle()}
          icon="palette"
          type="chevron"
          onPress={() => setThemeSheetVisible(true)}
        />
        <SettingRow
          title={t('language_select', 'Language Selection')}
          subtitle={`${SUPPORTED_LOCALES[locale]?.nativeName || 'English'} (${SUPPORTED_LOCALES[locale]?.name || 'United States'})`}
          icon="language"
          type="chevron"
          onPress={() => setLangSheetVisible(true)}
        />
        <SettingRow
          title={t('scan_preferences', 'Scan Engine Configuration')}
          subtitle="Precision viewfinder target resolution & shutter AI"
          icon="camera"
          type="chevron"
          onPress={() => router.push('/(screens)/scanner' as any)}
        />
        <SettingRow
          title={t('scan_history', 'Scan History Archive')}
          subtitle="Manage automatic offline record logging & quotas"
          icon="history"
          type="chevron"
          onPress={() => router.push('/(tabs)/history' as any)}
        />
        <SettingRow
          title={t('favorites_vault', 'Saved Favorites Vault')}
          subtitle="Configure personal starred bookmarks & export vaults"
          icon="favorite"
          type="chevron"
          showDivider={false}
          onPress={() => router.push('/(screens)/favorites' as any)}
        />
      </View>

      {/* 4. PREFERENCES SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        {t('sec_hardware', 'HARDWARE & INTERACTION PREFERENCES')}
      </Text>
      <View style={[styles.sectionGroup, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingVertical: theme.spacing[14], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[28] }]}>
        <SettingRow
          title={t('default_scan_mode', 'Default Scan Mode')}
          subtitle="Initial optical mode when opening live scanner"
          icon="target"
          type="dropdown"
          dropdownValue={defaultScanMode}
          onPress={() => setScanModeSheetVisible(true)}
        />
        <SettingRow
          title={t('generator_preferences', 'Default QR Generator Type')}
          subtitle="Preferred template when opening design studio"
          icon="generator"
          type="dropdown"
          dropdownValue={defaultQrType}
          onPress={() => setQrTypeSheetVisible(true)}
        />
        <SettingRow
          title={t('auto_flash', 'Automatic Torch / Flashlight')}
          subtitle="Illuminate LEDs automatically in low-light environments"
          icon="flashlight"
          type="switch"
          switchValue={autoFlash}
          onSwitchChange={(val) => {
            setAutoFlash(val);
            settingsSvc.updateSetting('autoFlash', val);
          }}
        />
        <SettingRow
          title={t('haptic_feedback', 'Haptic Vibration Feedback')}
          subtitle="Tactile vibration buzz upon optical code recognition"
          icon="vibrate"
          type="switch"
          switchValue={vibration}
          onSwitchChange={(val) => {
            setVibration(val);
            settingsSvc.updateSetting('vibration', val);
            settingsSvc.updateSetting('hapticFeedback', val);
          }}
        />
        <SettingRow
          title={t('audio_bleep', 'Audible Bleep Tone')}
          subtitle="Play signature chime on successful code capture"
          icon="sound"
          type="switch"
          switchValue={sound}
          onSwitchChange={(val) => {
            setSound(val);
            settingsSvc.updateSetting('sound', val);
            settingsSvc.updateSetting('audioFeedback', val);
          }}
        />
        <SettingRow
          title={t('high_fps_anim', 'High Frame-Rate Animations')}
          subtitle="Enable Reanimated spring micro-interactions at 120 FPS"
          icon="animation"
          type="switch"
          switchValue={animations}
          onSwitchChange={(val) => {
            setAnimations(val);
            settingsSvc.updateSetting('animationPreference', val);
          }}
        />
        <SettingRow
          title={t('compact_list', 'Compact List Mode')}
          subtitle="Condensed item spacing for high-density scan records"
          icon="compact"
          type="switch"
          switchValue={compactMode}
          onSwitchChange={(val) => setCompactMode(val)}
          showDivider={false}
        />
      </View>

      {/* 5. DATA SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        {t('sec_data', 'DATA MANAGEMENT & BACKUP')}
      </Text>
      <View style={[styles.sectionGroup, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingVertical: theme.spacing[14], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[28] }]}>
        <SettingRow
          title={t('export_data', 'Export Scan Archive')}
          subtitle="Generate complete portable dataset as JSON / CSV"
          icon="export"
          type="chevron"
          onPress={() => setExportSheetVisible(true)}
        />
        <SettingRow
          title={t('import_data', 'Import External Archive')}
          subtitle="Restore scanned payloads from a saved backup file"
          icon="import"
          type="chevron"
          onPress={() => setImportSheetVisible(true)}
        />
        <SettingRow
          title={t('backup_now', 'Create Local Database Backup')}
          subtitle="Save secure snapshot to internal device filesystem"
          icon="backup"
          type="chevron"
          onPress={() => {
            settingsSvc.getBackupEngine().createLocalBackup();
            setActiveDialog('backup_done');
          }}
        />
        <SettingRow
          title={t('restore_backup', 'Restore Vault Snapshot')}
          subtitle="Revert preferences and history from existing snapshot"
          icon="restore"
          type="chevron"
          onPress={() => setActiveDialog('restore_confirm')}
        />
        <SettingRow
          title={t('clear_history', 'Clear Scan History')}
          subtitle="Wipe all un-pinned scan entries from offline storage"
          icon="delete"
          type="chevron"
          destructive
          onPress={() => setActiveDialog('clear_history')}
        />
        <SettingRow
          title={t('clear_favorites', 'Clear Favorites Vault')}
          subtitle="Permanently obliterate all bookmarked scan profiles"
          icon="delete"
          type="chevron"
          destructive
          showDivider={false}
          onPress={() => setActiveDialog('clear_favorites')}
        />
      </View>

      {/* 6. SECURITY & PRIVACY SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        {t('sec_security', 'SECURITY & PRIVACY')}
      </Text>
      <View style={[styles.sectionGroup, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingVertical: theme.spacing[14], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[28] }]}>
        <SettingRow
          title={t('privacy_policy', 'Privacy Policy')}
          subtitle="Learn how code payloads remain locally strictly offline"
          icon="privacy"
          type="chevron"
          onPress={() => router.push('/(screens)/privacy-policy' as any)}
        />
        <SettingRow
          title={t('device_permissions', 'Device Permissions')}
          subtitle="Camera viewfinder, Gallery images & Storage privileges"
          icon="secure"
          type="chevron"
          onPress={() => setPermissionsSheetVisible(true)}
        />
        <SettingRow
          title={t('terms_of_service', 'Terms of Service')}
          subtitle="End-user software licensing terms & usage guidelines"
          icon="info"
          type="chevron"
          showDivider={false}
          onPress={() => setTosSheetVisible(true)}
        />
      </View>

      {/* 7. SUPPORT, ABOUT & FEEDBACK SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        {t('sec_support', 'STUDIO SUPPORT & ABOUT')}
      </Text>
      <View style={[styles.sectionGroup, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingVertical: theme.spacing[14], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[32] }]}>
        <SettingRow
          title={t('about_quickscan', 'About QuickScan')}
          subtitle="Envalis Technologies • Application Architecture"
          icon="info"
          type="chevron"
          onPress={() => router.push('/(screens)/about' as any)}
        />
        <SettingRow
          title={t('help_support', 'Help & Support Center')}
          subtitle="Interactive FAQ cards, tutorials & troubleshooting answers"
          icon="help"
          type="chevron"
          onPress={() => router.push('/(screens)/help-support' as any)}
        />
        <SettingRow
          title={t('submit_feedback', 'Submit User Feedback')}
          subtitle="Send ideas, design suggestions or praise to our product team"
          icon="sms"
          type="chevron"
          onPress={() => router.push('/(screens)/feedback' as any)}
        />
        <SettingRow
          title={t('report_bug', 'Report Technical Bug')}
          subtitle="Submit crash analytics or camera incompatibility logs"
          icon="bug"
          type="chevron"
          onPress={() => router.push('/(screens)/feedback' as any)}
        />
        <SettingRow
          title={t('contact_envalis', 'Contact Envalis Technologies')}
          subtitle="envalistechnologies@gmail.com • Software Development & Digital Marketing"
          icon="email"
          type="chevron"
          onPress={() => { }}
        />
        <SettingRow
          title={t('rate_app', 'Rate QuickScan Studio 5 ★')}
          subtitle="Help support continuous development & feature upgrades"
          icon="rate"
          type="chevron"
          onPress={() => router.push('/(screens)/rate-app' as any)}
        />
        <SettingRow
          title={t('share_app', 'Share App with Friends')}
          subtitle="Share install invite links across enterprise teams"
          icon="share"
          type="chevron"
          onPress={() => { }}
        />
        <SettingRow
          title={t('technical_info', 'Technical App Information')}
          subtitle="Detailed build diagnostics, React Native & Expo SDK runtime"
          icon="appInfo"
          type="chevron"
          showDivider={true}
          onPress={() => router.push('/(screens)/app-information' as any)}
        />
        <SettingRow
          title="Phase 21: Production QA & Benchmarking"
          subtitle="Run 10,000-item stress tests & inspect real-time performance telemetry"
          icon="analytics"
          type="chevron"
          showDivider={false}
          onPress={() => router.push('/(screens)/performance-qa' as any)}
        />
      </View>

      <View style={{ height: theme.spacing[24] }} />

      {/* --- THEME SELECTION BOTTOM SHEET --- */}
      <BottomSheet
        visible={themeSheetVisible}
        onClose={() => setThemeSheetVisible(false)}
        title={t('appearance_theme', 'Select Appearance Theme')}
      >
        <View style={styles.sheetContent}>
          {[
            { mode: 'system', title: 'System Default', desc: 'Automatically match iOS / Android os color theme' },
            { mode: 'dark', title: 'Dark Theme (OLED Friendly)', desc: 'Sleek neutral dark surfaces with vibrant blue accents' },
            { mode: 'light', title: 'Light Theme (Studio Clean)', desc: 'Clean bright layout for high-visibility environments' },
          ].map((item) => (
            <ListItem
              key={item.mode}
              title={item.title}
              subtitle={item.desc}
              leadingIcon={themeMode === item.mode ? 'check' : 'palette'}
              onPress={() => {
                setThemeMode(item.mode as any);
                setThemeSheetVisible(false);
              }}
            />
          ))}
          <OutlineButton title={t('cancel', 'Cancel')} icon="close" onPress={() => setThemeSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- LANGUAGE SELECTION BOTTOM SHEET --- */}
      <BottomSheet
        visible={langSheetVisible}
        onClose={() => setLangSheetVisible(false)}
        title={t('language_select', 'Select Language / Idioma / 語')}
      >
        <View style={styles.sheetContent}>
          {supportedLanguages.map((lang) => (
            <ListItem
              key={lang.code}
              title={`${lang.nativeName} (${lang.name.split(' ')[0]})`}
              subtitle={`Locale Code: ${lang.code}`}
              leadingIcon={locale === lang.code ? 'check' : 'language'}
              onPress={async () => {
                await setLocale(lang.code);
                setLangSheetVisible(false);
              }}
            />
          ))}
          <OutlineButton title={t('cancel', 'Cancel')} icon="close" onPress={() => setLangSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- REUSABLE MORE OPTIONS BOTTOM SHEET --- */}
      <BottomSheet
        visible={moreSheetVisible}
        onClose={() => setMoreSheetVisible(false)}
        title="Settings & System Management"
      >
        <View style={styles.sheetContent}>
          <ListItem
            title={t('reset_all_pref', 'Reset All Preferences')}
            subtitle="Revert hardware switches & toggles to initial defaults"
            leadingIcon="reset"
            onPress={() => {
              setMoreSheetVisible(false);
              setActiveDialog('reset_settings');
            }}
          />
          <ListItem
            title={t('factory_reset', 'Restore Factory Settings')}
            subtitle="Wipe customized modes and return to clean slate"
            leadingIcon="refresh"
            onPress={() => {
              setMoreSheetVisible(false);
              setActiveDialog('reset_settings');
            }}
          />
          <ListItem
            title="Delete All Vault Data"
            subtitle="Purge history, favorites and logs immediately"
            leadingIcon="delete"
            onPress={() => {
              setMoreSheetVisible(false);
              setActiveDialog('delete_all');
            }}
          />
          <ListItem
            title={t('share_app', 'Share App Installation')}
            subtitle="Transmit application APK or store link to peers"
            leadingIcon="share"
            onPress={() => {
              setMoreSheetVisible(false);
            }}
          />
          <ListItem
            title={t('rate_app', 'Rate Quick Scan')}
            subtitle="Open 5-star Google Play / App Store review dialog"
            leadingIcon="rate"
            onPress={() => {
              setMoreSheetVisible(false);
              router.push('/(screens)/rate-app' as any);
            }}
          />

          <View style={{ height: theme.spacing[12] }} />
          <OutlineButton title={t('cancel', 'Cancel')} icon="close" onPress={() => setMoreSheetVisible(false)} fullWidth />
        </View>
      </BottomSheet>

      {/* --- SCAN MODE DROPDOWN SHEET --- */}
      <BottomSheet
        visible={scanModeSheetVisible}
        onClose={() => setScanModeSheetVisible(false)}
        title="Select Default Scan Mode"
      >
        <View style={styles.sheetContent}>
          {[
            { label: 'Auto Detect All Codes', val: 'AUTO' },
            { label: 'QR Matrix Focused', val: 'QR' },
            { label: 'Retail Barcode Only', val: 'BARCODE' },
            { label: 'Batch Vault Scan', val: 'BATCH' },
          ].map((mode) => (
            <ListItem
              key={mode.val}
              title={mode.label}
              leadingIcon={defaultScanMode === mode.label ? 'check' : 'target'}
              onPress={() => {
                setDefaultScanMode(mode.label);
                settingsSvc.updateSetting('defaultScanMode', mode.val as any);
                setScanModeSheetVisible(false);
              }}
            />
          ))}
          <OutlineButton title={t('close', 'Close')} icon="close" onPress={() => setScanModeSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- QR TYPE DROPDOWN SHEET --- */}
      <BottomSheet
        visible={qrTypeSheetVisible}
        onClose={() => setQrTypeSheetVisible(false)}
        title="Select Default Generator Type"
      >
        <View style={styles.sheetContent}>
          {[
            { label: 'Website URL', val: 'URL' },
            { label: 'Wi-Fi Network Access', val: 'WIFI' },
            { label: 'vCard 3.0 Contact', val: 'VCARD' },
            { label: 'Plain Text String', val: 'TEXT' },
            { label: 'Business Phone Call', val: 'PHONE' },
            { label: 'Email Composer', val: 'EMAIL' },
          ].map((type) => (
            <ListItem
              key={type.val}
              title={type.label}
              leadingIcon={defaultQrType === type.label ? 'check' : 'generator'}
              onPress={() => {
                setDefaultQrType(type.label);
                settingsSvc.updateSetting('defaultQrType', type.val as any);
                setQrTypeSheetVisible(false);
              }}
            />
          ))}
          <OutlineButton title={t('close', 'Close')} icon="close" onPress={() => setQrTypeSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- EXPORT ARCHIVE SHEET --- */}
      <BottomSheet
        visible={exportSheetVisible}
        onClose={() => setExportSheetVisible(false)}
        title={t('export_data', 'Select Export Format')}
      >
        <View style={styles.sheetContent}>
          <ListItem
            title="JSON Portable Archive"
            subtitle="Structured backup manifest (History, Favorites & Settings)"
            leadingIcon="export"
            onPress={async () => {
              setExportSheetVisible(false);
              const res = await settingsSvc.getExportEngine().exportToJson();
              if (res.success && res.data) {
                await ShareService.getInstance().shareText(res.data, 'QuickScan_Backup_Archive.json');
              } else {
                Alert.alert('Export Failed', res.error || 'Failed generating backup archive.');
              }
            }}
          />
          <ListItem
            title="CSV Tabular Dataset"
            subtitle="Spreadsheet format compatible with Excel and Google Sheets"
            leadingIcon="export"
            onPress={async () => {
              setExportSheetVisible(false);
              const res = await settingsSvc.getExportEngine().exportToCsv('history');
              if (res.success && res.data) {
                await ShareService.getInstance().shareText(res.data, 'QuickScan_History_Export.csv');
              } else {
                Alert.alert('Export Failed', res.error || 'Failed generating CSV file.');
              }
            }}
          />
          <OutlineButton title={t('cancel', 'Cancel')} icon="close" onPress={() => setExportSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- IMPORT ARCHIVE SHEET --- */}
      <BottomSheet
        visible={importSheetVisible}
        onClose={() => setImportSheetVisible(false)}
        title={t('import_data', 'Select Backup Source')}
      >
        <View style={styles.sheetContent}>
          <ListItem
            title="Import from Device Clipboard"
            subtitle="Paste and restore an exported JSON string from your clipboard"
            leadingIcon="copy"
            onPress={async () => {
              setImportSheetVisible(false);
              const clipText = await ClipboardService.getInstance().readFromClipboard();
              if (!clipText || (!clipText.includes('history') && !clipText.includes('favorites'))) {
                Alert.alert('Import Notice', 'No valid QuickScan JSON backup found in your clipboard. Copy an exported JSON archive string first.');
                return;
              }
              const res = await settingsSvc.getImportEngine().importJsonData(clipText);
              if (res.success) {
                StorageService.getInstance().notifyVaultChange();
                Alert.alert('Import Successful', `Restored ${res.importedCounts.history} History items and ${res.importedCounts.favorites} Favorites!`);
              } else {
                Alert.alert('Import Failed', res.error || 'Invalid JSON format.');
              }
            }}
          />
          <ListItem
            title="Restore Local Internal Backup"
            subtitle="Revert data from your latest internal storage snapshot"
            leadingIcon="restore"
            onPress={async () => {
              setImportSheetVisible(false);
              const res = await settingsSvc.getBackupEngine().restoreFromLocalBackup();
              if (res.success) {
                StorageService.getInstance().notifyVaultChange();
                Alert.alert('Restore Successful', `Restored ${res.importedCounts.history} History items and ${res.importedCounts.favorites} Favorites!`);
              } else {
                Alert.alert('Restore Notice', res.error || 'No valid internal backup snapshot found.');
              }
            }}
          />
          <OutlineButton title={t('cancel', 'Cancel')} icon="close" onPress={() => setImportSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- PERMISSIONS SHEET --- */}
      <BottomSheet
        visible={permissionsSheetVisible}
        onClose={() => setPermissionsSheetVisible(false)}
        title={t('device_permissions', 'Hardware Permissions')}
      >
        <View style={styles.sheetContent}>
          <ListItem title="Camera Shutter & Viewfinder" subtitle="Required for live optical QR decoding • ACTIVE" leadingIcon="camera" />
          <ListItem title="Photo Album & Gallery" subtitle="Required to scan saved static images • ACTIVE" leadingIcon="gallery" />
          <ListItem title="Local Storage Vault" subtitle="Required for zero-latency offline history • ACTIVE" leadingIcon="folder" />
          <OutlineButton title={t('done', 'Done')} icon="check" onPress={() => setPermissionsSheetVisible(false)} fullWidth style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      {/* --- TERMS OF SERVICE SHEET --- */}
      <BottomSheet
        visible={tosSheetVisible}
        onClose={() => setTosSheetVisible(false)}
        title={t('terms_of_service', 'Terms of Service Agreement')}
      >
        <View style={styles.sheetContent}>
          <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, lineHeight: 22, marginBottom: 16 }]}>
            QuickScan Studio is software licensed under the Material 3 developer distribution guidelines. By operating this workstation, you acknowledge that all optical visual scanning occurs strictly upon local device silicon without external network extraction.
          </Text>
          <OutlineButton title={t('done', 'I Acknowledge')} icon="check" onPress={() => setTosSheetVisible(false)} fullWidth />
        </View>
      </BottomSheet>

      {/* --- NATIVE DIALOG DESIGNS --- */}
      <Dialog
        visible={activeDialog === 'reset_settings'}
        title={t('reset_all_pref', 'Reset All Preferences?')}
        message="This action will restore default toggle switches for Auto Flash, Vibration haptics, Audio chimes, and Default Scan Modes. Your saved scans and favorites will NOT be deleted."
        primaryButtonText="Reset Preferences"
        secondaryButtonText={t('cancel', 'Cancel')}
        onPrimaryPress={async () => {
          await settingsSvc.resetSettings();
          setAutoFlash(false);
          setVibration(true);
          setSound(true);
          setAnimations(true);
          setCompactMode(false);
          setActiveDialog('none');
        }}
        onSecondaryPress={() => setActiveDialog('none')}
      />

      <Dialog
        visible={activeDialog === 'clear_history'}
        title={t('clear_history', 'Clear Entire Scan History?')}
        message="You are about to permanently obliterate all archived QR and barcode logs from device memory. This action cannot be reversed offline."
        primaryButtonText="Clear History"
        secondaryButtonText={t('cancel', 'Cancel')}
        destructive
        onPrimaryPress={async () => {
          await settingsSvc.clearHistory();
          StorageService.getInstance().notifyVaultChange();
          setActiveDialog('none');
        }}
        onSecondaryPress={() => setActiveDialog('none')}
      />

      <Dialog
        visible={activeDialog === 'clear_favorites'}
        title={t('clear_favorites', 'Wipe Favorites Vault?')}
        message="This will unpin all starred items from your personal bookmarks vault. They will no longer appear in quick recall tables."
        primaryButtonText="Wipe Vault"
        secondaryButtonText={t('cancel', 'Cancel')}
        destructive
        onPrimaryPress={async () => {
          await settingsSvc.clearFavorites();
          StorageService.getInstance().notifyVaultChange();
          setActiveDialog('none');
        }}
        onSecondaryPress={() => setActiveDialog('none')}
      />

      <Dialog
        visible={activeDialog === 'delete_all'}
        title="Obliterate All Data & Logs?"
        message="CRITICAL: This executive command purges all scan history, saved favorites, custom generated matrices, and restores application preferences to factory fresh status."
        primaryButtonText="Delete All Data"
        secondaryButtonText="Keep Data"
        destructive
        onPrimaryPress={async () => {
          await settingsSvc.factoryReset();
          StorageService.getInstance().notifyVaultChange();
          setActiveDialog('none');
        }}
        onSecondaryPress={() => setActiveDialog('none')}
      />

      <Dialog
        visible={activeDialog === 'backup_done'}
        title="Local Backup Complete"
        message="An encrypted snapshot of all your configurations, custom QR templates, and history records has been successfully preserved in your local storage sanctuary."
        primaryButtonText={t('done', 'Done')}
        onPrimaryPress={() => setActiveDialog('none')}
        onSecondaryPress={() => setActiveDialog('none')}
      />

      <Dialog
        visible={activeDialog === 'restore_confirm'}
        title={t('restore_backup', 'Restore Vault Snapshot?')}
        message="Do you wish to replace your active preferences and scan history logs with the latest saved filesystem snapshot from your storage archive?"
        primaryButtonText="Restore Now"
        secondaryButtonText={t('cancel', 'Cancel')}
        onPrimaryPress={async () => {
          const res = await settingsSvc.getBackupEngine().restoreFromLocalBackup();
          if (res.success) {
            StorageService.getInstance().notifyVaultChange();
            Alert.alert('Restore Successful', `Successfully restored ${res.importedCounts.history} History records and ${res.importedCounts.favorites} Favorites!`);
          } else {
            Alert.alert('Restore Notice', res.error || 'No backup found in local storage.');
          }
          setActiveDialog('none');
        }}
        onSecondaryPress={() => setActiveDialog('none')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileTextWrap: {
    flex: 1,
  },
  sectionGroup: {
    width: '100%',
  },
  sheetContent: {
    width: '100%',
  },
});
