import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { serviceService } from "../../src/services/productd_services";
import { Service } from "../../src/types/Service";

interface FormularioServico {
  nome: string;
  preco: string;
  descricao: string;
}

const SERVICOS_INICIAIS: Service[] = [
  {
    nome: "Corte de Cabelo",
    preco: "R$ 50",
    descricao: "Inclui lavagem com produtos premium.",
  },
  {
    nome: "Escova",
    preco: "R$ 45",
    descricao:
      "Lavagem profunda, secagem e modelagem com escova para um efeito liso ou ondulado duradouro.",
  },
  {
    nome: "Coloracao",
    preco: "R$ 120",
    descricao: "Aplicacao de coloracao profissional mais escova para um resultado duradouro.",
  },
  {
    nome: "Hidratacao",
    preco: "R$ 60",
    descricao:
      "Tratamento intensivo para cabelos ressecados, devolvendo maciez e brilho.",
  },
  {
    nome: "Progressiva",
    preco: "R$ 180",
    descricao:
      "Alinhamento capilar termico com produtos de alta tecnologia para um liso natural.",
  },
];

export default function ServicosScreen() {
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [modalFormularioVisible, setModalFormularioVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Service | null>(null);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [formulario, setFormulario] = useState<FormularioServico>({
    nome: "",
    preco: "",
    descricao: "",
  });

  const editando = useMemo(() => Boolean(servicoSelecionado?.id), [servicoSelecionado]);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setCarregando(true);
      let lista = await serviceService.listar();

      if (lista.length === 0) {
        await Promise.all(SERVICOS_INICIAIS.map((servico) => serviceService.inserir(servico)));
        lista = await serviceService.listar();
      }

      setServicos(lista);
    } catch (error) {
      console.log("Erro ao carregar servicos:", error);
      Alert.alert("Erro", "Nao foi possivel carregar os servicos.");
    } finally {
      setCarregando(false);
    }
  };

  const abrirDetalhes = (servico: Service) => {
    setServicoSelecionado(servico);
    setModalDetalhesVisible(true);
  };

  const abrirCadastro = () => {
    setServicoSelecionado(null);
    setFormulario({
      nome: "",
      preco: "",
      descricao: "",
    });
    setModalFormularioVisible(true);
  };

  const abrirEdicao = (servico: Service) => {
    setServicoSelecionado(servico);
    setFormulario({
      nome: servico.nome,
      preco: servico.preco,
      descricao: servico.descricao,
    });
    setModalDetalhesVisible(false);
    setModalFormularioVisible(true);
  };

  const atualizarCampo = (campo: keyof FormularioServico, valor: string) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const salvarServico = async () => {
    const nome = formulario.nome.trim();
    const preco = formulario.preco.trim();
    const descricao = formulario.descricao.trim();

    if (!nome || !preco || !descricao) {
      Alert.alert("Campos obrigatorios", "Preencha nome, preco e descricao.");
      return;
    }

    try {
      setSalvando(true);

      if (servicoSelecionado?.id) {
        await serviceService.alterar(servicoSelecionado.id, {
          nome,
          preco,
          descricao,
        });
      } else {
        await serviceService.inserir({
          nome,
          preco,
          descricao,
        });
      }

      setModalFormularioVisible(false);
      setServicoSelecionado(null);
      await carregarServicos();
    } catch (error) {
      console.log("Erro ao salvar servico:", error);
      Alert.alert("Erro", "Nao foi possivel salvar o servico.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirServico = async () => {
    if (!servicoSelecionado?.id) return;

    Alert.alert("Excluir servico", ` "${servicoSelecionado.nome}"?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await serviceService.excluir(servicoSelecionado.id!);
            setModalDetalhesVisible(false);
            setServicoSelecionado(null);
            await carregarServicos();
          } catch (error) {
            console.log("Erro ao excluir servico:", error);
            Alert.alert("Erro", "Nao foi possivel excluir o servico.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.titulo}>Nossos Servicos</Text>
          <Text style={styles.subtitulo}>
            Cadastre, edite e acompanhe os servicos oferecidos pelo studio.
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} activeOpacity={0.9} onPress={abrirCadastro}>
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Adicionar Servico</Text>
        </TouchableOpacity>

        {carregando ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.stateText}>Carregando servicos...</Text>
          </View>
        ) : (
          <FlatList
            data={servicos}
            keyExtractor={(item) => item.id ?? item.nome}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.card}
                onPress={() => abrirDetalhes(item)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.row}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="cut" size={24} color="#7C3AED" />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.nome}>{item.nome}</Text>
                      <Text style={styles.descricaoCurta} numberOfLines={2}>
                        {item.descricao}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.precoBadge}>
                    <Text style={styles.precoText}>{item.preco}</Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardHint}>Ver detalhes e editar</Text>
                  <Ionicons name="create-outline" size={18} color="#8B7AA8" />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalDetalhesVisible}
        onRequestClose={() => setModalDetalhesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="cut" size={38} color="#7C3AED" />
              </View>
              <Pressable
                onPress={() => setModalDetalhesVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>{servicoSelecionado?.nome}</Text>
            <Text style={styles.modalPrice}>{servicoSelecionado?.preco}</Text>
            <Text style={styles.modalDescription}>{servicoSelecionado?.descricao}</Text>

            <TouchableOpacity
              style={styles.buttonEditar}
              onPress={() => servicoSelecionado && abrirEdicao(servicoSelecionado)}
            >
              <Ionicons name="create-outline" size={18} color="#7C3AED" />
              <Text style={styles.buttonEditarText}>Editar Servico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonExcluir} onPress={excluirServico}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={styles.buttonExcluirText}>Excluir Servico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonAgendar}
              onPress={() => {
                setModalDetalhesVisible(false);
                router.push("/agendar");
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#FFF" />
              <Text style={styles.buttonText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={modalFormularioVisible}
        onRequestClose={() => setModalFormularioVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editando ? "Editar Servico" : "Novo Servico"}
              </Text>
              <Pressable
                onPress={() => setModalFormularioVisible(false)}
                style={styles.formCloseButton}
              >
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={formulario.nome}
              onChangeText={(valor) => atualizarCampo("nome", valor)}
              placeholder="Ex.: Corte feminino"
              placeholderTextColor="#9A90AB"
              style={styles.input}
            />

            <Text style={styles.label}>Preco</Text>
            <TextInput
              value={formulario.preco}
              onChangeText={(valor) => atualizarCampo("preco", valor)}
              placeholder="Ex.: R$ 80,00"
              placeholderTextColor="#9A90AB"
              style={styles.input}
            />

            <Text style={styles.label}>Descricao</Text>
            <TextInput
              value={formulario.descricao}
              onChangeText={(valor) => atualizarCampo("descricao", valor)}
              placeholder="Descreva o servico"
              placeholderTextColor="#9A90AB"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.inputDescricao]}
            />

            <TouchableOpacity
              style={[styles.buttonSalvar, salvando && styles.buttonDisabled]}
              onPress={salvarServico}
              disabled={salvando}
            >
              <Text style={styles.buttonText}>
                {salvando ? "Salvando..." : editando ? "Salvar Alteracoes" : "Cadastrar Servico"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F0FF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hero: {
    marginTop: 18,
    marginBottom: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#221431",
  },
  subtitulo: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6278",
  },
  addButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
  listaContent: {
    paddingBottom: 40,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B6278",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 12,
  },
  nome: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F2340",
  },
  descricaoCurta: {
    marginTop: 4,
    fontSize: 13,
    color: "#7B718E",
  },
  precoBadge: {
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  precoText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7C3AED",
  },
  cardBottom: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1ECF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B7AA8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 20, 49, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 34,
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  modalIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -62,
    borderWidth: 6,
    borderColor: "#FFF",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2F2340",
    marginTop: 16,
    textAlign: "center",
  },
  modalPrice: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: "#7C3AED",
  },
  modalDescription: {
    marginTop: 12,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 24,
    color: "#6F6482",
    textAlign: "center",
  },
  buttonEditar: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#F8F2FF",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  buttonEditarText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
  buttonExcluir: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#FFF1F2",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FBCACA",
  },
  buttonExcluirText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },
  buttonAgendar: {
    width: "100%",
    backgroundColor: "#7C3AED",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  formModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2F2340",
  },
  formCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#44305F",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F9F6FF",
    borderWidth: 1,
    borderColor: "#E9DFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#2F2340",
  },
  inputDescricao: {
    minHeight: 120,
  },
  buttonSalvar: {
    marginTop: 24,
    backgroundColor: "#7C3AED",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
  },
});
