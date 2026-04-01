import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUser } from "../context/UserContext";
import { API_URL } from "../api/apiClient";

type Session = {
  id: string;
  device: string;
  location: string;
  logged_in_at: string;
  is_current: boolean;
};

export default function ActiveSessions({ navigation }: any) {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/users/${user?.id}/sessions`)
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-SG", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Active Sessions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Devices currently logged into your account.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1E3EA1" style={{ marginTop: 60 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No active sessions found.</Text>
        ) : (
          <View style={styles.card}>
            {sessions.map((session, idx) => (
              <View
                key={session.id}
                style={[styles.row, idx < sessions.length - 1 && styles.rowBorder]}
              >
                <View style={styles.iconWrap}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#1E3EA1" />
                </View>
                <View style={styles.info}>
                  <View style={styles.deviceRow}>
                    <Text style={styles.deviceName}>{session.device}</Text>
                    {session.is_current && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.location}>{session.location}</Text>
                  <Text style={styles.time}>{formatDate(session.logged_in_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6fa" },
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111" },
  content: { padding: 24 },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 20 },
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 },
  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  deviceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  deviceName: { fontSize: 15, fontWeight: "600", color: "#111" },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, color: "#16a34a", fontWeight: "700" },
  location: { fontSize: 13, color: "#666" },
  time: { fontSize: 12, color: "#aaa", marginTop: 2 },
});
