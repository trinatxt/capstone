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
import { SignCardModal, SendMessageModal, ReceivedCardsModal } from "../components/BirthdayModals";
import { useUser } from "../context/UserContext";

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
  const { user } = useUser();
  const carouselRef = useRef(null);
  const [signCardVisible, setSignCardVisible] = useState(false);
  const [sendMessageVisible, setSendMessageVisible] = useState(false);
  const [myBirthdayVisible, setMyBirthdayVisible] = useState(false);
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
          <Text style={styles.name}>{user?.full_name || user?.username}</Text>
        </View>
      </View>

      {/* Birthday Cards - horizontally scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bdCardsContainer}
        style={styles.bdCardsScroll}
      >
        {/* My Birthday Card */}
        <View style={styles.myBirthdayCard}>
          <View style={styles.myBdDecorTL} />
          <View style={styles.myBdDecorBR} />

          <View style={styles.myBdTop}>
            <Text style={styles.myBdEmoji}>🎂</Text>
            <View style={styles.myBdBadge}>
              <Text style={styles.myBdBadgeText}>Your Birthday</Text>
            </View>
          </View>

          <Text style={styles.myBdTitle}>Happy Birthday,{"\n"}{user?.full_name || user?.username}! 🥳</Text>
          <Text style={styles.myBdSub}>3 colleagues signed your card today</Text>

          <View style={styles.myBdAvatarRow}>
            {["J", "A", "S"].map((initial, i) => (
              <View
                key={i}
                style={[styles.myBdAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}
              >
                <Text style={styles.myBdAvatarText}>{initial}</Text>
              </View>
            ))}
            <Text style={styles.myBdAvatarLabel}>Jane, Anna & Simin</Text>
          </View>

          <Pressable style={styles.myBdButton} onPress={() => setMyBirthdayVisible(true)}>
            <Text style={styles.myBdButtonText}>View Your Cards  🎁</Text>
          </Pressable>
        </View>

        {/* Andrew's Birthday Card */}
        <View style={styles.birthdayCard}>
          <View style={styles.bdDecorTL} />
          <View style={styles.bdDecorBR} />

          <View style={styles.birthdayTop}>
            <Text style={styles.birthdayEmoji}>🎉</Text>
            <View style={styles.birthdayBadge}>
              <Text style={styles.birthdayBadgeText}>Colleague's Birthday</Text>
            </View>
          </View>

          <Text style={styles.birthdayText}>{"Today is\nAndrew's Birthday!"}</Text>
          <Text style={styles.birthdaySub}>Show him some love from the team 💙</Text>

          <View style={styles.birthdayActions}>
            <Pressable style={styles.birthdayButton} onPress={() => setSignCardVisible(true)}>
              <Text style={styles.birthdayButtonText}>✍️  Sign Card</Text>
            </Pressable>
            <Pressable style={[styles.birthdayButton, styles.birthdayButtonOutline]} onPress={() => setSendMessageVisible(true)}>
              <Text style={styles.birthdayButtonTextOutline}>✉️  Message</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <SignCardModal
        visible={signCardVisible}
        onClose={() => setSignCardVisible(false)}
        recipientName="Andrew"
      />
      <SendMessageModal
        visible={sendMessageVisible}
        onClose={() => setSendMessageVisible(false)}
        recipientName="Andrew"
      />
      <ReceivedCardsModal
        visible={myBirthdayVisible}
        onClose={() => setMyBirthdayVisible(false)}
      />

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

  /* Birthday cards scroll */
  bdCardsScroll: {
    marginBottom: 24,
  },
  bdCardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },

  /* My Birthday Card */
  myBirthdayCard: {
    width: screenWidth - 60,
    backgroundColor: "#92400e",
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
    gap: 10,
  },
  myBdDecorTL: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(251,191,36,0.18)",
    top: -30,
    left: -30,
  },
  myBdDecorBR: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(251,191,36,0.12)",
    bottom: -25,
    right: -20,
  },
  myBdTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myBdEmoji: {
    fontSize: 36,
  },
  myBdBadge: {
    backgroundColor: "#F59E0B",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  myBdBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  myBdTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 28,
  },
  myBdSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  myBdAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  myBdAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#92400e",
  },
  myBdAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  myBdAvatarLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginLeft: 14,
  },
  myBdButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  myBdButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  /* Andrew's Birthday Card */
  birthdayCard: {
    width: screenWidth - 60,
    backgroundColor: "#1E3EA1",
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
    gap: 10,
  },
  bdDecorTL: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -30,
    left: -30,
  },
  bdDecorBR: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -25,
    right: -20,
  },
  birthdayTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  birthdayEmoji: {
    fontSize: 36,
  },
  birthdayBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  birthdayBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  birthdayText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 28,
  },
  birthdaySub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
  },
  birthdayActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  birthdayButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 11,
    borderRadius: 16,
    alignItems: "center",
  },
  birthdayButtonText: {
    color: "#1E3EA1",
    fontWeight: "700",
    fontSize: 13,
  },
  birthdayButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  birthdayButtonTextOutline: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
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
