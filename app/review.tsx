import { View, Text, Button } from "react-native";
import { useEffect, useState } from "react";
import { getReviewWords, updateWordAfterReview } from "../src/database/database";
import { useRouter } from "expo-router";

export default function Review() {
  const router = useRouter();
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    const result = await getReviewWords();
    setWords(result);
  }

  async function handleAnswer(correct: boolean) {
    const word = words[currentIndex];

    await updateWordAfterReview(word, correct);

    if (currentIndex + 1 < words.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace("/reading");
    }
  }

  if (words.length === 0) {
    return (
      <View>
        <Text>Nenhuma palavra para revisar hoje.</Text>
        <Button title="Voltar" onPress={() => router.replace("/reading")} />
      </View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <View>
      <Text>Revisão</Text>
      <Text>{currentWord.word}</Text>

      <Button title="Acertei" onPress={() => handleAnswer(true)} />
      <Button title="Errei" onPress={() => handleAnswer(false)} />
    </View>
  );
}