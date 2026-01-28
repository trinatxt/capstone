import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import Carousel from "react-native-snap-carousel";

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
];

export default function HomePage({ navigation }: any) {
  const carouselRef = useRef(null);

  const renderItem = ({ item }: any) => (
    <View style={styles.bookingCard}>
      <Image source={item.image} style={styles.bookingImage} resizeMode="cover" />
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingTitle}>{item.title}</Text>
        <Text style={styles.bookingDetails}>{item.location}</Text>
        <Text style={styles.bookingDetails}>{item.time}</Text>
        <Text style={styles.bookingDetails}>{item.people} people</Text>
        <Pressable style={styles.checkInButton}>
          <Text style={styles.checkInText}>Check in</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>Lee Wan Wei</Text>
        </View>
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.services}>
        <Pressable style={styles.serviceButton}>
          <Text style={styles.serviceText}>📅 Make a booking</Text>
        </Pressable>
        <Pressable style={styles.serviceButton}>
          <Text style={styles.serviceText}>📆 View my bookings</Text>
        </Pressable>
      </View>

      {/* ================= SCROLLED CONTENT ================= */}

      {/* Birthday Card */}
      <View style={styles.birthdayCard}>
        <Text style={styles.birthdayText}>🎂 Today is Andrew’s Birthday!</Text>
        <View style={styles.birthdayActions}>
          <Pressable style={styles.birthdayButton}>
            <Text style={styles.birthdayButtonText}>Sign Card</Text>
          </Pressable>
          <Pressable style={styles.birthdayButton}>
            <Text style={styles.birthdayButtonText}>Send Message</Text>
          </Pressable>
        </View>
      </View>

      {/* Knock Card */}
      <View style={styles.knockCard}>
        <Text style={styles.knockTitle}>Alex knocked on your pod</Text>
        <Text style={styles.knockSubtitle}>
          "Got a sec? Need quick feedback!"
        </Text>

        <View style={styles.quickReplies}>
          <View style={styles.emojiBubble}><Text>👍</Text></View>
          <View style={styles.emojiBubble}><Text>😊</Text></View>
          <View style={styles.emojiBubble}><Text>⏰</Text></View>
        </View>

        <View style={styles.replyActions}>
          <Pressable style={styles.replyButton}>
            <Text>I'm free</Text>
          </Pressable>
          <Pressable style={styles.replyButton}>
            <Text>1 min</Text>
          </Pressable>
        </View>
      </View>

      {/* Focus Mode */}
      <View style={styles.focusCard}>
        <View style={styles.focusLeft}>
          <Image
            source={require("../images/avatar.png")}
            style={styles.focusAvatar}
          />
          <View>
            <Text style={styles.focusName}>Justin Tan</Text>
            <Text style={styles.focusSub}>Focus Mode</Text>
          </View>
        </View>

        <Pressable style={styles.knockBtn}>
          <Text style={styles.knockText}>Knock</Text>
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
    marginBottom: 20,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },

  welcome: {
    fontSize: 16,
    color: "#888",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  services: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  serviceButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },

  serviceText: {
    fontSize: 14,
  },

  birthdayCard: {
    backgroundColor: "#ff4f9a",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  birthdayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },

  birthdayActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  birthdayButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  birthdayButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  knockCard: {
    backgroundColor: "#f4f6ff",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  knockTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  knockSubtitle: {
    color: "#555",
    marginBottom: 12,
  },

  quickReplies: {
    flexDirection: "row",
    marginBottom: 12,
  },

  emojiBubble: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },

  replyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  replyButton: {
    backgroundColor: "#eaeaea",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  focusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 20,
    elevation: 2,
  },

  focusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  focusAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  focusName: {
    fontWeight: "bold",
  },

  focusSub: {
    fontSize: 12,
    color: "#777",
  },

  knockBtn: {
    backgroundColor: "#4f7cff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  knockText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* Booking styles (kept for future use) */
  bookingCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },

  bookingImage: {
    width: "100%",
    height: 150,
  },

  bookingInfo: {
    padding: 15,
  },

  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  bookingDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },

  checkInButton: {
    marginTop: 10,
    backgroundColor: "#90ee90",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  checkInText: {
    color: "#000",
    fontWeight: "bold",
  },
});
