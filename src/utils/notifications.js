import { Notify } from "quasar";

export function showSuccess(message, group = false, position = "bottom-left") {
  Notify.create({
    type: "positive",
    group: group,
    message: message,
    position,
    timeout: 6000,
  });
  addClassesToNotify();
}

export function showSuccessHtml(
  message,
  group = false,
  position = "bottom-left",
) {
  Notify.create({
    group: group,
    message: message,
    html: true,
    position,
    timeout: 6000,
    actions: [
      {
        icon: "close",
        color: "black",
        round: true,
        handler: () => {
          /* ... */
        },
      },
    ],
    color: "green-100",
    textColor: "green-700",
    icon: "task_alt",
    iconSize: "27px",
    iconColor: "green-6",
  });
  addClassesToNotify();
}

export function showError(message, group = false, position = "bottom-left") {
  Notify.create({
    type: "negative",
    group: group,
    message: message,
    position,
    timeout: 6000,
  });
  addClassesToNotify();
}

export function showErrorHtml(
  message,
  group = false,
  position = "bottom-left",
) {
  Notify.create({
    group: group,
    message: message,
    html: true,
    position,
    timeout: 6000,
    actions: [
      {
        icon: "close",
        color: "black",
        round: true,
        handler: () => {
          /* ... */
        },
      },
    ],
    color: "red-100",
    textColor: "red-700",
    icon: "warning",
    iconSize: "27px",
    iconColor: "red-700",
  });
  addClassesToNotify();
}

export function showWarning(message, group = false, position = "bottom-left") {
  Notify.create({
    type: "warning",
    group: group,
    message: message,
    position,
    timeout: 6000,
  });
  addClassesToNotify();
}

export function showWarningHtml(
  message,
  group = false,
  position = "bottom-left",
) {
  Notify.create({
    group: group,
    message: message,
    html: true,
    position,
    timeout: 6000,
    actions: [
      {
        icon: "close",
        color: "black",
        round: true,
        handler: () => {
          /* ... */
        },
      },
    ],
    color: "yellow-100",
    textColor: "yellow-700",
    icon: "notifications",
    iconSize: "27px",
    iconColor: "yellow-8",
  });
  addClassesToNotify();
}

export function showInfoHtml(message, group = false, position = "bottom-left") {
  Notify.create({
    group: group,
    message: message,
    html: true,
    position,
    timeout: 6000,
    actions: [
      {
        icon: "close",
        color: "black",
        round: true,
        handler: () => {
          /* ... */
        },
      },
    ],
    color: "gray-100",
    textColor: "gray-700",
    icon: "info",
    iconSize: "27px",
    iconColor: "light-green-9",
  });
  addClassesToNotify();
}

export function showConfirmation(
  title,
  message,
  onConfirm,
  onCancel,
  group = false,
  position = "bottom-left",
) {
  Notify.create({
    title: title,
    message: message,
    position,
    timeout: 0,
    group: group,
    actions: [
      {
        label: "Cancel",
        color: "negative",
        handler: onCancel,
      },
      {
        label: "Confirm",
        color: "positive",
        handler: onConfirm,
      },
    ],
  });
  addClassesToNotify();
}

function addClassesToNotify() {
  const notify = document.querySelector(".q-notifications");
  // if it's not already there
  if (!notify.classList.contains("q-plp")) {
    notify.classList.add("q-plp");
  }
}
