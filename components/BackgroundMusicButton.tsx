import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { musicPlayer, useMusicMuted } from "@/src/services/musicPlayer";

type BackgroundMusicButtonProps = {
  color?: string;
};

export function BackgroundMusicButton({
  color = "#ffffff",
}: BackgroundMusicButtonProps) {
  const isMuted = useMusicMuted();
  const [isBusy, setIsBusy] = useState(false);

  const iconName = isMuted ? "volume-mute-outline" : "volume-high-outline";

  async function handlePress() {
    if (isBusy) return;

    setIsBusy(true);

    try {
      await musicPlayer.toggleMute();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isBusy}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isMuted ? "Ativar música de fundo" : "Mutar música de fundo"}
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#2A3142",
        backgroundColor: "#1E2432",
        alignItems: "center",
        justifyContent: "center",
        opacity: isBusy ? 0.65 : 1,
      }}
    >
      <Ionicons name={iconName} size={20} color={color} />
    </TouchableOpacity>
  );
}