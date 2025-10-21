import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";
import { confirmAction, toastInfo, toastSuccess } from "../lib/alerts.js";
import Swal from "sweetalert2";

export default function useConfirmLogout() {
  const { logout } = useAuth();
  const nav = useNavigate();

  return useCallback(async (e) => {
    // امنع أي تنقل افتراضي
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    const ok = await confirmAction(
      "تأكيد تسجيل الخروج؟",
      "سيتم إنهاء الجلسة الحالية",
      "خروج",
      "إلغاء"
    );
    if (!ok) {
      toastInfo("تم الإلغاء");
      return;
    }

    try {
      await logout();
    } finally {
      // قفل أي مودال مفتوح
      try { Swal.close(); } catch {}
      toastSuccess("تم تسجيل الخروج");

      // أحيانًا React Router بيكون لسه بيفكّكツ
      setTimeout(() => {
        try {
          nav("/", { replace: true });
          // fallback أخير لو ما اتنقلش لأي سبب (بعد 250ms)
          setTimeout(() => {
            if (window.location.pathname !== "/") {
              window.location.assign("/");
            }
          }, 250);
        } catch {
          window.location.assign("/");
        }
      }, 0);
    }
  }, [logout, nav]);
}
