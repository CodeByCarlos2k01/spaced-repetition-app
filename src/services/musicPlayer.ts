import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useSyncExternalStore } from "react";

const tracks = [
  require("../../assets/music/1.mp3"),
  require("../../assets/music/2.mp3"),
  require("../../assets/music/3.mp3"),
  require("../../assets/music/4.mp3"),
  require("../../assets/music/5.mp3"),
] as const;

type AudioPlayerRef = ReturnType<typeof createAudioPlayer>;
type Listener = () => void;

class MusicPlayer {
  private player: AudioPlayerRef | null = null;
  private currentIndex = 0;
  private muted = false;
  private listeners = new Set<Listener>();
  private statusSubscription: { remove: () => void } | null = null;
  private startPromise: Promise<void> | null = null;
  private sessionToken = 0;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getIsMutedSnapshot = () => this.muted;

  async start() {
    if (this.muted || this.player) return;
    if (this.startPromise) return this.startPromise;

    const tokenAtStart = this.sessionToken;

    this.startPromise = (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });

      if (tokenAtStart !== this.sessionToken || this.muted || this.player) {
        return;
      }

      this.createAndPlayCurrentTrack();
    })().finally(() => {
      this.startPromise = null;
    });

    return this.startPromise;
  }

  async mute() {
    if (this.muted) return;

    this.muted = true;
    this.sessionToken += 1;
    this.destroyPlayerOnly();
    this.emit();
  }

  async unmute() {
    if (!this.muted) return;

    this.muted = false;
    this.currentIndex = (this.currentIndex + 1) % tracks.length;
    this.emit();

    await this.start();
  }

  async toggleMute() {
    if (this.muted) {
      await this.unmute();
      return;
    }

    await this.mute();
  }

  destroy() {
    this.sessionToken += 1;
    this.destroyPlayerOnly();
    this.currentIndex = 0;
    this.muted = false;
    this.emit();
  }

  private createAndPlayCurrentTrack() {
    this.destroyPlayerOnly();

    const player = createAudioPlayer(tracks[this.currentIndex]);
    this.player = player;

    this.statusSubscription = player.addListener("playbackStatusUpdate", (status) => {
      if (!status.didJustFinish || this.muted) {
        return;
      }

      this.currentIndex = (this.currentIndex + 1) % tracks.length;
      this.createAndPlayCurrentTrack();
    });

    player.play();
  }

  private destroyPlayerOnly() {
    this.statusSubscription?.remove();
    this.statusSubscription = null;

    if (!this.player) return;

    try {
      this.player.pause();
    } catch {}

    try {
      void this.player.seekTo(0);
    } catch {}

    try {
      this.player.remove();
    } catch {}

    this.player = null;
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const musicPlayer = new MusicPlayer();

export function useMusicMuted() {
  return useSyncExternalStore(
    musicPlayer.subscribe,
    musicPlayer.getIsMutedSnapshot,
    musicPlayer.getIsMutedSnapshot
  );
}