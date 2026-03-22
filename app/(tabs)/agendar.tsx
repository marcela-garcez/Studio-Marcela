import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAgendamento } from "../../context/AgendamentosContext";

type Agendamento = {
  servico: string;
  data: string;
  hora: string;
};

type Servico = {
  id: string;
  nome: string;
  icone: keyof typeof Ionicons.glyphMap;
};

const SERVICOS: Servico[] = [
  { id: "1", nome: "Corte", icone: "cut" },
  { id: "2", nome: "Escova", icone: "brush" },
  { id: "3", nome: "Pintura", icone: "color-palette" },
  { id: "4", nome: "Hidrata", icone: "water" },
  { id: "5", nome: "Progressiva", icone: "sparkles" },
  { id: "6", nome: "Manicure / Pedicure", icone: "footsteps-outline" },
];

const DATAS = [
  "2026-04-01","2026-04-02","2026-04-03","2026-04-04",
  "2026-04-07","2026-04-08","2026-04-09","2026-04-10",
  "2026-04-11","2026-04-14","2026-04-15","2026-04-16",
  "2026-04-17","2026-04-18","2026-04-21","2026-04-22",
  "2026-04-23","2026-04-24","2026-04-25","2026-04-28",
  "2026-04-29","2026-04-30",
];

const HORARIOS = [
  "08:00","09:00","10:00","11:00",
  "13:00","14:00","15:00","16:00",
  "17:00","18:00",
];

export default function Agendar() {
  const contexto = useAgendamento();

  const [servico, setServico] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  if (!contexto) {
    return (
      <View style={styles.center}>
        <Text>Erro: Contexto não carregado</Text>
      </View>
    );
  }

  const { adicionar, agendamentos = [] } = contexto as {
    adicionar: (novo: Agendamento) => Promise<boolean>;
    agendamentos: Agendamento[];
  };

  const formatarData = (dataISO: string) => {
    if(!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}`;
  };

  const confirmar = async () => {
    if (!servico || !data || !hora) {
      Alert.alert("Quase lá!", "Selecione o serviço, a data e o horário.");
      return;
    }

    const sucesso = await adicionar({
      servico,
      data: `${data.split("-")[2]}/${data.split("-")[1]}/${data.split("-")[0]}`,
      hora,
    });

    if (sucesso) {
      Alert.alert("Feito!", "Seu horário foi reservado com sucesso.");
      setServico(null);
      setData(null);
      setHora(null);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Agendar Horário</Text>
      <Text style={styles.info}>Escolha os detalhes do seu atendimento</Text>

      {/* SEÇÃO: SERVIÇOS (Em Grid) */}
      <Text style={styles.labelSecao}>Qual o serviço?</Text>
      <View style={styles.gridServicos}>
        {SERVICOS.map((item) => {
          const ativo = servico === item.nome;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.cardServico, ativo && styles.cardServicoAtivo]}
              onPress={() => setServico(item.nome)}
              activeOpacity={0.7}
            >
              <View style={[styles.circuloIcone, ativo && styles.circuloIconeAtivo]}>
                <Ionicons name={item.icone} size={22} color={ativo ? "#FFF" : "#8A2BE2"} />
              </View>
              <Text style={[styles.textoServico, ativo && styles.textoBranco]}>{item.nome}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SEÇÃO: DATAS (Horizontal) */}
      <Text style={styles.labelSecao}>Para quando?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollData}>
        {DATAS.map((d) => {
          const ativo = data === d;
          return (
            <TouchableOpacity
              key={d}
              style={[styles.botaoData, ativo && styles.botaoDataAtivo]}
              onPress={() => { setData(d); setHora(null); }}
            >
              <Text style={[styles.textoDataMenor, ativo && styles.textoBranco]}>Abril</Text>
              <Text style={[styles.textoDataDia, ativo && styles.textoBranco]}>{d.split("-")[2]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SEÇÃO: HORÁRIOS */}
      <Text style={styles.labelSecao}>Em qual horário?</Text>
      {!data && <Text style={styles.aviso}>Selecione uma data primeiro</Text>}
      
      <View style={styles.containerHorarios}>
        {HORARIOS.map((h) => {
          const dataFormatada = data ? `${data.split("-")[2]}/${data.split("-")[1]}/${data.split("-")[0]}` : "";
          const ocupado = agendamentos.some(
            (a: Agendamento) => a.data === dataFormatada && a.hora === h
          );
          const ativo = hora === h;

          return (
            <TouchableOpacity
              key={h}
              disabled={!data || ocupado}
              style={[
                styles.itemHorario,
                ativo && styles.itemHorarioAtivo,
                ocupado && styles.itemHorarioOcupado,
              ]}
              onPress={() => setHora(h)}
            >
              <Text style={[
                styles.textoHorario, 
                ativo && styles.textoBranco,
                ocupado && styles.textoOcupado
              ]}>
                {h}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.botaoConfirmar} onPress={confirmar}>
        <Text style={styles.textoBotaoConfirmar}>Confirmar Agendamento</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 50,
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  labelSecao: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginTop: 25,
    marginBottom: 15,
  },
  /* Serviços */
  gridServicos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardServico: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardServicoAtivo: {
    backgroundColor: "#8A2BE2",
  },
  circuloIcone: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#F0E6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  circuloIconeAtivo: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  textoServico: {
    fontWeight: "600",
    color: "#444",
  },
  /* Datas */
  scrollData: {
    flexDirection: "row",
  },
  botaoData: {
    width: 65,
    height: 80,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  botaoDataAtivo: {
    backgroundColor: "#8A2BE2",
    borderColor: "#8A2BE2",
  },
  textoDataMenor: {
    fontSize: 12,
    color: "#888",
  },
  textoDataDia: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  /* Horários */
  containerHorarios: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemHorario: {
    width: "30%",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemHorarioAtivo: {
    backgroundColor: "#8A2BE2",
    borderColor: "#8A2BE2",
  },
  itemHorarioOcupado: {
    backgroundColor: "#E2E8F0",
    opacity: 0.4,
  },
  textoHorario: {
    fontWeight: "bold",
    color: "#444",
  },
  textoOcupado: {
    textDecorationLine: "line-through",
  },
  /* Geral */
  textoBranco: {
    color: "#FFF",
  },
  aviso: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
  botaoConfirmar: {
    backgroundColor: "#8A2BE2",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
    elevation: 5,
  },
  textoBotaoConfirmar: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});