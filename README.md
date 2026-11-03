# ExpoCalc

Calculadora em React Native (Expo SDK 54) com histórico de contas salvo no celular.
Projeto da disciplina de Desenvolvimento de Dispositivos Móveis (Fatec ADS), construído a partir do [ExpoCalc-aula](https://github.com/mrAndersonfeitosa/ExpoCalc-aula) do professor.

## Funcionalidades

- Calculadora com `+`, `-`, `X`, `/`, `%`, `+/-`, raiz e memória (`M+`, `M-`, `MRC`)
- Histórico de contas salvo com AsyncStorage (continua ao fechar e abrir o app)
- **Limpar histórico:** apaga todas as contas da tela e do celular
- **Excluir uma conta:** remove só a conta escolhida
- **Reutilizar uma conta:** ao tocar numa conta do histórico, o resultado volta para o visor e a conta continua a partir dele

## Como rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (SDK 54), aperte `a` para o emulador Android ou `w` para a web.
Se a rede falhar, use `npx expo start --tunnel`.

## Estrutura

```text
App.js                      navegação (Home e Historico)
src/
  components/               Botao, Display e Teclado
  screens/
    HomeScreen.js           calculadora, estado e histórico
    HistoricoScreen.js      lista com FlatList, limpar, excluir e reutilizar
  storage/
    historico.js            salvar, carregar e limpar (AsyncStorage)
  utils/
    calcular.js             cálculo da expressão (sem eval)
```

## O que foi implementado

| Evolução | Como funciona |
|---|---|
| Limpar histórico | `AsyncStorage.removeItem` + `setLista([])`. A Home recarrega o histórico a cada `focus` da tela. |
| Excluir uma conta | `lista.filter(...)` cria uma lista nova, que é salva no AsyncStorage. |
| Reutilizar uma conta | `navigation.popTo('Home', { valor, ts })`. A Home reage com `useEffect`, e o `ts` faz funcionar mesmo ao tocar na mesma conta duas vezes. |

## Tecnologias

React Native, Expo, React Navigation, AsyncStorage
