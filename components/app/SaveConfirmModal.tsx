import React from 'react';
import AppModal from './AppModal';

type Props = {
  visible: boolean;
  kind: 'image' | 'video';
  onSave: () => void;
  onClose: () => void;
};

const copy = {
  image: {
    title: '이미지를 저장하시겠습니까?',
    message: '현재 꿈 이미지를 갤러리에 저장할 수 있습니다.',
    action: '이미지 저장',
  },
  video: {
    title: '영상을 저장하시겠습니까?',
    message: '현재 꿈 영상을 갤러리에 저장할 수 있습니다.',
    action: '영상 저장',
  },
};

export default function SaveConfirmModal({ visible, kind, onSave, onClose }: Props) {
  const selectedCopy = copy[kind];

  return (
    <AppModal
      visible={visible}
      title={selectedCopy.title}
      message={selectedCopy.message}
      buttons={[
        { text: '닫기', style: 'cancel' },
        { text: selectedCopy.action, onPress: onSave },
      ]}
      onClose={onClose}
    />
  );
}
