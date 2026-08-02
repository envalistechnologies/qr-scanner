import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { IconName } from '../../theme/icons';
import { AdService } from '../../features/ads/AdService';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TabBarItemProps {
  label: string;
  iconName: IconName | string;
  isFocused: boolean;
  onPress: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({ label, iconName, isFocused, onPress }) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(isFocused ? 1.05 : 1);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 15, stiffness: 150 });
  }, [isFocused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeBgColor = isFocused ? theme.customColors.primaryContainer : 'transparent';
  const iconColor = isFocused ? theme.customColors.primary : theme.customColors.textSecondary;
  const textColor = isFocused ? theme.customColors.primary : theme.customColors.textSecondary;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.tabItem, animatedStyle]}
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={`Tab ${label}`}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: activeBgColor,
            borderRadius: 999,
            overflow: 'hidden',
          },
        ]}
      >
        <Icon name={iconName as any} size={24} color={iconColor} />
      </View>
      <Text
        style={[
          theme.typography.labelSmall,
          { color: textColor, marginTop: 4, fontWeight: isFocused ? '700' : '500' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

export const BottomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const getIconForRoute = (routeName: string): string => {
    switch (routeName) {
      case 'index':
      case 'home':
        return 'home';
      case 'generate':
        return 'generator';
      case 'history':
        return 'history';
      case 'settings':
        return 'settings';
      default:
        return 'qr';
    }
  };

  const getLabelForRoute = (routeName: string, title?: string): string => {
    if (title) return title;
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'generate':
        return 'Generate';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      default:
        return routeName.charAt(0).toUpperCase() + routeName.slice(1);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.customColors.surface,
          borderTopColor: theme.customColors.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: theme.spacing[8],
        },
        theme.elevation.level2,
      ]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
            AdService.getInstance().onTabSwitched();
          }
        };

        return (
          <TabBarItem
            key={route.key}
            label={getLabelForRoute(route.name, options.title || options.tabBarLabel)}
            iconName={getIconForRoute(route.name)}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 64,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});