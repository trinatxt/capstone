import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

const pods = [
  {
    id: "1",
    name: "Delta Pod 10",
    location: "Floor 4, Office 2",
    time: "Oct 15, 12:00 - 12:30 PM",
    people: 4,
    image: require("../images/office.png"),
  },
  {
    id: "2",
    name: "Delta Pod 10",
    location: "Floor 4, Office 2",
    time: "Oct 15, 13:00 - 13:30 PM",
    people: 4,
    image: require("../images/office.png"),
  },
  {
    id: "3",
    name: "Delta Pod 12",
    location: "Floor 5, Office 1",
    time: "Oct 15, 14:00 - 14:30 PM",
    people: 6,
    image: require("../images/office.png"),
  },
];

const modes = [
  {
    id: "meeting",
    label: "Meeting",
    sub: "For collaboration\nand calls",
    dotColor: "#FBBF24",
    bg: "#FFFBEB",
  },
  {
    id: "reading",
    label: "Reading",
    sub: "Quiet focus time",
    dotColor: "#86EFAC",
    bg: "#F0FDF4",
  },
  {
    id: "relaxation",
    label: "Relaxation",
    sub: "Unwind and\nrecharge",
    icon: "moon-outline" as const,
    dotColor: "#C4B5FD",
    bg: "#F5F3FF",
  },
];

export default function MakeBooking({ navigation }: any) {
  const [selectedMode, setSelectedMode] = useState("meeting");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.headerTitle}>Make a Booking</Text>
      </View>

      {/* Date & Time */}
      <View style={styles.dateTimeCard}>
        <View style={styles.dateTimeCol}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>Apr 1, 2025</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.dateTimeCol, { flex: 2 }]}>
          <View style={styles.timeHeader}>
            <Text style={styles.fieldLabel}>Time</Text>
            <Text style={styles.addFilter}>+ add filter</Text>
          </View>
          <Text style={styles.fieldValue}>9:00 AM - 10:00 AM</Text>
        </View>
      </View>

      {/* Mode */}
      <Text style={styles.sectionLabel}>Mode</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modesContainer}
      >
        {modes.map((m) => (
          <Pressable
            key={m.id}
            style={[
              styles.modeCard,
              { backgroundColor: m.bg },
              selectedMode === m.id && styles.modeCardSelected,
            ]}
            onPress={() => setSelectedMode(m.id)}
          >
            {m.icon ? (
              <Ionicons name={m.icon} size={20} color="#7C3AED" />
            ) : (
              <View style={[styles.modeDot, { backgroundColor: m.dotColor }]} />
            )}
            <Text style={styles.modeLabel}>{m.label}</Text>
            <Text style={styles.modeSub}>{m.sub}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Available Pods */}
      <Text style={styles.sectionLabel}>Available Pods</Text>
      {pods.map((pod) => (
        <View key={pod.id} style={styles.podCard}>
          <Image source={pod.image} style={styles.podImage} resizeMode="cover" />
          <View style={styles.podInfo}>
            <Text style={styles.podName}>{pod.name}</Text>
            <View style={styles.podRow}>
              <Ionicons name="location-outline" size={13} color="#666" />
              <Text style={styles.podDetail}>{pod.location}</Text>
            </View>
            <View style={styles.podRow}>
              <Ionicons name="time-outline" size={13} color="#666" />
              <Text style={styles.podDetail}>{pod.time}</Text>
            </View>
            <View style={styles.podRow}>
              <Ionicons name="people-outline" size={13} color="#666" />
              <Text style={styles.podDetail}>{pod.people} pax</Text>
            </View>
            <Pressable style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Book Now</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  dateTimeCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    gap: 16,
  },
  dateTimeCol: {
    flex: 1,
    gap: 4,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  timeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  addFilter: {
    fontSize: 12,
    color: "#056af7",
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
    color: "#111",
  },
  modesContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  modeCard: {
    width: 120,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeCardSelected: {
    borderColor: "#056af7",
  },
  modeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  modeSub: {
    fontSize: 11,
    color: "#666",
    lineHeight: 15,
  },
  podCard: {
    flexDirection: "row",
    height: 160,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  podImage: {
    width: 120,
  },
  podInfo: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  podName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  podRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  podDetail: {
    fontSize: 12,
    color: "#555",
  },
  bookBtn: {
    marginTop: 8,
    backgroundColor: "#4ADE80",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  bookBtnText: {
    color: "#065f46",
    fontWeight: "bold",
    fontSize: 13,
  },
});
