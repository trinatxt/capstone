import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
// import WebView from "react-native-webview"; // 3D model hidden for now

// ── Mode definitions ──────────────────────────────────────────────────────────
type ModeKey = "meeting" | "reading" | "relaxation";

type ModeConfig = {
  label: string;
  icon: string;
  color: string;
  bgLight: string;
  lighting: {
    brightness: number;
    colorTemp: string;
    modeName: string;
  };
  fan: {
    speed: string;
    rpm: string;
    setTemp: string;
    level: number; // 0–5
  };
  suggestion: string;
};

const MODES: Record<ModeKey, ModeConfig> = {
  meeting: {
    label: "Meeting",
    icon: "people",
    color: "#1E3EA1",
    bgLight: "#EEF2FF",
    lighting: {
      brightness: 80,
      colorTemp: "4000 K",
      modeName: "Bright Cool",
    },
    fan: { speed: "Medium", rpm: "1200 RPM", setTemp: "22 °C", level: 3 },
    suggestion:
      "Bright cool-white lighting (4000 K, 80%) keeps everyone alert. Medium airflow (22 °C) maintains comfort without distracting noise.",
  },
  reading: {
    label: "Reading",
    icon: "book",
    color: "#059669",
    bgLight: "#ECFDF5",
    lighting: {
      brightness: 60,
      colorTemp: "3500 K",
      modeName: "Warm White",
    },
    fan: { speed: "Low", rpm: "600 RPM", setTemp: "23 °C", level: 2 },
    suggestion:
      "Warm white at 60% reduces glare and eye strain. Low, quiet airflow (23 °C) avoids paper rustling and distraction.",
  },
  relaxation: {
    label: "Relaxation",
    icon: "moon",
    color: "#7C3AED",
    bgLight: "#F5F3FF",
    lighting: {
      brightness: 25,
      colorTemp: "2700 K",
      modeName: "Dim Warm",
    },
    fan: { speed: "Silent", rpm: "300 RPM", setTemp: "24 °C", level: 1 },
    suggestion:
      "Dim amber lighting (2700 K, 25%) signals rest to the brain. Near-silent fan at 24 °C keeps the pod comfortable without any disruption.",
  },
};

// ── Segmented progress bar ─────────────────────────────────────────────────
function SegmentBar({ value, max, color }: { value: number; max: number; color: string }) {
  const SEGMENTS = 10;
  const filled = Math.round((value / max) * SEGMENTS);
  return (
    <View style={{ flexDirection: "row", gap: 4, marginVertical: 6 }}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: i < filled ? color : "#E2E8F0",
          }}
        />
      ))}
    </View>
  );
}

