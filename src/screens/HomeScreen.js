import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import Display from '../components/Display';
import Teclado from '../components/Teclado';
import {
  calcular,
  ehOperador,
  ultimoNumero,
  alternarSinal,
  porcentagem,
} from '../utils/calcular';
import { carregar, salvar } from '../storage/historico';

export default function HomeScreen({ navigation, route }) {
  const [expressao, setExpressao] = useState('');
  const [resultado, setResultado] = useState('');
  const [calculado, setCalculado] = useState(false); // acabou de apertar =
  const [memoria, setMemoria] = useState(0);
  const [historico, setHistorico] = useState([]);

  // Evolução 1: recarrega o histórico toda vez que a tela ganha foco.
  // Sem isso, a Home continuaria com a lista antiga guardada no estado
  // (as contas apagadas voltariam ao salvar uma conta nova).
  useEffect(() => {
    carregar().then(setHistorico); // primeira abertura
    const desinscrever = navigation.addListener('focus', () => {
      carregar().then(setHistorico);
    });
    return desinscrever;
  }, [navigation]);

  // Evolução 3: o histórico devolve o resultado escolhido via route.params.
  // Observamos também o "ts" (muda a cada toque); se observássemos só o valor,
  // tocar na mesma conta duas vezes não dispararia o efeito de novo.
  useEffect(() => {
    if (route.params?.valor !== undefined) {
      setExpressao(String(route.params.valor));
      setResultado('');
      setCalculado(false);
    }
  }, [route.params?.valor, route.params?.ts]);

  function limpar() {
    setExpressao('');
    setResultado('');
    setCalculado(false);
  }

  function valorAtual() {
    const v = calcular(expressao);
    return typeof v === 'number' ? v : null;
  }

  async function aoIgual() {
    if (expressao === '') return;
    const valor = String(calcular(expressao));
    setResultado(valor);
    setCalculado(true);
    if (valor === 'Erro') return;

    const item = {
      id: Date.now().toString(),
      conta: expressao,
      resultado: valor,
    };
    const novo = [item, ...historico];
    setHistorico(novo);
    await salvar(novo);
  }

  function aoTocar(tecla) {
    if (tecla === 'AC') return limpar();

    if (tecla === 'OFF') {
      limpar();
      setMemoria(0);
      return;
    }

    if (tecla === 'C') {
      setExpressao(expressao.slice(0, -1));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (tecla === '=') return aoIgual();

    if (tecla === '+/-') {
      setExpressao(alternarSinal(expressao));
      return;
    }

    if (tecla === '%') {
      setExpressao(porcentagem(expressao));
      return;
    }

    if (tecla === 'Raiz') {
      if (expressao === '') return;
      const v = valorAtual();
      if (v === null || v < 0) {
        setResultado('Erro');
        setCalculado(true);
        return;
      }
      setExpressao(String(parseFloat(Math.sqrt(v).toFixed(10))));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (tecla === 'M+' || tecla === 'M-') {
      const v = valorAtual();
      if (v === null) return;
      const novo = tecla === 'M+' ? memoria + v : memoria - v;
      setMemoria(parseFloat(novo.toFixed(10)));
      return;
    }

    if (tecla === 'MRC') {
      const base = calculado ? '' : expressao;
      setExpressao(base.slice(0, ultimoNumero(base).inicio) + String(memoria));
      setResultado('');
      setCalculado(false);
      return;
    }

    if (ehOperador(tecla)) {
      // depois do =, continua a conta a partir do resultado
      let base = calculado ? (resultado === 'Erro' ? '' : resultado) : expressao;
      if (base === '' && tecla !== '-') return;
      if (base.length > 1 && ehOperador(base.slice(-1))) {
        base = base.slice(0, -1); // troca o operador anterior
      }
      setExpressao(base + tecla);
      setResultado('');
      setCalculado(false);
      return;
    }

    // dígito ou ponto
    const base = calculado ? '' : expressao;
    const atual = ultimoNumero(base).texto;
    if (tecla === '.' && atual.includes('.')) return;
    const novo = tecla === '.' && (atual === '' || atual === '-') ? '0.' : tecla;
    setExpressao(base + novo);
    setResultado('');
    setCalculado(false);
  }

  return (
    // ScrollView: na web (ou em telas baixas) o teclado é maior que a janela,
    // então a tela precisa rolar para mostrar as últimas linhas e o botão.
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.titulo}>Calculadora do Fukuta</Text>

      <Display expressao={expressao} resultado={resultado} memoria={memoria} />
      <Teclado onPress={aoTocar} />

      <View style={styles.botaoHistorico}>
        <Button
          title="Ver histórico"
          onPress={() => navigation.navigate('Historico', { historico })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#4a0303' },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
    backgroundColor: '#4a0303',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titulo: {
    textAlign: 'center',
    backgroundColor: 'gray',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    height: 35,
    width: '100%',
  },
  botaoHistorico: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
});
