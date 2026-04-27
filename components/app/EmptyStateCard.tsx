import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
  title?: string;
  message?: string;
  children?: ReactNode;
  style?: ViewStyle;
};

export default function EmptyStateCard({ title, message, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {children}
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    textAlign: 'center',
  },
});
