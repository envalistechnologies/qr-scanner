import { useWindowDimensions } from 'react-native';

export type DeviceCategory =
  | 'smallPhone'
  | 'mediumPhone'
  | 'largePhone'
  | 'foldable'
  | 'tablet';

export interface ResponsiveInfo {
  deviceCategory: DeviceCategory;
  isSmallPhone: boolean;
  isTabletOrFoldable: boolean;
  contentMaxWidth: number | string;
  horizontalPadding: number;
}

export const getDeviceCategory = (width: number, height: number): DeviceCategory => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  if (minDimension >= 600 || (minDimension >= 500 && maxDimension >= 900)) {
    return 'tablet';
  }
  if (minDimension >= 500 && maxDimension < 900) {
    return 'foldable';
  }
  if (minDimension >= 414) {
    return 'largePhone';
  }
  if (minDimension >= 375) {
    return 'mediumPhone';
  }
  return 'smallPhone';
};

export const useResponsive = (): ResponsiveInfo => {
  const { width, height } = useWindowDimensions();
  const category = getDeviceCategory(width, height);

  const isSmallPhone = category === 'smallPhone';
  const isTabletOrFoldable = category === 'tablet' || category === 'foldable';

  let horizontalPadding = 16;
  if (isSmallPhone) {
    horizontalPadding = 12;
  } else if (isTabletOrFoldable) {
    horizontalPadding = 32;
  }

  return {
    deviceCategory: category,
    isSmallPhone,
    isTabletOrFoldable,
    contentMaxWidth: '100%',
    horizontalPadding,
  };
};

export const flexLayouts = {
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  colCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colStart: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
} as const;
