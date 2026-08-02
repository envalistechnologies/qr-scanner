import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ScreenContainer, AppHeader, SectionCard, PremiumButton, OutlineButton, Icon, Tag } from '../../components';

export default function RateAppScreen() {
  const { theme } = useAppTheme();
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  return (
    <ScreenContainer scrollable withSafeArea testID="rate-app-placeholder-screen">
      <AppHeader title="Rate Quick Scan" subtitle="Share your architectural feedback" showBack={true} />

      <View style={[styles.centerBox, { marginVertical: theme.spacing[24] }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.customColors.primaryContainer, width: 88, height: 88, borderRadius: 44, marginBottom: theme.spacing[16] },
            theme.elevation.level2,
          ]}
        >
          <Icon name="rate" size={48} color={theme.customColors.primary} />
        </View>
        <Text style={[theme.typography.headlineSmall, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
          Enjoying Quick Scan?
        </Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: '85%' }]}>
          Your feedback fuels our independent engineering iterations. Select a star rating below to evaluate our Phase 2 navigation architecture!
        </Text>
      </View>

      {/* Star Rating Card */}
      <SectionCard title="Select Rating Score" subtitle="Interactive Demo Placeholder">
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = star <= rating;
            return (
              <Pressable
                key={star}
                onPress={() => {
                  setRating(star);
                  setSubmitted(false);
                }}
                style={styles.starTouch}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star} stars`}
              >
                <Icon
                  name={isSelected ? 'starFilled' : 'star'}
                  size={42}
                  color={isSelected ? '#F59E0B' : theme.customColors.outline}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={{ alignItems: 'center', marginTop: theme.spacing[12] }}>
          <Tag
            label={
              rating === 5
                ? '5 STARS • FLICKER-FREE ARCHITECTURAL PRECISION!'
                : `${rating} STARS • THANK YOU FOR EVALUATING!`
            }
            variant={rating >= 4 ? 'success' : 'info'}
          />
        </View>
      </SectionCard>

      <View style={{ height: theme.spacing[24] }} />

      {submitted ? (
        <View style={{ alignItems: 'center', marginBottom: theme.spacing[24] }}>
          <Tag label="THANK YOU FOR YOUR DEMO RATING!" variant="success" dot />
          <OutlineButton title="Return to Settings" icon="arrowBack" onPress={() => router.back()} fullWidth style={{ marginTop: 12 }} />
        </View>
      ) : (
        <PremiumButton
          title={`Submit ${rating}-Star Review on Store`}
          icon="check"
          onPress={() => setSubmitted(true)}
          fullWidth
        />
      )}

      <View style={{ height: theme.spacing[48] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  starTouch: {
    padding: 8,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
