import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";

import { useProduct } from "../src/hooks/useProduct";
import {
  addProductToCart,
  mapShoppingCartItemsToApiItems,
  ShoppingCart,
  ShoppingCartItem,
} from "../src/components/ShoppingCart";
import { saveShoppingCart } from "../src/services/api";
import { Product } from "../src/types/Product";
import { showAlert } from "../src/utils/feedback";

type PriceFilter = "todos" | "ate-50" | "51-100" | "acima-100";

const CATEGORY_KEYWORDS = [
  { label: "Finalizacao", keywords: ["escova", "escolva", "final", "babyliss", "penteado"] },
  { label: "Cabelos", keywords: ["corte", "cut", "bob", "pixie", "shag", "butterfly"] },
  { label: "Coloracao", keywords: ["cor", "color", "mecha", "loiro", "tinta"] },
  { label: "Tratamento", keywords: ["hidrat", "trat", "reconstr", "mascara"] },
];

function formatarPreco(valor: string | number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizarTexto(valor: string) {
  return valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getProductCategory(produto: Product) {
  const textoBase = normalizarTexto(`${produto.nome} ${produto.descricao}`);
  const match = CATEGORY_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => textoBase.includes(normalizarTexto(keyword))),
  );

  return match?.label ?? "Geral";
}

function filtrarPorPreco(preco: number, filtro: PriceFilter) {
  if (filtro === "ate-50") return preco <= 50;
  if (filtro === "51-100") return preco > 50 && preco <= 100;
  if (filtro === "acima-100") return preco > 100;
  return true;
}

