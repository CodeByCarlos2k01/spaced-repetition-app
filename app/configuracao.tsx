import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getReminderTime,
  setReminderTime,
} from "../src/services/notificationService";
import {
  getLearningGoalWords,
  getStudyGoalTime,
  setLearningGoalWords,
  setStudyGoalTime,
} from "../src/services/progressService";

export default function ConfiguracaoScreen() {
  const insets = useSafeAreaInsets();
  const [hourText, setHourText] = useState("18");
  const [minuteText, setMinuteText] = useState("00");
  const [goalText, setGoalText] = useState("");
  const [studyGoalHourText, setStudyGoalHourText] = useState("0");
  const [studyGoalMinuteText, setStudyGoalMinuteText] = useState("0");

  useEffect(() => {
    (async () => {
      const reminder = await getReminderTime();
      setHourText(String(reminder.hour).padStart(2, "0"));
      setMinuteText(String(reminder.minute).padStart(2, "0"));

      const learningGoal = getLearningGoalWords();
      setGoalText(learningGoal > 0 ? String(learningGoal) : "");

      const studyGoal = getStudyGoalTime();
      setStudyGoalHourText(String(studyGoal.hour));
      setStudyGoalMinuteText(String(studyGoal.minute));
    })();
  }, []);

  async function handleSave() {
    const rawReminderHour = hourText.trim();
    const rawReminderMinute = minuteText.trim();

    if (!rawReminderHour || !rawReminderMinute) {
      await setReminderTime(18, 0);
      setHourText("18");
      setMinuteText("00");
    } else {
      const parsedHour = Number(rawReminderHour);
      const parsedMinute = Number(rawReminderMinute);

      const safeHour =
        Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23
          ? parsedHour
          : 18;

      const safeMinute =
        Number.isInteger(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59
          ? parsedMinute
          : 0;

      await setReminderTime(safeHour, safeMinute);
      setHourText(String(safeHour).padStart(2, "0"));
      setMinuteText(String(safeMinute).padStart(2, "0"));
    }

    const rawLearningGoal = goalText.trim();
    const parsedLearningGoal = Number(rawLearningGoal);

    if (!rawLearningGoal || !Number.isFinite(parsedLearningGoal) || parsedLearningGoal <= 0) {
      setLearningGoalWords(0);
      setGoalText("");
    } else {
      const safeLearningGoal = Math.floor(parsedLearningGoal);
      setLearningGoalWords(safeLearningGoal);
      setGoalText(String(safeLearningGoal));
    }

    const rawStudyGoalHour = studyGoalHourText.trim();
    const rawStudyGoalMinute = studyGoalMinuteText.trim();

    if (!rawStudyGoalHour || !rawStudyGoalMinute) {
      setStudyGoalTime(0, 0);
      setStudyGoalHourText("0");
      setStudyGoalMinuteText("0");
    } else {
      const parsedStudyGoalHour = Number(rawStudyGoalHour);
      const parsedStudyGoalMinute = Number(rawStudyGoalMinute);

      const safeStudyGoalHour =
        Number.isInteger(parsedStudyGoalHour) && parsedStudyGoalHour >= 0
          ? parsedStudyGoalHour
          : 0;

      const safeStudyGoalMinute =
        Number.isInteger(parsedStudyGoalMinute) &&
        parsedStudyGoalMinute >= 0 &&
        parsedStudyGoalMinute <= 59
          ? parsedStudyGoalMinute
          : 0;

      if (safeStudyGoalHour === 0 && safeStudyGoalMinute === 0) {
        setStudyGoalTime(0, 0);
      } else {
        setStudyGoalTime(safeStudyGoalHour, safeStudyGoalMinute);
      }

      setStudyGoalHourText(String(safeStudyGoalHour));
      setStudyGoalMinuteText(String(safeStudyGoalMinute));
    }

    Alert.alert("Sucesso", "Configurações salvas com sucesso!");
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0A0E17",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack.Screen
          options={{
            title: "Configurações",
            headerStyle: {
              backgroundColor: "#0A0E17",
            },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 20,
            },
            headerShadowVisible: false,
          }}
        />

        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 0,
          }}
        >
          <View style={{ gap: 10 }}>
            {/* Seção: Notificação */}
            <View
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2A3142",
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#2A3142",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="notifications-outline" size={18} color="#3B82F6" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Notificação Diária
                </Text>
              </View>

              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 18,
                }}
              >
                Receba um lembrete diário para manter sua rotina de estudos
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: "#CBD5E1",
                    fontSize: 15,
                    fontWeight: "500",
                    minWidth: 70,
                  }}
                >
                  Horário
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <TextInput
                    value={hourText}
                    onChangeText={(text) =>
                      setHourText(text.replace(/[^0-9]/g, "").slice(0, 2))
                    }
                    keyboardType="number-pad"
                    placeholder="18"
                    placeholderTextColor="#475569"
                    maxLength={2}
                    style={{
                      width: 60,
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      borderRadius: 10,
                      paddingVertical: 12,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  />

                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    :
                  </Text>

                  <TextInput
                    value={minuteText}
                    onChangeText={(text) =>
                      setMinuteText(text.replace(/[^0-9]/g, "").slice(0, 2))
                    }
                    keyboardType="number-pad"
                    placeholder="00"
                    placeholderTextColor="#475569"
                    maxLength={2}
                    style={{
                      width: 60,
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      borderRadius: 10,
                      paddingVertical: 12,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Seção: Meta de Aprendizado */}
            <View
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2A3142",
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#2A3142",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="book-outline" size={18} color="#3B82F6" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Meta de Palavras
                </Text>
              </View>

              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 18,
                }}
              >
                Quantas palavras você quer aprender por dia?
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: "#CBD5E1",
                    fontSize: 15,
                    fontWeight: "500",
                    minWidth: 70,
                  }}
                >
                  Meta Diária
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TextInput
                    value={goalText}
                    onChangeText={(text) =>
                      setGoalText(text.replace(/[^0-9]/g, "").slice(0, 4))
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#475569"
                    maxLength={4}
                    style={{
                      width: 80,
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      borderRadius: 10,
                      paddingVertical: 12,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  />

                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 14,
                    }}
                  >
                    palavras
                  </Text>
                </View>
              </View>
            </View>

            {/* Seção: Meta de Estudo */}
            <View
              style={{
                backgroundColor: "#1E2432",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#2A3142",
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "#2A3142",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="time-outline" size={18} color="#3B82F6" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Meta de Tempo
                </Text>
              </View>

              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 18,
                }}
              >
                Quanto tempo você quer dedicar aos estudos por dia?
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    color: "#CBD5E1",
                    fontSize: 15,
                    fontWeight: "500",
                    minWidth: 70,
                  }}
                >
                  Meta Diária
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <TextInput
                    value={studyGoalHourText}
                    onChangeText={(text) =>
                      setStudyGoalHourText(text.replace(/[^0-9]/g, "").slice(0, 2))
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#475569"
                    maxLength={2}
                    style={{
                      width: 60,
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      borderRadius: 10,
                      paddingVertical: 12,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  />

                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    h
                  </Text>

                  <TextInput
                    value={studyGoalMinuteText}
                    onChangeText={(text) =>
                      setStudyGoalMinuteText(text.replace(/[^0-9]/g, "").slice(0, 2))
                    }
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#475569"
                    maxLength={2}
                    style={{
                      width: 60,
                      backgroundColor: "#0A0E17",
                      borderWidth: 1,
                      borderColor: "#2A3142",
                      borderRadius: 10,
                      paddingVertical: 12,
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  />

                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 14,
                    }}
                  >
                    min
                  </Text>
                </View>
              </View>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              onPress={() => {
                void handleSave();
              }}
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                marginTop: 12,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Salvar Configurações
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}