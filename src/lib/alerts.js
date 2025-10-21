// src/lib/alerts.js
import Swal from "sweetalert2";

const isDark =
  document.documentElement.classList.contains("theme-dark") ||
  window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;

export async function confirmAction(
  title = "تأكيد الإجراء؟",
  text = "",
  confirmText = "تأكيد",
  cancelText = "إلغاء"
) {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
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

export function alertError(title = "خطأ", text = "حدث خطأ") {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "حسناً",
    color: isDark ? "#e5e7eb" : "#0f172a",
    background: isDark ? "#0b1324" : "#fff",
  });
}
