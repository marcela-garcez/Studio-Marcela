import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CartApiItem,
  CouponApiItem,
  findCouponByCode,
  getCoupons,
  saveShoppingCart,
  ShippingApiInfo,
} from "../services/api";
import { Product } from "../types/Product";
import { showAlert } from "../utils/feedback";

export type ShoppingCartItem = Product & {
  cartKey: string;
  quantidade: number;
};

type ShoppingCartProps = {
  items: ShoppingCartItem[];
  visible: boolean;
  isWideScreen?: boolean;
  onClose: () => void;
  onChangeItems: (items: ShoppingCartItem[]) => void;
};

type ShippingMode = "cep" | "regiao";

const REGION_SHIPPING_OPTIONS = [
  { label: "Sudeste", value: "Sudeste", price: 18.9 },
  { label: "Sul", value: "Sul", price: 20.9 },
  { label: "Centro-Oeste", value: "Centro-Oeste", price: 22.9 },
  { label: "Nordeste", value: "Nordeste", price: 24.9 },
  { label: "Norte", value: "Norte", price: 29.9 },
];

export function getProductCartKey(produto: Product) {
  return String(produto.id ?? `${produto.nome}-${produto.preco}-${produto.imageUrl}`);
}

export function addProductToCart(items: ShoppingCartItem[], produto: Product, quantidade = 1) {
  const cartKey = getProductCartKey(produto);
  const produtoExistente = items.find((item) => item.cartKey === cartKey);

  if (produtoExistente) {
    return items.map((item) =>
      item.cartKey === cartKey ? { ...item, quantidade: item.quantidade + quantidade } : item,
    );
  }

  return [...items, { ...produto, cartKey, quantidade }];
}

