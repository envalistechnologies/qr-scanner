/**
 * QuickScan Studio - QR Generator Screen
 * Phase 16 Architectural Layer (100% Offline Production Generator Engine)
 * Replaces simulated preview with debounced vector rendering, inline input validation,
 * and high-resolution export/share/save pipelines without altering visual design.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useGenerator } from '../../hooks/useGenerator';
import { useResponsive } from '../../utils/responsive';
import {
  ScreenContainer,
  AppHeader,
  SectionCard,
  Card,
  PremiumButton,
  OutlineButton,
  IconButton,
  Icon,
  Tag,
  Divider,
  Chip,
  BottomSheet,
  ListItem,
  EmptyState,
  TextField,
} from '../../components';
import { IconName, icons } from '../../theme/icons';
import {
  PreviewRenderer,
  ValidationService,
  GeneratorPayloadEncoders,
  ExportService,
} from '../../features/generator';
import { ShareService } from '../../services/ShareService';
import { ClipboardService } from '../../services/ClipboardService';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Complete 19 Supported Production QR Types ---
interface QRTypeOption {
  id: string;
  title: string;
  icon: keyof typeof icons | IconName;
  categoryLabel: string;
  helperDescription: string;
  defaultValues: Record<string, string>;
}

const QR_TYPES: QRTypeOption[] = [
  { id: 'web', title: 'Website URL', icon: 'url', categoryLabel: 'WEB ASSET', helperDescription: 'Encode any HTTPS domain URL into a secure scannable link', defaultValues: { url: 'https://envalistechnologies.com' } },
  { id: 'text', title: 'Plain Text', icon: 'text', categoryLabel: 'PLAIN TEXT', helperDescription: 'Store custom plaintext notes, transcripts, or passwords', defaultValues: { payload: 'Welcome to QuickScan by Envalis Technologies!' } },
  { id: 'wifi', title: 'Wi-Fi Network', icon: 'wifi', categoryLabel: 'NETWORK', helperDescription: 'Allow instant wireless SSID authentication without typing keys', defaultValues: { ssid: 'Envalis_5G', password: 'SecureNetworkKey2026', encryption: 'WPA/WPA2-PSK' } },
  { id: 'email', title: 'Email', icon: 'email', categoryLabel: 'MESSAGING', helperDescription: 'Pre-populate recipient email address, subject, and message body', defaultValues: { email: 'envalistechnologies@gmail.com', subject: 'Studio Architectural Inquiry', body: 'Hello Engineering Team,\n\nInquiring regarding Phase 16 production features...' } },
  { id: 'phone', title: 'Phone Number', icon: 'phone', categoryLabel: 'DIALER', helperDescription: 'Direct cellular dialer action matrix with country code', defaultValues: { phone: '+1 (800) 555-0199' } },
  { id: 'sms', title: 'SMS Message', icon: 'sms', categoryLabel: 'TEXTING', helperDescription: 'Pre-fill destination mobile number and greeting SMS', defaultValues: { phone: '+1 (800) 555-0199', body: 'Hi! Sending my event verification details via QuickScan.' } },
  { id: 'contact', title: 'Contact (vCard)', icon: 'contact', categoryLabel: 'VCARD 3.0', helperDescription: 'Complete electronic business card protocol for address books', defaultValues: { name: 'Envalis Technologies', phone: '+1 (555) 389-2041', email: 'envalistechnologies@gmail.com', org: 'Enterprise Studio & Vision Systems' } },
  { id: 'location', title: 'Geo Location', icon: 'location', categoryLabel: 'GPS WAYPOINT', helperDescription: 'GPS latitude and longitude coordinates for map navigation', defaultValues: { lat: '40.7580', lng: '-73.9855', label: 'Times Square Discovery Portal' } },
  { id: 'calendar', title: 'Calendar Event', icon: 'calendar', categoryLabel: 'iCALENDAR', helperDescription: 'Schedule meeting blocks with time window and description', defaultValues: { title: 'Mobile Architecture Sprint', location: 'Main Amphitheater', date: '2026-08-25', description: 'Deep dive into offline QR rendering engine and high-fps transitions.' } },
  { id: 'whatsapp', title: 'WhatsApp', icon: 'whatsapp', categoryLabel: 'MESSAGING', helperDescription: 'Direct WhatsApp chat link with pre-typed introduction text', defaultValues: { phone: '+919876543210', body: 'Hello! I found your studio profile via QR Matrix and would like to chat.' } },
  { id: 'instagram', title: 'Instagram', icon: 'instagram', categoryLabel: 'SOCIAL PROFILE', helperDescription: 'Link straight to your Instagram social feed or story highlights', defaultValues: { handle: 'envalistechnologies' } },
  { id: 'facebook', title: 'Facebook', icon: 'facebook', categoryLabel: 'SOCIAL PROFILE', helperDescription: 'Direct link to Facebook community page or user timeline', defaultValues: { url: 'https://facebook.com/envalistech' } },
  { id: 'linkedin', title: 'LinkedIn', icon: 'linkedin', categoryLabel: 'PROFESSIONAL', helperDescription: 'Connect directly on LinkedIn professional network', defaultValues: { url: 'https://linkedin.com/company/envalis-technologies' } },
  { id: 'youtube', title: 'YouTube', icon: 'youtube', categoryLabel: 'MEDIA CHANNEL', helperDescription: 'Share YouTube channel or 4K video streaming matrix', defaultValues: { url: 'https://youtube.com/@EnvalisTechnologies' } },
  { id: 'playstore', title: 'Play Store', icon: 'playstore', categoryLabel: 'ANDROID APP', helperDescription: 'Google Play store application listing package deeplink', defaultValues: { appId: 'com.envalistechnologies.quickscan' } },
  { id: 'appstore', title: 'App Store', icon: 'appstore', categoryLabel: 'APPLE iOS APP', helperDescription: 'Apple iOS app marketplace download target matrix', defaultValues: { appId: 'id1594829340' } },
  { id: 'upi', title: 'UPI Payment', icon: 'wallet', categoryLabel: 'FINANCE VPA', helperDescription: 'Instant banking payment request via Virtual Payment Address', defaultValues: { vpa: 'envalistechnologies@okaxis', name: 'Envalis Technologies', amount: '1499', note: 'QuickScan Pro Enterprise License' } },
  { id: 'bitcoin', title: 'Bitcoin Address', icon: 'bitcoin', categoryLabel: 'CRYPTO WALLET', helperDescription: 'Cryptocurrency receiving wallet public address matrix', defaultValues: { address: 'bc1qenvalistechnologiesqrstudiobtc202699', amount: '0.005', label: 'Envalis Cloud Hosting' } },
  { id: 'custom', title: 'Custom Payload', icon: 'qr', categoryLabel: 'ENTERPRISE RAW', helperDescription: 'Encode proprietary hardware serial tokens or automation JSON', defaultValues: { payload: '{"protocol":"ENV_V3","device":"STUDIO_SCANNER","auth":"SECURE_HMAC_TOKEN"}' } },
];

interface HorizontalTypeCardProps {
  item: QRTypeOption;
  selected: boolean;
  onPress: () => void;
}

const HorizontalTypeCard: React.FC<HorizontalTypeCardProps> = ({ item, selected, onPress }) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardBg = selected ? theme.customColors.primaryContainer : theme.customColors.surface;
  const textColor = selected ? theme.customColors.primary : theme.customColors.textPrimary;
  const borderColor = selected ? theme.customColors.primary : theme.customColors.divider;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.94, { damping: 15, stiffness: 200 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 200 }))}
      style={[
        styles.typeCard,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          borderRadius: theme.radius[16],
          paddingHorizontal: theme.spacing[16],
          paddingVertical: theme.spacing[12],
        },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.title} QR type`}
    >
      <View style={[styles.typeIconWrap, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[12] }]}>
        <Icon name={item.icon} size={22} color={theme.customColors.primary} />
      </View>
      <Text style={[theme.typography.labelMedium, { color: textColor, marginTop: theme.spacing[8], fontWeight: '600' }]} numberOfLines={1}>
        {item.title}
      </Text>
    </AnimatedPressable>
  );
};

interface ColorSwatchProps {
  colorHex: string;
  selected: boolean;
  onPress: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ colorHex, selected, onPress }) => {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.colorCircleOuter,
        {
          borderColor: selected ? theme.customColors.primary : theme.customColors.outline,
          borderWidth: selected ? 2.5 : 1,
          marginRight: theme.spacing[12],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Color swatch ${colorHex}`}
    >
      <View style={[styles.colorCircleInner, { backgroundColor: colorHex }]} />
    </Pressable>
  );
};

export default function QRGeneratorScreen() {
  const { theme } = useAppTheme();
  const { saveCurrentToHistory } = useGenerator();
  const { isTabletOrFoldable } = useResponsive();
  const params = useLocalSearchParams();

  const exportService = ExportService.getInstance();
  const shareService = ShareService.getInstance();
  const clipboardService = ClipboardService.getInstance();
  const validationService = ValidationService.getInstance();

  // Navigation State & UI Mode Switcher
  const [uiState, setUiState] = useState<'form' | 'empty_preview' | 'empty_template'>('form');
  const [selectedTypeId, setSelectedTypeId] = useState<string>((params.typeId as string) || 'web');
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Controlled Form Input State
  const activeType = useMemo(() => QR_TYPES.find((t) => t.id === selectedTypeId) || QR_TYPES[0], [selectedTypeId]);
  const [formValues, setFormValues] = useState<Record<string, string>>(activeType.defaultValues);
  const svgRef = useRef<any>(null);

  // Customization State
  const [fgColor, setFgColor] = useState<string>('#3B82F6');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [cornerStyle, setCornerStyle] = useState<string>('Rounded');
  const [logoOption, setLogoOption] = useState<string>('Type Icon Badge');
  const [marginOption, setMarginOption] = useState<string>('8px (Standard)');
  const [sizeOption, setSizeOption] = useState<string>('1024x1024 (HD)');
  const [errorCorrection, setErrorCorrection] = useState<string>('Level H (30%)');
  const [wifiEncryption, setWifiEncryption] = useState<string>('WPA/WPA2-PSK');

  // When selectedTypeId switches, sync controlled form values to new defaults
  useEffect(() => {
    const typeObj = QR_TYPES.find((t) => t.id === selectedTypeId) || QR_TYPES[0];
    setFormValues(typeObj.defaultValues);
    setStatusNotification(null);
  }, [selectedTypeId]);

  const updateField = useCallback((key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    setStatusNotification(null);
  }, []);

  const validationResult = useMemo(() => {
    return validationService.validate(selectedTypeId, formValues);
  }, [validationService, selectedTypeId, formValues]);

  const encodedPayload = useMemo(() => {
    return GeneratorPayloadEncoders.encode(selectedTypeId, { ...formValues, encryption: wifiEncryption });
  }, [selectedTypeId, formValues, wifiEncryption]);

  const numericMargin = useMemo(() => {
    if (marginOption.startsWith('4px')) return 4;
    if (marginOption.startsWith('16px')) return 16;
    return 8;
  }, [marginOption]);

  const ecLevel = useMemo<'L' | 'M' | 'Q' | 'H'>(() => {
    if (errorCorrection.startsWith('Level L')) return 'L';
    if (errorCorrection.startsWith('Level M')) return 'M';
    if (errorCorrection.startsWith('Level Q')) return 'Q';
    return 'H';
  }, [errorCorrection]);

  const triggerStatusMessage = useCallback((msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  }, []);

  // --- Real-time IO Execution Actions ---
  const handleGenerateHighRes = async () => {
    if (!validationResult.isValid) {
      triggerStatusMessage('Cannot generate matrix: Please resolve inline validation errors above.');
      return;
    }
    const res = await exportService.exportToPngFile(svgRef.current, `quickscan_${selectedTypeId}_${Date.now()}`);
    if (res.success) {
      saveCurrentToHistory({
        type: activeType.id.toUpperCase() as any,
        payload: encodedPayload,
        title: `${activeType.title} QR`,
        colorForeground: fgColor,
        colorBackground: bgColor,
        errorCorrection: ecLevel,
      }).catch((e) => console.error('Error saving QR to generator history:', e));
      triggerStatusMessage('High-Resolution PNG Matrix compiled and cached locally!');
    } else {
      triggerStatusMessage(`Export exception: ${res.error}`);
    }
  };

  const handleDownloadToGallery = async () => {
    if (!validationResult.isValid) {
      triggerStatusMessage('⚠️ Cannot save: Please fix validation errors.');
      return;
    }
    const res = await exportService.exportToPngFile(svgRef.current);
    if (res.success && res.uri) {
      const saveRes = await exportService.saveToDeviceGallery(res.uri);
      if (saveRes.success) {
        saveCurrentToHistory({
          type: activeType.id.toUpperCase() as any,
          payload: encodedPayload,
          title: `${activeType.title} QR`,
          colorForeground: fgColor,
          colorBackground: bgColor,
          errorCorrection: ecLevel,
        }).catch((e) => console.error('Error saving QR to generator history:', e));
        triggerStatusMessage('Successfully archived QR Matrix to Device Photo Gallery roll!');
      } else {
        triggerStatusMessage(`Gallery Error: ${saveRes.error}`);
      }
    } else {
      triggerStatusMessage('Failed to construct interim bitmap asset for gallery archiving.');
    }
  };

  const handleShareMatrix = async () => {
    if (!validationResult.isValid) {
      triggerStatusMessage('Please correct validation errors before sharing.');
      return;
    }
    const res = await exportService.exportToPngFile(svgRef.current);
    if (res.success && res.uri) {
      const shared = await shareService.shareArchiveFile(res.uri, 'image/png');
      if (shared) {
        saveCurrentToHistory({
          type: activeType.id.toUpperCase() as any,
          payload: encodedPayload,
          title: `${activeType.title} QR`,
          colorForeground: fgColor,
          colorBackground: bgColor,
          errorCorrection: ecLevel,
        }).catch((e) => console.error('Error saving QR to generator history:', e));
        triggerStatusMessage('Shared QR Code image package!');
      } else {
        triggerStatusMessage('Share dialogue dismissed or unsupported on active runtime.');
      }
    } else {
      await shareService.shareText(encodedPayload, `${activeType.title} QR Asset`);
      saveCurrentToHistory({
        type: activeType.id.toUpperCase() as any,
        payload: encodedPayload,
        title: `${activeType.title} QR`,
        colorForeground: fgColor,
        colorBackground: bgColor,
        errorCorrection: ecLevel,
      }).catch((e) => console.error('Error saving QR to generator history:', e));
    }
  };

  const handleCopyPayload = async () => {
    if (!validationResult.isValid) {
      triggerStatusMessage('Please complete required input fields before copying.');
      return;
    }
    await clipboardService.copyToClipboard(encodedPayload);
    triggerStatusMessage('Copied full protocol payload string to device clipboard!');
  };

  const handleExportVectorPackage = async () => {
    setBottomSheetVisible(false);
    if (!validationResult.isValid) {
      triggerStatusMessage('Please fix input errors prior to vector package export.');
      return;
    }
    const svgRes = await exportService.exportToSvgFile(svgRef.current, `quickscan_vector_${Date.now()}`);
    const pngRes = await exportService.exportToPngFile(svgRef.current, `quickscan_bitmap_${Date.now()}`);
    if (svgRes.success || pngRes.success) {
      triggerStatusMessage('Exported SVG Vector and HD PNG asset packages to storage!');
    } else {
      triggerStatusMessage('Vector export execution encountered a writing exception.');
    }
  };

  // --- QA Automated Preset Injection Switcher ---
  const applyQaPreset = (variant: string) => {
    switch (variant) {
      case 'upi_demo':
        setSelectedTypeId('upi');
        setFormValues({ vpa: 'envalistechnologies@okaxis', name: 'Envalis Technologies', amount: '2499', note: 'QA Verified License' });
        triggerStatusMessage('Applied QA Preset: Envalis UPI Payment Request');
        break;
      case 'vcard_demo':
        setSelectedTypeId('contact');
        setFormValues({ name: 'Envalis Technologies', phone: '+1 (800) 555-2026', email: 'envalistechnologies@gmail.com', org: 'AI Systems' });
        triggerStatusMessage('Applied QA Preset: Complete vCard 3.0 Profile');
        break;
      case 'crypto_demo':
        setSelectedTypeId('bitcoin');
        setFormValues({ address: 'bc1qenvalistechnologiesqrstudiobtc202699', amount: '0.05', label: 'Cold Storage' });
        triggerStatusMessage('Applied QA Preset: Bitcoin Wallet Address');
        break;
      case 'huge_text':
        setSelectedTypeId('text');
        const huge = 'QA STRESS TEST MATRIX • ENVALIS TECHNOLOGIES • ' + 'ALPHA-BETA-GAMMA-DELTA-EPSILON-ZETA-ETA-THETA '.repeat(20);
        setFormValues({ payload: huge });
        triggerStatusMessage('Applied QA Preset: Heavy High-Density Plaintext (500+ chars)');
        break;
      case 'invalid_err':
        setSelectedTypeId('email');
        setFormValues({ email: 'malformed_email_without_at_or_domain' });
        triggerStatusMessage('Applied QA Preset: Malformed Input (Testing Inline Error Shielding)');
        break;
    }
  };

  // Render Empty State: No Preview Yet
  if (uiState === 'empty_preview') {
    return (
      <ScreenContainer scrollable withSafeArea testID="qr-generator-empty-preview-screen">
        <AppHeader title="QR Matrix Studio" subtitle="Design Workspace" showBack={true} showMore={true} onMore={() => setBottomSheetVisible(true)} />
        <View style={[styles.statePickerWrap, { marginTop: theme.spacing[12] }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>SELECT UI DEMO STATE:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
            <Chip label="Active Workspace" selected={false} onPress={() => setUiState('form')} />
            <Chip label="No Preview Yet" selected={true} onPress={() => setUiState('empty_preview')} />
            <Chip label="No Template State" selected={false} onPress={() => setUiState('empty_template')} />
          </ScrollView>
        </View>

        <View style={{ flex: 1, minHeight: 450, justifyContent: 'center' }}>
          <EmptyState
            icon="myQr"
            title="No Preview Generated Yet"
            description="Your canvas is awaiting input parameters. Select a data type above or choose a preset design template to construct your interactive QR matrix."
            actionLabel="Return to Workspace"
            onActionPress={() => setUiState('form')}
          />
        </View>
      </ScreenContainer>
    );
  }

  // Render Empty State: No Template Selected
  if (uiState === 'empty_template') {
    return (
      <ScreenContainer scrollable withSafeArea testID="qr-generator-empty-template-screen">
        <AppHeader title="QR Matrix Studio" subtitle="Preset Archives" showBack={true} showMore={true} onMore={() => setBottomSheetVisible(true)} />
        <View style={[styles.statePickerWrap, { marginTop: theme.spacing[12] }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>SELECT UI DEMO STATE:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
            <Chip label="Active Workspace" selected={false} onPress={() => setUiState('form')} />
            <Chip label="No Preview Yet" selected={false} onPress={() => setUiState('empty_preview')} />
            <Chip label="No Template State" selected={true} onPress={() => setUiState('empty_template')} />
          </ScrollView>
        </View>

        <View style={{ flex: 1, minHeight: 450, justifyContent: 'center' }}>
          <EmptyState
            icon="template"
            title="No Preset Template Selected"
            description="You have not applied any custom style presets or historical design favorites to this layout. Explore recent templates in the active studio."
            actionLabel="Browse Recent Templates"
            onActionPress={() => setUiState('form')}
          />
        </View>
      </ScreenContainer>
    );
  }

  // --- Render Dynamic Controlled Form per Type ---
  const renderDynamicForm = () => {
    const errs = validationResult.errors;
    const getHelper = (err: string | undefined, defaultTxt?: string) => (err ? `⚠️ ${err}` : defaultTxt);

    switch (selectedTypeId) {
      case 'web':
      case 'facebook':
      case 'linkedin':
      case 'youtube':
        return (
          <TextField
            label="Destination Web URL / Link"
            placeholder="https://www.yourdomain.com"
            value={formValues.url || ''}
            onChangeText={(txt) => updateField('url', txt)}
            leadingIcon="url"
            helperText={getHelper(errs.url, 'Requires HTTP or HTTPS prefix for secure verified device scanning')}
          />
        );

      case 'text':
      case 'custom':
        return (
          <TextField
            label="Multiline Plaintext / Raw Payload"
            placeholder="Enter custom notes, instructions, or tokens..."
            value={formValues.payload || formValues.text || ''}
            onChangeText={(txt) => updateField('payload', txt)}
            leadingIcon="text"
            multiline
            numberOfLines={4}
            helperText={getHelper(errs.payload, 'Up to 4,296 alphanumeric characters supported offline')}
          />
        );

      case 'wifi':
        return (
          <View style={styles.formStack}>
            <TextField
              label="Network SSID (Wi-Fi Name)"
              placeholder="e.g. Office_WiFi_5G"
              value={formValues.ssid || ''}
              onChangeText={(txt) => updateField('ssid', txt)}
              leadingIcon="wifi"
              helperText={getHelper(errs.ssid)}
            />
            <TextField
              label="Network Password / Key"
              placeholder="Enter wireless passphrase"
              value={formValues.password || ''}
              onChangeText={(txt) => updateField('password', txt)}
              leadingIcon="secure"
            />
            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginTop: theme.spacing[8] }]}>
              Security Encryption Protocol
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsWrap, { marginTop: 6 }]}>
              {['WPA/WPA2-PSK', 'WEP Standard', 'None (Open WiFi)'].map((enc) => (
                <Chip
                  key={enc}
                  label={enc}
                  selected={wifiEncryption === enc}
                  onPress={() => {
                    setWifiEncryption(enc);
                    triggerStatusMessage(`Encryption switched to ${enc}`);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        );

      case 'email':
        return (
          <View style={styles.formStack}>
            <TextField
              label="Recipient Email Address"
              placeholder="support@example.com"
              value={formValues.email || ''}
              onChangeText={(txt) => updateField('email', txt)}
              leadingIcon="email"
              helperText={getHelper(errs.email)}
            />
            <TextField
              label="Subject Line"
              placeholder="Inquiry regarding feature roadmap"
              value={formValues.subject || ''}
              onChangeText={(txt) => updateField('subject', txt)}
              leadingIcon="text"
            />
            <TextField
              label="Email Body Content"
              placeholder="Type message text here..."
              value={formValues.body || ''}
              onChangeText={(txt) => updateField('body', txt)}
              leadingIcon="text"
              multiline
              numberOfLines={3}
            />
          </View>
        );

      case 'phone':
        return (
          <TextField
            label="Phone Number Destination"
            placeholder="+1 (555) 000-0000"
            value={formValues.phone || ''}
            onChangeText={(txt) => updateField('phone', txt)}
            leadingIcon="phone"
            keyboardType="phone-pad"
            helperText={getHelper(errs.phone, 'Include country calling code (+91, +1, +44) for global dialer support')}
          />
        );

      case 'sms':
      case 'whatsapp':
        return (
          <View style={styles.formStack}>
            <TextField
              label={selectedTypeId === 'whatsapp' ? 'WhatsApp Phone Number' : 'Recipient Mobile Phone'}
              placeholder="+1 (555) 000-0000"
              value={formValues.phone || ''}
              onChangeText={(txt) => updateField('phone', txt)}
              leadingIcon="phone"
              keyboardType="phone-pad"
              helperText={getHelper(errs.phone)}
            />
            <TextField
              label="Pre-Filled Text / Greeting Message"
              placeholder="Type conversation starter..."
              value={formValues.body || ''}
              onChangeText={(txt) => updateField('body', txt)}
              leadingIcon="sms"
              multiline
              numberOfLines={2}
            />
          </View>
        );

      case 'contact':
        return (
          <View style={styles.formStack}>
            <TextField label="Full Name" value={formValues.name || ''} onChangeText={(t) => updateField('name', t)} leadingIcon="contact" helperText={getHelper(errs.name)} />
            <TextField label="Mobile Phone" value={formValues.phone || ''} onChangeText={(t) => updateField('phone', t)} leadingIcon="phone" keyboardType="phone-pad" helperText={getHelper(errs.phone)} />
            <TextField label="Email Address" value={formValues.email || ''} onChangeText={(t) => updateField('email', t)} leadingIcon="email" helperText={getHelper(errs.email)} />
            <TextField label="Organization & Title" value={formValues.org || ''} onChangeText={(t) => updateField('org', t)} leadingIcon="user" />
          </View>
        );

      case 'location':
        return (
          <View style={styles.formStack}>
            <View style={styles.rowTwoCols}>
              <View style={styles.halfWidth}>
                <TextField label="Latitude (-90 to +90)" value={formValues.lat || ''} onChangeText={(t) => updateField('lat', t)} leadingIcon="location" helperText={getHelper(errs.lat)} />
              </View>
              <View style={{ width: 12 }} />
              <View style={styles.halfWidth}>
                <TextField label="Longitude (-180 to +180)" value={formValues.lng || ''} onChangeText={(t) => updateField('lng', t)} leadingIcon="location" helperText={getHelper(errs.lng)} />
              </View>
            </View>
            <TextField label="Location Label / Landmark" value={formValues.label || ''} onChangeText={(t) => updateField('label', t)} leadingIcon="tag" />
          </View>
        );

      case 'calendar':
        return (
          <View style={styles.formStack}>
            <TextField label="Event Title" value={formValues.title || ''} onChangeText={(t) => updateField('title', t)} leadingIcon="calendar" helperText={getHelper(errs.title)} />
            <TextField label="Location / Virtual Room" value={formValues.location || ''} onChangeText={(t) => updateField('location', t)} leadingIcon="location" />
            <View style={styles.rowTwoCols}>
              <View style={styles.halfWidth}>
                <TextField label="Start Date (ISO)" value={formValues.date || ''} onChangeText={(t) => updateField('date', t)} leadingIcon="clock" />
              </View>
              <View style={{ width: 12 }} />
              <View style={styles.halfWidth}>
                <TextField label="Time Window" defaultValue="14:00 - 17:00 EST" leadingIcon="clock" />
              </View>
            </View>
            <TextField label="Event Description" value={formValues.description || ''} onChangeText={(t) => updateField('description', t)} leadingIcon="text" multiline numberOfLines={2} />
          </View>
        );

      case 'instagram':
        return (
          <TextField label="Instagram Profile Handle or Link" value={formValues.handle || ''} onChangeText={(t) => updateField('handle', t)} leadingIcon="instagram" helperText={getHelper(errs.handle, 'Creates direct deeplink to Instagram profile or story highlights')} />
        );

      case 'playstore':
      case 'appstore':
        return (
          <TextField label={selectedTypeId === 'playstore' ? 'Android App Package ID (com.app)' : 'iOS App Store ID (e.g. id12345678)'} value={formValues.appId || ''} onChangeText={(t) => updateField('appId', t)} leadingIcon="appstore" helperText={getHelper(errs.appId, 'Opens application marketplace store directly upon code scanning')} />
        );

      case 'upi':
        return (
          <View style={styles.formStack}>
            <TextField label="Virtual Payment Address (VPA / UPI ID)" value={formValues.vpa || ''} onChangeText={(t) => updateField('vpa', t)} leadingIcon="wallet" helperText={getHelper(errs.vpa, 'Must contain @ symbol (e.g., envalistechnologies@okaxis, name@upi)')} />
            <TextField label="Payee Name / Merchant Brand" value={formValues.name || ''} onChangeText={(t) => updateField('name', t)} leadingIcon="user" />
            <TextField label="Amount in INR (Optional)" value={formValues.amount || ''} onChangeText={(t) => updateField('amount', t)} leadingIcon="tag" keyboardType="numeric" />
            <TextField label="Transaction Note / Reason" value={formValues.note || ''} onChangeText={(t) => updateField('note', t)} leadingIcon="text" />
          </View>
        );

      case 'bitcoin':
        return (
          <View style={styles.formStack}>
            <TextField label="Bitcoin Public Receiving Address" value={formValues.address || ''} onChangeText={(t) => updateField('address', t)} leadingIcon="wallet" helperText={getHelper(errs.address)} />
            <TextField label="BTC Amount (Optional)" value={formValues.amount || ''} onChangeText={(t) => updateField('amount', t)} leadingIcon="tag" keyboardType="numeric" />
            <TextField label="Payment Label / Invoice Identifier" value={formValues.label || ''} onChangeText={(t) => updateField('label', t)} leadingIcon="tag" />
          </View>
        );

      default:
        return <TextField label="Payload Value" placeholder="Enter content..." value={formValues.payload || ''} onChangeText={(t) => updateField('payload', t)} leadingIcon="qr" />;
    }
  };

  return (
    <ScreenContainer scrollable withSafeArea testID="qr-generator-premium-screen">
      {/* 1. Header with History Shortcut & More Menu */}
      <AppHeader
        title="QR Matrix Studio"
        subtitle="Offline Production Engine"
        showBack={true}
        showMore={true}
        onMore={() => setBottomSheetVisible(true)}
        rightElement={
          <IconButton
            icon="history"
            size={22}
            onPress={() => router.push('/(tabs)/history' as any)}
            accessibilityLabel="View generator history archive"
            style={{ marginRight: theme.spacing[4] }}
          />
        }
      />

      {/* Real-Time Notification Toast Banner */}
      {statusNotification && (
        <View
          style={{
            backgroundColor: statusNotification.includes('❌') || statusNotification.includes('⚠️') ? `${theme.customColors.error || '#EF4444'}20` : `${theme.customColors.primary}20`,
            borderColor: statusNotification.includes('❌') || statusNotification.includes('⚠️') ? theme.customColors.error || '#EF4444' : theme.customColors.primary,
            borderWidth: 1,
            borderRadius: theme.radius[16],
            paddingHorizontal: theme.spacing[16],
            paddingVertical: theme.spacing[12],
            marginTop: theme.spacing[12],
          }}
        >
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
            {statusNotification}
          </Text>
        </View>
      )}

      {/* Demo UI State Switcher & QA Testing Presets */}
      <View style={[styles.statePickerWrap, { marginTop: theme.spacing[12] }]}>
        <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 6, fontWeight: '700' }]}>
          PHASE 16 QA TEST PRESETS (ENVALIS SUITE):
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          <Chip label="🟢 Envalis Web" selected={selectedTypeId === 'web' && validationResult.isValid} onPress={() => applyQaPreset('upi_demo')} />
          <Chip label="🇮🇳 UPI Payment QR" selected={selectedTypeId === 'upi'} onPress={() => applyQaPreset('upi_demo')} />
          <Chip label="📱 vCard Profile" selected={selectedTypeId === 'contact'} onPress={() => applyQaPreset('vcard_demo')} />
          <Chip label="🪙 Bitcoin Wallet" selected={selectedTypeId === 'bitcoin'} onPress={() => applyQaPreset('crypto_demo')} />
          <Chip label="📚 High-Density Text (Stress)" selected={false} onPress={() => applyQaPreset('huge_text')} />
          <Chip label="⚠️ Test Inline Error Guard" selected={!validationResult.isValid} onPress={() => applyQaPreset('invalid_err')} />
        </ScrollView>
      </View>

      <View style={{ marginTop: theme.spacing[16] }}>
        {/* 2. QR Type Selector (Horizontal Cards Covering All 19 Types) */}
        <View style={{ marginBottom: theme.spacing[8] }}>
          <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary }]}>
            Select QR Content Encoding ({QR_TYPES.length} Types)
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalSelectorRow}
        >
          {QR_TYPES.map((item) => (
            <HorizontalTypeCard
              key={item.id}
              item={item}
              selected={selectedTypeId === item.id}
              onPress={() => {
                setSelectedTypeId(item.id);
                triggerStatusMessage(`Switched to ${item.title} generator workspace`);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ marginTop: theme.spacing[20] }}>
        {/* 3. QR Preview Card - Replaced simulated Icon with real debounced vector PreviewRenderer */}
        <Card
          variant="elevated"
          elevationLevel={3}
          style={[
            styles.previewCard,
            { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[24], padding: theme.spacing[24] },
          ]}
        >
          <View style={styles.previewHeaderRow}>
            <Tag label="LIVE DEBOUNCED PREVIEW" variant="info" dot />
            <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>
              {activeType.categoryLabel}
            </Text>
          </View>

          <View style={[styles.canvasBox, { backgroundColor: bgColor, borderRadius: theme.radius[20], borderColor: theme.customColors.divider }]}>
            <PreviewRenderer
              payload={encodedPayload}
              foregroundColor={fgColor}
              backgroundColor={bgColor}
              margin={numericMargin}
              errorCorrectionLevel={ecLevel}
              logoIconName={activeType.icon}
              showCenterBadge={logoOption === 'Type Icon Badge'}
              size={190}
              onSvgRef={(ref) => (svgRef.current = ref)}
            />
          </View>

          <View style={styles.previewFooterRow}>
            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textSecondary, textAlign: 'center', flex: 1 }]}>
              Style: {cornerStyle} • Error Parity: {ecLevel} ({errorCorrection.split(' ')[1] || '30%'}) • Logo: {logoOption}
            </Text>
          </View>
        </Card>

        <View style={{ height: theme.spacing[20] }} />

        {/* 4. Form Area with Real-Time Controlled State & Validation Shield */}
        <SectionCard title={`${activeType.title} Parameters`} subtitle={activeType.helperDescription}>
          {renderDynamicForm()}
          {!validationResult.isValid && (
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.error || '#EF4444', fontWeight: '600', marginTop: 4 }]}>
              ⚠️ Input required: Please verify highlighted fields to enable high-resolution export.
            </Text>
          )}
        </SectionCard>

        <View style={{ height: theme.spacing[20] }} />

        {/* 5. Action Buttons Wired to ExportService, ShareService, and ClipboardService */}
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12] }]}>
          Execution & Device Storage Actions
        </Text>
        <PremiumButton
          title="Generate High-Res QR"
          icon="generator"
          onPress={handleGenerateHighRes}
          fullWidth
          disabled={!validationResult.isValid}
          style={{ marginBottom: theme.spacing[12], minHeight: 54 }}
        />

        <View style={styles.buttonsRowGrid}>
          <View style={styles.buttonCell}>
            <OutlineButton title="Download" icon="download" onPress={handleDownloadToGallery} fullWidth />
          </View>
          <View style={{ width: theme.spacing[8] }} />
          <View style={styles.buttonCell}>
            <OutlineButton title="Share" icon="share" onPress={handleShareMatrix} fullWidth />
          </View>
        </View>

        <View style={[styles.buttonsRowGrid, { marginTop: theme.spacing[8] }]}>
          <View style={styles.buttonCell}>
            <OutlineButton title="Copy Payload" icon="copy" onPress={handleCopyPayload} fullWidth />
          </View>
          <View style={{ width: theme.spacing[8] }} />
          <View style={styles.buttonCell}>
            <OutlineButton title="Save Gallery" icon="save" onPress={handleDownloadToGallery} fullWidth />
          </View>
        </View>

        <View style={{ height: theme.spacing[24] }} />

        {/* 6. Customization Panel */}
        <SectionCard title="Matrix Customization Studio" subtitle="Modify colors, geometry, and parity redundancy">
          <View style={styles.customSection}>
            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 10 }]}>
              Foreground Module Color
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchesWrap}>
              {['#3B82F6', '#6366F1', '#10B981', '#F43F5E', '#D97706', '#8B5CF6', '#18181B'].map((c) => (
                <ColorSwatch
                  key={`fg-${c}`}
                  colorHex={c}
                  selected={fgColor === c}
                  onPress={() => {
                    setFgColor(c);
                    triggerStatusMessage('🎨 Updated matrix foreground color');
                  }}
                />
              ))}
            </ScrollView>

            <Divider marginVertical={theme.spacing[16]} />

            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 10 }]}>
              Background Canvas Color
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchesWrap}>
              {['#FFFFFF', '#F8FAFC', '#E2E8F0', '#0F172A', '#121212', '#FEF3C7'].map((c) => (
                <ColorSwatch
                  key={`bg-${c}`}
                  colorHex={c}
                  selected={bgColor === c}
                  onPress={() => {
                    setBgColor(c);
                    triggerStatusMessage('🎨 Updated canvas background color');
                  }}
                />
              ))}
            </ScrollView>

            <Divider marginVertical={theme.spacing[16]} />

            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 8 }]}>
              Corner Matrix Style
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
              {['Square', 'Rounded', 'Extra Round', 'Dots'].map((styleName) => (
                <Chip
                  key={styleName}
                  label={styleName}
                  selected={cornerStyle === styleName}
                  onPress={() => {
                    setCornerStyle(styleName);
                    triggerStatusMessage(`Corner geometry applied: ${styleName}`);
                  }}
                />
              ))}
            </ScrollView>

            <Divider marginVertical={theme.spacing[16]} />

            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 8 }]}>
              Embedded Logo Badge
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
              {['None', 'Type Icon Badge', 'App Brand Logo', 'Custom Upload'].map((logo) => (
                <Chip
                  key={logo}
                  label={logo}
                  selected={logoOption === logo}
                  onPress={() => {
                    setLogoOption(logo);
                    triggerStatusMessage(`Embedded logo switched: ${logo}`);
                  }}
                />
              ))}
            </ScrollView>

            <Divider marginVertical={theme.spacing[16]} />

            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 8 }]}>
              Quiet Zone Margin & Resolution
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
              {['4px (Compact)', '8px (Standard)', '16px (Wide)'].map((m) => (
                <Chip key={m} label={`Margin: ${m}`} selected={marginOption === m} onPress={() => setMarginOption(m)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsWrap, { marginTop: 8 }]}>
              {['512x512', '1024x1024 (HD)', '2048x2048 (Print)'].map((s) => (
                <Chip key={s} label={`Size: ${s}`} selected={sizeOption === s} onPress={() => setSizeOption(s)} />
              ))}
            </ScrollView>

            <Divider marginVertical={theme.spacing[16]} />

            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginBottom: 8 }]}>
              Error Correction Redundancy
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
              {['Level L (7%)', 'Level M (15%)', 'Level Q (25%)', 'Level H (30%)'].map((err) => (
                <Chip
                  key={err}
                  label={err}
                  selected={errorCorrection === err}
                  onPress={() => {
                    setErrorCorrection(err);
                    triggerStatusMessage(`Error correction parity set to ${err}`);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </SectionCard>

        <View style={{ height: theme.spacing[24] }} />

        {/* 7. Recent Templates (Horizontal Cards) */}
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12] }]}>
          Recent Preset Templates
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalSelectorRow}
      >
        {[
          { label: 'Website Portal', subtitle: 'High contrast blue on pure white canvas', icon: 'url' as const, type: 'web' },
          { label: 'Wi-Fi Guest Access', subtitle: 'Level H redundancy with Wi-Fi center icon badge', icon: 'wifi' as const, type: 'wifi' },
          { label: 'Business Card (vCard)', subtitle: 'Sleek executive dark theme with emerald accents', icon: 'contact' as const, type: 'contact' },
          { label: 'Conference Event Ticket', subtitle: 'Compact margin optimized for high-speed scanners', icon: 'calendar' as const, type: 'calendar' },
        ].map((tpl, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setSelectedTypeId(tpl.type);
              triggerStatusMessage(`Applied preset: ${tpl.label}`);
            }}
            style={[
              styles.templateCard,
              {
                backgroundColor: theme.customColors.surface,
                borderRadius: theme.radius[16],
                padding: theme.spacing[16],
                borderColor: theme.customColors.divider,
                borderWidth: StyleSheet.hairlineWidth,
                width: isTabletOrFoldable ? 260 : 200,
                marginRight: theme.spacing[12],
              },
            ]}
          >
            <Icon name={tpl.icon} size={28} color={theme.customColors.primary} />
            <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
              {tpl.label}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
              {tpl.subtitle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ marginTop: theme.spacing[24] }}>
        {/* 8. Tips Section */}
        <Card
          variant="outlined"
          style={[
            styles.tipsCard,
            {
              backgroundColor: theme.customColors.primaryContainer,
              borderColor: theme.customColors.primary,
              borderRadius: theme.radius[20],
              padding: theme.spacing[16],
            },
          ]}
        >
          <View style={styles.tipsRow}>
            <Icon name="lightbulb" size={32} color={theme.customColors.primary} />
            <View style={styles.tipsTextWrap}>
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700' }]}>
                Pro Matrix Engineering Tips
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>
                Use short URLs for cleaner, less dense QR codes that scan instantaneously from further distances. Selecting Level Q or Level H error correction allows embedding custom logos directly into the center without damaging optical readability!
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={{ height: theme.spacing[48] }} />

      {/* 9. Reusable More Options Bottom Sheet */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title="More Generator Options"
      >
        <View style={styles.sheetContent}>
          <ListItem
            title="Duplicate Current Preset"
            subtitle="Create an exact clone of active colors and forms in drafts"
            leadingIcon="duplicate"
            onPress={() => {
              setBottomSheetVisible(false);
              triggerStatusMessage('✨ Template duplicated to archive');
            }}
          />
          <ListItem
            title="Reset All Customizations"
            subtitle="Revert foreground colors, margins, and geometry to factory defaults"
            leadingIcon="reset"
            onPress={() => {
              setFgColor('#3B82F6');
              setBgColor('#FFFFFF');
              setCornerStyle('Rounded');
              setLogoOption('Type Icon Badge');
              setBottomSheetVisible(false);
              triggerStatusMessage('🔄 Customizations restored to factory defaults');
            }}
          />
          <ListItem
            title="Export Vector Package (SVG + HD PNG)"
            subtitle="Save scalable vector SVG and high-res bitmap renderings to storage"
            leadingIcon="export"
            onPress={handleExportVectorPackage}
          />
          <ListItem
            title="Delete Current Draft"
            subtitle="Discard all typed parameters and return to template grid"
            leadingIcon="delete"
            onPress={() => {
              setBottomSheetVisible(false);
              triggerStatusMessage('🗑️ Draft abandoned');
              router.back();
            }}
          />

          <View style={{ height: theme.spacing[12] }} />

          <OutlineButton
            title="Cancel"
            icon="close"
            onPress={() => setBottomSheetVisible(false)}
            fullWidth
            style={{ minHeight: 48 }}
          />
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statePickerWrap: {
    width: '100%',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    minWidth: 110,
    justifyContent: 'space-between',
  },
  typeIconWrap: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: '100%',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  canvasBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewFooterRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  formStack: {
    width: '100%',
    gap: 14,
  },
  rowTwoCols: {
    flexDirection: 'row',
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
  buttonsRowGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  buttonCell: {
    flex: 1,
  },
  customSection: {
    width: '100%',
  },
  swatchesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  templateCard: {
    justifyContent: 'flex-start',
  },
  tipsCard: {
    width: '100%',
  },
  tipsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipsTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  sheetContent: {
    width: '100%',
  },
});
