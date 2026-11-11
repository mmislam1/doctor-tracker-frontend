import { Toast } from "@base-ui/react/toast";

export const toastManager = Toast.createToastManager();

export function showToast(type: "success" | "error", title: string, description: string) {
  toastManager.add({ type, title, description });
}
