import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Header } from '../headers/Header';
import { IconButton } from '../buttons/IconButton';
import { BaseComponentProps } from '../../types/theme';

export interface AppHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showMore?: boolean;
  onMore?: () => void;
  rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  showSearch = false,
  onSearch,
  showMore = false,
  onMore,
  rightElement,
  style,
  testID,
}) => {
  const { theme } = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const renderRightActions = () => {
    return (
      <View style={styles.actions}>
        {showSearch && (
          <IconButton
            icon="search"
            size={22}
            onPress={onSearch || (() => router.push('/(screens)/search' as any))}
            accessibilityLabel="Search"
            style={{ marginLeft: theme.spacing[4] }}
          />
        )}
        {rightElement}
        {showMore && (
          <IconButton
            icon="more"
            size={22}
            onPress={onMore || (() => {})}
            accessibilityLabel="More options"
            style={{ marginLeft: theme.spacing[4] }}
          />
        )}
      </View>
    );
  };

  return (
    <Header
      title={title}
      subtitle={subtitle}
      showBack={showBack}
      onBackPress={handleBack}
      rightAction={renderRightActions()}
      style={style}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
