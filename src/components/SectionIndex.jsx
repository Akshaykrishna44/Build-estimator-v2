import React, { useEffect, useRef, useState } from 'react';

const OFFSET = 96; // a section counts as current once its top passes this many px from the top of the window

/** The id of the section being read: the last one whose top has passed the offset (the first one at the very top). */
export function currentSection(ids, getTop = (id) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top : null; }, atBottom = false) {
  if (atBottom && ids.length) return ids[ids.length - 1];
  let cur = ids[0];
  for (const id of ids) {
    const t = getTop(id);
    if (t !== null && t <= OFFSET) cur = id;
  }
  return cur;
}

/** A sticky index of the sections on the page. Clicking scrolls to the section; the current section is highlighted as you scroll. */
export default function SectionIndex({ items, label = 'On this page' }) {
  const [active, setActive] = useState(items[0] ? items[0].id : '');
  const nav = useRef(null);
  const lock = useRef(null); // the entry that was just clicked: it stays highlighted while the page scrolls to it
  const key = items.map((i) => i.id).join('|');

  useEffect(() => {
    const ids = items.map((i) => i.id);
    let raf = 0;
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && window.scrollY > 0;
    const update = () => { raf = 0; if (!lock.current) setActive(currentSection(ids, undefined, atBottom())); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const release = () => { if (lock.current) { clearTimeout(lock.current.t); lock.current = null; onScroll(); } }; // the reader took over the scrolling
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('keydown', release);
    return () => {
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', release); window.removeEventListener('touchstart', release); window.removeEventListener('keydown', release);
      if (lock.current) clearTimeout(lock.current.t);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // keep the highlighted entry visible inside the index (a sideways strip on phones, a tall list on wide screens)
  useEffect(() => {
    const el = nav.current && nav.current.querySelector('[aria-current="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  const go = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lock.current) clearTimeout(lock.current.t);
    lock.current = { id, t: setTimeout(() => { lock.current = null; window.dispatchEvent(new Event('scroll')); }, 1100) };
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setActive(id);
  };

  if (items.length < 2) return null;
  return (
    <nav className="index" aria-label={label} ref={nav}>
      <div className="indexin">
      <span className="indexh">{label}</span>
      <ul>
        {items.map((i) => (
          <li key={i.id} className={i.sub ? 'subitem' : ''}>
            <a href={'#' + i.id} onClick={go(i.id)} className={i.id === active ? 'on' : ''} aria-current={i.id === active ? 'true' : undefined}>{i.label}</a>
          </li>
        ))}
      </ul>
      </div>
    </nav>
  );
}
