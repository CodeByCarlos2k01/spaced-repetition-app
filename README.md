# PolyGlota

> Aplicativo mobile para aprendizagem de vocabulário em idiomas por meio de **leitura contextual**, **tradução rápida**, **áudio**, **imagens** e **repetição espaçada**.

---

## 📖 Sobre

O PolyGlota transforma a leitura de textos reais em uma experiência ativa de aprendizado. Em vez de depender de listas soltas de palavras, o app une **exposição contextual** com **revisão inteligente**, ajudando você a consolidar vocabulário de forma natural e duradoura.

---

## 🚀 Fluxo do App

1. **Leia** — Abra textos ou páginas da web diretamente no app  
2. **Toque** — Selecione palavras desconhecidas para ver traduções instantâneas  
3. **Salve** — As palavras são automaticamente adicionadas ao seu plano de estudo  
4. **Pratique** — Reforce o vocabulário com quizzes interativos e revisões espaçadas  
5. **Acompanhe** — Visualize métricas de retenção, tempo de estudo e evolução  

---

## ✨ Funcionalidades

### 📚 Leitura Inteligente
- Navegador embutido com modo leitura otimizado  
- Toque em qualquer palavra para tradução instantânea via bancos locais  
- Salvamento automático do vocabulário encontrado  
- Retomada de leitura onde parou  

### 🧠 Repetição Espaçada
- Algoritmo que adapta revisões conforme seu desempenho  
- Classificação inteligente: palavras novas, em revisão ou esquecidas  
- Priorização automática do que precisa ser revisto  

### 🎯 Quiz e Treino Ativo
- Múltipla escolha e modo de digitação  
- Geração dinâmica de alternativas e prompts  
- Reforço focado nas palavras mais difíceis  

### 🔊 Recursos Multimodais
- Áudio para pronúncia correta  
- Associação com imagens para reforço visual  

### 📊 Acompanhamento
- Histórico de palavras aprendidas  
- Taxa de retenção e palavras mais desafiadoras  
- Tempo total de estudo  

### 🛠 Ferramentas Auxiliares
- Tradutor embutido via WebView  
- Lembretes diários por notificação  
- Música de fundo com opção de mute  

---

## 🌍 Idiomas Suportados

| Idioma   | Status        |
|----------|---------------|
| Inglês   | ✅ Disponível |
| Espanhol | ✅ Disponível |
| Francês  | ✅ Disponível |
| Alemão   | ✅ Disponível |
| Italiano | ✅ Disponível |

---

## 🛠 Stack Tecnológica

**Core:** React Native + Expo, TypeScript, Expo Router  
**Persistência:** SQLite, AsyncStorage, expo-file-system  
**UI:** @react-navigation/drawer, react-native-reanimated  
**Multimídia:** expo-audio, react-native-webview, expo-notifications

---

## 📁 Estrutura do Projeto

PolyGlota/ ├── app/ # Telas e rotas ├── assets/ # Imagens, ícones, fontes e bancos ├── components/ # Componentes reutilizáveis ├── src/ │ ├── constants/ # Constantes │ ├── database/ # Acesso SQLite │ ├── engine/ # Regras de quiz │ ├── hooks/ # Hooks customizados │ ├── models/ # Modelos de dados │ ├── repository/ # Acesso a dados │ ├── services/ # Regras de negócio │ └── utils/ # Utilitários ├── app.json ├── package.json └── tsconfig.json

---

## ⚙️ Como Executar

git clone <URL_DO_REPOSITORIO> && cd PolyGlota && npm install && npx expo start

---

## 📦 Build Android

npx expo prebuild --platform android && cd android && ./gradlew assembleDebug

APK em: android/app/build/outputs/apk/debug/app-debug.apk

---

## 🗄 Bancos de Dados

wordnet_omw_en_pt.db, wordnet_omw_es_pt.db, wordnet_omw_fr_pt.db, wordnet_omw_de_pt.db, wordnet_omw_ita_pt.db

---

## 👤 Autor

Desenvolvido por Carlos.
