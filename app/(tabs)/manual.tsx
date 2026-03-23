import { ScrollView, Text, View } from "react-native";

export default function ManualScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#1f1f1f" }} // fundo principal
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
    >

      <View
        style={{
          backgroundColor: "#2e2e2e", // card/bloco
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ffffff", // borda
        }}
      >

        {/* Título principal */}
        <Text style={{ fontSize: 25, fontWeight: "700", color: "#fff", marginBottom: 16 }}>
          Lógica de Aprendizado
        </Text>

        {/* Parágrafos */}
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          Este aplicativo foi desenvolvido para ajudar você a aprender vocabulário em idiomas de forma eficiente e duradoura.
          Em vez de simplesmente memorizar palavras de forma aleatória, o sistema utiliza princípios da ciência da
          aprendizagem, como:
        </Text>
        <Text style={{ fontSize: 16, color: "#fff" }}>• Repetição Espaçada;</Text>
        <Text style={{ fontSize: 16, color: "#fff" }}>• Recordação Ativa;</Text>
        <Text style={{ fontSize: 16, color: "#fff" }}>• Exposição Contextual.</Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Seção */}
        <Text style={{ fontSize: 25, fontWeight: "700", color: "#fff", marginBottom: 16 }}>
          Aprendizado Por Contexto
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          Uma das formas mais eficazes de aprender um idioma é por meio da leitura de textos reais.
          Por isso, o aplicativo permite que você leia textos importados de páginas da internet.
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          Durante a leitura, sempre que você tocar em uma palavra desconhecida, o aplicativo mostra a tradução
          e adiciona essa palavra à sua lista de aprendizado.
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>
          Esse processo tem duas vantagens importantes:
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>• Você aprende palavras dentro de um contexto real de uso;</Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 12 }}>
          • Você seleciona apenas as palavras que realmente são novas para você.
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Lista de Palavras */}
        <Text style={{ fontSize: 25, fontWeight: "700", color: "#fff", marginBottom: 16 }}>
          Lista de Palavras
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          Todas as palavras que você seleciona durante a leitura são armazenadas na seção "Minhas Palavras".
          Ali o aplicativo organiza as palavras em diferentes estados de aprendizado, permitindo que o sistema
          saiba quais precisam ser revisadas com mais frequência.
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Repetição Espaçada */}
        <Text style={{ fontSize: 25, fontWeight: "700", color: "#fff", marginBottom: 16 }}>
          Repetição Espaçada
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          O aplicativo utiliza um método chamado repetição espaçada, baseado em psicologia cognitiva.
          Revisões feitas em intervalos progressivamente maiores ajudam a fixar o conhecimento na memória
          de longo prazo.
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>Por exemplo:</Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>• Palavra recém aprendida aparece rapidamente no quiz;</Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 8 }}>• Se você acertar várias vezes, ela aparece com menos frequência;</Text>
        <Text style={{ fontSize: 16, color: "#fff", marginBottom: 12 }}>
          • Se você errar, ela volta a aparecer mais cedo.
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24 }}>
          Assim, o aplicativo se adapta ao seu progresso.
        </Text>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: "#3a3a3a", marginVertical: 16 }} />

        {/* Exercícios */}
        <Text style={{ fontSize: 25, fontWeight: "700", color: "#fff", marginBottom: 16 }}>
          Exercícios
        </Text>
        <Text style={{ fontSize: 16, color: "#fff", lineHeight: 24, marginBottom: 12 }}>
          Durante os exercícios, o aplicativo apresenta palavras que você já encontrou e pede que lembre
          o significado ou a forma correta.
        </Text>
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#fff", marginBottom: 6 }}>
          • Múltipla escolha
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 12 }}>
          Você vê uma palavra e precisa escolher a tradução correta entre várias alternativas.
        </Text>
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#fff", marginBottom: 6 }}>
          • Digitar a palavra
        </Text>
        <Text style={{ fontSize: 16, color: "#c8c8c8", marginBottom: 12 }}>
          O aplicativo mostra o significado e você precisa digitar a palavra original.
        </Text>
        
      </View>
    </ScrollView>
  );
}