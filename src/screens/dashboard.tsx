import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const data = {
    labels: ["9AM", "11AM", "1PM", "3PM", "5PM"],
    datasets: [
      {
        data: [200, 400, 300, 500, 250],
        strokeWidth: 2,
      },
    ],
  };

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
            <Text style={styles.title}>Dashboard</Text>
          </View>
        </View>

        {/* Chart Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CO₂ Levels</Text>
          <Text style={styles.cardValue}>500 PPM</Text>

          <LineChart
            data={data}
            width={screenWidth - 40}
            height={170}
            chartConfig={{
              backgroundGradientFrom: "#06b6d4",
              backgroundGradientTo: "#06b6d4",
              color: (opacity = 1) =>
                `rgba(255,255,255,${opacity})`,
              propsForDots: {
                r: "3",
                strokeWidth: "2",
                stroke: "#fff",
              },
            }}
            withInnerLines={false}
            withOuterLines={false}
            withDots
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Stats */}
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Most used mode</Text>
            <Text style={styles.statValue}>Focus</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>10</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time Used</Text>
            <Text style={styles.statValue}>5h 24m</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Interactions Sent</Text>
            <Text style={styles.statValue}>10</Text>
          </View>
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
  card: {
    backgroundColor: "#06b6d4",
    borderRadius: 14,
    padding: 16,
    marginVertical: 15,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cardValue: {
    color: "#fff",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    backgroundColor: "#f0f0f0",
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: {
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
