import { Easing, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export interface AnimationConfig {
  spring: WithSpringConfig;
  timing: WithTimingConfig;
}

export const animations = {
  buttonPress: {
    scaleDown: 0.96,
    opacityDown: 0.85,
    spring: {
      damping: 15,
      mass: 0.3,
      stiffness: 150,
    } as WithSpringConfig,
  },
  fade: {
    duration: 250,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  scale: {
    damping: 12,
    mass: 0.5,
    stiffness: 120,
  } as WithSpringConfig,
  slide: {
    duration: 300,
    easing: Easing.inOut(Easing.quad),
  } as WithTimingConfig,
  cardAnimation: {
    damping: 14,
    mass: 0.6,
    stiffness: 100,
  } as WithSpringConfig,
  modalAnimation: {
    duration: 300,
    easing: Easing.out(Easing.exp),
  } as WithTimingConfig,
  bottomSheetAnimation: {
    damping: 20,
    mass: 0.8,
    stiffness: 130,
  } as WithSpringConfig,
  ripple: {
    duration: 400,
    easing: Easing.out(Easing.quad),
    maxOpacity: 0.24,
  },
  pageTransition: {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
};

export const createAnimationTiming = (
  duration = 300,
  easing = Easing.inOut(Easing.ease)
): WithTimingConfig => ({
  duration,
  easing,
});

export const createAnimationSpring = (
  damping = 15,
  stiffness = 120,
  mass = 0.5
): WithSpringConfig => ({
  damping,
  stiffness,
  mass,
});
