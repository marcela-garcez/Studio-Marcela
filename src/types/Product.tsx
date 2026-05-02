export interface Product {
  id?: number | string;
  nome: string;
  preco: string;
  descricao: string;
  imageUrl: string;
}

export interface ProductWithId {
  record: Product;
  metadede: string;
}
