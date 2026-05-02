import React, { useState } from 'react';
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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import ProductCard from '../components/ProductCard';
import { useProduct } from '../hoocks/useProduct';
import { Product } from '../types/Product';
import { showAlert, showConfirm } from '../utils/feedback';

type ProductForm = {
  nome: string;
  preco: string;
  descricao: string;
  imageUrl: string;
};

export default function ProductScreens() {
  const { width } = useWindowDimensions();
  const { produtos, loading, error, atualizarProduto, adicionarProduto, removerProduto } = useProduct();
  const isWideScreen = width >= 960;
  const modalMaxWidth = isWideScreen ? 720 : 560;

  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formulario, setFormulario] = useState<ProductForm>({
    nome: '',
    preco: '',
    descricao: '',
    imageUrl: '',
  });

  const limparFormulario = () => {
    setFormulario({
      nome: '',
      preco: '',
      descricao: '',
      imageUrl: '',
    });
  };

  const abrirCadastro = () => {
    setProdutoSelecionado(null);
    limparFormulario();
    setModalVisible(true);
  };

  const abrirEdicao = (produto: Product) => {
    setProdutoSelecionado(produto);
    setFormulario({
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      imageUrl: produto.imageUrl,
    });
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setProdutoSelecionado(null);
    limparFormulario();
  };

  const atualizarCampo = (campo: keyof ProductForm, valor: string) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const salvarProduto = async () => {
    const nome = formulario.nome.trim();
    const preco = formulario.preco.trim();
    const descricao = formulario.descricao.trim();
    const imageUrl = formulario.imageUrl.trim();

    if (!nome || !preco || !descricao || !imageUrl) {
      showAlert('Campos obrigatorios', 'Preencha nome, preco, descricao e imagem.');
      return;
    }

    try {
      setSalvando(true);
      if (produtoSelecionado) {
        await atualizarProduto({
          ...produtoSelecionado,
          nome,
          preco,
          descricao,
          imageUrl,
        });
        showAlert('Produto atualizado', 'As alteracoes foram salvas com sucesso.');
      } else {
        await adicionarProduto({
          nome,
          preco,
          descricao,
          imageUrl,
        });
        showAlert('Produto cadastrado', 'O produto foi adicionado com sucesso.');
      }

      fecharModal();
    } catch (err) {
      console.log('Erro ao salvar produto:', err);
      showAlert('Erro', 'Nao foi possivel salvar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirProduto = async (produto: Product) => {
    const confirmou = await showConfirm({
      title: 'Confirmar exclusao',
      message: `Tem certeza que deseja excluir ${produto.nome}?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });

    if (!confirmou) {
      return;
    }

    try {
      await removerProduto(produto.id);
      showAlert('Produto excluido', 'O produto foi removido com sucesso.');
    } catch (err) {
      console.log('Erro ao excluir produto:', err);
      showAlert('Erro', 'Nao foi possivel excluir o produto.');
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      produto={item}
      onEdit={() => abrirEdicao(item)}
      onDelete={() => excluirProduto(item)}
    />
  );

  const renderEmptyState = (icon: keyof typeof Ionicons.glyphMap, title: string, message: string) => (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={28} color="#7C3AED" />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F0FF" />

      <View style={[styles.container, isWideScreen && styles.containerWide]}>
        <FlatList
          data={produtos}
          keyExtractor={(item, index) => `${item.id ?? item.nome}-${index}`}
          renderItem={renderItem}
          numColumns={isWideScreen ? 2 : 1}
          key={isWideScreen ? 'grid' : 'list'}
          columnWrapperStyle={isWideScreen ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.hero}>
                <Text style={styles.overline}>Catalogo</Text>
                <Text style={styles.title}>Lista de produtos</Text>
                <Text style={styles.subtitle}>
                  Confira nossos cortes disponiveis.
                </Text>

                <View style={styles.heroMeta}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="pricetag-outline" size={16} color="#7C3AED" />
                    <Text style={styles.heroBadgeText}>{produtos.length} itens</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.addButton} activeOpacity={0.9} onPress={abrirCadastro}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.addButtonText}>Adicionar mais produtos</Text>
                </TouchableOpacity>
              </View>

              {!loading && !error && produtos.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cortes disponiveis</Text>
                  <Text style={styles.sectionHint}>Edite ou exclua pelos cards</Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Carregando produtos...</Text>
              </View>
            ) : error ? (
              renderEmptyState('alert-circle-outline', 'Nao foi possivel carregar os produtos', error)
            ) : (
              renderEmptyState(
                'bag-handle-outline',
                'Nenhum produto encontrado',
                'Assim que novos produtos forem cadastrados, eles aparecerao aqui.',
              )
            )
          }
        />
      </View>

      <Modal transparent animationType="slide" visible={modalVisible} onRequestClose={fecharModal}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.modalContent, { maxWidth: modalMaxWidth }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {produtoSelecionado ? 'Editar produto' : 'Adicionar produto'}
                </Text>
                <Pressable onPress={fecharModal} style={styles.closeButton}>
                  <Ionicons name="close" size={22} color="#47345F" />
                </Pressable>
              </View>

              <Text style={styles.label}>URL da imagem</Text>
              <TextInput
                value={formulario.imageUrl}
                onChangeText={(valor) => atualizarCampo('imageUrl', valor)}
                placeholder="https://exemplo.com/imagem.jpg"
                placeholderTextColor="#9A90AB"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <View style={styles.previewCard}>
                <ProductCard
                  produto={{ ...produtoSelecionado, ...formulario } as Product}
                  showActions={false}
                />
              </View>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                value={formulario.nome}
                onChangeText={(valor) => atualizarCampo('nome', valor)}
                placeholder="Nome do produto"
                placeholderTextColor="#9A90AB"
                style={styles.input}
              />

              <Text style={styles.label}>Preco</Text>
              <TextInput
                value={formulario.preco}
                onChangeText={(valor) => atualizarCampo('preco', valor)}
                placeholder="Ex.: 75"
                placeholderTextColor="#9A90AB"
                style={styles.input}
              />

              <Text style={styles.label}>Descricao</Text>
              <TextInput
                value={formulario.descricao}
                onChangeText={(valor) => atualizarCampo('descricao', valor)}
                placeholder="Descreva o produto"
                placeholderTextColor="#9A90AB"
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.inputDescricao]}
              />

              <TouchableOpacity
                style={[styles.saveButton, salvando && styles.buttonDisabled]}
                activeOpacity={0.9}
                onPress={salvarProduto}
                disabled={salvando}
              >
                <Ionicons name="save-outline" size={18} color="#FFF" />
                <Text style={styles.saveButtonText}>
                  {salvando
                    ? 'Salvando...'
                    : produtoSelecionado
                      ? 'Salvar alteracoes'
                      : 'Cadastrar produto'}
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
    backgroundColor: '#F4F0FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  containerWide: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  listContent: {
    paddingBottom: 36,
  },
  hero: {
    marginTop: 18,
    marginBottom: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  overline: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6D5EF6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#221431',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B6278',
  },
  heroMeta: {
    marginTop: 18,
    flexDirection: 'row',
  },
  addButton: {
    marginTop: 18,
    backgroundColor: '#7C3AED',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  addButtonText: {
    marginLeft: 10,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F8F2FF',
    borderWidth: 1,
    borderColor: '#E8D8FF',
  },
  heroBadgeText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#221431',
  },
  sectionHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7AA8',
  },
  columnWrapper: {
    gap: 14,
  },
  loadingContainer: {
    paddingTop: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B6278',
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE3FF',
  },
  stateIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#2F2340',
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#7B718E',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 20, 49, 0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 24,
  },
  modalContent: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F2340',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    marginTop: 14,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#44305F',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9F6FF',
    borderWidth: 1,
    borderColor: '#E9DFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2F2340',
  },
  inputDescricao: {
    minHeight: 120,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#7C3AED',
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    marginLeft: 10,
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
