/**
 * QuickScan Studio - useCameraLifecycle Custom Hook
 * Phase 12 Architectural & Lifecycle Layer
 * Automatically suspends camera hardware rendering when app goes into background
 * or when screen loses navigation focus to preserve battery and prevent memory leaks.
 */
import { useState, useEffect, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export interface CameraLifecycleState {
  isCameraActive: boolean;
  appState: AppStateStatus;
  isScreenFocused: boolean;
}

export const useCameraLifecycle = (): CameraLifecycleState => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const isScreenFocused = useIsFocused();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isCameraActive = useMemo(() => {
    return appState === 'active' && isScreenFocused;
  }, [appState, isScreenFocused]);

  return {
    isCameraActive,
    appState,
    isScreenFocused,
  };
};

export default useCameraLifecycle;
