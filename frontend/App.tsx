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

import { UserProvider } from "./src/context/UserContext";
import SignIn from "./src/screens/signin";
import SignInCredentials from "./src/screens/SignInCredentials";
import SignUp from "./src/screens/signup";
import GetStarted from "./src/screens/getstarted";
import TabNavigator from "./src/navigation/TabNavigator";
import OfficeTabNavigator from "./src/navigation/OfficeTabNavigator";
import MakeBooking from "./src/screens/MakeBooking";
import ViewBookings from "./src/screens/ViewBookings";
import Wifi from "./src/screens/wifi";
import Settings from "./src/screens/settings";
import ProfileSettings from "./src/screens/ProfileSettings";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignInCredentials" component={SignInCredentials} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="GetStarted" component={GetStarted} />

        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="OfficeTabs" component={OfficeTabNavigator} />
        <Stack.Screen name="MakeBooking" component={MakeBooking} />
        <Stack.Screen name="ViewBookings" component={ViewBookings} />
        <Stack.Screen name="Wifi" component={Wifi} />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ animation: "slide_from_left" }}
        />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}
