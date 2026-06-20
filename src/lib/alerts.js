// src/lib/alerts.js
import Swal from "sweetalert2";
import i18n from "./i18n.js";

const isDark =
  document.documentElement.classList.contains("theme-dark") ||
  window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;

const tr = (key, fallback) => {
  try {
    const v = i18n?.t ? i18n.t(key) : key;
    return v && v !== key ? v : fallback;
  } catch {
    return fallback;
  }
};

export async function confirmAction(
  title,
  text = "",
  confirmText,
  cancelText
) {
  const result = await Swal.fire({
    title: title ?? tr("alerts.confirmTitle", "Confirm action?"),
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText ?? tr("alerts.confirm", "Confirm"),
    cancelButtonText: cancelText ?? tr("alerts.cancel", "Cancel"),
    reverseButtons: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    backdrop: true,
    color: isDark ? "#e5e7eb" : "#0f172a",
    background: isDark ? "#0b1324" : "#fff",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: isDark ? "#334155" : "#e5e7eb",
  });
  return result.isConfirmed;
}

export function toastSuccess(msg) {
  return Swal.fire({
    toast: true,
    position: "top",
    icon: "success",
    title: msg,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    background: isDark ? "#0b1324" : "#fff",
    color: isDark ? "#e5e7eb" : "#0f172a",
  });
}

export function toastInfo(msg) {
  return Swal.fire({
    toast: true,
    position: "top",
    icon: "info",
    title: msg,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    background: isDark ? "#0b1324" : "#fff",
    color: isDark ? "#e5e7eb" : "#0f172a",
  });
}

export function alertError(title, text) {
  return Swal.fire({
    icon: "error",
    title: title ?? tr("alerts.errorTitle", "Error"),
    text: text ?? tr("alerts.errorDefault", "Something went wrong"),
    confirmButtonText: tr("alerts.ok", "OK"),
    color: isDark ? "#e5e7eb" : "#0f172a",
    background: isDark ? "#0b1324" : "#fff",
  });
}
