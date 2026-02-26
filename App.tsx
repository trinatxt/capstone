// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import SignIn from "./src/screens/signin";
// import GetStarted from "./src/screens/getstarted";
// import HomePage from "./src/screens/homepage";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="SignIn"
//         screenOptions={{ headerShown: false }}
//       >
//         <Stack.Screen name="SignIn" component={SignIn} />
//         <Stack.Screen name="GetStarted" component={GetStarted} />
//         <Stack.Screen name="HomePage" component={HomePage} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignIn from "./src/screens/signin";
import GetStarted from "./src/screens/getstarted";
import TabNavigator from "./src/navigation/TabNavigator";
import Wifi from "./src/screens/wifi";
import Settings from "./src/screens/settings";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="GetStarted" component={GetStarted} />

        {/* 👇 THIS is where tabs live */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Wifi" component={Wifi} />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ animation: "slide_from_left" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
