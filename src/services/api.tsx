import axios from "axios";

import { API_KEY, BIN_URL, URL } from "../constants/ConfigProduto";
import { Product } from "../types/Product";

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
    record?: ProductApiItem[] | { cupons?: Partial<CouponApiItem>[] };
    carrinho?: CartApiItem[];
    cupons?: Partial<CouponApiItem>[];
    cupom?: Partial<CouponApiItem>[];
    coupons?: Partial<CouponApiItem>[];
    descontos?: Partial<CouponApiItem>[];
    [key: string]: unknown;
  };
};

export type CartApiItem = ProductApiItem & {
  quantidade: number;
};

export type CouponApiItem = {
  id: string;
  codigo: string;
  descricao?: string;
  percentualDesconto: number;
  ativo: boolean;
  criadoEm: string;
};

export type ShippingApiInfo = {
  tipo: "cep" | "regiao";
  valor: number;
  cep?: string;
  regiao?: string;
};

type CouponApiRawItem = Partial<CouponApiItem> & {
  code?: string;
  cupom?: string;
  codigoCupom?: string;
  desconto?: number | string;
  percent?: number | string;
  percentual?: number | string;
  porcentagem?: number | string;
  description?: string;
};

export type SavedCartApiItem = {
  id: string;
  criadoEm: string;
  produtos: CartApiItem[];
  cupom?: CouponApiItem;
  desconto: number;
  frete: number;
  freteInfo?: ShippingApiInfo;
  subtotal: number;
  total: number;
  quantidadeTotal: number;
};

const apiHeaders = {
  "Content-Type": "application/json",
  "X-Master-Key": API_KEY,
};

