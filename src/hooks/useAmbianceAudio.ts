"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimerStore } from "@/stores/timerStore";
import { useFeatureStore } from "@/stores/featureStore";

const FADE_DURATION = 500; // ms
const FADE_STEPS = 20;

/**
 * Manages ambient audio playback that syncs with the Pomodoro timer.
 * - Plays selected track in a loop during focus sessions (if autoplay)
 * - Crossfades between tracks on change
 * - Volume controlled by settings slider
 */
export function useAmbianceAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambianceEnabled = useFeatureStore((s) => s.features.ambiance);

  const track = useSettingsStore((s) => s.ambianceTrack);
  const volume = useSettingsStore((s) => s.ambianceVolume);
  const autoplay = useSettingsStore((s) => s.ambianceAutoplay);

  // Fade to target volume
  const fadeTo = useCallback((audio: HTMLAudioElement, targetVol: number, onDone?: () => void) => {
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const startVol = audio.volume;
    const delta = (targetVol - startVol) / FADE_STEPS;
    let step = 0;

    fadeIntervalRef.current = setInterval(() => {
      step++;
      if (step >= FADE_STEPS) {
        audio.volume = Math.max(0, Math.min(1, targetVol));
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        onDone?.();
      } else {
        audio.volume = Math.max(0, Math.min(1, startVol + delta * step));
      }
    }, FADE_DURATION / FADE_STEPS);
  }, []);

  // Create or update audio element when track changes
  useEffect(() => {
    if (!ambianceEnabled || track === "none") {
      // Fade out and destroy
      if (audioRef.current) {
        const oldAudio = audioRef.current;
        fadeTo(oldAudio, 0, () => {
          oldAudio.pause();
          oldAudio.src = "";
        });
        audioRef.current = null;
      }
      return;
    }

    const src = `/sounds/${track}.mp3`;

    // If same track, just continue
    if (audioRef.current && audioRef.current.getAttribute("data-track") === track) {
      return;
    }

    // Fade out old audio
    if (audioRef.current) {
      const oldAudio = audioRef.current;
      fadeTo(oldAudio, 0, () => {
        oldAudio.pause();
        oldAudio.src = "";
      });
    }

    // Create new audio
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.setAttribute("data-track", track);
    audioRef.current = audio;

    // Check if timer is running and autoplay is on
    const timerState = useTimerStore.getState();
    const shouldPlay = autoplay && timerState.status === "running" && timerState.sessionType === "focus";

    if (shouldPlay) {
      audio.play().then(() => {
        fadeTo(audio, volume / 100);
      }).catch(() => {
        // Browser may block autoplay without user gesture
      });
    }

    return () => {
      // Cleanup on unmount
    };
  }, [track, fadeTo, autoplay, volume, ambianceEnabled]);

  // React to volume changes
  useEffect(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  // React to timer state changes
  useEffect(() => {
    const unsub = useTimerStore.subscribe((state) => {
      const audio = audioRef.current;
      if (!audio || track === "none") return;

      if (state.status === "running" && state.sessionType === "focus" && autoplay) {
        // Start playing
        if (audio.paused) {
          audio.play().then(() => {
            fadeTo(audio, volume / 100);
          }).catch(() => {
            // Browser may block autoplay
          });
        }
      } else if (state.status === "paused" || state.status === "idle") {
        // Fade out and pause
        if (!audio.paused) {
          fadeTo(audio, 0, () => {
            audio.pause();
          });
        }
      }
    });

    return unsub;
  }, [track, autoplay, volume, fadeTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);
}
