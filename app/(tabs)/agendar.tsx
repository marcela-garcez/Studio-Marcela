import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAgendamento } from "../../context/AgendamentosContext";
import { showAlert } from "../../src/utils/feedback";

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
  "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04",
  "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10",
  "2026-04-11", "2026-04-14", "2026-04-15", "2026-04-16",
  "2026-04-17", "2026-04-18", "2026-04-21", "2026-04-22",
  "2026-04-23", "2026-04-24", "2026-04-25", "2026-04-28",
  "2026-04-29", "2026-04-30",
];

const HORARIOS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00",
];

export default function Agendar() {
  const contexto = useAgendamento();

  const [servico, setServico] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  if (!contexto) {
    return (
      <View style={styles.center}>
        <Text>Erro: Contexto nao carregado</Text>
      </View>
    );
  }

  const { adicionar, agendamentos = [] } = contexto as {
    adicionar: (novo: Agendamento) => Promise<boolean>;
    agendamentos: Agendamento[];
  };

  const resumoAgendamento = [
    servico || "Escolha um servico",
    data ? `${data.split("-")[2]}/${data.split("-")[1]}` : "Selecione uma data",
    hora || "Defina o horario",
  ];

  const botaoDesabilitado = !servico || !data || !hora;

  const confirmar = async () => {
    if (!servico || !data || !hora) {
      showAlert("Quase la!", "Selecione o servico, a data e o horario.");
      return;
    }

    const sucesso = await adicionar({
      servico,
      data: `${data.split("-")[2]}/${data.split("-")[1]}/${data.split("-")[0]}`,
      hora,
    });

    if (sucesso) {
      showAlert("Feito!", "Seu horario foi reservado com sucesso.");
      setServico(null);
      setData(null);
      setHora(null);
      return;
    }

    showAlert("Horario indisponivel", "Ja existe um agendamento para essa data e horario.");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.titulo}>Agendar Horario</Text>
        <Text style={styles.info}>
          Monte seu atendimento em poucos toques e escolha o melhor encaixe.
        </Text>

        <View style={styles.resumoContainer}>
          {resumoAgendamento.map((item, index) => (
            <View key={index} style={styles.resumoChip}>
              <Text style={styles.resumoChipText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.secaoCard}>
        <Text style={styles.labelSecao}>Qual o servico?</Text>
        <View style={styles.gridServicos}>
          {SERVICOS.map((item) => {
            const ativo = servico === item.nome;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.cardServico, ativo && styles.cardServicoAtivo]}
                onPress={() => setServico(item.nome)}
                activeOpacity={0.82}
              >
                <View style={[styles.circuloIcone, ativo && styles.circuloIconeAtivo]}>
                  <Ionicons name={item.icone} size={22} color={ativo ? "#FFF" : "#7C3AED"} />
                </View>
                <Text style={[styles.textoServico, ativo && styles.textoBranco]}>
                  {item.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.secaoCard}>
        <Text style={styles.labelSecao}>Para quando?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollData}
          contentContainerStyle={styles.scrollDataContent}
        >
          {DATAS.map((d) => {
            const ativo = data === d;

            return (
              <TouchableOpacity
                key={d}
                style={[styles.botaoData, ativo && styles.botaoDataAtivo]}
                onPress={() => {
                  setData(d);
                  setHora(null);
                }}
              >
                <Text style={[styles.textoDataMenor, ativo && styles.textoBranco]}>Abr</Text>
                <Text style={[styles.textoDataDia, ativo && styles.textoBranco]}>
                  {d.split("-")[2]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.secaoCard}>
        <Text style={styles.labelSecao}>Em qual horario?</Text>
        {!data && <Text style={styles.aviso}>Selecione uma data primeiro</Text>}

        <View style={styles.containerHorarios}>
          {HORARIOS.map((h) => {
            const dataFormatada = data
              ? `${data.split("-")[2]}/${data.split("-")[1]}/${data.split("-")[0]}`
              : "";
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
                <Text
                  style={[
                    styles.textoHorario,
                    ativo && styles.textoBranco,
                    ocupado && styles.textoOcupado,
                  ]}
                >
                  {h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botaoConfirmar, botaoDesabilitado && styles.botaoConfirmarDesabilitado]}
        onPress={confirmar}
        activeOpacity={0.9}
      >
        <Ionicons name="calendar-outline" size={20} color="#FFF" />
        <Text style={styles.textoBotaoConfirmar}>Confirmar Agendamento</Text>
      </TouchableOpacity>

      <View style={styles.espacoFinal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0FF",
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    marginTop: 28,
    marginBottom: 22,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 4,
  },
  titulo: {
    fontSize: 31,
    fontWeight: "800",
    color: "#221431",
  },
  info: {
    fontSize: 15,
    color: "#6B6278",
    lineHeight: 22,
    marginTop: 8,
  },
  resumoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },
  resumoChip: {
    backgroundColor: "#FAF7FF",
    borderWidth: 1,
    borderColor: "#E9DDFD",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  resumoChipText: {
    color: "#5B4B75",
    fontSize: 12,
    fontWeight: "600",
  },
  secaoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  labelSecao: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F2340",
    marginBottom: 15,
  },
  gridServicos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardServico: {
    width: "48%",
    backgroundColor: "#FCFAFF",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE6FF",
    shadowColor: "#C4B5FD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  cardServicoAtivo: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  circuloIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  circuloIconeAtivo: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  textoServico: {
    fontWeight: "700",
    color: "#44305F",
    textAlign: "center",
  },
  scrollData: {
    flexDirection: "row",
  },
  scrollDataContent: {
    paddingRight: 6,
  },
  botaoData: {
    width: 72,
    height: 88,
    backgroundColor: "#FCFAFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E7DBFF",
    shadowColor: "#DDD6FE",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  botaoDataAtivo: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  textoDataMenor: {
    fontSize: 12,
    color: "#7C7194",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  textoDataDia: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E2041",
  },
  containerHorarios: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemHorario: {
    width: "30%",
    backgroundColor: "#FBFAFE",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9E1F7",
  },
  itemHorarioAtivo: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  itemHorarioOcupado: {
    backgroundColor: "#ECE8F3",
    borderColor: "#DDD6E7",
    opacity: 0.48,
  },
  textoHorario: {
    fontWeight: "800",
    color: "#45345F",
  },
  textoOcupado: {
    textDecorationLine: "line-through",
  },
  textoBranco: {
    color: "#FFF",
  },
  aviso: {
    color: "#8A7EA1",
    marginBottom: 14,
    fontWeight: "500",
  },
  botaoConfirmar: {
    backgroundColor: "#7C3AED",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  botaoConfirmarDesabilitado: {
    backgroundColor: "#A78BFA",
    shadowOpacity: 0.1,
    elevation: 1,
  },
  textoBotaoConfirmar: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
  },
  espacoFinal: {
    height: 40,
  },
});
