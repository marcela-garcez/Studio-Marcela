import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Product } from '../types/Product';

interface Props {
  produto: Product | null;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function ProductCard({ produto, onEdit, onDelete, showActions = true }: Props) {
  if (!produto) {
    return <Text>Produto invalido</Text>;
  }

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {produto.imageUrl ? (
          <Image
            source={{ uri: produto.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={30} color="#A78BFA" />
            <Text style={styles.imageFallbackText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>
            {Number(produto.preco || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Produto</Text>
        <Text style={styles.nome}>{produto.nome ? produto.nome.toUpperCase() : 'SEM NOME'}</Text>

        <Text numberOfLines={3} style={styles.descricao}>
          {produto.descricao || 'Sem descricao'}
        </Text>
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={onEdit}>
            <Ionicons name="create-outline" size={18} color="#7C3AED" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#2E1065',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#F8F2FF',
    padding: 14,
  },
  image: {
    width: '100%',
    height: 220,
  },
  imageFallback: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8B4FE',
    backgroundColor: '#FAF7FF',
  },
  imageFallbackText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7AA8',
  },
  priceBadge: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  priceBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
  },
  infoContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B7AA8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2F2340',
  },
  descricao: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#6F6482',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F8F2FF',
    borderWidth: 1,
    borderColor: '#E8D8FF',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
});
