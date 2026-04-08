import React, { useRef, useState, useEffect } from "react";
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
import { API_URL } from "../api/apiClient";

const screenWidth = Dimensions.get("window").width;

type Knock = { id: string; name: string };
type BirthdayUser = { id: string; username: string; full_name: string | null };
type ReceivedCard = { id: string; from: string; initial: string; cardId: string; message: string };

function isTodayBirthday(birthday: string | null | undefined): boolean {
  if (!birthday) return false;
  try {
    // Split the "YYYY-MM-DD" string directly — avoids timezone shifts from new Date()
    const datePart = birthday.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length < 3) return false;
    const bdMonth = parseInt(parts[1], 10) - 1;
    const bdDay = parseInt(parts[2], 10);
    const today = new Date();
    return bdMonth === today.getMonth() && bdDay === today.getDate();
  } catch {
    return false;
  }
}

export default function HomePage({ navigation }: any) {
  const { user } = useUser();
  const carouselRef = useRef(null);
  const [colleagues, setColleagues] = useState<{ id: string; name: string; mode: string }[]>([]);
  const [signCardVisible, setSignCardVisible] = useState(false);
  const [sendMessageVisible, setSendMessageVisible] = useState(false);
  const [myBirthdayVisible, setMyBirthdayVisible] = useState(false);
  const isMyBirthday = isTodayBirthday(user?.birthday);
  const [knockedIds, setKnockedIds] = useState<Set<string>>(new Set());
  const knockTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [incomingKnocks, setIncomingKnocks] = useState<Knock[]>([]);
  const [todayBirthdays, setTodayBirthdays] = useState<BirthdayUser[]>([]);
  const [receivedCards, setReceivedCards] = useState<ReceivedCard[]>([]);
  const [selectedBirthdayPerson, setSelectedBirthdayPerson] = useState<BirthdayUser | null>(null);

  const fetchColleagues = () => {
    fetch(`${API_URL}/api/users`)
      .then((r) => r.json())
      .then((data: { id: string; username: string; full_name: string | null; preferred_modes: string | null }[]) => {
        const others = data
          .filter((u) => u.id !== user?.id)
          .map((u) => ({
            id: String(u.id),
            name: u.full_name || u.username,
            mode: u.preferred_modes || "Meeting",
          }));
        setColleagues(others);
      })
      .catch(() => {});
  };

  const fetchBirthdays = () => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/birthdays/today?exclude_user_id=${user.id}`)
      .then((r) => r.json())
      .then((data: BirthdayUser[]) => setTodayBirthdays(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const fetchReceivedCards = () => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/birthday-cards?to_user_id=${user.id}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setReceivedCards(
          data.map((c) => ({
            id: String(c.id),
            from: c.from_full_name || c.from_username,
            initial: (c.from_full_name || c.from_username).charAt(0).toUpperCase(),
            cardId: c.card_design || "1",
            message: c.message,
          }))
        );
      })
      .catch(() => {});
  };

  const fetchKnocks = () => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/knocks?to_user_id=${user.id}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setIncomingKnocks(
          data.map((k) => ({
            id: String(k.id),
            name: k.from_full_name || k.from_username,
          }))
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchColleagues();
    fetchKnocks();
    fetchBirthdays();
    fetchReceivedCards();
    const colleagueInterval = setInterval(fetchColleagues, 10000);
    const knockInterval = setInterval(fetchKnocks, 5000);
    const birthdayInterval = setInterval(fetchBirthdays, 30000);
    return () => {
      clearInterval(colleagueInterval);
      clearInterval(knockInterval);
      clearInterval(birthdayInterval);
    };
  }, [user?.id]);

  const handleDismissKnock = async (knockId: string) => {
    setIncomingKnocks((prev) => prev.filter((k) => k.id !== knockId));
    try {
      await fetch(`${API_URL}/api/knocks/${knockId}/dismiss`, { method: "PUT" });
    } catch {}
  };

  const handleKnock = async (colleagueId: string) => {
    if (knockedIds.has(colleagueId)) return;
    setKnockedIds((prev) => new Set(prev).add(colleagueId));
    knockTimers.current[colleagueId] = setTimeout(() => {
      setKnockedIds((prev) => {
        const next = new Set(prev);
        next.delete(colleagueId);
        return next;
      });
    }, 2000);
    try {
      await fetch(`${API_URL}/api/knocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_user_id: user?.id, to_user_id: colleagueId }),
      });
    } catch {}
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
        {/* My Birthday Card — show on user's birthday */}
        {isMyBirthday && (
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
            {receivedCards.length > 0 ? (
              <>
                <Text style={styles.myBdSub}>{receivedCards.length} colleague{receivedCards.length > 1 ? "s" : ""} signed your card today</Text>
                <View style={styles.myBdAvatarRow}>
                  {receivedCards.slice(0, 3).map((c, i) => (
                    <View key={c.id} style={[styles.myBdAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}>
                      <Text style={styles.myBdAvatarText}>{c.initial}</Text>
                    </View>
                  ))}
                  <Text style={styles.myBdAvatarLabel}>
                    {receivedCards.slice(0, 3).map((c) => c.from).join(", ")}
                  </Text>
                </View>
                <Pressable style={styles.myBdButton} onPress={() => setMyBirthdayVisible(true)}>
                  <Text style={styles.myBdButtonText}>View Your Cards  🎁</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.myBdSub}>No cards yet — your colleagues can sign one for you!</Text>
            )}
          </View>
        )}

        {/* Colleague Birthday Cards — one per person with birthday today */}
        {todayBirthdays.map((person) => {
          const name = person.full_name || person.username;
          return (
            <View key={person.id} style={styles.birthdayCard}>
              <View style={styles.bdDecorTL} />
              <View style={styles.bdDecorBR} />

              <View style={styles.birthdayTop}>
                <Text style={styles.birthdayEmoji}>🎉</Text>
                <View style={styles.birthdayBadge}>
                  <Text style={styles.birthdayBadgeText}>Colleague's Birthday</Text>
                </View>
              </View>

              <Text style={styles.birthdayText}>{`Today is\n${name}'s Birthday!`}</Text>
              <Text style={styles.birthdaySub}>Show them some love from the team 💙</Text>

              <View style={styles.birthdayActions}>
                <Pressable style={styles.birthdayButton} onPress={() => { setSelectedBirthdayPerson(person); setSignCardVisible(true); }}>
                  <Text style={styles.birthdayButtonText}>✍️  Sign Card</Text>
                </Pressable>
                <Pressable style={[styles.birthdayButton, styles.birthdayButtonOutline]} onPress={() => { setSelectedBirthdayPerson(person); setSendMessageVisible(true); }}>
                  <Text style={styles.birthdayButtonTextOutline}>✉️  Message</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <SignCardModal
        visible={signCardVisible}
        onClose={() => setSignCardVisible(false)}
        recipientName={selectedBirthdayPerson ? (selectedBirthdayPerson.full_name || selectedBirthdayPerson.username) : ""}
        fromUserId={user?.id}
        toUserId={selectedBirthdayPerson?.id}
      />
      <SendMessageModal
        visible={sendMessageVisible}
        onClose={() => setSendMessageVisible(false)}
        recipientName={selectedBirthdayPerson ? (selectedBirthdayPerson.full_name || selectedBirthdayPerson.username) : ""}
      />
      <ReceivedCardsModal
        visible={myBirthdayVisible}
        onClose={() => setMyBirthdayVisible(false)}
        cards={receivedCards}
      />

      {/* Knock Section - horizontally scrollable cards */}
      {incomingKnocks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.knockCardsContainer}
          style={styles.knockCardsScroll}
        >
          {incomingKnocks.map((knocker) => (
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
                    onPress={() => handleDismissKnock(knocker.id)}
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
                    onPress={() => handleDismissKnock(knocker.id)}
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
