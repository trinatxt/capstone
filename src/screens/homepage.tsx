import React, { useRef, useState } from "react";
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

const colleagues = [
  { id: "1", name: "Jane", mode: "Meeting Mode" },
  { id: "2", name: "Anna", mode: "Relax Mode" },
  { id: "3", name: "Simin", mode: "Reading Mode" },
  { id: "4", name: "Trina", mode: "Meeting Mode" },
];

const knockers = [
  { id: "k1", name: "Alex" },
  { id: "k2", name: "Ben" },
  { id: "k3", name: "Chris" },
];

export default function HomePage({ navigation }: any) {
  const carouselRef = useRef(null);
  const [knockedIds, setKnockedIds] = useState<Set<string>>(new Set());
  const knockTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [dismissedKnockers, setDismissedKnockers] = useState<Set<string>>(new Set());

  const handleReply = (knockerId: string) =>
    setDismissedKnockers((prev) => new Set(prev).add(knockerId));

  const activeKnockers = knockers.filter((k) => !dismissedKnockers.has(k.id));

  const handleKnock = (id: string) => {
    if (knockedIds.has(id)) return;
    setKnockedIds((prev) => new Set(prev).add(id));
    knockTimers.current[id] = setTimeout(() => {
      setKnockedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

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
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Image source={require("../images/avatar.png")} style={styles.avatar} />
        </Pressable>
        <View>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>Lee Wan Wei</Text>
        </View>
      </View>

      {/* Birthday Card */}
      <View style={styles.birthdayCard}>
        <Text style={styles.birthdayEmoji}>🎂</Text>
        <View style={styles.birthdayTextBlock}>
          <Text style={styles.birthdayText}>{"Today is Andrew's\nBirthday!"}</Text>
          <View style={styles.birthdayActions}>
            <Pressable style={styles.birthdayButton}>
              <Text style={styles.birthdayButtonText}>Sign Card</Text>
            </Pressable>
            <Pressable style={styles.birthdayButton}>
              <Text style={styles.birthdayButtonText}>Send Message</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Knock Section - horizontally scrollable cards */}
      {activeKnockers.length === 0 && dismissedKnockers.size > 0 && (
        <Pressable
          style={styles.resetKnockBtn}
          onPress={() => setDismissedKnockers(new Set())}
        >
          <Text style={styles.resetKnockText}>↺  Show knocks again</Text>
        </Pressable>
      )}
      {activeKnockers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.knockCardsContainer}
          style={styles.knockCardsScroll}
        >
          {activeKnockers.map((knocker) => (
            <View key={knocker.id} style={styles.knockCard}>
              <View style={styles.knockHeader}>
                <Image source={require("../images/avatar.png")} style={styles.knockAvatar} />
                <Text style={styles.knockTitle}>{knocker.name} knocked on your pod</Text>
              </View>

              <Text style={styles.quickReplyLabel}>Send a Quick Reply</Text>

              <View style={styles.emojiGrid}>
                {[
                  { emoji: "👋", bg: "#1E3A8A" },
                  { emoji: "👍", bg: "#F1F5F9" },
                  { emoji: "😅", bg: "#7A3F44" },
                  { emoji: "⏰", bg: "#1E3A8A" },
                ].map(({ emoji, bg }) => (
                  <Pressable
                    key={emoji}
                    style={[styles.emojiTile, { backgroundColor: bg }]}
                    onPress={() => handleReply(knocker.id)}
                  >
                    <Text style={styles.emojiTileText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.replyActions}>
                {["5 min", "15 min", "I'm free"].map((label) => (
                  <Pressable
                    key={label}
                    style={styles.replyButton}
                    onPress={() => handleReply(knocker.id)}
                  >
                    <Text style={styles.replyButtonText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Colleagues List */}
      {colleagues.map((person) => (
        <View key={person.id} style={styles.focusCard}>
          <View style={styles.focusLeft}>
            <Image
              source={require("../images/avatar.png")}
              style={styles.focusAvatar}
            />
            <View>
              <Text style={styles.focusName}>{person.name}</Text>
              <Text style={styles.focusSub}>{person.mode}</Text>
            </View>
          </View>
          <Pressable
            style={[styles.knockBtn, knockedIds.has(person.id) && styles.knockBtnActive]}
            onPress={() => handleKnock(person.id)}
            disabled={knockedIds.has(person.id)}
          >
            <Text style={[styles.knockText, knockedIds.has(person.id) && styles.knockTextActive]}>
              {knockedIds.has(person.id) ? "Knocked! 👊" : "Knock"}
            </Text>
          </Pressable>
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
    marginBottom: 20,
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

  /* Birthday Card */
  birthdayCard: {
    backgroundColor: "#1E3EA1",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  birthdayEmoji: {
    fontSize: 52,
    marginRight: 16,
  },

  birthdayTextBlock: {
    flex: 1,
  },

  birthdayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },

  birthdayActions: {
    flexDirection: "row",
    gap: 10,
  },

  birthdayButton: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  birthdayButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },

  /* Knock Section */
  resetKnockBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  resetKnockText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  knockSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  knockCardsScroll: {
    marginBottom: 20,
  },
  knockCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  knockCard: {
    width: screenWidth - 60,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    backgroundColor: "#fff",
  },

  knockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  knockAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },

  knockTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },

  quickReplyLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },

  emojiRow: {
    marginBottom: 14,
  },

  emojiCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  emojiText: {
    fontSize: 36,
  },

  emojiGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  emojiTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  emojiTileText: {
    fontSize: 26,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: 10,
  },

  replyActions: {
    flexDirection: "row",
    gap: 10,
  },

  replyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  replyButtonText: {
    fontSize: 14,
    color: "#333",
  },

  /* Focus Card */
  focusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  focusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  focusAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  focusName: {
    fontWeight: "bold",
    fontSize: 15,
  },

  focusSub: {
    fontSize: 12,
    color: "#777",
  },

  knockBtn: {
    borderWidth: 1.5,
    borderColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  knockText: {
    color: "#333",
    fontWeight: "600",
  },
  knockBtnActive: {
    backgroundColor: "#1E3EA1",
    borderColor: "#1E3EA1",
  },
  knockTextActive: {
    color: "#fff",
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
