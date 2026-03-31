import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { API_URL } from "../api/apiClient";

const PREFERRED_MODES = ["Meeting Mode", "Reading Mode", "Relaxation Mode"];

export default function ProfileSettings({ navigation }: any) {
  const { user, setUser } = useUser();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [preferredMode, setPreferredMode] = useState(user?.preferred_modes || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          birthday: birthday.trim() || null,
          preferred_modes: preferredMode || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.error || "Failed to save.");
      } else {
        setUser(data.user);
        Alert.alert("Saved", "Profile updated successfully.");
        navigation.goBack();
      }
    } catch {
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Profile Settings</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image source={require("../images/avatar.png")} style={styles.avatar} />
          <Text style={styles.username}>@{user?.username}</Text>
        </View>

        {/* Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Birthday</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Mode</Text>
          <View style={styles.modeRow}>
            {PREFERRED_MODES.map((m) => (
              <Pressable
                key={m}
                style={[styles.modeChip, preferredMode === m && styles.modeChipActive]}
                onPress={() => setPreferredMode(m)}
              >
                <Text style={[styles.modeChipText, preferredMode === m && styles.modeChipTextActive]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: pressed ? "#0356c8" : "#056af7" },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: "#056af7",
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 28,
    gap: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  username: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  modeRow: {
    gap: 8,
  },
  modeChip: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },
  modeChipActive: {
    borderColor: "#056af7",
    backgroundColor: "#EBF3FF",
  },
  modeChipText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
  modeChipTextActive: {
    color: "#056af7",
    fontWeight: "700",
  },
  saveBtn: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
