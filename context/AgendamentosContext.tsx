import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Agendamento = {
  servico: string;
  data: string;
  hora: string;
};

type ContextType = {
  agendamentos: Agendamento[];
  adicionar: (novo: Agendamento) => Promise<boolean>;
  remover: (index: number) => Promise<void>; // Adicionei para seu controle
};

const AgendamentoContext = createContext<ContextType | null>(null);

export function AgendamentoProvider({ children }: any) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  // Carrega ao iniciar o App
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const dados = await AsyncStorage.getItem("@agendamentos_key");
        if (dados) {
          setAgendamentos(JSON.parse(dados));
        }
      } catch (e) {
        console.error("Erro ao carregar agendamentos", e);
      }
    };
    carregarDadosIniciais();
  }, []);

  const adicionar = async (novo: Agendamento) => {
    // Verifica se já existe o horário
    const existe = agendamentos.some(
      (a) => a.data === novo.data && a.hora === novo.hora
    );

    if (existe) return false;

    // Atualiza o estado PRIMEIRO para a UI reagir na hora
    const novaLista = [...agendamentos, novo];
    setAgendamentos(novaLista);

    // Salva no storage em seguida
    try {
      await AsyncStorage.setItem("@agendamentos_key", JSON.stringify(novaLista));
      return true;
    } catch (e) {
      return false;
    }
  };

  const remover = async (index: number) => {
    const novaLista = agendamentos.filter((_, i) => i !== index);
    setAgendamentos(novaLista);
    await AsyncStorage.setItem("@agendamentos_key", JSON.stringify(novaLista));
  };

  return (
    <AgendamentoContext.Provider value={{ agendamentos, adicionar, remover }}>
      {children}
    </AgendamentoContext.Provider>
  );
}

export const useAgendamento = () => {
  const context = useContext(AgendamentoContext);
  if (!context) {
    throw new Error("useAgendamento deve ser usado dentro de um AgendamentoProvider");
  }
  return context;
};