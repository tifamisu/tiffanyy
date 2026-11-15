"use client";

/* Drop-in hero for tiffanyyin.vercel.app
   Put this folder at  components/pixel-home/  and render <PixelHome /> at the
   top of app/page.tsx (in place of the old hero). */

import { useEffect, useRef } from "react";
import "./pixel-home.css";
// engine + content are plain JS so they're easy to edit
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { mountPixelHome } from "./engine";

type Theme = { bg: string; paper: string; ink: string; accent: string; accent2: string; soft: string; shadow: string };

export default function PixelHome({
  music = true,
  picker = true,
  tifStyle = "b",
  tifModel,
  onRoomChange,
}: {
  /** body/arm version 1-5, one number for all outfits or one per outfit, e.g. { ux: 3, mkt: 1, pm: 4 } */
  tifModel?: number | { ux?: number; mkt?: number; pm?: number };
  /** "b" (default) = outlined reference style, "a" = original full-color Tif */
  tifStyle?: "a" | "b";
  /** false = skip the main menu and go straight into the room (also skipped for #uiux / #marketing / #pm links) */
  picker?: boolean;
  /** false = no built-in synth; listen for the "pixelhome:music" event and drive your own player */
  music?: boolean;
  /** e.g. (id, theme) => setAccent(theme.accent) to recolor the rest of the site */
  onRoomChange?: (id: "ux" | "mkt" | "pm", theme: Theme) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api = useRef<any>(null);
  const cb = useRef(onRoomChange);
  cb.current = onRoomChange;

  useEffect(() => {
    if (!ref.current) return;
    const destroy = mountPixelHome(ref.current, {
      music,
      picker,
      tifStyle,
      tifModel,
      onRoomChange: (id: "ux" | "mkt" | "pm", theme: Theme) => cb.current?.(id, theme),
    });
    api.current = destroy;
    return destroy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music, picker]);

  useEffect(() => { api.current?.setStyle(tifStyle); }, [tifStyle]);

  return <section ref={ref} id="home" aria-label="Tiffany's pixel home" />;
}
