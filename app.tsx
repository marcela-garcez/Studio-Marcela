import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import RootStack from "./app/(tabs)/index";
import { requestNotificationPermission } from "./src/services/firebaseMessaging";

export default function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
