import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, List, Modal, Portal, Provider } from 'react-native-paper';

export default function App() {
  const [cep, setCep] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [sexo, setSexo] = useState(null);
  const [outroSexo, setOutroSexo] = useState('');
  const [dados, setDados] = useState({});
  const [selectedValue, setSelectedValue] = useState(null);
  const [expandedSexo, setExpandedSexo] = useState(false);
  const [expandedEstado, setExpandedEstado] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleSexoPress = (x) => {
    setSexo(x);
    setExpandedSexo(false);
    if (x !== 'Outro') setOutroSexo('');
  };

  const handleEstadoPress = (x) => {
    setSelectedValue(x);
    setExpandedEstado(false);
  };

  const validarCampos = () => {
    let novoErros = {};

    if (!nome.trim()) novoErros.nome = 'O nome é obrigatório.';
    if (!email.includes('@') || !email.includes('.')) novoErros.email = 'Digite um e-mail válido.';
    if (!sexo) novoErros.sexo = 'Selecione uma identidade de gênero.';
    if (sexo === 'Outro' && !outroSexo.trim()) novoErros.outroSexo = 'Preencha sua identidade de gênero.';
    if (!cep.match(/^\d{8}$/)) novoErros.cep = 'O CEP deve ter 8 dígitos numéricos.';
    if (!dados?.logradouro) novoErros.cep = 'Busque um CEP válido antes de confirmar.';
    if (!selectedValue) novoErros.estado = 'Selecione um estado.';

    setErrors(novoErros);
    if (Object.keys(novoErros).length === 0) showModal();
  };

  const buscaCep = () => {
    if (!cep.match(/^\d{8}$/)) {
      setErrors((prev) => ({ ...prev, cep: 'O CEP deve ter 8 dígitos numéricos.' }));
      return;
    }

    let url = `https://viacep.com.br/ws/${cep}/json/`;

    fetch(url)
      .then((resp) => resp.json())
      .then((xjson) => {
        if (xjson.erro) {
          setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }));
          setDados({});
          setSelectedValue(null); // Reseta o estado
        } else {
          setDados(xjson);
          setSelectedValue(xjson.uf); // Define o estado automaticamente conforme a resposta
          setErrors((prev) => ({ ...prev, cep: undefined }));
        }
      })
      .catch(() => {
        setErrors((prev) => ({ ...prev, cep: 'Erro ao buscar o CEP. Tente novamente.' }));
      });
  };

  // Lista com todas as UFs do Brasil
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Consulta de CEP</Text>

          <TextInput label='Nome' mode='outlined' value={nome} onChangeText={setNome} style={styles.input} />
          {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

          <TextInput label='Email' mode='outlined' value={email} onChangeText={setEmail} keyboardType='email-address' style={styles.input} />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <List.Section title='Identidade de Gênero'>
            <List.Accordion title={sexo || 'Selecione'} expanded={expandedSexo} onPress={() => setExpandedSexo(!expandedSexo)}>
              {['Masculino', 'Feminino', 'Não binário', 'Prefiro não informar', 'Outro'].map((item) => (
                <List.Item key={item} title={item} onPress={() => handleSexoPress(item)} />
              ))}
            </List.Accordion>
          </List.Section>
          {errors.sexo && <Text style={styles.errorText}>{errors.sexo}</Text>}

          {sexo === 'Outro' && (
            <>
              <TextInput label='Especifique' mode='outlined' value={outroSexo} onChangeText={setOutroSexo} style={styles.input} />
              {errors.outroSexo && <Text style={styles.errorText}>{errors.outroSexo}</Text>}
            </>
          )}

          <TextInput placeholder='Digite o CEP' onChangeText={setCep} value={cep} style={styles.input} mode='outlined' keyboardType='numeric' />
          {errors.cep && <Text style={styles.errorText}>{errors.cep}</Text>}

          <Button icon='card-search' mode='contained' onPress={buscaCep} style={styles.button}>Buscar</Button>

          <TextInput label='Rua' mode='outlined' value={dados?.logradouro || ''} style={styles.input} />
          <TextInput label='Bairro' mode='outlined' value={dados?.bairro || ''} style={styles.input} />
          <TextInput label='Cidade' mode='outlined' value={dados?.localidade || ''} style={styles.input} />

          <List.Section title='Estado'>
            <List.Accordion title={selectedValue || 'Selecione'} expanded={expandedEstado} onPress={() => setExpandedEstado(!expandedEstado)}>
              {ufs.map((estado) => (
                <List.Item
                  key={estado}
                  title={estado}
                  onPress={() => handleEstadoPress(estado)}
                  style={selectedValue === estado ? { backgroundColor: '#e3f2fd' } : {}}
                />
              ))}
            </List.Accordion>
          </List.Section>
          {errors.estado && <Text style={styles.errorText}>{errors.estado}</Text>}

          <Button icon='check' mode='contained' onPress={validarCampos} style={styles.button}>Confirmar</Button>

          <Portal>
            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
              <Text style={styles.modalTitle}>Dados Informados</Text>
              <Text style={styles.modalText}>Nome: {nome}</Text>
              <Text style={styles.modalText}>Email: {email}</Text>
              <Text style={styles.modalText}>Identidade de Gênero: {sexo === 'Outro' ? outroSexo : sexo}</Text>
              <Text style={styles.modalText}>CEP: {cep}</Text>
              <Text style={styles.modalText}>Rua: {dados?.logradouro || ''}</Text>
              <Text style={styles.modalText}>Bairro: {dados?.bairro || ''}</Text>
              <Text style={styles.modalText}>Cidade: {dados?.localidade || ''}</Text>
              <Text style={styles.modalText}>Estado: {selectedValue}</Text>
              <Button onPress={hideModal} mode='contained' style={styles.button}>Fechar</Button>
            </Modal>
          </Portal>
        </View>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F2F5',
  },
  container: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#3A3A3A',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 25,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3A3A3A',
  },
  modalText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 6,
  },
});
