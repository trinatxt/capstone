import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useUser } from "../context/UserContext";
import { API_URL } from "../api/apiClient";
import { useFocusEffect } from "@react-navigation/native";

type TabType = "Today" | "Upcoming";

type Booking = {
  id: string;
  pod_name: string;
  location: string;
  booking_date: string;
  time_label: string;
  people_count: number;
  status: string;
};

function getLocalDateISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const TABS: TabType[] = ["Today", "Upcoming"];
const filterMap: Record<TabType, string> = {
  Today: "today",
  Upcoming: "upcoming",
};

export default function ViewBookings({ navigation }: any) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("Today");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/bookings?user_id=${user.id}&filter=${filterMap[activeTab]}&date=${getLocalDateISO()}`
      );
      const data = await res.json();
      setBookings(Array.isArray(data) ? data.map((b: any) => ({ ...b, id: String(b.id) })) : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeTab]);

  useFocusEffect(useCallback(() => { fetchBookings(); }, [fetchBookings]));


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
      {loading ? (
        <ActivityIndicator size="large" color="#056af7" style={{ marginTop: 60 }} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={52} color="#ccc" />
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
        </View>
      ) : (
        bookings.map((item) => (
          <View key={item.id} style={styles.bookingCard}>
            <Image source={require("../images/office.png")} style={styles.bookingImage} resizeMode="cover" />
            <View style={styles.bookingBody}>
              <Text style={styles.bookingTitle}>{item.pod_name}</Text>
              {item.location ? (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={13} color="#666" />
                  <Text style={styles.detailText}>{item.location}</Text>
                </View>
              ) : null}
              {item.booking_date ? (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={13} color="#666" />
                  <Text style={styles.detailText}>
                    {new Date(item.booking_date).toLocaleDateString("en-SG", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
              ) : null}
              {item.time_label ? (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={13} color="#666" />
                  <Text style={styles.detailText}>{item.time_label}</Text>
                </View>
              ) : null}
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={13} color="#666" />
                <Text style={styles.detailText}>{item.people_count} people</Text>
              </View>
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
});
