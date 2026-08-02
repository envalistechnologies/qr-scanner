import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface BottomSheetProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title || 'Bottom Sheet Dialog'}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={!disabled && !loading ? onClose : undefined}
          accessibilityLabel="Close bottom sheet"
        />
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.customColors.surface,
              borderTopLeftRadius: theme.radius[24],
              borderTopRightRadius: theme.radius[24],
              borderTopWidth: StyleSheet.hairlineWidth,
              borderColor: theme.customColors.outline,
            },
            theme.elevation.level5,
            style,
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={[styles.handleBar, { backgroundColor: theme.customColors.outline, marginTop: theme.spacing[12] }]} />

            {title && (
              <Text
                style={[
                  theme.typography.titleLarge,
                  {
                    color: theme.customColors.textPrimary,
                    paddingHorizontal: theme.spacing[20],
                    paddingTop: theme.spacing[16],
                    paddingBottom: theme.spacing[12],
                    textAlign: 'center',
                  },
                ]}
              >
                {title}
              </Text>
            )}

            <View style={{ paddingHorizontal: theme.spacing[20], paddingBottom: theme.spacing[24], minHeight: 100 }}>
              {loading ? (
                <View style={[styles.loadingContainer, { paddingVertical: theme.spacing[32] }]}>
                  <ActivityIndicator size="large" color={theme.customColors.primary} />
                </View>
              ) : (
                children
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
