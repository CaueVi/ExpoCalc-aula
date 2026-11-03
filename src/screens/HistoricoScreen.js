import { useState } from 'react';
import { FlatList, Text, View, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { limpar, salvar } from '../storage/historico';

export default function HistoricoScreen({ route, navigation }) {
  // Evolução 1: a lista vira estado, para a tela poder mudar
  const [lista, setLista] = useState(route.params.historico);

  // Evolução 1: apaga do celular (AsyncStorage) e depois da tela
  async function limparHistorico() {
    await limpar();
    setLista([]);
  }

  // Evolução 2: filter cria uma lista NOVA sem a conta; o React só atualiza
  // a tela quando recebe um novo array (mexer no array do estado não funciona)
  async function excluir(id) {
    const nova = lista.filter((item) => item.id !== id);
    setLista(nova);
    await salvar(nova);
  }

  // Evolução 3: volta para a Home que já existe (popTo não empilha outra),
  // levando o resultado. O "ts" muda a cada toque para o efeito da Home rodar
  // mesmo quando o valor é igual ao anterior.
  function reutilizar(item) {
    navigation.popTo('Home', { valor: item.resultado, ts: Date.now() });
  }

  return (
    <View style={styles.container}>
      <View style={styles.botaoLimpar}>
        <Button title="Limpar histórico" onPress={limparHistorico} />
      </View>

      <FlatList
        style={styles.lista}
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.conta} onPress={() => reutilizar(item)}>
              <Text style={styles.linha}>
                {item.conta} = {item.resultado}
              </Text>
            </TouchableOpacity>
            <View style={styles.botaoExcluir}>
              <Button title="Excluir" onPress={() => excluir(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.linha}>Nenhuma conta ainda</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4a0303' },
  lista: { flex: 1 },
  linha: { fontSize: 24, padding: 12, color: 'white' },
  botaoLimpar: {
    margin: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignSelf: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conta: { flex: 1 },
  botaoExcluir: {
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});
