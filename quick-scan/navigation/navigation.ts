/**
 * QuickScan Studio - Strongly Typed Navigation Wrappers
 * Phase 11 Architectural Layer
 */
import { router } from 'expo-router';
import { APP_ROUTES } from '../constants/config';

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoutePath = (typeof APP_ROUTES)[AppRouteKey];

export const NavigationService = {
  navigate(path: AppRoutePath | string, params?: Record<string, any>) {
    if (params) {
      router.push({ pathname: path as any, params });
    } else {
      router.push(path as any);
    }
  },

  replace(path: AppRoutePath | string, params?: Record<string, any>) {
    if (params) {
      router.replace({ pathname: path as any, params });
    } else {
      router.replace(path as any);
    }
  },

  goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(APP_ROUTES.HOME as any);
    }
  },
};
