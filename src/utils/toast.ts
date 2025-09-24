import { toast } from "sonner";
import i18n from '@/i18n'; // Importez l'instance i18n

export const showSuccess = (messageKey: string, options?: any) => {
  toast.success(i18n.t(messageKey, options));
};

export const showError = (messageKey: string, options?: any) => {
  toast.error(i18n.t(messageKey, options));
};

export const showLoading = (messageKey: string, options?: any) => {
  return toast.loading(i18n.t(messageKey, options));
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};