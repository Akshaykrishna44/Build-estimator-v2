import React, { useEffect, useRef, useState } from 'react';

export function Field({ label, children, className, style }) {
  return <label className={className} style={style}>{label}{children}</label>;
}

/** A number field that keeps what you type (including blanks) as text. */
export function NumInput({ value, onChange, label, ...rest }) {
  return <input type="number" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

/** A destructive button that asks for a second click within 3.5 seconds. */
export function ConfirmButton({ onConfirm, children, className = 'sm', confirmText = 'Click again to confirm', ...rest }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    if (armed) { clearTimeout(timer.current); setArmed(false); onConfirm(); return; }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 3500);
  };
  return <button type="button" className={className} onClick={click} {...rest}>{armed ? confirmText : children}</button>;
}

const Trash = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);

/** A trash-can icon button that needs a second click ("Delete?") before it deletes. */
export function DeleteIconButton({ onConfirm, label }) {
  return <ConfirmButton className="icon-del" confirmText="Delete?" onConfirm={onConfirm} aria-label={label} title={label}><Trash /></ConfirmButton>;
}

export function H2({ children, id }) { return <h2 id={id}>{children}</h2>; }
export const Note = ({ children, style, id }) => <p className="note" style={style} id={id}>{children}</p>;
