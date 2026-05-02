import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AgendamentoProvider } from '../context/AgendamentosContext'; 

export const unstable_settings = {
  // Garante que o app saiba que a rota principal são as abas
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // O Provider aqui garante que o estado de 'agendamentos' seja global
    <AgendamentoProvider> 
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FBFBFF',
            },
            headerTintColor: '#8A2BE2', // Cor roxa premium nos botões de voltar
            headerTitleStyle: {
              fontWeight: '800',
            },
            headerShadowVisible: false, // Remove a linha feia do topo
          }}
        >
          {/* Configuração das telas principais */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              animation: 'fade' // Transição suave no login
            }} 
          />

          <Stack.Screen 
            name="cadastro" 
            options={{ 
              title: 'Criar Conta',
              headerBackTitle: 'Voltar'
            }} 
          />

          <Stack.Screen 
            name="editarPerfil" 
            options={{ 
              presentation: 'modal', // Abre como um card de baixo para cima
              title: 'Editar Perfil'
            }} 
          />

          <Stack.Screen
            name="produtos"
            options={{
              title: 'Produtos',
              headerBackTitle: 'Voltar'
            }}
          />

        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AgendamentoProvider>
  );
}
