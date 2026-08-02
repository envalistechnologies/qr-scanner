import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBar, AdBannerView } from '../../components';
import { AdService } from '../../features/ads/AdService';

export default function TabsLayout() {
  useEffect(() => {
    AdService.getInstance().onAppStarted();
  }, []);

  return (
    <Tabs
      tabBar={(props) => (
        <View>
          <AdBannerView screenName="bottom_tab_container" style={{ marginVertical: 0 }} />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="generate" options={{ title: 'Generate', tabBarLabel: 'Generate' }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarLabel: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarLabel: 'Settings' }} />
    </Tabs>
  );
}

