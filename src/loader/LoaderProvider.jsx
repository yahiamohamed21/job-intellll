/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect
} from "react";
import FullScreenLoader from "../Components/FullScreenLoader.jsx";

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const [visible, setVisible] = useState(false);

  // ده الفلاج اللي بيقول "المرة الجاية ما تفتحش اللودر"
  const [suppressNext, setSuppressNext] = useState(false);

  const showLoader = useCallback(() => {
    setVisible(true);
  }, []);

  const hideLoader = useCallback(() => {
    setVisible(false);
  }, []);

  // هنستخدم ده في الـLogin عشان نقول: اول نافيجيشن بعديها متفتحش اللودر الاوتوماتيك
  const suppressNextLoader = useCallback(() => {
    setSuppressNext(true);
  }, []);

  // Reserve a stable scrollbar gutter so the page never shifts
  // horizontally when the loader hides and the scrollbar reappears.
  // We avoid toggling body overflow entirely — the fixed-position
  // loader overlay already blocks interaction with the page.
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => { document.documentElement.style.scrollbarGutter = ""; };
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        visible,
        showLoader,
        hideLoader,
        suppressNext,
        setSuppressNext,
        suppressNextLoader
      }}
    >
      {children}
      {visible && <FullScreenLoader />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used inside <LoaderProvider>");
  return ctx;
}
