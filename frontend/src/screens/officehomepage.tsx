import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;

const bookings = [
  {
    id: "1",
    title: "Delta Pod 2",
    location: "Floor 4, Office 2",
    time: "Oct 15, 12:00 - 12:30 PM",
    people: 4,
    image: require("../images/office.png"),
  },
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
];

export default function OfficeHomePage({ navigation }: any) {
  const { user } = useUser();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(idx);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../images/avatar.png")} style={styles.avatar} />
        </Pressable>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user?.full_name || user?.username}</Text>
        </View>
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>UPCOMING BOOKINGS</Text>
        <View style={styles.todayBadge}>
          <Text style={styles.todayText}>Today</Text>
        </View>
      </View>

      {/* Booking Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {bookings.map((item) => (
          <View key={item.id} style={styles.slideWrapper}>
            <View style={styles.bookingCard}>
              <Image source={item.image} style={styles.bookingImage} resizeMode="cover" />
              <View style={styles.bookingBody}>
                <Text style={styles.bookingTitle}>{item.title}</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.detailText}>{item.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={14} color="#666" />
                  <Text style={styles.detailText}>{item.people} people</Text>
                </View>
                <Pressable style={styles.checkInBtn}>
                  <Text style={styles.checkInText}>Check in</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotsRow}>
        {bookings.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Services */}
      <Text style={styles.servicesLabel}>Services</Text>
      <View style={styles.servicesRow}>
        <Pressable
          style={styles.serviceCard}
          onPress={() => navigation.navigate("MakeBooking")}
        >
          <Ionicons name="calendar-number-outline" size={34} color="#056af7" />
          <Text style={styles.serviceText}>Make a booking</Text>
        </Pressable>
        <Pressable
          style={styles.serviceCard}
          onPress={() => navigation.navigate("ViewBookings")}
        >
          <Ionicons name="calendar-outline" size={34} color="#056af7" />
          <Text style={styles.serviceText}>View my bookings</Text>
        </Pressable>
      </View>

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
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 15,
  },
  welcome: {
    fontSize: 16,
    color: "#888",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 0.5,
  },
  todayBadge: {
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  todayText: {
    fontSize: 12,
    color: "#056af7",
    fontWeight: "600",
  },
  slideWrapper: {
    width: screenWidth,
    paddingHorizontal: 20,
  },
  bookingCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  bookingImage: {
    width: "100%",
    height: 180,
  },
  bookingBody: {
    padding: 16,
    gap: 6,
  },
  bookingTitle: {
    fontSize: 20,
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
  checkInBtn: {
    marginTop: 10,
    backgroundColor: "#4ADE80",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  checkInText: {
    color: "#065f46",
    fontWeight: "bold",
    fontSize: 15,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: "#056af7",
  },
  servicesLabel: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  servicesRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: "#F5F8FF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E8EFFF",
  },
  serviceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