// ── Fan level dots ─────────────────────────────────────────────────────────
function FanDots({ level, color }: { level: number; color: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginVertical: 6 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: i < level ? color : "#E2E8F0",
          }}
        />
      ))}
    </View>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<ModeKey>("meeting");
  const mode = MODES[activeMode];

  // ── 3D Viewer (commented out) ──────────────────────────────────────────
  // const handleWebViewMessage = (event: any) => {
  //   try {
  //     const msg = JSON.parse(event.nativeEvent.data);
  //     if (msg.error) console.warn("[PodViewer]", msg.error);
  //   } catch { /* ignore */ }
  // };
  //
  // <View style={styles.viewerWrap}>
  //   <WebView
  //     source={{ uri: "file:///android_asset/pod-viewer.html" }}
  //     style={styles.webview}
  //     onMessage={handleWebViewMessage}
  //     originWhitelist={["*", "file://"]}
  //     javaScriptEnabled
  //     allowFileAccess
  //     allowFileAccessFromFileURLs
  //     allowUniversalAccessFromFileURLs
  //     mixedContentMode="always"
  //     scrollEnabled={false}
  //     backgroundColor="#f8fafc"
  //   />
  // </View>
  // ──────────────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../images/avatar.png")} style={styles.avatar} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Meeting Pod · Delta 2</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      {/* ── Mode Hero Banner ── */}
      <View style={[styles.heroBanner, { backgroundColor: mode.bgLight }]}>
        <View style={[styles.heroIconWrap, { backgroundColor: mode.color }]}>
          <Ionicons name={mode.icon} size={26} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>Active Mode</Text>
          <Text style={[styles.heroMode, { color: mode.color }]}>{mode.label}</Text>
        </View>
        <View style={[styles.optimalPill, { backgroundColor: mode.color }]}>
          <Text style={styles.optimalPillText}>✦ Optimal</Text>
        </View>
      </View>

      {/* ── Mode Tabs ── */}
      <View style={styles.tabsRow}>
        {(Object.keys(MODES) as ModeKey[]).map((key) => {
          const m = MODES[key];
          const active = activeMode === key;
          return (
            <Pressable
              key={key}
              style={[
                styles.tab,
                active && { backgroundColor: m.color, borderColor: m.color },
              ]}
              onPress={() => setActiveMode(key)}
            >
              <Ionicons
                name={m.icon}
                size={14}
                color={active ? "#fff" : "#64748b"}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Sensor Cards ── */}
      <View style={styles.cardsRow}>

        {/* Lighting Card */}
        <View style={[styles.sensorCard, { borderTopColor: mode.color }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: mode.bgLight }]}>
              <Ionicons name="bulb" size={18} color={mode.color} />
            </View>
            <Text style={styles.cardTitle}>Lighting</Text>
          </View>

          <Text style={[styles.cardBigValue, { color: mode.color }]}>
            {mode.lighting.brightness}%
          </Text>
          <Text style={styles.cardSubLabel}>Brightness</Text>
          <SegmentBar value={mode.lighting.brightness} max={100} color={mode.color} />

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Mode</Text>
            <Text style={[styles.metaVal, { color: mode.color }]}>{mode.lighting.modeName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Colour temp</Text>
            <Text style={styles.metaVal}>{mode.lighting.colorTemp}</Text>
          </View>
        </View>

        {/* Fan Card */}
        <View style={[styles.sensorCard, { borderTopColor: mode.color }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: mode.bgLight }]}>
              <Ionicons name="snow" size={18} color={mode.color} />
            </View>
            <Text style={styles.cardTitle}>Fan / AC</Text>
          </View>

          <Text style={[styles.cardBigValue, { color: mode.color }]}>
            {mode.fan.speed}
          </Text>
          <Text style={styles.cardSubLabel}>Fan speed</Text>
          <FanDots level={mode.fan.level} color={mode.color} />

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>RPM</Text>
            <Text style={[styles.metaVal, { color: mode.color }]}>{mode.fan.rpm}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Set temp</Text>
            <Text style={styles.metaVal}>{mode.fan.setTemp}</Text>
          </View>
        </View>

      </View>

      {/* ── Settings Summary ── */}
      <Text style={styles.sectionLabel}>Current Settings</Text>
      <View style={styles.summaryCard}>
        {[
          { icon: "sunny", label: "Brightness", value: `${mode.lighting.brightness}%` },
          { icon: "thermometer", label: "Temperature", value: mode.fan.setTemp },
          { icon: "speedometer", label: "Fan RPM", value: mode.fan.rpm },
          { icon: "color-palette", label: "Colour Temp", value: mode.lighting.colorTemp },
        ].map(({ icon, label, value }, i) => (
          <View key={label} style={[styles.summaryRow, i < 3 && styles.summaryRowBorder]}>
            <View style={[styles.summaryIconWrap, { backgroundColor: mode.bgLight }]}>
              <Ionicons name={icon as any} size={16} color={mode.color} />
            </View>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={[styles.summaryValue, { color: mode.color }]}>{value}</Text>
          </View>
        ))}
      </View>

      {/* ── AI Suggestion ── */}
      <View style={[styles.suggestion, { borderLeftColor: mode.color, backgroundColor: mode.bgLight }]}>
        <View style={styles.suggestionHeader}>
          <Ionicons name="sparkles" size={14} color={mode.color} />
          <Text style={[styles.suggestionTitle, { color: mode.color }]}>Smart Suggestion</Text>
        </View>
        <Text style={styles.suggestionText}>{mode.suggestion}</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981" },
  onlineText: { fontSize: 12, color: "#059669", fontWeight: "600" },

  /* Hero Banner */
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "500", marginBottom: 2 },
  heroMode: { fontSize: 22, fontWeight: "bold" },
  optimalPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  optimalPillText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  /* Tabs */
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  tabLabel: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  tabLabelActive: { color: "#fff" },

  /* Sensor Cards */
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    borderTopWidth: 3,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#334155" },
  cardBigValue: { fontSize: 26, fontWeight: "bold" },
  cardSubLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "500", marginTop: -2 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 8 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaLabel: { fontSize: 11, color: "#94a3b8" },
  metaVal: { fontSize: 11, fontWeight: "700", color: "#334155" },

  /* Summary */
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { flex: 1, fontSize: 13, color: "#475569", fontWeight: "500" },
  summaryValue: { fontSize: 13, fontWeight: "700" },

  /* Suggestion */
  suggestion: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  suggestionTitle: { fontSize: 13, fontWeight: "700" },
  suggestionText: { fontSize: 13, color: "#475569", lineHeight: 20 },
});
