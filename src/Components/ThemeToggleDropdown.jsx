import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faLaptop, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const OPTIONS = [
  { value: "light",  label: "فاتح",       icon: faSun   },
  { value: "dark",   label: "داكن",       icon: faMoon  },
  { value: "system", label: "نظام الجهاز", icon: faLaptop},
];

export default function ThemeToggleDropdown(){
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = OPTIONS.find(o => o.value === theme) || OPTIONS[0];

  // إغلاق عند الضغط خارج/ESC
  useEffect(()=>{
    const onDown = (e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey  = (e)=>{ if(e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return ()=>{ document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  },[]);

  return (
    <div className="theme-dd" ref={ref}>
      <button
        type="button"
        className="theme-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={()=>setOpen(v=>!v)}
      >
        <FontAwesomeIcon icon={current.icon} />
        <span>{current.label}</span>
        <FontAwesomeIcon icon={faChevronDown} style={{opacity:.8}} />
      </button>

      {open && (
        <div className="theme-menu" role="menu">
          {OPTIONS.map(opt => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                role="menuitemradio"
                aria-checked={active}
                className={`theme-item${active ? " is-active" : ""}`}
                onClick={()=>{ setTheme(opt.value); setOpen(false); }}
              >
                <FontAwesomeIcon icon={opt.icon} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
