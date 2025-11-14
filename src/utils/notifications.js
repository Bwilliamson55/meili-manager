import { Notify, Dialog } from "quasar";

export function showSuccess(message, position = "bottom-left") {
  Notify.create({
    type: "positive",
    message,
    position,
    timeout: 6000,
  });
}

export function showError(message, position = "bottom-left") {
  Notify.create({
    type: "negative",
    message,
    position,
    timeout: 6000,
  });
}

export function showWarning(message, position = "bottom-left") {
  Notify.create({
    type: "warning",
    message,
    position,
    timeout: 6000,
  });
}

export function showInfo(message, position = "bottom-left") {
  Notify.create({
    type: "info",
    message,
    position,
    timeout: 6000,
  });
}

export function showConfirmation(message, onConfirm, onCancel = () => {}) {
  Notify.create({
    message,
    position: "center",
    timeout: 0,
    actions: [
      {
        label: "Cancel",
        color: "white",
        handler: onCancel,
      },
      {
        label: "Confirm",
        color: "white",
        handler: onConfirm,
      },
    ],
  });
}

export function showPrompt(title, message, onConfirm, onCancel = () => {}) {
  Dialog.create({
    title,
    message,
    prompt: {
      model: "",
      type: "text",
    },
    cancel: true,
    persistent: false,
  })
    .onOk(onConfirm)
    .onCancel(onCancel);
}
