import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

export default function SignIn({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        A New Typology of {"\n"}Compactable Meeting Pods
        
      </Text>

      <Pressable
        onPress={() => navigation.navigate("SignInCredentials")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? "#0097f6" : "#056af7" },
        ]}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("SignUp")}
        style={({ pressed }) => [
          styles.buttonOutline,
          { borderColor: pressed ? "#0097f6" : "#056af7" },
        ]}
      >
        <Text style={styles.buttonOutlineText}>Get Started</Text>
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
    backgroundColor: "#FFFFFF", // optional light background
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
  buttonOutline: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#fff",
  },
  buttonOutlineText: {
    color: "#056af7",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
