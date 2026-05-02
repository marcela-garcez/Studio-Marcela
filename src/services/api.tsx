import axios from 'axios';

import { API_KEY, BIN_URL, URL } from '../constants/config';
import { Product } from '../types/Product';

type ProductApiItem = {
  id?: number | string;
  nome?: string;
  preco?: number | string;
  descricao?: string;
  imagem?: string;
  imageUrl?: string;
};

type ProductApiResponse = {
  record?: {
    record?: ProductApiItem[];
  };
};

type ProductApiPayload = {
  record: ProductApiItem[];
};

const apiHeaders = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
};

function mapApiItemToProduct(item: ProductApiItem): Product {
  return {
    id: item.id,
    nome: item.nome?.trim() || 'Sem nome',
    descricao: item.descricao?.trim() || 'Sem descricao',
    preco: String(item.preco ?? '0'),
    imageUrl: item.imageUrl || item.imagem || '',
  };
}

function mapProductToApiItem(product: Product): ProductApiItem {
  return {
    id: product.id,
    nome: product.nome.trim(),
    descricao: product.descricao.trim(),
    preco: product.preco,
    imagem: product.imageUrl.trim(),
  };
}

async function persistProducts(products: Product[]) {
  const payload: ProductApiPayload = {
    record: products.map(mapProductToApiItem),
  };

  await axios.put(BIN_URL, payload, {
    headers: apiHeaders,
  });
}

export const getProduct = async (): Promise<Product[]> => {
  const response = await axios.get<ProductApiResponse>(URL, {
    headers: apiHeaders,
  });

  const items = response.data?.record?.record ?? [];

  return items.map(mapApiItemToProduct);
};

export const editProduct = async (updatedProduct: Product): Promise<Product[]> => {
  const products = await getProduct();

  const nextProducts = products.map((product) =>
    product.id === updatedProduct.id ? updatedProduct : product,
  );

  await persistProducts(nextProducts);

  return nextProducts;
};

export const addProduct = async (newProduct: Product): Promise<Product[]> => {
  const products = await getProduct();
  const productWithId: Product = {
    ...newProduct,
    id: newProduct.id ?? `${Date.now()}`,
  };
  const nextProducts = [...products, productWithId];

  await persistProducts(nextProducts);

  return nextProducts;
};

export const deleteProduct = async (productId: Product['id']): Promise<Product[]> => {
  const products = await getProduct();
  const nextProducts = products.filter((product) => product.id !== productId);

  await persistProducts(nextProducts);

  return nextProducts;
};
