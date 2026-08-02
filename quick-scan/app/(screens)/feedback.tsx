import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  TextField,
  PremiumButton,
  Card,
  Icon,
  Chip,
  EmptyState,
} from '../../components';

export default function FeedbackScreen() {
  const { theme } = useAppTheme();
  const [uiState, setUiState] = useState<'form' | 'submitted'>('form');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = () => {
    setUiState('submitted');
  };

  if (uiState === 'submitted') {
    return (
      <ScreenContainer scrollable={false} withSafeArea testID="feedback-submitted-screen">
        <AppHeader title="Submit Feedback" subtitle="Submission Receipt" showBack={true} />
        <View style={[styles.stateRow, { marginTop: theme.spacing[12] }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>
            DEMO UI STATE SWITCHER:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
            <Chip label="✔ Composer Form" selected={false} onPress={() => setUiState('form')} style={{ marginRight: 6 }} />
            <Chip label="○ Feedback Sent UI" selected={true} onPress={() => setUiState('submitted')} style={{ marginRight: 6 }} />
          </ScrollView>
        </View>

        <View style={{ flex: 1, minHeight: 450, justifyContent: 'center' }}>
          <EmptyState
            icon="success"
            title="Feedback Sent Successfully!"
            description="Thank you for your valuable insight and 5-star studio rating! Your diagnostic report and comments have been recorded locally in this static UI demo."
            actionLabel="Return to Settings"
            onActionPress={() => router.back()}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable withSafeArea testID="feedback-screen">
      <AppHeader title="Submit User Feedback" subtitle="Help Shape QuickScan Architecture" showBack={true} />

      <View style={[styles.stateRow, { marginTop: theme.spacing[12] }]}>
        <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>
          DEMO UI STATE SWITCHER:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          <Chip label="✔ Composer Form" selected={true} onPress={() => setUiState('form')} style={{ marginRight: 6 }} />
          <Chip label="○ Feedback Sent UI" selected={false} onPress={() => setUiState('submitted')} style={{ marginRight: 6 }} />
        </ScrollView>
      </View>

      {/* 1. LARGE HERO ILLUSTRATION */}
      <View style={[styles.heroCard, { backgroundColor: theme.customColors.primaryContainer, borderRadius: theme.radius[24], padding: theme.spacing[20], marginVertical: theme.spacing[16], alignItems: 'center' }]}>
        <View style={[styles.illBox, { backgroundColor: theme.customColors.surface, borderRadius: 26, elevation: 3 }]}>
          <Icon name="sms" size={48} color={theme.customColors.primary} />
        </View>
        <Text style={[theme.typography.headlineSmall, { color: theme.customColors.textPrimary, fontWeight: '800', marginTop: theme.spacing[16], textAlign: 'center' }]}>
          We Value Your Perspective
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 6, textAlign: 'center', maxWidth: 320, lineHeight: 20 }]}>
          Whether you have discovered a rare retail barcode format or have a visual concept for our generator studio, let our team know below!
        </Text>
      </View>

      {/* 2. RATING STARS SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        OVERALL STUDIO RATING ({rating} OF 5 STARS)
      </Text>
      <Card variant="elevated" elevationLevel={1} style={[styles.starCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[22], padding: theme.spacing[20], marginBottom: theme.spacing[24] }]}>
        <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center', marginBottom: 16 }]}>
          How satisfied are you with scanning speed & accuracy?
        </Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((starIdx) => (
            <Pressable
              key={`star-${starIdx}`}
              onPress={() => setRating(starIdx)}
              style={styles.starTouch}
              accessibilityLabel={`Rate ${starIdx} stars`}
            >
              <Icon
                name={starIdx <= rating ? 'starFilled' : 'star'}
                size={38}
                color={starIdx <= rating ? theme.customColors.warning : theme.customColors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 3. INPUT FIELDS COMPOSER */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        YOUR INFORMATION & MESSAGE
      </Text>
      <View style={[styles.formContainer, { marginBottom: theme.spacing[28] }]}>
        <TextField
          label="Your Full Name or Company"
          placeholder="e.g. Envalis Technologies"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <View style={{ height: theme.spacing[14] }} />
        <TextField
          label="Contact Email Address"
          placeholder="e.g. envalistechnologies@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={{ height: theme.spacing[14] }} />
        <TextField
          label="Feedback or Bug Description"
          placeholder="Describe your suggestion, desired feature or camera observation in detail..."
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={4}
        />
      </View>
      {/* 4. SUBMIT BUTTON */}
      <PremiumButton
        title="Submit Studio Feedback"
        icon="check"
        onPress={handleSubmit}
        fullWidth
        style={[styles.stateRow, { marginTop: theme.spacing[12] }]}
      />

      <View style={{ height: theme.spacing[32] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stateRow: {
    width: '100%',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroCard: {
    width: '100%',
  },
  illBox: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starCard: {
    width: '100%',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  starTouch: {
    padding: 6,
  },
  formContainer: {
    width: '100%',
  },
});
