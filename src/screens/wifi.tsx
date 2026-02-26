import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native";

const otherNetworks = ["SUTD_Guest", "Changi"];

export default function Wifi() {
  const [wifiEnabled, setWifiEnabled] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.title}>Wi-Fi</Text>
      </View>

      {/* Main card */}
      <View style={styles.card}>
        {/* WiFi icon */}
        <View style={styles.iconArea}>
          <Text style={styles.wifiIcon}>📶</Text>
          <Text style={styles.wifiLabel}>Wi-Fi</Text>
        </View>

        {/* Wi-Fi toggle row */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Wi-Fi</Text>
          <Switch
            value={wifiEnabled}
            onValueChange={setWifiEnabled}
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
            thumbColor="#fff"
          />
        </View>

        {/* Connected network */}
        {wifiEnabled && (
          <View style={styles.networkRow}>
            <Text style={styles.networkName}>SUTD_Wifi</Text>
          </View>
        )}
      </View>

      {/* Other Networks */}
      {wifiEnabled && (
        <>
          <Text style={styles.sectionLabel}>Other Networks</Text>
          <View style={styles.card}>
            {otherNetworks.map((net, index) => (
              <View
                key={net}
                style={[
                  styles.networkRow,
                  index < otherNetworks.length - 1 && styles.networkRowBorder,
                ]}
              >
                <Text style={styles.networkName}>{net}</Text>
              </View>
            ))}
          </View>
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

  /* Card */
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },

  /* WiFi icon area */
  iconArea: {
    alignItems: "center",
    paddingVertical: 24,
  },
  wifiIcon: {
    fontSize: 52,
  },
  wifiLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },

  /* Toggle row */
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleText: {
    fontSize: 16,
  },

  /* Network rows */
  networkRow: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  networkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  networkName: {
    fontSize: 16,
    color: "#222",
  },

  /* Other Networks label */
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
