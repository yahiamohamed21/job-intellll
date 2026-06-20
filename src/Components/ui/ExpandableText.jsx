import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ExpandableText = ({ text, lines = 3, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const checkOverflow = () => {
      if (!isExpanded) {
        setIsClamped(el.scrollHeight > el.clientHeight);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, isExpanded, lines]);

  if (!text) return null;

  const clampClass = {
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
  }[lines] || "line-clamp-3";

  return (
    <div className="relative">
      <div
        ref={textRef}
        className={`${className} ${!isExpanded ? clampClass : ""}`}
      >
        {text}
      </div>
      {isClamped && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
        >
          {t("projectCard.showMore", "Show More")}
          <span className="material-symbols-outlined text-[12px] transition-transform">expand_more</span>
        </button>
      )}
      {isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-expanded={isExpanded}
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
        >
          {t("projectCard.showLess", "Show Less")}
          <span className="material-symbols-outlined text-[12px] transition-transform rotate-180">expand_more</span>
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
