import { get, push, ref, remove, set, update } from "firebase/database";
import { database } from "./connectionFirebase";
import { Service } from "../types/Service";

const PATH = "services";

class ServiceService {
  async inserir(servico: Service) {
    const servicosRef = ref(database, PATH);
    const novoRef = push(servicosRef);

    await set(novoRef, {
      nome: servico.nome,
      preco: servico.preco,
      descricao: servico.descricao,
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

  async alterar(id: string, servico: Partial<Service>) {
    const servicoRef = ref(database, `${PATH}/${id}`);
    await update(servicoRef, servico);
  }

  async excluir(id: string) {
    const servicoRef = ref(database, `${PATH}/${id}`);
    await remove(servicoRef);
  }
}

export const serviceService = new ServiceService();
