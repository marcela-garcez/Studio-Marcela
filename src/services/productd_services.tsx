import { get, push, ref, remove, set, update } from "firebase/database";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { database, storage } from "./connectionFirebase";
import { Service } from "../types/Service";

const PATH = "services";

export type ServiceImageInput = {
  uri: string;
  file?: Blob;
};

async function criarBlobDaImagem(imagem: ServiceImageInput): Promise<Blob> {
  if (imagem.file) {
    return imagem.file;
  }

  const resposta = await fetch(imagem.uri);
  return await resposta.blob();
}

class ServiceService {
  private imagemEstaNoFirebaseStorage(imageUrl?: string) {
    if (!imageUrl) {
      return false;
    }

    const bucket = getStorage().app.options.storageBucket;

    if (!bucket) {
      return false;
    }

    return imageUrl.includes(bucket) && imageUrl.includes("/o/services%2F");
  }

  private async uploadImagem(id: string, imagem: ServiceImageInput) {
    const imagemRef = storageRef(storage, `${PATH}/${id}`);
    const blob = await criarBlobDaImagem(imagem);

    await uploadBytes(imagemRef, blob);

    return await getDownloadURL(imagemRef);
  }

  async inserir(servico: Service, imagem?: ServiceImageInput) {
    const servicosRef = ref(database, PATH);
    const novoRef = push(servicosRef);
    const id = novoRef.key;

    if (!id) {
      throw new Error("Nao foi possivel gerar o id do servico.");
    }

    let imageUrl = servico.imageUrl;

    if (imagem) {
      imageUrl = await this.uploadImagem(id, imagem);
    }

    await set(novoRef, {
      nome: servico.nome,
      preco: servico.preco,
      descricao: servico.descricao,
      informacao: servico.informacao ?? "",
      imageUrl: imageUrl ?? "",
    });
  }

  async listar(): Promise<Service[]> {
    const servicosRef = ref(database, PATH);
    const snapshot = await get(servicosRef);

    if (!snapshot.exists()) return [];

    const data = snapshot.val();

    return Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
  }

  async alterar(id: string, servico: Partial<Service>, imagem?: ServiceImageInput) {
    const servicoRef = ref(database, `${PATH}/${id}`);
    const dadosAtualizados = { ...servico };

    if (imagem) {
      dadosAtualizados.imageUrl = await this.uploadImagem(id, imagem);
    }

    await update(servicoRef, dadosAtualizados);
  }

  async excluir(id: string) {
    try {
      const servicoRef = ref(database, `${PATH}/${id}`);
      const snapshot = await get(servicoRef);
      const servico = snapshot.exists() ? (snapshot.val() as Service) : null;

      await remove(servicoRef);

      if (this.imagemEstaNoFirebaseStorage(servico?.imageUrl)) {
        try {
          const imagemRef = storageRef(storage, `${PATH}/${id}`);
          await deleteObject(imagemRef);
        } catch (error) {
          console.log("Imagem no Storage nao encontrada para exclusao:", error);
        }
      }

      console.log("Servico removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover servico:", error);
      throw error;
    }
  }
}

export const serviceService = new ServiceService();
