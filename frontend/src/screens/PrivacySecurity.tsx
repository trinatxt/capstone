import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUser } from "../context/UserContext";
import { API_URL } from "../api/apiClient";

const sections = [
  {
    title: "Privacy",
    items: [
      { label: "Show my pod status", type: "toggle", key: "showStatus" },
      { label: "Allow knock notifications", type: "toggle", key: "allowKnock" },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Change Password", type: "link" },
      { label: "Active Sessions", type: "link" },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Delete account", type: "link", danger: true },
    ],
  },
];

const linkActions: Record<string, string> = {
  "Change Password": "ChangePassword",
  "Active Sessions": "ActiveSessions",
};

export default function PrivacySecurity({ navigation }: any) {
  const { user, setUser } = useUser();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    showStatus: true,
    allowKnock: true,
  });

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your bookings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/users/${user?.id}`, { method: "DELETE" });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to delete account");
              setUser(null);
              navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.row,
                    idx < section.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Text style={[styles.rowLabel, item.danger && styles.dangerText]}>
                    {item.label}
                  </Text>
                  {item.danger ? (
                    <Pressable onPress={handleDeleteAccount}>
                      <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                    </Pressable>
                  ) : item.type === "link" && linkActions[item.label] ? (
                    <Pressable onPress={() => navigation.navigate(linkActions[item.label])}>
                      <Ionicons name="chevron-forward" size={18} color="#bbb" />
                    </Pressable>
                  ) : item.type === "toggle" && item.key ? (
                    <Switch
                      value={toggles[item.key]}
                      onValueChange={() => toggle(item.key!)}
                      trackColor={{ false: "#ccc", true: "#1E3EA1" }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#bbb" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLabel: {
    fontSize: 15,
    color: "#111",
  },
  dangerText: {
    color: "#EF4444",
  },
});
