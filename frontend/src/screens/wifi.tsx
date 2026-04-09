import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { API_URL } from "../api/apiClient";

const POD_ID = "delta-pod-1";

export default function Wifi({ navigation }: any) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnect = async () => {
    if (!ssid.trim()) {
      setErrorMsg("Please enter a network name.");
      setResult("error");
      return;
    }
    setLoading(true);
    setResult(null);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/pods/${POD_ID}/sync-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wifi_ssid: ssid.trim(),
          wifi_password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send command");
      setResult("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not reach backend.");
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setErrorMsg("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.title}>Wi-Fi Settings</Text>
      </View>

      {/* Pod status — static */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <Ionicons name="wifi" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>Pod is connected</Text>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedBadgeText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Success state */}
      {result === "success" ? (
        <View style={styles.resultCard}>
          <Ionicons name="checkmark-circle" size={52} color="#4CAF50" />
          <Text style={styles.resultTitle}>Command sent!</Text>
          <Text style={styles.resultSub}>
            The pod is switching to <Text style={{ fontWeight: "700" }}>{ssid}</Text>.{"\n"}
            This may take a few seconds.
          </Text>
          <Pressable style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>Change Again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Form */}
          <Text style={styles.sectionLabel}>Switch Pod Wi-Fi</Text>
          <Text style={styles.hint}>
            Enter the network name and password to connect the pod to a new Wi-Fi network or your personal hotspot.
          </Text>

          <View style={styles.card}>
            {/* SSID */}
            <View style={styles.fieldRow}>
              <Ionicons name="wifi-outline" size={18} color="#666" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Network name (SSID)"
                placeholderTextColor="#aaa"
                value={ssid}
                onChangeText={setSsid}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.divider} />

            {/* Password */}
            <View style={styles.fieldRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#666" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#888" />
              </Pressable>
            </View>
          </View>

          {/* Error */}
          {result === "error" && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Connect button */}
          <Pressable
            style={[styles.connectBtn, loading && styles.connectBtnDisabled]}
            onPress={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.connectBtnText}>Save & Connect</Text>
            )}
          </Pressable>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  /* Pod status card */
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  connectedBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  connectedBadgeText: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 12,
  },

  /* Form */
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },
  eyeBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 14,
  },

  /* Error */
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: -8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
  },

  /* Connect button */
  connectBtn: {
    backgroundColor: "#056af7",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  connectBtnDisabled: {
    opacity: 0.6,
  },
  connectBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* Success */
  resultCard: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  resultSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
  },
  retryBtn: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: "#056af7",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 11,
  },
  retryBtnText: {
    color: "#056af7",
    fontWeight: "600",
    fontSize: 15,
  },
});
