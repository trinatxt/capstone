import React from "react";
import { useUser } from "../context/UserContext";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";

const menuItems = [
  { label: "Profile Settings", screen: "ProfileSettings" },
  { label: "Privacy & Security", screen: "PrivacySecurity" },
  { label: "Help & Support", screen: "HelpSupport" },
];

export default function Settings({ navigation }: any) {
  const { user } = useUser();
  return (
    <SafeAreaView style={styles.container}>
      {/* Avatar + Name */}
      <View style={styles.profileRow}>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.name}>{user?.full_name || user?.username}</Text>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            style={styles.menuItem}
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 18,
    color: "#111",
  },
  menuArrow: {
    fontSize: 22,
    color: "#bbb",
  },
});
