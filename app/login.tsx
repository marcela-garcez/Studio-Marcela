import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar(){

    const usuarioSalvo = await AsyncStorage.getItem("usuario");

    if(!usuarioSalvo){
      alert("Nenhum usuário cadastrado!");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    if(email === usuario.email && senha === usuario.senha){

      await AsyncStorage.setItem("usuarioLogado", JSON.stringify(usuario));

      alert("Login realizado!");

      router.replace("/");

    }else{
      alert("Email ou senha incorretos");
    }

  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={entrar}>
        <Text style={styles.texto}>ENTRAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop:20 }}
         onPress={() => router.push("/cadastro")}
        >
      <Text style={{ textAlign:"center", color:"#8A2BE2" }}>
         Não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
container:{
flex:1,
justifyContent:"center",
padding:20
},

titulo:{
fontSize:28,
fontWeight:"bold",
textAlign:"center",
marginBottom:30
},

input:{
borderWidth:1,
padding:15,
borderRadius:10,
marginBottom:15
},

botao:{
backgroundColor:"#8A2BE2",
padding:18,
borderRadius:20,
alignItems:"center"
},

texto:{
color:"#fff",
fontWeight:"bold"
}
});