import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  bottomOffset?: number;
  includeSafeArea?: boolean;
  showDivider?: boolean;
  overlay?: boolean;
  buttonHeight?: number;
  buttonRadius?: number;
  horizontalPadding?: number;
  activeColor?: string;
  disabledColor?: string;
  fontSize?: number;
  style?: ViewStyle;
};

const DEFAULT_BUTTON_HEIGHT = 56;

export default function FixedBottomButton({
  label,
  onPress,
  disabled = false,
  bottomOffset = 0,
  includeSafeArea = true,
  showDivider = false,
  overlay = false,
  buttonHeight = DEFAULT_BUTTON_HEIGHT,
  buttonRadius = 12,
  horizontalPadding = 20,
  activeColor = '#BB7CFF',
  disabledColor,
  fontSize = 16,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const safeBottom = includeSafeArea ? insets.bottom || 20 : 0;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          paddingBottom: safeBottom,
          paddingHorizontal: horizontalPadding,
          backgroundColor: overlay ? 'rgba(0, 0, 0, 0.2)' : '#FFFFFF',
          borderTopWidth: showDivider ? 1 : 0,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.button,
          {
            height: buttonHeight,
            borderRadius: buttonRadius,
            backgroundColor: disabled && disabledColor ? disabledColor : activeColor,
            opacity: disabled && !disabledColor ? 0.5 : 1,
          },
        ]}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, { fontSize }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 16,
    borderTopColor: '#F0F0F0',
    gap: 10,
    zIndex: 10,
    elevation: 10,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
