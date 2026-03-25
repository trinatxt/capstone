import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type TabType = "Today" | "Upcoming" | "Cancelled";

const allBookings: Record<TabType, any[]> = {
  Today: [
    {
      id: "1",
      title: "Delta Pod 2",
      location: "Floor 4, Office 2",
      time: "Oct 15, 12:00 - 12:30 PM",
      people: 4,
      image: require("../images/office.png"),
    },
  ],
  Upcoming: [
    {
      id: "2",
      title: "Delta Pod 5",
      location: "Floor 5, Office 1",
      time: "Oct 16, 14:00 - 14:30 PM",
      people: 3,
      image: require("../images/office.png"),
    },
    {
      id: "3",
      title: "Delta Pod 8",
      location: "Floor 3, Office 3",
      time: "Oct 17, 10:00 - 11:00 AM",
      people: 5,
      image: require("../images/office.png"),
    },
  ],
  Cancelled: [],
};

const TABS: TabType[] = ["Today", "Upcoming", "Cancelled"];

export default function ViewBookings({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("Today");
  const bookings = allBookings[activeTab];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.headerTitle}>View Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={52} color="#ccc" />
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
        </View>
      ) : (
        bookings.map((item) => (
          <View key={item.id} style={styles.bookingCard}>
            <Image source={item.image} style={styles.bookingImage} resizeMode="cover" />
            <View style={styles.bookingBody}>
              <Text style={styles.bookingTitle}>{item.title}</Text>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={13} color="#666" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={13} color="#666" />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={13} color="#666" />
                <Text style={styles.detailText}>{item.people} people</Text>
              </View>
              {activeTab !== "Cancelled" && (
                <Pressable style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}

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
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#111",
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 70,
    gap: 12,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 15,
  },
  bookingCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  bookingImage: {
    width: "100%",
    height: 160,
  },
  bookingBody: {
    padding: 16,
    gap: 5,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#555",
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#FEE2E2",
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 14,
  },
});
