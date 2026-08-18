export type Agendamento = {
  id?: string;
  uid: string;
  servico: string;
  data: string;
  hora: string;
  status: "confirmado" | "cancelado";
  criadoEm: string;
};
