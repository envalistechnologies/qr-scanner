import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { Tag } from '../common/Tag';
import { IconName, icons } from '../../theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FavoriteItemData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  dateSaved: string;
  icon: keyof typeof icons | IconName;
  accentVariant?: 'primary' | 'success' | 'warning' | 'info';
  previewText?: string;
}

export interface FavoriteCardProps {
  item: FavoriteItemData;
  onPress: () => void;
  onLongPress?: () => void;
  onMorePress?: () => void;
  viewMode?: 'list' | 'grid';
  isMultiSelect?: boolean;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  testID?: string;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = React.memo(({
  item,
  onPress,
  onLongPress,
  onMorePress,
  viewMode = 'list',
  isMultiSelect = false,
  isSelected = false,
  onSelectToggle,
  testID,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isMultiSelect && onSelectToggle) {
      onSelectToggle();
    } else {
      onPress();
    }
  };

  const cardBg = isSelected ? theme.customColors.primaryContainer : theme.customColors.surface;
  const borderColor = isSelected ? theme.customColors.primary : theme.customColors.divider;

  if (viewMode === 'grid') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={() => (scale.value = withSpring(0.95, { damping: 15, stiffness: 200 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 200 }))}
        style={[
          styles.gridContainer,
          {
            backgroundColor: cardBg,
            borderColor,
            borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
            borderRadius: theme.radius[20],
            padding: theme.spacing[16],
          },
          theme.elevation.level2,
          animatedStyle,
        ]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} favorite grid item`}
      >
        <View style={styles.gridHeader}>
          <View style={[styles.iconCircle, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[12] }]}>
            <Icon name={item.icon} size={26} color={theme.customColors.primary} />
          </View>
          {isMultiSelect ? (
            <Icon
              name={isSelected ? 'checkbox' : 'checkboxOutline'}
              size={24}
              color={isSelected ? theme.customColors.primary : theme.customColors.textSecondary}
            />
          ) : (
            <Icon name="starFilled" size={20} color={theme.customColors.warning} />
          )}
        </View>

        <View style={{ marginTop: theme.spacing[12] }}>
          <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </View>

        <View style={[styles.gridFooter, { marginTop: theme.spacing[12], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.customColors.divider, paddingTop: theme.spacing[8] }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]} numberOfLines={1}>
            {item.dateSaved}
          </Text>
          <Icon name="myQr" size={16} color={theme.customColors.textSecondary} />
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 15, stiffness: 200 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 200 }))}
      style={[
        styles.listContainer,
        {
          backgroundColor: cardBg,
          borderColor,
          borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
          borderRadius: theme.radius[20],
          padding: theme.spacing[16],
          marginBottom: theme.spacing[12],
        },
        theme.elevation.level1,
        animatedStyle,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} favorite list item`}
    >
      <View style={styles.listRow}>
        {isMultiSelect && (
          <Pressable onPress={onSelectToggle} style={[styles.checkboxWrap, { marginRight: theme.spacing[12] }]}>
            <Icon
              name={isSelected ? 'checkbox' : 'checkboxOutline'}
              size={24}
              color={isSelected ? theme.customColors.primary : theme.customColors.textSecondary}
            />
          </Pressable>
        )}

        <View style={[styles.iconBox, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[16] }]}>
          <Icon name={item.icon} size={28} color={theme.customColors.primary} />
        </View>

        <View style={styles.listContent}>
          <View style={styles.titleRow}>
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Icon name="starFilled" size={18} color={theme.customColors.warning} style={{ marginLeft: 6 }} />
          </View>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
          <View style={styles.metaRow}>
            <Tag label={item.category} variant="info" style={{ paddingHorizontal: 8, paddingVertical: 2 }} />
            <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginLeft: 8 }]}>
              {item.dateSaved}
            </Text>
          </View>
        </View>

        <View style={styles.listTrailing}>
          <Pressable onPress={onMorePress || onPress} style={styles.chevronTouch} accessibilityLabel="More favorite options">
            <Icon name="more" size={22} color={theme.customColors.textSecondary} />
          </Pressable>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textDisabled, fontSize: 10, marginTop: 8 }]}>
            ◄ Swipe
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconBox: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  chevronTouch: {
    padding: 6,
  },
  gridContainer: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
