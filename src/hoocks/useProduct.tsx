import { useEffect, useState } from 'react';

import { addProduct, deleteProduct, editProduct, getProduct } from '../services/api';
import { Product } from '../types/Product';

export function useProduct() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getProduct();
      setProdutos(data);
      setError(null);
    } catch (err) {
      console.log('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const atualizarProduto = async (produtoAtualizado: Product) => {
    const data = await editProduct(produtoAtualizado);
    setProdutos(data);
    setError(null);
  };

  const adicionarProduto = async (novoProduto: Product) => {
    const data = await addProduct(novoProduto);
    setProdutos(data);
    setError(null);
  };

  const removerProduto = async (productId: Product['id']) => {
    const data = await deleteProduct(productId);
    setProdutos(data);
    setError(null);
  };

  return { produtos, loading, error, load, atualizarProduto, adicionarProduto, removerProduto };
}
