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

export default function Controls() {
  const [unlocked, setUnlocked] = useState(true);
  const [brightness, setBrightness] = useState(50);
  const [fanSpeed, setFanSpeed] = useState(3);
  const [mode, setMode] = useState("Meeting");

  // ---- Send updates when light or fan changes ----
  useEffect(() => {
    sendControlUpdate(unlocked, brightness, fanSpeed);
  }, [unlocked, brightness, fanSpeed]);

  const increaseBrightness = () =>
    setBrightness((prev) => Math.min(prev + 10, 100));

  const decreaseBrightness = () =>
    setBrightness((prev) => Math.max(prev - 10, 0));

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../images/avatar.png")}
              style={styles.avatar}
            />
            <Text style={styles.title}>Controls</Text>
          </View>
        </View>

        {/* Pod Image Placeholder */}
        <View style={styles.podImage} />

        {/* Unlock */}
        <View style={styles.row}>
          <Text>Lights Enabled</Text>
          <Switch value={unlocked} onValueChange={setUnlocked} />
        </View>

        {/* Modes */}
        <Text style={styles.section}>Mode</Text>
        <View style={styles.modes}>
          {["Meeting", "Reading", "Relaxation"].map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[
                styles.modeCard,
                mode === m && styles.activeMode,
              ]}
            >
              <Text style={styles.modeTitle}>{m}</Text>
            </Pressable>
          ))}
        </View>

        {/* Lighting */}
        <Text style={styles.section}>💡 Lighting</Text>
        <Text>{brightness}%</Text>
        <View style={styles.customSlider}>
          <Pressable onPress={decreaseBrightness}>
            <Text style={styles.sliderButtonText}>−</Text>
          </Pressable>

          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                { width: `${brightness}%` },
              ]}
            />
          </View>

          <Pressable onPress={increaseBrightness}>
            <Text style={styles.sliderButtonText}>+</Text>
          </Pressable>
        </View>

        {/* Fan */}
        <Text style={styles.section}>💨 Fan Speed</Text>
        <View style={styles.fanRow}>
          <Pressable onPress={() => setFanSpeed(Math.max(1, fanSpeed - 1))}>
            <Text style={styles.fanButton}>−</Text>
          </Pressable>

          <Text style={styles.fanValue}>{fanSpeed}</Text>

          <Pressable onPress={() => setFanSpeed(Math.min(5, fanSpeed + 1))}>
            <Text style={styles.fanButton}>+</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "cover",
  },
  podImage: {
    height: 160,
    marginVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  section: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  modes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modeCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 12,
    width: "30%",
  },
  activeMode: {
    borderColor: "#056af7",
    borderWidth: 2,
  },
  modeTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  customSlider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  sliderFill: {
    height: 8,
    backgroundColor: "#056af7",
    borderRadius: 4,
  },
  sliderButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  fanRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  fanButton: {
    fontSize: 30,
    marginHorizontal: 20,
  },
  fanValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
