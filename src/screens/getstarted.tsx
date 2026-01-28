import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import HomePage from "./homepage";

export default function GetStarted({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../images/pod.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Two-line welcome text */}
      <Text style={styles.title}>
        Where will you use your pod?
      </Text>

      {/* Modern Pressable button */}
      <Pressable
        onPress={() => navigation.replace("MainTabs")}
        style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? "#0097f6" : "#056af7" },
        ]}
      >
        <Text style={styles.buttonText}>Home</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.replace("MainTabs")}
        style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? "#0097f6" : "#056af7", marginTop: 20 },
        ]}
      >
        <Text style={styles.buttonText}>Office</Text>
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
    width: 200,            // fixed width
    height: 50,            // fixed height
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
});