export default function ProdutoScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { produtos, loading, error } = useProduct();
  const isWideScreen = width >= 960;

  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [faixaPreco, setFaixaPreco] = useState<PriceFilter>("todos");
  const [carrinho, setCarrinho] = useState<ShoppingCartItem[]>([]);
  const [carrinhoVisible, setCarrinhoVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [adicionandoAoCarrinho, setAdicionandoAoCarrinho] = useState(false);

  const categoriasDisponiveis = useMemo(() => {
    const categorias = Array.from(new Set(produtos.map(getProductCategory)));
    return ["Todos", ...categorias];
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termoBusca = normalizarTexto(pesquisa.trim());

    return produtos.filter((produto) => {
      const categoria = getProductCategory(produto);
      const preco = Number(produto.preco || 0);
      const textoBase = normalizarTexto(`${produto.nome} ${produto.descricao}`);

      const correspondeBusca = termoBusca ? textoBase.includes(termoBusca) : true;
      const correspondeCategoria =
        categoriaSelecionada === "Todos" ? true : categoria === categoriaSelecionada;
      const correspondePreco = filtrarPorPreco(preco, faixaPreco);

      return correspondeBusca && correspondeCategoria && correspondePreco;
    });
  }, [categoriaSelecionada, faixaPreco, pesquisa, produtos]);

  const quantidadeCarrinho = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade, 0),
    [carrinho],
  );

  const adicionarAoCarrinho = (produto: Product) => {
    setProdutoSelecionado(produto);
    setQuantidadeSelecionada(1);
  };

  const fecharMenuQuantidade = () => {
    setProdutoSelecionado(null);
    setQuantidadeSelecionada(1);
  };

  const confirmarAdicionarAoCarrinho = async () => {
    if (!produtoSelecionado) return;

    const nextItems = addProductToCart(carrinho, produtoSelecionado, quantidadeSelecionada);

    setAdicionandoAoCarrinho(true);

    try {
      await saveShoppingCart(mapShoppingCartItemsToApiItems(nextItems));
      setCarrinho(nextItems);
      showAlert(
        "Produto adicionado",
        `${quantidadeSelecionada} item(ns) de ${produtoSelecionado.nome} foram adicionados ao carrinho.`,
      );
      fecharMenuQuantidade();
    } catch (error) {
      console.error("Erro ao salvar carrinho no JSONBin:", error);
      showAlert("Erro", "Nao foi possivel salvar o carrinho no JSONBin.");
    } finally {
      setAdicionandoAoCarrinho(false);
    }
  };

  const renderEmptyState = (icon: keyof typeof Ionicons.glyphMap, title: string, message: string) => (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={28} color="#7C3AED" />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );

  const renderFilterChip = (
    label: string,
    ativo: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={label}
      style={[styles.filterChip, ativo && styles.filterChipActive]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, ativo && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderProduto = ({ item }: { item: Product }) => (
    <View style={[styles.card, isWideScreen && styles.cardWide]}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <View style={styles.imageFrame}>
            <View style={styles.imageGlow} />
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="contain" />
          </View>
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={32} color="#A78BFA" />
            <Text style={styles.imageFallbackText}>Sem imagem</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatarPreco(item.preco)}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.productMetaRow}>
          <Text style={styles.label}>Produto</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{getProductCategory(item)}</Text>
          </View>
        </View>

        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.descricao} numberOfLines={3}>
          {item.descricao}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addCartButton}
        activeOpacity={0.9}
        onPress={() => adicionarAoCarrinho(item)}
      >
        <Ionicons name="cart-outline" size={18} color="#FFF" />
        <Text style={styles.addCartButtonText}>Adicionar ao carrinho</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShoppingShortcut = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    count?: number,
  ) => (
    <TouchableOpacity style={styles.shoppingShortcut} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.shoppingShortcutIcon}>
        <Ionicons name={icon} size={21} color="#7C3AED" />
      </View>
      <Text style={styles.shoppingShortcutText}>{label}</Text>
      {typeof count === "number" ? (
        <View style={styles.shoppingShortcutBadge}>
          <Text style={styles.shoppingShortcutBadgeText}>{count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.container, isWideScreen && styles.containerWide]}>
        <FlatList
          data={loading || error ? [] : produtosFiltrados}
          key={isWideScreen ? "grid" : "list"}
          keyExtractor={(item, index) => `${item.id ?? item.nome}-${index}`}
          renderItem={renderProduto}
          numColumns={isWideScreen ? 2 : 1}
          columnWrapperStyle={isWideScreen ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaContent}
          ListHeaderComponent={
            <>
              <View style={styles.hero}>
                <View style={styles.heroTop}>
                  <View style={styles.heroTextBlock}>
                    <Text style={styles.overline}>Catalogo</Text>
                    <Text style={styles.titulo}>Produtos do studio</Text>
                    <Text style={styles.subtitulo}>
                    </Text>
                  </View>

                  <View style={styles.heroProductIcon}>
                    <Ionicons name="bag-handle-outline" size={22} color="#7C3AED" />
                  </View>
                </View>

                <View style={styles.heroMeta}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="pricetags-outline" size={16} color="#7C3AED" />
                    <Text style={styles.heroBadgeText}>{produtos.length} itens disponiveis</Text>
                  </View>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shoppingShortcutsBar}
              >
                {renderShoppingShortcut("Cupons", "ticket-outline", () => router.push("/cupons"))}
                {renderShoppingShortcut(
                  "Carrinho",
                  "cart-outline",
                  () => setCarrinhoVisible(true),
                  quantidadeCarrinho,
                )}
                {renderShoppingShortcut("Notificações", "notifications-outline", () =>
                  router.push("/notificacoes"),
                )}
              </ScrollView>

              <View style={styles.toolsCard}>
                <View style={styles.searchRow}>
                  <Ionicons name="search-outline" size={18} color="#8B7AA8" />
                  <TextInput
                    value={pesquisa}
                    onChangeText={setPesquisa}
                    placeholder="Buscar por nome ou descricao"
                    placeholderTextColor="#9A90AB"
                    style={styles.searchInput}
                  />
                </View>

                <Text style={styles.sectionLabel}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {categoriasDisponiveis.map((categoria) =>
                    renderFilterChip(
                      categoria,
                      categoriaSelecionada === categoria,
                      () => setCategoriaSelecionada(categoria),
                    ),
                  )}
                </ScrollView>

                <Text style={styles.sectionLabel}>Faixa de preco</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                  {renderFilterChip("Todos", faixaPreco === "todos", () => setFaixaPreco("todos"))}
                  {renderFilterChip("Ate R$ 50", faixaPreco === "ate-50", () => setFaixaPreco("ate-50"))}
                  {renderFilterChip("R$ 51 a R$ 100", faixaPreco === "51-100", () => setFaixaPreco("51-100"))}
                  {renderFilterChip("Acima de R$ 100", faixaPreco === "acima-100", () => setFaixaPreco("acima-100"))}
                </ScrollView>
              </View>

              {!loading && !error ? (
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>Produtos encontrados</Text>
                  <Text style={styles.resultsCount}>{produtosFiltrados.length} resultado(s)</Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.stateText}>Carregando produtos...</Text>
              </View>
            ) : error ? (
              renderEmptyState("alert-circle-outline", "Erro ao carregar produtos", error)
            ) : (
              renderEmptyState(
                "bag-handle-outline",
                "Nenhum produto encontrado",
                "Tente mudar a busca ou os filtros para encontrar mais itens.",
              )
            )
          }
        />
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(produtoSelecionado)}
        onRequestClose={fecharMenuQuantidade}
      >
        <View style={styles.quantityOverlay}>
          <View style={[styles.quantityMenu, isWideScreen && styles.quantityMenuWide]}>
            <View style={styles.quantityHeader}>
              <View style={styles.quantityHeaderText}>
                <Text style={styles.quantityTitle}>Quantidade</Text>
                <Text style={styles.quantitySubtitle} numberOfLines={2}>
                  {produtoSelecionado?.nome}
                </Text>
              </View>

              <Pressable onPress={fecharMenuQuantidade} style={styles.quantityCloseButton}>
                <Ionicons name="close" size={22} color="#47345F" />
              </Pressable>
            </View>

            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantidadeSelecionada((valor) => Math.max(1, valor - 1))}
              >
                <Ionicons name="remove" size={18} color="#7C3AED" />
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantidadeSelecionada}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantidadeSelecionada((valor) => valor + 1)}
              >
                <Ionicons name="add" size={18} color="#7C3AED" />
              </TouchableOpacity>
            </View>

            <Text style={styles.quantityTotal}>
              Total: {formatarPreco(Number(produtoSelecionado?.preco || 0) * quantidadeSelecionada)}
            </Text>

            <TouchableOpacity
              style={[styles.confirmQuantityButton, adicionandoAoCarrinho && styles.buttonDisabled]}
              activeOpacity={0.9}
              onPress={confirmarAdicionarAoCarrinho}
              disabled={adicionandoAoCarrinho}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={styles.confirmQuantityButtonText}>
                {adicionandoAoCarrinho ? "Adicionando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ShoppingCart
        items={carrinho}
        visible={carrinhoVisible}
        isWideScreen={isWideScreen}
        onClose={() => setCarrinhoVisible(false)}
        onChangeItems={setCarrinho}
      />
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
  listaContent: {
    paddingBottom: 40,
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
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroProductIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  overline: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6D5EF6",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
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
  heroCartButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  heroCartText: {
    marginLeft: 8,
    marginRight: 10,
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "800",
  },
  cartCounter: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartCounterText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  heroMeta: {
    marginTop: 18,
    flexDirection: "row",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  heroBadgeText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  shoppingShortcutsBar: {
    gap: 12,
    paddingBottom: 16,
  },
  shoppingShortcut: {
    minWidth: 138,
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  shoppingShortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  shoppingShortcutText: {
    flex: 1,
    color: "#44305F",
    fontSize: 14,
    fontWeight: "900",
  },
  shoppingShortcutBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  shoppingShortcutBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },
  toolsCard: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6FF",
    borderWidth: 1,
    borderColor: "#E9DFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 15,
    color: "#2F2340",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#44305F",
    marginBottom: 10,
  },
  chipsRow: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  filterChipActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  notificationCard: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE3FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F2340",
  },
  notificationText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#7B718E",
  },
  resultsHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#221431",
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8B7AA8",
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
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  stateIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2340",
    textAlign: "center",
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#7B718E",
    textAlign: "center",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardWide: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 220,
    borderRadius: 22,
    backgroundColor: "#F8F2FF",
    overflow: "hidden",
    marginBottom: 16,
  },
  imageFrame: {
    flex: 1,
    padding: 14,
  },
  imageGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8F2FF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF7FF",
  },
  imageFallbackText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#8B7AA8",
  },
  priceBadge: {
    position: "absolute",
    right: 14,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7C3AED",
  },
  infoContainer: {
    marginBottom: 16,
  },
  productMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8B7AA8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F8F2FF",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7C3AED",
  },
  nome: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F2340",
  },
  descricao: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#6F6482",
  },
  addCartButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  addCartButtonText: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  quantityOverlay: {
    flex: 1,
    backgroundColor: "rgba(33, 20, 49, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  quantityMenu: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECE3FF",
  },
  quantityMenuWide: {
    maxWidth: 420,
  },
  quantityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  quantityHeaderText: {
    flex: 1,
  },
  quantityTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2F2340",
  },
  quantitySubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#7B718E",
  },
  quantityCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F7F2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F6FF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8D8FF",
    paddingVertical: 12,
    marginBottom: 14,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8D8FF",
  },
  quantityValue: {
    minWidth: 62,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    color: "#2F2340",
  },
  quantityTotal: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#7C3AED",
  },
  confirmQuantityButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  confirmQuantityButtonText: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
