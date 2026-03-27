import AppModal, { AppModalButton } from '@/components/app/AppModal';
import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react';

type DialogOptions = {
  title: string;
  message?: string;
  buttons?: AppModalButton[];
};

type AppDialogContextType = {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
};

const AppDialogContext = createContext<AppDialogContextType | undefined>(undefined);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: '확인' }],
  });

  const value = useMemo<AppDialogContextType>(
    () => ({
      showDialog: (options) => {
        setDialog({
          visible: true,
          title: options.title,
          message: options.message,
          buttons: options.buttons?.length ? options.buttons : [{ text: '확인' }],
        });
      },
      hideDialog: () => {
        setDialog((prev) => ({ ...prev, visible: false }));
      },
    }),
    [],
  );

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      <AppModal
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={value.hideDialog}
      />
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog는 AppDialogProvider 내부에서 사용해야 합니다.');
  }
  return context;
}
