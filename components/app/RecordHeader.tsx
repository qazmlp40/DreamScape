import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  onBackPress?: () => void;
  rightText?: string;
  onRightPress?: () => void;
  showBack?: boolean;
  backIcon?: 'arrow-back' | 'chevron-back';
  variant?: 'light' | 'overlay';
  style?: ViewStyle;
};

const HEADER_CONTENT_HEIGHT = 56;

export default function RecordHeader({
  title,
  onBackPress,
  rightText,
  onRightPress,
  showBack = true,
  backIcon = 'chevron-back',
  variant = 'light',
  style,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOverlay = variant === 'overlay';
  const iconColor = isOverlay ? '#FFFFFF' : '#1F2937';
  const textColor = isOverlay ? '#FFFFFF' : '#282828';

  const handleBackPress = onBackPress ?? (() => router.back());

  return (
    <View
      style={[
        styles.container,
        {
          height: HEADER_CONTENT_HEIGHT + insets.top,
          paddingTop: insets.top,
          backgroundColor: isOverlay ? 'transparent' : '#FFFFFF',
        },
        isOverlay ? styles.overlayContainer : null,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.side}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        disabled={!showBack}
      >
        {showBack ? (
          <Ionicons name={backIcon} size={24} color={iconColor} />
        ) : null}
      </TouchableOpacity>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.title, { color: textColor }]}
      >
        {title ?? ''}
      </Text>

      {rightText ? (
        <TouchableOpacity
          onPress={onRightPress}
          style={styles.rightTextButton}
          accessibilityRole="button"
        >
          <Text style={[styles.rightText, { color: textColor }]}>{rightText}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    elevation: 10,
  },
  side: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    textAlign: 'left',
    marginLeft: 4,
    zIndex: 1,
  },
  rightTextButton: {
    minWidth: 88,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
  },
});
