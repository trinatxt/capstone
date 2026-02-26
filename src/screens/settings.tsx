import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const menuItems = [
  { label: "Profile Settings" },
  { label: "Privacy & Security" },
  { label: "Help & Support" },
];

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar + Name */}
      <View style={styles.profileRow}>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.name}>Lee Wan Wei</Text>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <Pressable key={item.label} style={styles.menuItem}>
            <Text style={styles.menuText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  menu: {
    gap: 8,
  },
  menuItem: {
    paddingVertical: 18,
  },
  menuText: {
    fontSize: 20,
    color: "#111",
  },
});