function mapApiItemToProduct(item: ProductApiItem): Product {
  return {
    id: item.id,
    nome: item.nome?.trim() || "Sem nome",
    descricao: item.descricao?.trim() || "Sem descricao",
    preco: String(item.preco ?? "0"),
    imageUrl: item.imageUrl || item.imagem || "",
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

function mapCartItemToApiItem(item: CartApiItem): CartApiItem {
  return {
    id: item.id,
    nome: item.nome?.trim() || "Sem nome",
    descricao: item.descricao?.trim() || "Sem descricao",
    preco: item.preco ?? "0",
    imagem: item.imageUrl || item.imagem || "",
    quantidade: item.quantidade,
  };
}

function normalizeCouponCode(codigo: string) {
  return codigo.replace(/\s/g, "").toUpperCase();
}

function mapCouponToApiItem(cupom: CouponApiRawItem): CouponApiItem {
  const codigo = cupom.codigo || cupom.codigoCupom || cupom.cupom || cupom.code || "";
  const percentualDesconto =
    cupom.percentualDesconto ?? cupom.desconto ?? cupom.percent ?? cupom.percentual ?? cupom.porcentagem ?? 0;

  return {
    id: cupom.id || `${Date.now()}`,
    codigo: normalizeCouponCode(codigo),
    descricao: cupom.descricao?.trim() || cupom.description?.trim() || "",
    percentualDesconto: Number(percentualDesconto || 0),
    ativo: cupom.ativo ?? true,
    criadoEm: cupom.criadoEm || new Date().toISOString(),
  };
}

function normalizeCouponList(value: unknown): CouponApiRawItem[] {
  if (Array.isArray(value)) {
    return value as CouponApiRawItem[];
  }

  if (value && typeof value === "object") {
    return [value as CouponApiRawItem];
  }

  return [];
}

async function getCurrentRecord() {
  const response = await axios.get<ProductApiResponse>(URL, {
    headers: apiHeaders,
  });

  return response.data.record ?? {};
}

async function persistProducts(products: Product[]) {
  const currentRecord = await getCurrentRecord();
  const payload = {
    ...currentRecord,
    record: products.map(mapProductToApiItem),
  };

  await axios.put(BIN_URL, payload, {
    headers: apiHeaders,
  });
}

export const getProduct = async (): Promise<Product[]> => {
  const currentRecord = await getCurrentRecord();
  const items = Array.isArray(currentRecord.record) ? currentRecord.record : [];

  return items.map(mapApiItemToProduct);
};

export const editProduct = async (
  updatedProduct: Product,
): Promise<Product[]> => {
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

export const deleteProduct = async (
  productId: Product["id"],
): Promise<Product[]> => {
  const products = await getProduct();
  const nextProducts = products.filter((product) => product.id !== productId);

  await persistProducts(nextProducts);

  return nextProducts;
};

export const getCoupons = async (): Promise<CouponApiItem[]> => {
  const currentRecord = await getCurrentRecord();
  const nestedCoupons =
    currentRecord.record && !Array.isArray(currentRecord.record)
      ? currentRecord.record.cupons
      : [];
  const coupons = [
    ...normalizeCouponList(currentRecord.cupons),
    ...normalizeCouponList(currentRecord.cupom),
    ...normalizeCouponList(currentRecord.coupons),
    ...normalizeCouponList(currentRecord.descontos),
    ...normalizeCouponList(nestedCoupons),
  ];

  return coupons
    .map(mapCouponToApiItem)
    .filter((coupon) => coupon.codigo && coupon.percentualDesconto > 0);
};

export const addCoupon = async (
  newCoupon: Omit<CouponApiItem, "id" | "criadoEm" | "ativo"> & {
    ativo?: boolean;
  },
): Promise<CouponApiItem[]> => {
  const currentRecord = await getCurrentRecord();
  const coupons = (currentRecord.cupons ?? []).map(mapCouponToApiItem);
  const codigo = normalizeCouponCode(newCoupon.codigo);

  if (coupons.some((coupon) => coupon.codigo === codigo)) {
    throw new Error("COUPON_ALREADY_EXISTS");
  }

  const couponWithId: CouponApiItem = {
    id: `${Date.now()}`,
    codigo,
    descricao: newCoupon.descricao?.trim() || "",
    percentualDesconto: Number(newCoupon.percentualDesconto || 0),
    ativo: newCoupon.ativo ?? true,
    criadoEm: new Date().toISOString(),
  };
  const nextCoupons = [...coupons, couponWithId];

  await axios.put(
    BIN_URL,
    {
      ...currentRecord,
      cupons: nextCoupons,
    },
    {
      headers: apiHeaders,
    },
  );

  return nextCoupons;
};

export const editCoupon = async (
  updatedCoupon: CouponApiItem,
): Promise<CouponApiItem[]> => {
  const currentRecord = await getCurrentRecord();
  const coupons = (currentRecord.cupons ?? []).map(mapCouponToApiItem);
  const couponToSave = mapCouponToApiItem(updatedCoupon);

  if (
    coupons.some(
      (coupon) =>
        coupon.id !== couponToSave.id && coupon.codigo === couponToSave.codigo,
    )
  ) {
    throw new Error("COUPON_ALREADY_EXISTS");
  }

  const nextCoupons = coupons.map((coupon) =>
    coupon.id === couponToSave.id ? couponToSave : coupon,
  );

  await axios.put(
    BIN_URL,
    {
      ...currentRecord,
      cupons: nextCoupons,
    },
    {
      headers: apiHeaders,
    },
  );

  return nextCoupons;
};

export const deleteCoupon = async (
  couponId: CouponApiItem["id"],
): Promise<CouponApiItem[]> => {
  const currentRecord = await getCurrentRecord();
  const coupons = (currentRecord.cupons ?? []).map(mapCouponToApiItem);
  const nextCoupons = coupons.filter((coupon) => coupon.id !== couponId);

  await axios.put(
    BIN_URL,
    {
      ...currentRecord,
      cupons: nextCoupons,
    },
    {
      headers: apiHeaders,
    },
  );

  return nextCoupons;
};

export const findCouponByCode = async (
  codigo: string,
): Promise<CouponApiItem | null> => {
  const coupons = await getCoupons();
  const normalizedCode = normalizeCouponCode(codigo);

  return (
    coupons.find(
      (coupon) => coupon.ativo && coupon.codigo === normalizedCode,
    ) ?? null
  );
};

export const saveShoppingCart = async (
  cartItems: CartApiItem[],
  cupom?: CouponApiItem | null,
  frete = 0,
  freteInfo?: ShippingApiInfo,
): Promise<SavedCartApiItem> => {
  const currentRecord = await getCurrentRecord();
  const produtos = cartItems.map(mapCartItemToApiItem);
  const subtotal = produtos.reduce(
    (total, item) => total + Number(item.preco || 0) * item.quantidade,
    0,
  );
  const percentualDesconto = cupom
    ? Math.min(Math.max(Number(cupom.percentualDesconto || 0), 0), 100)
    : 0;
  const desconto = subtotal * (percentualDesconto / 100);
  const freteCalculado = Math.max(Number(frete || 0), 0);
  const savedCart: SavedCartApiItem = {
    id: `${Date.now()}`,
    criadoEm: new Date().toISOString(),
    produtos,
    cupom: cupom ? mapCouponToApiItem(cupom) : undefined,
    quantidadeTotal: produtos.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
    desconto,
    frete: freteCalculado,
    freteInfo: freteInfo ? { ...freteInfo, valor: freteCalculado } : undefined,
    subtotal,
    total: Math.max(subtotal - desconto, 0) + freteCalculado,
  };

  await axios.put(
    BIN_URL,
    {
      ...currentRecord,
      carrinho: produtos,
      cupomAplicado: savedCart.cupom ?? null,
      ultimoCarrinhoSalvo: savedCart,
    },
    {
      headers: apiHeaders,
    },
  );

  return savedCart;
};
