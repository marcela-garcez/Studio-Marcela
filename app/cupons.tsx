import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { addCoupon, CouponApiItem, deleteCoupon, editCoupon, getCoupons } from "../src/services/api";
import { showAlert, showConfirm } from "../src/utils/feedback";

type CouponForm = {
  codigo: string;
  descricao: string;
  percentualDesconto: string;
};

export default function CuponsScreen() {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 960;

  const [cupons, setCupons] = useState<CouponApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [cupomSelecionado, setCupomSelecionado] = useState<CouponApiItem | null>(null);
  const [formulario, setFormulario] = useState<CouponForm>({
    codigo: "",
    descricao: "",
    percentualDesconto: "",
  });

  const carregarCupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCupons(data);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      showAlert("Erro", "Nao foi possivel carregar os cupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCupons();
  }, []);

  const atualizarCampo = (campo: keyof CouponForm, valor: string) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: campo === "codigo" ? valor.replace(/\s/g, "").toUpperCase() : valor,
    }));
  };

  const limparFormulario = () => {
    setCupomSelecionado(null);
    setFormulario({
      codigo: "",
      descricao: "",
      percentualDesconto: "",
    });
  };

  const editarCupom = (cupom: CouponApiItem) => {
    setCupomSelecionado(cupom);
    setFormulario({
      codigo: cupom.codigo.toUpperCase(),
      descricao: cupom.descricao || "",
      percentualDesconto: String(cupom.percentualDesconto),
    });
  };

  const salvarCupom = async () => {
    const codigo = formulario.codigo.replace(/\s/g, "").toUpperCase();
    const descricao = formulario.descricao.trim();
    const percentualDesconto = Number(formulario.percentualDesconto.replace(",", "."));

    if (!codigo || !formulario.percentualDesconto.trim()) {
      showAlert("Campos obrigatorios", "Preencha o codigo e o percentual de desconto.");
      return;
    }

    if (Number.isNaN(percentualDesconto) || percentualDesconto <= 0 || percentualDesconto > 100) {
      showAlert("Desconto invalido", "Informe um percentual maior que 0 e menor ou igual a 100.");
      return;
    }

    try {
      setSalvando(true);
      const data = cupomSelecionado
        ? await editCoupon({
            ...cupomSelecionado,
            codigo,
            descricao,
            percentualDesconto,
          })
        : await addCoupon({
            codigo,
            descricao,
            percentualDesconto,
          });
      setCupons(data);
      limparFormulario();
      showAlert(
        cupomSelecionado ? "Cupom atualizado" : "Cupom criado",
        `O cupom ${codigo} foi salvo com sucesso.`,
      );
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      showAlert(
        "Erro",
        error instanceof Error && error.message === "COUPON_ALREADY_EXISTS"
          ? "Ja existe um cupom com esse codigo."
          : "Nao foi possivel salvar o cupom.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const excluirCupom = async (cupom: CouponApiItem) => {
    const confirmou = await showConfirm({
      title: "Excluir cupom",
      message: `Deseja excluir o cupom ${cupom.codigo}?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (!confirmou) return;

    try {
      const data = await deleteCoupon(cupom.id);
      setCupons(data);
      showAlert("Cupom excluido", "O cupom foi removido com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      showAlert("Erro", "Nao foi possivel excluir o cupom.");
    }
  };

  const renderCupom = ({ item }: { item: CouponApiItem }) => (
    <View style={[styles.couponCard, isWideScreen && styles.couponCardWide]}>
      <View style={styles.couponIcon}>
        <Ionicons name="ticket-outline" size={24} color="#7C3AED" />
      </View>

      <View style={styles.couponInfo}>
        <Text style={styles.couponCode}>{item.codigo}</Text>
        <Text style={styles.couponDescription}>
          {item.descricao || "Cupom sem descricao"}
        </Text>
        <Text style={styles.couponDiscount}>{item.percentualDesconto}% de desconto</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => editarCupom(item)}>
          <Ionicons name="create-outline" size={18} color="#7C3AED" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => excluirCupom(item)}>
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0FF" />

      <View style={[styles.container, isWideScreen && styles.containerWide]}>
        <FlatList
          data={cupons}
          keyExtractor={(item) => item.id}
          renderItem={renderCupom}
          numColumns={isWideScreen ? 2 : 1}
          key={isWideScreen ? "grid" : "list"}
          columnWrapperStyle={isWideScreen ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.hero}>
                <Text style={styles.overline}>Descontos</Text>
                <Text style={styles.title}>{cupomSelecionado ? "Alterar cupom" : "Criar cupons"}</Text>
                <Text style={styles.subtitle}>
                  Cadastre codigos para o cliente digitar no carrinho.
                </Text>

                <View style={styles.formCard}>
                  <Text style={styles.label}>Codigo do cupom</Text>
                  <TextInput
                    value={formulario.codigo}
                    onChangeText={(valor) => atualizarCampo("codigo", valor)}
                    placeholder="Ex.: STUDIO10"
                    placeholderTextColor="#9A90AB"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.input}
                  />

                  <TextInput
                    value={formulario.codigo}
                    onChangeText={(valor) => atualizarCampo("codigo", valor)}
                    placeholder="Ex.: PRIMEIRACOMPRA20"
                    placeholderTextColor="#9A90AB"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.input}
                  />
                  <TextInput
                    value={formulario.codigo}
                    onChangeText={(valor) => atualizarCampo("codigo", valor)}
                    placeholder="Ex.: BOASVINDAS15"
                    placeholderTextColor="#9A90AB"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.input}
                  />
                  <TextInput
                    value={formulario.codigo}
                    onChangeText={(valor) => atualizarCampo("codigo", valor)}
                    placeholder="Ex.: VERAO5"
                    placeholderTextColor="#9A90AB"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.input}
                  />

                  <Text style={styles.label}>Desconto (%)</Text>
                  <TextInput
                    value={formulario.percentualDesconto}
                    onChangeText={(valor) => atualizarCampo("percentualDesconto", valor)}
                    placeholder="Ex.: 10"
                    placeholderTextColor="#9A90AB"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />

                  <Text style={styles.label}>Descricao</Text>
                  <TextInput
                    value={formulario.descricao}
                    onChangeText={(valor) => atualizarCampo("descricao", valor)}
                    placeholder="Ex.: Promocao de boas-vindas"
                    placeholderTextColor="#9A90AB"
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, salvando && styles.buttonDisabled]}
                    activeOpacity={0.9}
                    onPress={salvarCupom}
                    disabled={salvando}
                  >
                    <Ionicons
                      name={cupomSelecionado ? "save-outline" : "add-circle-outline"}
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.saveButtonText}>
                      {salvando ? "Salvando..." : cupomSelecionado ? "Salvar alteracoes" : "Criar cupom"}
                    </Text>
                  </TouchableOpacity>

                  {cupomSelecionado ? (
                    <TouchableOpacity style={styles.cancelEditButton} onPress={limparFormulario}>
                      <Text style={styles.cancelEditButtonText}>Cancelar edicao</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cupons cadastrados</Text>
                <Text style={styles.sectionHint}>{cupons.length} cupom(ns)</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Carregando cupons...</Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="ticket-outline" size={32} color="#A78BFA" />
                <Text style={styles.emptyTitle}>Nenhum cupom cadastrado</Text>
                <Text style={styles.emptyText}>Crie um cupom para ele poder ser usado no carrinho.</Text>
              </View>
            )
          }
        />
      </View>
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
  listContent: {
    paddingBottom: 36,
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
  overline: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6D5EF6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#221431",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B6278",
  },
  formCard: {
    marginTop: 18,
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
  saveButton: {
    marginTop: 18,
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveButtonText: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelEditButton: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  cancelEditButtonText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#221431",
  },
  sectionHint: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8B7AA8",
  },
  columnWrapper: {
    gap: 14,
  },
  couponCard: {
    flex: 1,
    marginBottom: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  couponCardWide: {
    flex: 1,
  },
  couponIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2F2340",
  },
  couponDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#7B718E",
  },
  couponDiscount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#7C3AED",
  },
  cardActions: {
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    paddingTop: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
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
    marginTop: 14,
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
});
