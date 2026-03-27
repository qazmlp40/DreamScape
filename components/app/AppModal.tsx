import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type AppModalButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AppModalButton[];
  onClose?: () => void;
};

export default function AppModal({ visible, title, message, buttons = [{ text: '확인' }], onClose }: Props) {
  const useVerticalButtons = buttons.length >= 3;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.subtitle}>{message}</Text>}
          <View style={[styles.buttons, useVerticalButtons ? styles.buttonsVertical : null]}>
            {buttons.map((btn, i) => (
              <Pressable
                key={i}
                style={[
                  styles.btn,
                  useVerticalButtons ? styles.btnVertical : null,
                  btn.style === 'cancel'
                    ? styles.btnCancel
                    : btn.style === 'destructive'
                      ? styles.btnDestructive
                      : styles.btnConfirm,
                ]}
                onPress={() => { btn.onPress?.(); onClose?.(); }}
              >
                <Text
                  style={[
                    styles.btnText,
                    btn.style === 'cancel'
                      ? styles.btnTextCancel
                      : btn.style === 'destructive'
                        ? styles.btnTextDestructive
                        : styles.btnTextConfirm,
                  ]}
                >
                  {btn.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  buttonsVertical: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnVertical: {
    width: '100%',
    flex: 0,
  },
  btnConfirm: {
    backgroundColor: '#BB7CFF',
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnDestructive: {
    backgroundColor: '#FEE2E2',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  btnTextConfirm: {
    color: '#fff',
  },
  btnTextCancel: {
    color: '#1F2937',
  },
  btnTextDestructive: {
    color: '#DC2626',
  },
});
