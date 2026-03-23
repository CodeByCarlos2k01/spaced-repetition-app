import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Word } from "../src/models/Word";
import { WordRepository } from "../src/repository/wordRepository";
import { getForgotten } from "../src/engine/scheduler";
import { completeForgotten } from "../src/engine/reviewEngine";

export default function ForgottenScreen() {
  const [words, setWords] = useState<Word[]>([]);
  const repo = new WordRepository();

  useEffect(() => {
    const all = repo.getAll();
    const forgotten = getForgotten(all);
    setWords(forgotten);
  }, []);

  function concluir(word: Word) {
    completeForgotten(word);
    repo.update(word);

    const restantes = words.filter(w => w.word !== word.word);
    setWords(restantes);
  }

  if (words.length === 0) {
    return (
      <View style={{ marginTop: 60 }}>
        <Text>Palavras esquecidas concluídas ✅</Text>
      </View>
    );
  }

  const atual = words[0];

  return (
    <View style={{ marginTop: 60, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Palavras Esquecidas</Text>
      <Text style={{ fontSize: 18, marginVertical: 20 }}>
        {atual.word}
      </Text>

      <Button
        title="Reaprender palavra"
        onPress={() => concluir(atual)}
      />
    </View>
  );
}