function formatarPreco(valor: string | number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function calcularFretePorCep(cep: string) {
  const cepNumerico = somenteNumeros(cep);

  if (cepNumerico.length !== 8) return null;

  const primeiroDigito = Number(cepNumerico[0]);

  if (primeiroDigito <= 3) return { regiao: "Sudeste", valor: 18.9 };
  if (primeiroDigito <= 6) return { regiao: "Nordeste", valor: 24.9 };
  if (primeiroDigito === 7) return { regiao: "Centro-Oeste", valor: 22.9 };
  if (primeiroDigito === 8) return { regiao: "Sul", valor: 20.9 };

  return { regiao: "Norte", valor: 29.9 };
}

export function mapShoppingCartItemToApiItem(item: ShoppingCartItem): CartApiItem {
  return {
    id: item.id,
    nome: item.nome,
    preco: item.preco,
    descricao: item.descricao,
    imageUrl: item.imageUrl,
    quantidade: item.quantidade,
  };
}

export function mapShoppingCartItemsToApiItems(items: ShoppingCartItem[]) {
  return items.map(mapShoppingCartItemToApiItem);
}

export function ShoppingCart({
  items,
  visible,
  isWideScreen = false,
  onClose,
  onChangeItems,
}: ShoppingCartProps) {
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<
    { type: "remove"; cartKey: string; productName: string } | { type: "clear" } | null
  >(null);
  const [processandoConfirmacao, setProcessandoConfirmacao] = useState(false);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [erroCupom, setErroCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<CouponApiItem | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);
  const [cuponsCadastrados, setCuponsCadastrados] = useState<CouponApiItem[]>([]);
  const [cuponsVisible, setCuponsVisible] = useState(false);
  const [carregandoCupons, setCarregandoCupons] = useState(false);
  const [freteModo, setFreteModo] = useState<ShippingMode>("cep");
  const [cepInput, setCepInput] = useState("");
  const [regiaoSelecionada, setRegiaoSelecionada] = useState(REGION_SHIPPING_OPTIONS[0].value);
  const [erroFrete, setErroFrete] = useState("");

  const quantidadeTotal = useMemo(
    () => items.reduce((total, item) => total + item.quantidade, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.preco || 0) * item.quantidade, 0),
    [items],
  );

  const desconto = useMemo(() => {
    if (!cupomAplicado) return 0;

    return total * (Math.min(Math.max(cupomAplicado.percentualDesconto, 0), 100) / 100);
  }, [cupomAplicado, total]);

  const totalComDesconto = Math.max(total - desconto, 0);

  const frete = useMemo(() => {
    if (freteModo === "cep") {
      return calcularFretePorCep(cepInput)?.valor ?? 0;
    }

    if (freteModo === "regiao") {
      return REGION_SHIPPING_OPTIONS.find((option) => option.value === regiaoSelecionada)?.price ?? 0;
    }

    return 0;
  }, [cepInput, freteModo, regiaoSelecionada]);

  const freteInfo = useMemo<ShippingApiInfo>(() => {
    if (freteModo === "cep") {
      return {
        tipo: "cep",
        valor: frete,
        cep: somenteNumeros(cepInput),
        regiao: calcularFretePorCep(cepInput)?.regiao,
      };
    }

    if (freteModo === "regiao") {
      return {
        tipo: "regiao",
        valor: frete,
        regiao: regiaoSelecionada,
      };
    }

    return {
      tipo: "cep",
      valor: frete,
      cep: somenteNumeros(cepInput),
      regiao: calcularFretePorCep(cepInput)?.regiao,
    };
  }, [cepInput, frete, freteModo, regiaoSelecionada]);

  const totalComFrete = totalComDesconto + frete;

  useEffect(() => {
    if (items.length === 0) {
      setCodigoCupom("");
      setErroCupom("");
      setCupomAplicado(null);
      setCepInput("");
      setRegiaoSelecionada(REGION_SHIPPING_OPTIONS[0].value);
      setErroFrete("");
    }
  }, [items.length]);

  const alterarCodigoCupom = (valor: string) => {
    setCodigoCupom(valor.replace(/\s/g, "").toUpperCase());
    setErroCupom("");
  };

  const alterarCep = (valor: string) => {
    setCepInput(somenteNumeros(valor).slice(0, 8));
    setErroFrete("");
  };

  const alterarModoFrete = (modo: ShippingMode) => {
    setFreteModo(modo);
    setErroFrete("");
  };

  const alterarQuantidade = (cartKey: string, incremento: number) => {
    onChangeItems(
      items
        .map((item) =>
          item.cartKey === cartKey ? { ...item, quantidade: item.quantidade + incremento } : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  };

  const removerItem = (cartKey: string) => {
    const item = items.find((produto) => produto.cartKey === cartKey);

    if (!item) return;

    setConfirmacao({ type: "remove", cartKey, productName: item.nome });
  };

  const limparCarrinho = () => {
    setConfirmacao({ type: "clear" });
  };

  const aplicarCupom = async () => {
    const codigo = codigoCupom.replace(/\s/g, "").toUpperCase();
    setErroCupom("");

    if (cupomAplicado) {
      setErroCupom("Remova o cupom atual antes de adicionar outro.");
      return;
    }

    if (!codigo) {
      setErroCupom("Digite o codigo do cupom de desconto.");
      return;
    }

    setValidandoCupom(true);

    try {
      const cupom = await findCouponByCode(codigo);

      if (!cupom) {
        setErroCupom("Nao encontramos um cupom ativo com esse codigo.");
        return;
      }

      setCupomAplicado(cupom);
      setCodigoCupom(cupom.codigo);
      showAlert("Cupom aplicado", `${cupom.codigo} adicionou ${cupom.percentualDesconto}% de desconto.`);
    } catch (error) {
      console.error("Erro ao validar cupom no JSONBin:", error);
      setErroCupom("Nao foi possivel validar o cupom agora.");
    } finally {
      setValidandoCupom(false);
    }
  };

  const carregarCuponsCadastrados = async () => {
    if (cupomAplicado) {
      setErroCupom("Remova o cupom atual antes de adicionar outro.");
      return;
    }

    setErroCupom("");
    setCarregandoCupons(true);
    setCuponsVisible(true);

    try {
      const cupons = await getCoupons();
      setCuponsCadastrados(cupons.filter((cupom) => cupom.ativo && cupom.codigo));
    } catch (error) {
      console.error("Erro ao carregar cupons no JSONBin:", error);
      setErroCupom("Nao foi possivel carregar os cupons cadastrados.");
      setCuponsVisible(false);
    } finally {
      setCarregandoCupons(false);
    }
  };

  const aplicarCupomCadastrado = (cupom: CouponApiItem) => {
    if (cupomAplicado) {
      setErroCupom("Remova o cupom atual antes de adicionar outro.");
      setCuponsVisible(false);
      return;
    }

    setCupomAplicado(cupom);
    setCodigoCupom(cupom.codigo);
    setErroCupom("");
    setCuponsVisible(false);
    showAlert("Cupom aplicado", `${cupom.codigo} adicionou ${cupom.percentualDesconto}% de desconto.`);
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCodigoCupom("");
    setErroCupom("");
  };

  const limparDadosDoPedido = () => {
    removerCupom();
    setCepInput("");
    setRegiaoSelecionada(REGION_SHIPPING_OPTIONS[0].value);
    setErroFrete("");
  };

  const cancelarConfirmacao = () => {
    if (processandoConfirmacao) return;
    setConfirmacao(null);
  };

  const confirmarAcao = async () => {
    if (!confirmacao) return;

    const nextItems =
      confirmacao.type === "remove"
        ? items.filter((item) => item.cartKey !== confirmacao.cartKey)
        : [];

    setProcessandoConfirmacao(true);

    const shouldClearOrderData = nextItems.length === 0;

    try {
      await saveShoppingCart(
        mapShoppingCartItemsToApiItems(nextItems),
        shouldClearOrderData ? null : cupomAplicado,
        shouldClearOrderData ? 0 : frete,
        shouldClearOrderData ? undefined : freteInfo,
      );
      onChangeItems(nextItems);
      if (shouldClearOrderData) {
        limparDadosDoPedido();
      }
      showAlert(
        confirmacao.type === "remove" ? "Produto removido" : "Carrinho limpo",
        confirmacao.type === "remove"
          ? "O produto foi removido do carrinho e do JSONBin."
          : "Todos os itens foram removidos do carrinho e do JSONBin.",
      );
      setConfirmacao(null);
    } catch (error) {
      console.error("Erro ao atualizar carrinho no JSONBin:", error);
      showAlert("Erro", "Nao foi possivel atualizar o carrinho no JSONBin.");
    } finally {
      setProcessandoConfirmacao(false);
    }
  };

  const salvarCarrinho = async () => {
    if (items.length === 0) {
      showAlert("Carrinho vazio", "Adicione pelo menos um produto antes de salvar.");
      return;
    }

    if (freteModo === "cep" && cepInput.trim() && cepInput.length !== 8) {
      setErroFrete("Digite um CEP com 8 numeros.");
      return;
    }

    setSalvando(true);

    try {
      await saveShoppingCart(mapShoppingCartItemsToApiItems(items), cupomAplicado, frete, freteInfo);
      showAlert("Carrinho salvo", "Carrinho salvo no JSONBin com sucesso.");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar carrinho no JSONBin:", error);
      showAlert("Erro", "Nao foi possivel salvar o carrinho no JSONBin.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isWideScreen && styles.modalContentWide]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Carrinho</Text>
              <Text style={styles.modalSubtitle}>
                {quantidadeTotal} item(ns) em {items.length} produto(s)
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#47345F" />
            </Pressable>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={32} color="#A78BFA" />
              <Text style={styles.emptyTitle}>Seu carrinho esta vazio</Text>
              <Text style={styles.emptyText}>Escolha um produto na lista para ele aparecer aqui.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>Produtos no carrinho</Text>
                  <Text style={styles.sectionSubtitle}>Ajuste quantidades e salve no JSONBin.</Text>
                </View>

                <TouchableOpacity style={styles.clearButton} onPress={limparCarrinho}>
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text style={styles.clearButtonText}>Limpar tudo</Text>
                </TouchableOpacity>
              </View>

              {items.map((item) => (
                <View key={item.cartKey} style={styles.cartItem}>
                  <View style={styles.itemTop}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="contain" />
                    ) : (
                      <View style={styles.imageFallback}>
                        <Ionicons name="image-outline" size={22} color="#A78BFA" />
                      </View>
                    )}

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.nome}</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.descricao}
                      </Text>
                      <Text style={styles.itemPrice}>{formatarPreco(item.preco)}</Text>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => alterarQuantidade(item.cartKey, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#7C3AED" />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantidade}</Text>

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => alterarQuantidade(item.cartKey, 1)}
                      >
                        <Ionicons name="add" size={16} color="#7C3AED" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.removeButton} onPress={() => removerItem(item.cartKey)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemTotalRow}>
                    <Text style={styles.itemTotalLabel}>
                      {item.quantidade} x {formatarPreco(item.preco)}
                    </Text>
                    <Text style={styles.itemSubtotal}>
                      {formatarPreco(Number(item.preco || 0) * item.quantidade)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.summaryCard}>
                <View style={styles.couponBox}>
                  <View style={styles.couponHeader}>
                    <Text style={styles.couponTitle}>Cupom de desconto</Text>

                    {!cupomAplicado ? (
                      <TouchableOpacity
                        style={styles.couponHeaderButton}
                        activeOpacity={0.9}
                        onPress={carregarCuponsCadastrados}
                      >
                        <Ionicons name="ticket-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.couponHeaderButtonText}>Ver cupons</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {cupomAplicado ? (
                    <View style={styles.appliedCouponRow}>
                      <View style={styles.appliedCouponInfo}>
                        <Text style={styles.appliedCouponCode}>{cupomAplicado.codigo}</Text>
                        <Text style={styles.appliedCouponText}>
                          {cupomAplicado.percentualDesconto}% de desconto aplicado
                        </Text>
                      </View>

                      <TouchableOpacity style={styles.removeCouponButton} onPress={removerCupom}>
                        <Ionicons name="close" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.couponInputRow}>
                        <TextInput
                          value={codigoCupom}
                          onChangeText={alterarCodigoCupom}
                          placeholder="Digite seu cupom"
                          placeholderTextColor="#A99BBB"
                          autoCapitalize="characters"
                          autoCorrect={false}
                          style={[styles.couponInput, erroCupom ? styles.couponInputError : null]}
                        />

                        <TouchableOpacity
                          style={[styles.applyCouponButton, validandoCupom && styles.buttonDisabled]}
                          onPress={aplicarCupom}
                          disabled={validandoCupom}
                        >
                          <Text style={styles.applyCouponText}>{validandoCupom ? "..." : "OK"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {erroCupom ? <Text style={styles.couponErrorText}>{erroCupom}</Text> : null}
                </View>

                <View style={styles.shippingBox}>
                  <Text style={styles.couponTitle}>Frete</Text>

                  <View style={styles.shippingModeRow}>
                    {(["cep", "regiao"] as ShippingMode[]).map((modo) => (
                      <TouchableOpacity
                        key={modo}
                        style={[styles.shippingModeButton, freteModo === modo && styles.shippingModeButtonActive]}
                        onPress={() => alterarModoFrete(modo)}
                      >
                        <Text
                          style={[
                            styles.shippingModeButtonText,
                            freteModo === modo && styles.shippingModeButtonTextActive,
                          ]}
                        >
                          {modo === "cep" ? "CEP" : "Regiao"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {freteModo === "cep" ? (
                    <View>
                      <View style={styles.shippingInputRow}>
                        <TextInput
                          value={cepInput}
                          onChangeText={alterarCep}
                          placeholder="Digite o CEP"
                          placeholderTextColor="#A99BBB"
                          keyboardType="number-pad"
                          maxLength={8}
                          style={[styles.couponInput, erroFrete ? styles.couponInputError : null]}
                        />
                        <Text style={styles.shippingPreview}>{formatarPreco(frete)}</Text>
                      </View>
                      {calcularFretePorCep(cepInput)?.regiao ? (
                        <Text style={styles.shippingHint}>
                          Regiao: {calcularFretePorCep(cepInput)?.regiao}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {freteModo === "regiao" ? (
                    <View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.regionOptions}
                      >
                        {REGION_SHIPPING_OPTIONS.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.regionOption,
                              regiaoSelecionada === option.value && styles.regionOptionActive,
                            ]}
                            onPress={() => setRegiaoSelecionada(option.value)}
                          >
                            <Text
                              style={[
                                styles.regionOptionText,
                                regiaoSelecionada === option.value && styles.regionOptionTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                            <Text
                              style={[
                                styles.regionOptionPrice,
                                regiaoSelecionada === option.value && styles.regionOptionTextActive,
                              ]}
                            >
                              {formatarPreco(option.price)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <Text style={styles.shippingHint}>Frete selecionado: {formatarPreco(frete)}</Text>
                    </View>
                  ) : null}

                  {erroFrete ? <Text style={styles.couponErrorText}>{erroFrete}</Text> : null}
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summarySecondaryValue}>{formatarPreco(total)}</Text>
                </View>

                {cupomAplicado ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Desconto</Text>
                    <Text style={styles.discountValue}>- {formatarPreco(desconto)}</Text>
                  </View>
                ) : null}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frete</Text>
                  <Text style={styles.summarySecondaryValue}>{formatarPreco(frete)}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryValue}>{formatarPreco(totalComFrete)}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, salvando && styles.buttonDisabled]}
                  activeOpacity={0.9}
                  onPress={salvarCarrinho}
                  disabled={salvando}
                >
                  <Ionicons name="save-outline" size={18} color="#FFF" />
                  <Text style={styles.saveButtonText}>{salvando ? "Salvando..." : "Salvar carrinho"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={Boolean(confirmacao)} onRequestClose={cancelarConfirmacao}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmMenu}>
            <View style={styles.confirmIcon}>
              <Ionicons name="warning-outline" size={24} color="#DC2626" />
            </View>

            <Text style={styles.confirmTitle}>
              {confirmacao?.type === "remove" ? "Remover produto?" : "Limpar carrinho?"}
            </Text>
            <Text style={styles.confirmText}>
              {confirmacao?.type === "remove"
                ? `Deseja remover ${confirmacao.productName} do carrinho?`
                : "Deseja remover todos os itens do carrinho?"}
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelarConfirmacao}
                disabled={processandoConfirmacao}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, processandoConfirmacao && styles.buttonDisabled]}
                onPress={confirmarAcao}
                disabled={processandoConfirmacao}
              >
                <Text style={styles.confirmButtonText}>
                  {processandoConfirmacao
                    ? confirmacao?.type === "remove"
                      ? "Removendo..."
                      : "Limpando..."
                    : confirmacao?.type === "remove"
                      ? "Remover"
                      : "Limpar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={cuponsVisible} onRequestClose={() => setCuponsVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.couponsMenu}>
            <View style={styles.couponsMenuHeader}>
              <View>
                <Text style={styles.confirmTitle}>Cupons cadastrados</Text>
                <Text style={styles.confirmText}>Escolha um cupom para aplicar no carrinho.</Text>
              </View>

              <Pressable onPress={() => setCuponsVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            {carregandoCupons ? (
              <View style={styles.couponsLoading}>
                <ActivityIndicator color="#7C3AED" />
                <Text style={styles.couponsLoadingText}>Carregando cupons...</Text>
              </View>
            ) : cuponsCadastrados.length === 0 ? (
              <View style={styles.emptyCoupons}>
                <Ionicons name="ticket-outline" size={28} color="#A78BFA" />
                <Text style={styles.emptyCouponsText}>Nenhum cupom cadastrado.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.couponsList}>
                {cuponsCadastrados.map((cupom) => (
                  <TouchableOpacity
                    key={cupom.id}
                    style={styles.couponOption}
                    activeOpacity={0.9}
                    onPress={() => aplicarCupomCadastrado(cupom)}
                  >
                    <View style={styles.couponOptionIcon}>
                      <Ionicons name="ticket-outline" size={20} color="#7C3AED" />
                    </View>

                    <View style={styles.couponOptionInfo}>
                      <Text style={styles.couponOptionCode}>{cupom.codigo}</Text>
                      <Text style={styles.couponOptionText}>
                        {cupom.percentualDesconto}% de desconto
                        {cupom.descricao ? ` - ${cupom.descricao}` : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 20, 49, 0.45)",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalContent: {
    maxHeight: "88%",
    backgroundColor: "#FFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  modalContentWide: {
    width: "100%",
    maxWidth: 780,
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2F2340",
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#7B718E",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
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
  scrollContent: {
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2340",
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#7B718E",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  clearButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  cartItem: {
    backgroundColor: "#F9F6FF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  itemTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  itemImage: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  imageFallback: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2F2340",
  },
  itemDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#7B718E",
  },
  itemPrice: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#7C3AED",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F8F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: "#2F2340",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  removeButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  itemTotalRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E8D8FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTotalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6F6482",
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2F2340",
  },
  summaryCard: {
    marginTop: 4,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#221431",
  },
  couponBox: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 216, 255, 0.18)",
  },
  couponTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  couponHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: "#7C3AED",
    borderWidth: 1,
    borderColor: "#A78BFA",
  },
  couponHeaderButtonText: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  couponInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  couponInput: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 14,
    color: "#2F2340",
    fontSize: 14,
    fontWeight: "700",
  },
  couponInputError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF7F7",
  },
  couponErrorText: {
    marginTop: 8,
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "800",
  },
  shippingBox: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 216, 255, 0.18)",
  },
  shippingModeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  shippingModeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  shippingModeButtonActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#A78BFA",
  },
  shippingModeButtonText: {
    color: "#D3C9E4",
    fontSize: 12,
    fontWeight: "900",
  },
  shippingModeButtonTextActive: {
    color: "#FFFFFF",
  },
  shippingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shippingPreview: {
    minWidth: 94,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  shippingHint: {
    marginTop: 8,
    color: "#D3C9E4",
    fontSize: 12,
    fontWeight: "800",
  },
  regionOptions: {
    gap: 8,
    paddingBottom: 2,
  },
  regionOption: {
    minWidth: 112,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  regionOptionActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#A78BFA",
  },
  regionOptionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  regionOptionPrice: {
    marginTop: 4,
    color: "#D3C9E4",
    fontSize: 12,
    fontWeight: "800",
  },
  regionOptionTextActive: {
    color: "#FFFFFF",
  },
  applyCouponButton: {
    minWidth: 54,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  applyCouponText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  appliedCouponRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.35)",
    padding: 12,
  },
  appliedCouponInfo: {
    flex: 1,
  },
  appliedCouponCode: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  appliedCouponText: {
    marginTop: 4,
    color: "#D3C9E4",
    fontSize: 12,
    fontWeight: "700",
  },
  removeCouponButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  summaryLabel: {
    color: "#D3C9E4",
    fontSize: 15,
    fontWeight: "700",
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },
  summarySecondaryValue: {
    color: "#D3C9E4",
    fontSize: 16,
    fontWeight: "800",
  },
  discountValue: {
    color: "#86EFAC",
    fontSize: 16,
    fontWeight: "900",
  },
  saveButton: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 20, 49, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  confirmMenu: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2F2340",
  },
  confirmText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#7B718E",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 13,
    backgroundColor: "#F7F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  cancelButtonText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "800",
  },
  confirmButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 13,
    backgroundColor: "#DC2626",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  couponsMenu: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "78%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  couponsMenuHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  couponsLoading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  couponsLoadingText: {
    marginTop: 10,
    color: "#7B718E",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyCoupons: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#F9F6FF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    padding: 18,
  },
  emptyCouponsText: {
    marginTop: 10,
    color: "#7B718E",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  couponsList: {
    gap: 10,
    paddingBottom: 4,
  },
  couponOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#F9F6FF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    padding: 14,
  },
  couponOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  couponOptionInfo: {
    flex: 1,
  },
  couponOptionCode: {
    color: "#2F2340",
    fontSize: 16,
    fontWeight: "900",
  },
  couponOptionText: {
    marginTop: 4,
    color: "#7B718E",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
