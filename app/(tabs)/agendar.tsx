import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const listaServicos = [
  { id: "1", nome: "Corte de Cabelo", icone: "cut" },
  { id: "2", nome: "Escova", icone: "brush" },
  { id: "3", nome: "Coloração", icone: "color-palette" },
  { id: "4", nome: "Hidratação", icone: "water" },
];

export default function Agendar() {

  const [servico, setServico] = useState("");
  const [data, setData] = useState(new Date());
  const [mostrar, setMostrar] = useState(false);

  const onChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setData(selectedDate);
    }
    setMostrar(false);
  };

  async function salvarAgendamento() {

    if (!servico) {
      alert("Escolha um serviço!");
      return;
    }

    const novo = {
      id: Date.now().toString(),
      servico,
      data: data.toLocaleDateString(),
      hora: data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
       minute: "2-digit"
})
    };

    try {
      const dados = await AsyncStorage.getItem("agendamentos");
      const lista = dados ? JSON.parse(dados) : [];

      lista.push(novo);

      await AsyncStorage.setItem("agendamentos", JSON.stringify(lista));

      alert("Agendamento realizado com sucesso!");

      // limpar campos
      setServico("");
      setData(new Date());

    } catch (error) {
      console.log(error);
      alert("Erro ao salvar agendamento");
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Escolha o serviço</Text>

      <FlatList
        data={listaServicos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              servico === item.nome && { borderColor: "#8A2BE2", borderWidth: 2 }
            ]}
            onPress={() => setServico(item.nome)}
          >
            <Ionicons name={item.icone as any} size={28} color="#8A2BE2" />
            <Text style={styles.nome}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.escolhido}>
        Serviço: {servico || "Nenhum selecionado"}
      </Text>

      <Button title="Escolher Data e Hora" onPress={() => setMostrar(true)} />

      <Text style={styles.data}>
        {data.toLocaleDateString()} às {data.toLocaleTimeString()}
      </Text>

      {mostrar && (
        <DateTimePicker
          value={data}
          mode="datetime"
          display="default"
          onChange={onChange}
        />
      )}

      <TouchableOpacity style={styles.botao} onPress={salvarAgendamento}>
        <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
          Confirmar Agendamento
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fcfbfc"
  },

  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },
  cardAgendamento:{
  flexDirection:"row",
  alignItems:"center",
  backgroundColor:"#fff",
  padding:15,
  borderRadius:15,
  marginBottom:10,
  shadowColor:"#000",
  shadowOpacity:0.1,
  shadowRadius:5,
  elevation:3
},
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },

  nome: {
    marginLeft: 10,
    fontSize: 16
  },

  escolhido: {
    marginTop: 15,
    fontSize: 16
  },

  data: {
    marginTop: 10,
    fontSize: 15,
    color: "#555"
  },

  botao: {
    marginTop: 20,
    backgroundColor: "#8d2be2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  }

});