import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";



export default function Perfil() {

  const [usuario, setUsuario] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);

  useEffect(() => {
    verificarLogin();
    carregarAgendamentos();
  }, []);

  async function verificarLogin() {

    const dados = await AsyncStorage.getItem("usuarioLogado");

    if (!dados) {
      router.push("/login");
      return;
    }

    setUsuario(JSON.parse(dados));
  }

  const carregarAgendamentos = async () => {
  const dados = await AsyncStorage.getItem("agendamentos");

  if (dados) {
    let lista = JSON.parse(dados);

    lista = lista.filter((item: any) => item.servico && item.data && item.hora);

    // ordenar do mais recente para o mais antigo
    lista.sort((a: any, b: any) => {
      const dataA = new Date(`${a.data} ${a.hora}`);
      const dataB = new Date(`${b.data} ${b.hora}`);
      return dataB.getTime() - dataA.getTime();
    });

    await AsyncStorage.setItem("agendamentos", JSON.stringify(lista));

    setAgendamentos(lista);
  }
};

  async function sair() {
    await AsyncStorage.removeItem("usuarioLogado");
    router.push("/login");
  }

  if (!usuario) {
    return null;
  }
async function excluirAgendamento(index: number) {
  const novaLista = [...agendamentos];
  novaLista.splice(index, 1);

  setAgendamentos(novaLista);
  await AsyncStorage.setItem("agendamentos", JSON.stringify(novaLista));
}
  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.avatar}
        />

        <Text style={styles.nome}>{usuario.nome}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
      </View>

      <View style={styles.menu}>

        <TouchableOpacity 
          style={styles.item}
          onPress={() => router.push("/agendar")}
        >
          <Ionicons name="calendar-outline" size={22} color="#8A2BE2" />
          <Text style={styles.texto}>Agendar Novo Serviço</Text>
        </TouchableOpacity>

        <Text style={styles.tituloAgendamento}>Meus Agendamentos</Text>

        {agendamentos.length === 0 && (
          <Text style={styles.vazio}>Nenhum agendamento ainda</Text>
        )}
      
        {agendamentos.map((item, index) => (
  <View key={index} style={styles.cardAgendamento}>
    
    <Ionicons name="time-outline" size={20} color="#8A2BE2" />

    <View style={{ marginLeft: 10, flex: 1 }}>
      <Text style={styles.servico}>{item.servico}</Text>
      <Text style={styles.info}>
        {item.data} • {item.hora}
      </Text>
    </View>

    <TouchableOpacity onPress={() => excluirAgendamento(index)}>
      <Ionicons name="trash-outline" size={20} color="red" />
    </TouchableOpacity>

  </View>
))}

        <TouchableOpacity style={styles.item}>
          <Ionicons name="create-outline" size={22} color="#8A2BE2" />
          <Text style={styles.texto}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Ionicons name="notifications-outline" size={22} color="#8A2BE2" />
          <Text style={styles.texto}>Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemSair} onPress={sair}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.textoSair}>Sair</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f5f5f5",
padding:20
},

header:{
alignItems:"center",
marginBottom:30
},

avatar:{
width:110,
height:110,
borderRadius:60,
borderWidth:3,
borderColor:"#8A2BE2",
marginBottom:10
},

nome:{
fontSize:22,
fontWeight:"bold"
},

email:{
fontSize:14,
color:"#777"
},

menu:{
marginTop:10
},

item:{
flexDirection:"row",
alignItems:"center",
padding:16,
backgroundColor:"#fff",
borderRadius:15,
marginBottom:12
},

texto:{
marginLeft:10,
fontSize:16
},

tituloAgendamento:{
fontSize:18,
fontWeight:"bold",
marginTop:10,
marginBottom:10
},

vazio:{
color:"#777",
marginBottom:10
},

cardAgendamento:{
flexDirection:"row",
alignItems:"center",
backgroundColor:"#fff",
padding:15,
borderRadius:12,
marginBottom:10
},

servico:{
fontSize:16,
fontWeight:"bold"
},

info:{
fontSize:13,
color:"#777"
},

itemSair:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
padding:16,
backgroundColor:"#8A2BE2",
borderRadius:15,
marginTop:10
},

textoSair:{
marginLeft:10,
fontSize:16,
color:"#fff",
fontWeight:"bold"
}

});