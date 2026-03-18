import React from "react";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faLaptop } from "@fortawesome/free-solid-svg-icons";

export default function ThemeToggleIcons(){
  const { theme, setTheme } = useTheme();
  const Chip = ({ value, icon, label }) => {
    const active = theme === value;
    return (
      <button
        type="button"
        onClick={() => setTheme(value)}
        className="mode-chip"
        title={label}
        aria-label={label}
        style={active ? { borderColor:"rgba(56,189,248,.35)", boxShadow:"0 0 0 2px rgba(56,189,248,.25) inset" } : undefined}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
    );
  };
  return (
    <div style={{ display:"inline-flex", gap:8, alignItems:"center" }}>
      <Chip value="light"  icon={faSun}   label="فاتح" />
      <Chip value="dark"   icon={faMoon}  label="داكن" />
      <Chip value="system" icon={faLaptop} label="نظام الجهاز" />
    </div>
  );
}
