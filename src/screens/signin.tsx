import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import GetStarted from "./getstarted";

export default function SignIn({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Two-line welcome text */}
      <Text style={styles.title}>
        Secure access to your IoT-enabled{'\n'}Smart Meeting Pods
      </Text>

      {/* Modern Pressable button */}
      <Pressable
        onPress={() => navigation.navigate("GetStarted")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? "#0097f6" : "#056af7" },
        ]}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("signdelta")}
        style={({ pressed }) => [
          styles.buttonSecondary,
          { backgroundColor: pressed ? "#E0E0E0" : "#EFEFEF", marginTop: 12 },
        ]}
      >
        <Text style={styles.buttonSecondaryText}>Sign in with Delta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9", // optional light background
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonSecondary: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
