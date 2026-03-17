import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import WebView from "react-native-webview";

const DOTS = 12;

// ── Mode definitions ──────────────────────────────────────────────────────────
type ModeKey = "meeting" | "reading" | "relaxation";

type ModeConfig = {
  label: string;
  icon: string;
  color: string;        // accent colour for this mode
  lighting: {
    brightness: number; // 0–100
    colorTemp: string;
    modeName: string;
    filled: number;     // out of DOTS
  };
  fan: {
    speed: string;
    rpm: string;
    setTemp: string;
    filled: number;     // out of DOTS
  };
  suggestion: string;
  optimal: boolean;
};

const MODES: Record<ModeKey, ModeConfig> = {
  meeting: {
    label: "Meeting",
    icon: "👥",
    color: "#1E3EA1",
    lighting: {
      brightness: 80,
      colorTemp: "4000 K",
      modeName: "Bright",
      filled: 10,
    },
    fan: {
      speed: "Medium",
      rpm: "1200 RPM",
      setTemp: "22 °C",
      filled: 7,
    },
    suggestion:
      "Bright cool-white lighting (4000 K, 80%) keeps everyone alert. Medium airflow (22 °C) maintains comfort without distracting noise.",
    optimal: true,
  },
  reading: {
    label: "Reading",
    icon: "📖",
    color: "#059669",
    lighting: {
      brightness: 60,
      colorTemp: "3500 K",
      modeName: "Warm White",
      filled: 7,
    },
    fan: {
      speed: "Low",
      rpm: "600 RPM",
      setTemp: "23 °C",
      filled: 3,
    },
    suggestion:
      "Warm white at 60% reduces glare and eye strain. Low, quiet airflow (23 °C) avoids paper rustling and distraction.",
    optimal: true,
  },
  relaxation: {
    label: "Relaxation",
    icon: "😌",
    color: "#7C3AED",
    lighting: {
      brightness: 25,
      colorTemp: "2700 K",
      modeName: "Dim Warm",
      filled: 3,
    },
    fan: {
      speed: "Silent",
      rpm: "300 RPM",
      setTemp: "24 °C",
      filled: 2,
    },
    suggestion:
      "Dim amber lighting (2700 K, 25%) signals rest to the brain. Near-silent fan at 24 °C keeps the pod comfortable without any disruption.",
    optimal: true,
  },
};

// ── Dot progress bar ──────────────────────────────────────────────────────────
function DotBar({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: DOTS }, (_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            { backgroundColor: i < filled ? color : "#e2e8f0" },
          ]}
        />
      ))}
    </View>
  );
}
const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ navigation }: any) {
  const [activeMode, setActiveMode] = useState<ModeKey>("meeting");

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.error) console.warn("[PodViewer]", msg.error);
    } catch { /* ignore */ }
  };

  const mode = MODES[activeMode];

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../images/avatar.png")} style={styles.avatar} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Meeting Pod · Delta 2</Text>
        </View>
      </View>

      {/* ── 3D Viewer ── */}
      <View style={styles.viewerWrap}>
        <WebView
          source={{ uri: "file:///android_asset/pod-viewer.html" }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          originWhitelist={["*", "file://"]}
          javaScriptEnabled
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          scrollEnabled={false}
          backgroundColor="#f8fafc"
        />
      </View>

      {/* ── Mode tabs ── */}
      <View style={styles.tabsRow}>
        {(Object.keys(MODES) as ModeKey[]).map((key) => {
          const m = MODES[key];
          const active = activeMode === key;
          return (
            <Pressable
              key={key}
              style={[styles.tab, active && { backgroundColor: m.color, borderColor: m.color }]}
              onPress={() => setActiveMode(key)}
            >
              <Text style={styles.tabIcon}>{m.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Sensor cards ── */}
      <View style={styles.cardsRow}>

        {/* Lighting */}
        <View style={[styles.sensorCard, { borderTopColor: mode.color }]}>
          <View style={styles.sensorHeader}>
            <Text style={styles.sensorIcon}>💡</Text>
            <Text style={styles.sensorTitle}>Lighting</Text>
          </View>
          <Text style={[styles.sensorValue, { color: mode.color }]}>
            {mode.lighting.brightness}%
          </Text>
          <DotBar filled={mode.lighting.filled} color={mode.color} />
          <View style={styles.sensorMeta}>
            <Text style={styles.metaLabel}>Mode</Text>
            <Text style={styles.metaVal}>{mode.lighting.modeName}</Text>
          </View>
          <View style={styles.sensorMeta}>
            <Text style={styles.metaLabel}>Colour temp</Text>
            <Text style={styles.metaVal}>{mode.lighting.colorTemp}</Text>
          </View>
        </View>

        {/* Fan / AC */}
        <View style={[styles.sensorCard, { borderTopColor: mode.color }]}>
          <View style={styles.sensorHeader}>
            <Text style={styles.sensorIcon}>❄️</Text>
            <Text style={styles.sensorTitle}>Fan / AC</Text>
          </View>
          <Text style={[styles.sensorValue, { color: mode.color }]}>
            {mode.fan.speed}
          </Text>
          <DotBar filled={mode.fan.filled} color={mode.color} />
          <View style={styles.sensorMeta}>
            <Text style={styles.metaLabel}>Speed</Text>
            <Text style={styles.metaVal}>{mode.fan.rpm}</Text>
          </View>
          <View style={styles.sensorMeta}>
            <Text style={styles.metaLabel}>Set temp</Text>
            <Text style={styles.metaVal}>{mode.fan.setTemp}</Text>
          </View>
        </View>

      </View>

      {/* ── Optimal suggestion ── */}
      <View style={[styles.suggestion, { borderLeftColor: mode.color }]}>
        <View style={styles.suggestionTop}>
          <Text style={[styles.suggestionBadge, { backgroundColor: mode.color }]}>
            ✦  Optimal
          </Text>
        </View>
        <Text style={styles.suggestionText}>{mode.suggestion}</Text>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
    paddingBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  /* 3D Viewer */
  viewerWrap: {
    height: 220,
    marginHorizontal: 0,
    backgroundColor: "#f8fafc",
  },
  webview: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  /* Mode tabs */
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
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
  tabIcon: { fontSize: 14 },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  tabLabelActive: {
    color: "#fff",
  },

  /* Sensor cards */
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    borderTopWidth: 3,
    gap: 6,
  },
  sensorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sensorIcon: { fontSize: 18 },
  sensorTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sensorMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
  metaVal: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },

  /* Suggestion */
  suggestion: {
    marginHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  suggestionTop: {
    marginBottom: 8,
  },
  suggestionBadge: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  suggestionText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
});
