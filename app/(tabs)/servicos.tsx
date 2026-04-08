import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { serviceService } from "../../src/services/productd_services";
import { Service } from "../../src/types/Service";
import { showAlert, showConfirm } from "../../src/utils/feedback";

type FormularioServico = {
  nome: string;
  preco: string;
  descricao: string;
  informacao: string;
  imageUrl: string;
};

export default function ServicosScreen() {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 960;
  const modalMaxWidth = isWideScreen ? 720 : 560;

  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [modalFormularioVisible, setModalFormularioVisible] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Service | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroImagemPreview, setErroImagemPreview] = useState(false);
  const [formulario, setFormulario] = useState<FormularioServico>({
    nome: "",
    preco: "",
    descricao: "",
    informacao: "",
    imageUrl: "",
  });
  const [servicos, setServicos] = useState<Service[]>([]);

  const editando = useMemo(() => Boolean(servicoSelecionado?.id), [servicoSelecionado]);
  const imagemPreview = formulario.imageUrl.trim() || servicoSelecionado?.imageUrl || "";

  useEffect(() => {
    carregarServicos();
  }, []);

  const limparFormulario = () => {
    setFormulario({
      nome: "",
      preco: "",
      descricao: "",
      informacao: "",
      imageUrl: "",
    });
    setErroImagemPreview(false);
  };

  const carregarServicos = async () => {
    try {
      setCarregando(true);
      const lista = await serviceService.listar();
      setServicos(lista);
    } catch (error) {
      console.log("Erro ao carregar servicos:", error);
      showAlert("Erro", "Nao foi possivel carregar os servicos.");
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
    limparFormulario();
    setModalFormularioVisible(true);
  };

  const abrirEdicao = (servico: Service) => {
    setServicoSelecionado(servico);
    setFormulario({
      nome: servico.nome,
      preco: servico.preco,
      descricao: servico.descricao,
      informacao: servico.informacao ?? "",
      imageUrl: servico.imageUrl ?? "",
    });
    setErroImagemPreview(false);
    setModalDetalhesVisible(false);
    setModalFormularioVisible(true);
  };

  const atualizarCampo = (campo: keyof FormularioServico, valor: string) => {
    if (campo === "imageUrl") {
      setErroImagemPreview(false);
    }

    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const confirmarExclusaoServico = async (id: string) => {
    const confirmou = await showConfirm({
      title: "Confirmar exclusao",
      message: "Tem certeza que deseja excluir este servico?",
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (!confirmou) {
      return;
    }

    try {
      await serviceService.excluir(id);
      setModalDetalhesVisible(false);
      await carregarServicos();
    } catch (error) {
      console.log("Erro ao excluir:", error);
      showAlert("Erro", "Nao foi possivel excluir.");
    }
  };

  const salvarServico = async () => {
    const nome = formulario.nome.trim();
    const preco = formulario.preco.trim();
    const descricao = formulario.descricao.trim();
    const informacao = formulario.informacao.trim();
    const imageUrl = formulario.imageUrl.trim();

    if (!nome || !preco || !descricao) {
      showAlert("Campos obrigatorios", "Preencha nome, preco e descricao.");
      return;
    }

    try {
      setSalvando(true);

      const payload: Service = {
        nome,
        preco,
        descricao,
        informacao,
        imageUrl,
      };

      if (servicoSelecionado?.id) {
        await serviceService.alterar(servicoSelecionado.id, payload);
      } else {
        await serviceService.inserir(payload);
      }

      setModalFormularioVisible(false);
      setServicoSelecionado(null);
      limparFormulario();
      await carregarServicos();
    } catch (error) {
      console.log("Erro ao salvar servico:", error);
      showAlert("Erro", "Nao foi possivel salvar o servico.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.container, isWideScreen && styles.containerWide]}>
        <View style={styles.hero}>
          <Text style={styles.titulo}>Nossos Serviços</Text>
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
            key={isWideScreen ? "grid" : "list"}
            keyExtractor={(item) => item.id ?? item.nome}
            numColumns={isWideScreen ? 2 : 1}
            columnWrapperStyle={isWideScreen ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Ionicons name="briefcase-outline" size={36} color="#A78BFA" />
                <Text style={styles.emptyTitle}>Nenhum servico cadastrado</Text>
                <Text style={styles.emptyText}>
                  Toque em adicionar para criar o primeiro servico.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.card, isWideScreen && styles.cardWide]}
                onPress={() => abrirDetalhes(item)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.row}>
                    <View style={styles.iconContainer}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.cardImage}
                          contentFit="cover"
                        />
                      ) : (
                        <Ionicons name="cut" size={24} color="#7C3AED" />
                      )}
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
          <View style={[styles.modalContent, { maxWidth: modalMaxWidth }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                {servicoSelecionado?.imageUrl ? (
                  <Image
                    source={{ uri: servicoSelecionado.imageUrl }}
                    style={styles.modalImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="cut" size={38} color="#7C3AED" />
                )}
              </View>
              <Pressable onPress={() => setModalDetalhesVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>{servicoSelecionado?.nome}</Text>
            <Text style={styles.modalPrice}>{servicoSelecionado?.preco}</Text>
            <Text style={styles.modalDescription}>
              {servicoSelecionado?.informacao || servicoSelecionado?.descricao}
            </Text>

            <TouchableOpacity
              style={styles.buttonEditar}
              onPress={() => servicoSelecionado && abrirEdicao(servicoSelecionado)}
            >
              <Ionicons name="create-outline" size={18} color="#7C3AED" />
              <Text style={styles.buttonEditarText}>Editar Servico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonExcluir}
              onPress={() => servicoSelecionado?.id && confirmarExclusaoServico(servicoSelecionado.id)}
            >
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
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.formModalContent, { maxWidth: modalMaxWidth }]}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{editando ? "Editar Servico" : "Novo Servico"}</Text>
                <Pressable onPress={() => setModalFormularioVisible(false)} style={styles.formCloseButton}>
                  <Ionicons name="close" size={22} color="#47345F" />
                </Pressable>
              </View>

              <Text style={styles.label}>URL da imagem</Text>
              <TextInput
                value={formulario.imageUrl}
                onChangeText={(valor) => atualizarCampo("imageUrl", valor)}
                placeholder="https://exemplo.com/minha-foto.jpg"
                placeholderTextColor="#9A90AB"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              {imagemPreview ? (
                <Image
                  source={{ uri: imagemPreview }}
                  style={styles.formImagePreview}
                  contentFit="cover"
                  onError={() => setErroImagemPreview(true)}
                />
              ) : (
                <View style={styles.formImagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#A78BFA" />
                  <Text style={styles.formImagePlaceholderText}>Cole uma URL para visualizar a imagem</Text>
                </View>
              )}

              {imagemPreview && erroImagemPreview ? (
                <Text style={styles.imageErrorText}>
                  A imagem nao carregou. Use uma URL direta da foto, como `.jpg`, `.png` ou `.webp`.
                </Text>
              ) : null}

              <View style={[styles.formGrid, isWideScreen && styles.formGridWide]}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    value={formulario.nome}
                    onChangeText={(valor) => atualizarCampo("nome", valor)}
                    placeholder="Ex.: Corte feminino"
                    placeholderTextColor="#9A90AB"
                    style={styles.input}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.label}>Preco</Text>
                  <TextInput
                    value={formulario.preco}
                    onChangeText={(valor) => atualizarCampo("preco", valor)}
                    placeholder="Ex.: R$ 80,00"
                    placeholderTextColor="#9A90AB"
                    style={styles.input}
                  />
                </View>
              </View>

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

              <Text style={styles.label}>Informacoes adicionais</Text>
              <TextInput
                value={formulario.informacao}
                onChangeText={(valor) => atualizarCampo("informacao", valor)}
                placeholder="Detalhes extras do atendimento"
                placeholderTextColor="#9A90AB"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.inputDescricaoCurta]}
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
          </ScrollView>
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
  containerWide: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
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
  columnWrapper: {
    gap: 14,
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2340",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#7B718E",
    textAlign: "center",
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
  cardWide: {
    flex: 1,
    marginBottom: 14,
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
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
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
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 34,
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: 24,
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
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: "100%",
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
    borderColor: "#FECDD3",
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
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderRadius: 32,
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
  formGrid: {
    gap: 0,
  },
  formGridWide: {
    flexDirection: "row",
    gap: 14,
  },
  formField: {
    flex: 1,
  },
  formImagePreview: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginTop: 14,
    backgroundColor: "#F3E8FF",
  },
  formImagePlaceholder: {
    marginTop: 14,
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D8B4FE",
    backgroundColor: "#FAF7FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  formImagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#8B7AA8",
    textAlign: "center",
  },
  imageErrorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#B91C1C",
    lineHeight: 18,
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
  inputDescricaoCurta: {
    minHeight: 90,
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
