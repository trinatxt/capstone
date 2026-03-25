import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import Slider from "@react-native-community/slider";

// ---- ESP32 IP ----
const ESP32_IP = "http://172.20.10.2";

// ---- Send LED + Fan updates ----
const sendControlUpdate = async (lightOn, brightness, fanSpeed) => {
  const ledPWM = lightOn ? Math.round((brightness / 100) * 255) : 0;

  const fanMap = {
    1: 60,
    2: 100,
    3: 150,
    4: 200,
    5: 255,
  };

  const fanPWM = fanMap[fanSpeed] || 0;

  try {
    await fetch(`${ESP32_IP}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `led1=${ledPWM}&fan=${fanPWM}`,
    });
  } catch (err) {
    console.warn("ESP32 unreachable", err);
  }
};

const modeConfig = [
  { label: "Meeting",    sub: "For collaboration\nand calls",  color: "#1E3EA1" },
  { label: "Reading",    sub: "Quiet focus time",              color: "#B0BEF8" },
  { label: "Relaxation", sub: "Unwind and\nrecharge",          color: "#7B3535" },
];

export default function Controls({ navigation }: any) {
  const [unlocked, setUnlocked] = useState(true);
  const [brightness, setBrightness] = useState(50);
  const [fanSpeed, setFanSpeed] = useState(3);
  const [mode, setMode] = useState("Meeting");

  useEffect(() => {
    sendControlUpdate(unlocked, brightness, fanSpeed);
  }, [unlocked, brightness, fanSpeed]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate("Settings")}>
            <Image source={require("../images/avatar.png")} style={styles.avatar} />
          </Pressable>
          <Text style={styles.title}>Controls</Text>
        </View>

        {/* Pod image + Active Session panel */}
        <View style={styles.sessionRow}>
          <Image
            source={require("../images/pod.png")}
            style={styles.podImage}
            resizeMode="contain"
          />
          <View style={styles.sessionPanel}>
            <Text style={styles.sessionLabel}>Active Session</Text>
            <View style={styles.unlockRow}>
              <Text style={styles.unlockText}>Unlocked</Text>
              <Switch
                value={unlocked}
                onValueChange={setUnlocked}
                trackColor={{ false: "#ccc", true: "#4CAF50" }}
                thumbColor="#fff"
              />
            </View>
            <Pressable
              style={styles.wifiBtn}
              onPress={() => navigation.navigate("Wifi")}
            >
              <Text style={styles.wifiBtnText}>Wi-Fi Settings</Text>
            </Pressable>
          </View>
        </View>

        {/* Mode */}
        <Text style={styles.sectionLabel}>Mode</Text>
        <View style={styles.modesRow}>
          {modeConfig.map((m) => (
            <Pressable
              key={m.label}
              onPress={() => setMode(m.label)}
              style={[styles.modeCard, mode === m.label && styles.modeCardActive]}
            >
              <View style={[styles.modeCircle, { backgroundColor: m.color }]} />
              <Text style={styles.modeTitle}>{m.label}</Text>
              <Text style={styles.modeSub}>{m.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Lighting */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Lighting</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor="#F5C518"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#F5C518"
          />
          <Text style={styles.sliderPct}>{brightness}%</Text>
        </View>

        {/* Fan Speed */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💨 Fan Speed</Text>
          <View style={styles.fanRow}>
            <Pressable onPress={() => setFanSpeed(Math.max(1, fanSpeed - 1))}>
              <Text style={styles.fanBtn}>−</Text>
            </Pressable>
            <Text style={styles.fanValue}>{fanSpeed}</Text>
            <Pressable onPress={() => setFanSpeed(Math.min(5, fanSpeed + 1))}>
              <Text style={styles.fanBtn}>+</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  /* Session row */
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  podImage: {
    width: "45%",
    height: 180,
  },
  sessionPanel: {
    flex: 1,
    paddingLeft: 12,
  },
  sessionLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  unlockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  unlockText: {
    fontSize: 15,
    fontWeight: "500",
  },
  wifiBtn: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  wifiBtnText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  /* Mode */
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modeCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 12,
    width: "31%",
    minHeight: 120,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeCardActive: {
    borderColor: "#1E3EA1",
  },
  modeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: "absolute",
    top: 8,
    right: 8,
  },
  modeTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 48,
    marginBottom: 4,
  },
  modeSub: {
    fontSize: 11,
    color: "#777",
  },

  /* Card wrapper for lighting / fan */
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  /* Lighting slider */
  slider: {
    width: "100%",
    height: 40,
  },
  sliderPct: {
    textAlign: "right",
    color: "#888",
    fontSize: 13,
  },

  /* Fan */
  fanRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  fanBtn: {
    fontSize: 32,
    fontWeight: "bold",
    paddingHorizontal: 28,
    color: "#333",
  },
  fanValue: {
    fontSize: 32,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "center",
  },
});
