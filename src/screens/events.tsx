import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

const upcomingEvents = [
  { title: "Team Building Workshop", date: "March 18 3:00PM", icon: "🎯" },
  { title: "Product Launch Party", date: "March 18 3:00PM", icon: "🚀" },
  { title: "Wellness Yoga", date: "March 18 3:00PM", icon: "🧘‍♀️" },
];

export default function Events() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../images/avatar.png")}
              style={styles.avatar}
            />
            <Text style={styles.title}>Events</Text>
          </View>
        </View>

        {/* Birthday Card */}
        <View style={styles.birthdayCard}>
          <Text style={styles.birthdayText}>
            🎂 Today is Andrew&apos;s Birthday!
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.birthdayButton}>
              <Text style={styles.birthdayButtonText}>Sign Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.birthdayButton}>
              <Text style={styles.birthdayButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming */}
        <Text style={styles.section}>Upcoming</Text>

        {upcomingEvents.map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <View>
              <Text style={styles.eventIcon}>{event.icon}</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>

            <TouchableOpacity style={styles.rsvpButton}>
              <Text style={styles.rsvpText}>RSVP</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
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
  birthdayCard: {
    backgroundColor: "#f472b6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  birthdayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
  },
  birthdayButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  birthdayButtonText: {
    color: "#ec4899",
    fontWeight: "bold",
  },
  section: {
    color: "#6b7280",
    fontWeight: "bold",
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  eventTitle: {
    fontWeight: "bold",
  },
  eventDate: {
    color: "#6b7280",
  },
  rsvpButton: {
    backgroundColor: "#bfdbfe",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rsvpText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});
