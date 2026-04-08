import React, { useState, useEffect } from "react";
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
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../api/apiClient";

const PREFERRED_MODES = ["Meeting Mode", "Reading Mode", "Relaxation Mode"];

export default function ProfileSettings({ navigation }: any) {
  const { user, setUser } = useUser();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [preferredMode, setPreferredMode] = useState(user?.preferred_modes || "");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sync fields if user context changes (e.g. after save or re-login)
  useEffect(() => {
    setFullName(user?.full_name || "");
    setBirthday(user?.birthday || "");
    setPreferredMode(user?.preferred_modes || "");
  }, [user]);

  const birthdayDate = (() => {
    if (!birthday) return new Date(2000, 0, 1);
    const parts = birthday.split("T")[0].split("-");
    if (parts.length < 3) return new Date(2000, 0, 1);
    // Use local time constructor to avoid UTC midnight timezone shift
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  })();

  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, "0");
      const d = String(selected.getDate()).padStart(2, "0");
      setBirthday(`${y}-${m}-${d}`);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You are not logged in. Please sign in again.");
      return;
    }
    setLoading(true);
    try {
      console.log("Saving profile for user:", user.id, { fullName, birthday });
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
        setFullName(data.user.full_name || "");
        setBirthday(data.user.birthday || "");
        setPreferredMode(data.user.preferred_modes || "");
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
          <Text style={styles.username}>
            {user?.username ? `@${user.username}` : user?.full_name || "No username"}
          </Text>
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
          <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={{ fontSize: 16, color: birthday ? "#111" : "#aaa" }}>
              {birthday || "Select your birthday"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <Modal transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
              <Pressable style={styles.pickerOverlay} onPress={() => setShowDatePicker(false)}>
                <View style={styles.pickerCard}>
                  <Text style={styles.pickerTitle}>Select Birthday</Text>
                  <DateTimePicker
                    value={birthdayDate}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                    style={{ width: "100%" }}
                  />
                  <Pressable style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDoneText}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          )}
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  pickerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  pickerDone: {
    marginTop: 12,
    backgroundColor: "#056af7",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 24,
  },
  pickerDoneText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
