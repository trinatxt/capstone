import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from "react-native";
import { API_URL } from "../api/apiClient";

// ── Card designs ──────────────────────────────────────────────────────────────
const CARD_DESIGNS = [
  {
    id: "1",
    bg: "#6B4EFF",
    accent: "#8B72FF",
    emoji: "🦄",
    title: "Happy Birthday!",
    subtitle: "Enjoy your day! It's only one in every 365 days.",
  },
  {
    id: "2",
    bg: "#1E3EA1",
    accent: "#2B52CC",
    emoji: "🎈",
    title: "Happy Birthday!",
    subtitle: "Thank you for all the memories. The world is colourless without you.",
  },
  {
    id: "3",
    bg: "#E53935",
    accent: "#EF5350",
    emoji: "🥳",
    title: "Happy Birthday!",
    subtitle: "Hoping you get a lot of fun and beautiful gifts today!",
  },
  {
    id: "4",
    bg: "#0891b2",
    accent: "#06b6d4",
    emoji: "⭐",
    title: "Happy Birthday!",
    subtitle: "Wishing you a day as bright and wonderful as you are.",
  },
];

const QUICK_MESSAGES = [
  "Happy Birthday! 🎂 Wishing you all the best!",
  "Many happy returns of the day! 🥳",
  "Hope your birthday is as amazing as you are! 🎉",
];

// ── Shared card preview ───────────────────────────────────────────────────────
function CardPreview({
  card,
  size = "large",
  message,
}: {
  card: (typeof CARD_DESIGNS)[0];
  size?: "small" | "large";
  message?: string;
}) {
  const isLarge = size === "large";
  return (
    <View
      style={[
        styles.cardPreview,
        { backgroundColor: card.bg, height: isLarge ? 200 : 130 },
      ]}
    >
      {/* Decorative circles */}
      <View
        style={[
          styles.decorCircle,
          { backgroundColor: card.accent, top: -20, right: -20, width: 100, height: 100 },
        ]}
      />
      <View
        style={[
          styles.decorCircle,
          { backgroundColor: card.accent, bottom: -30, left: -15, width: 80, height: 80 },
        ]}
      />

      {/* Confetti dots */}
      {["#FFD700", "#FF69B4", "#00CED1", "#FF6347"].map((c, i) => (
        <View
          key={i}
          style={[
            styles.confettiDot,
            {
              backgroundColor: c,
              top: 10 + i * 14,
              left: 14 + i * 22,
              transform: [{ rotate: `${i * 30}deg` }],
            },
          ]}
        />
      ))}

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.cardEmoji, { fontSize: isLarge ? 44 : 30 }]}>{card.emoji}</Text>
        <Text style={[styles.cardTitle, { fontSize: isLarge ? 22 : 16 }]}>{card.title}</Text>
        {message ? (
          <Text style={[styles.cardMessage, { fontSize: isLarge ? 13 : 11 }]} numberOfLines={3}>
            {message}
          </Text>
        ) : (
          <Text style={[styles.cardSubtitle, { fontSize: isLarge ? 12 : 10 }]} numberOfLines={2}>
            {card.subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Sign Card Modal ───────────────────────────────────────────────────────────

export function SignCardModal({
  visible,
  onClose,
  recipientName,
  fromUserId,
  toUserId,
}: {
  visible: boolean;
  onClose: () => void;
  recipientName: string;
  fromUserId?: string;
  toUserId?: string;
}) {
  const [step, setStep] = useState<"pick" | "sign">("pick");
  const [selectedId, setSelectedId] = useState("1");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const selectedCard = CARD_DESIGNS.find((c) => c.id === selectedId)!;

  const handleClose = () => {
    setStep("pick");
    setSelectedId("1");
    setMessage("");
    setSent(false);
    onClose();
  };

  const handleSend = async () => {
    if (fromUserId && toUserId) {
      try {
        await fetch(`${API_URL}/api/birthday-cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            card_design: selectedId,
            message,
          }),
        });
      } catch {}
    }
    setSent(true);
    setTimeout(handleClose, 1800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.sheet}
        >
          {/* ── Sent confirmation ── */}
          {sent ? (
            <View style={styles.sentScreen}>
              <Text style={styles.sentEmoji}>🎉</Text>
              <Text style={styles.sentTitle}>Card Sent!</Text>
              <Text style={styles.sentSub}>Your card is on its way to {recipientName}.</Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.sheetHeader}>
                {step === "sign" ? (
                  <Pressable onPress={() => setStep("pick")} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                  </Pressable>
                ) : (
                  <View style={styles.backBtn} />
                )}
                <Text style={styles.sheetTitle}>
                  {step === "pick" ? "Choose a Card" : "Sign the Card"}
                </Text>
                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              {/* Step indicator */}
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, step === "pick" && styles.stepDotActive]} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step === "sign" && styles.stepDotActive]} />
              </View>

              {/* ── Step 1: Pick card ── */}
              {step === "pick" && (
                <>
                  <Text style={styles.stepHint}>
                    Select a birthday card for {recipientName}
                  </Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.cardList}
                  >
                    {CARD_DESIGNS.map((card) => (
                      <Pressable
                        key={card.id}
                        onPress={() => setSelectedId(card.id)}
                        style={[
                          styles.cardItem,
                          selectedId === card.id && {
                            borderColor: card.bg,
                            borderWidth: 2.5,
                          },
                        ]}
                      >
                        <CardPreview card={card} size="small" />
                        {selectedId === card.id && (
                          <View style={[styles.checkBadge, { backgroundColor: card.bg }]}>
                            <Text style={styles.checkText}>✓</Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Pressable
                    style={[styles.primaryBtn, { backgroundColor: selectedCard.bg }]}
                    onPress={() => setStep("sign")}
                  >
                    <Text style={styles.primaryBtnText}>Next  →</Text>
                  </Pressable>
                </>
              )}

              {/* ── Step 2: Sign card ── */}
              {step === "sign" && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <CardPreview card={selectedCard} size="large" message={message || undefined} />

                  <Text style={styles.fieldLabel}>Your message</Text>
                  <TextInput
                    style={styles.messageInput}
                    placeholder={`Write something for ${recipientName}…`}
                    placeholderTextColor="#bbb"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{message.length}/200</Text>

                  <Text style={styles.fieldLabel}>Quick messages</Text>
                  {QUICK_MESSAGES.map((q) => (
                    <Pressable
                      key={q}
                      style={styles.quickMsgChip}
                      onPress={() => setMessage(q)}
                    >
                      <Text style={styles.quickMsgText}>{q}</Text>
                    </Pressable>
                  ))}

                  <Pressable
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: selectedCard.bg, marginTop: 20 },
                      !message.trim() && styles.primaryBtnDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim()}
                  >
                    <Text style={styles.primaryBtnText}>Send Card  🎉</Text>
                  </Pressable>
                </ScrollView>
              )}
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Send Message Modal ────────────────────────────────────────────────────────
export function SendMessageModal({
  visible,
  onClose,
  recipientName,
}: {
  visible: boolean;
  onClose: () => void;
  recipientName: string;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    setMessage("");
    setSent(false);
    onClose();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(handleClose, 1600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.sheet}
        >
          {sent ? (
            <View style={styles.sentScreen}>
              <Text style={styles.sentEmoji}>✉️</Text>
              <Text style={styles.sentTitle}>Message Sent!</Text>
              <Text style={styles.sentSub}>Your birthday wish has been delivered.</Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.backBtn} />
                <Text style={styles.sheetTitle}>Send Message</Text>
                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              {/* Recipient */}
              <View style={styles.recipientRow}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitial}>
                    {recipientName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.recipientName}>{recipientName}</Text>
                  <Text style={styles.recipientSub}>Today is their birthday! 🎂</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Quick messages */}
              <Text style={styles.fieldLabel}>Quick wishes</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickRow}
              >
                {QUICK_MESSAGES.map((q) => (
                  <Pressable
                    key={q}
                    style={[
                      styles.quickPill,
                      message === q && styles.quickPillActive,
                    ]}
                    onPress={() => setMessage(message === q ? "" : q)}
                  >
                    <Text
                      style={[
                        styles.quickPillText,
                        message === q && styles.quickPillTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {q}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Text input */}
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Your message</Text>
              <TextInput
                style={styles.messageInput}
                placeholder={`Write a birthday message for ${recipientName}…`}
                placeholderTextColor="#bbb"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{message.length}/300</Text>

              {/* Send button */}
              <Pressable
                style={[
                  styles.primaryBtn,
                  { backgroundColor: "#1E3EA1" },
                  !message.trim() && styles.primaryBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Text style={styles.primaryBtnText}>Send  ✉️</Text>
              </Pressable>
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Received Cards Modal (my birthday) ───────────────────────────────────────
type ReceivedCard = { id: string; from: string; initial: string; cardId: string; message: string };

export function ReceivedCardsModal({
  visible,
  onClose,
  cards,
}: {
  visible: boolean;
  onClose: () => void;
  cards: ReceivedCard[];
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => { setSelectedIdx(0); }, [cards]);

  if (cards.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.backBtn} />
              <Text style={styles.sheetTitle}>Your Birthday Cards 🎂</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeX}>✕</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>🎂</Text>
              <Text style={{ fontSize: 15, color: "#888" }}>No cards yet — check back later!</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const current = cards[selectedIdx] ?? cards[0];
  const currentCard = CARD_DESIGNS.find((c) => c.id === current.cardId) ?? CARD_DESIGNS[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: "90%" }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.backBtn} />
            <Text style={styles.sheetTitle}>Your Birthday Cards 🎂</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </Pressable>
          </View>

          {/* Pill tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={rcStyles.tabRow}
          >
            {cards.map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => setSelectedIdx(i)}
                style={[rcStyles.tab, selectedIdx === i && rcStyles.tabActive]}
              >
                <View style={[rcStyles.tabAvatar, selectedIdx === i && { backgroundColor: currentCard.bg }]}>
                  <Text style={rcStyles.tabInitial}>{r.initial}</Text>
                </View>
                <Text style={[rcStyles.tabName, selectedIdx === i && rcStyles.tabNameActive]}>
                  {r.from}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Card preview */}
          <View style={rcStyles.previewWrap}>
            <CardPreview card={currentCard} size="large" message={current.message} />
          </View>

          {/* From label */}
          <View style={rcStyles.fromRow}>
            <View style={[rcStyles.fromAvatar, { backgroundColor: currentCard.bg }]}>
              <Text style={rcStyles.fromInitial}>{current.initial}</Text>
            </View>
            <View>
              <Text style={rcStyles.fromName}>From {current.from}</Text>
              <Text style={rcStyles.fromSub}>Signed your birthday card</Text>
            </View>
          </View>

          {/* Message bubble */}
          <View style={[rcStyles.bubble, { borderLeftColor: currentCard.bg }]}>
            <Text style={rcStyles.bubbleText}>"{current.message}"</Text>
          </View>

          {/* Navigation dots */}
          <View style={rcStyles.dotsRow}>
            {cards.map((_, i) => (
              <Pressable key={i} onPress={() => setSelectedIdx(i)}>
                <View
                  style={[
                    rcStyles.dot,
                    i === selectedIdx && { backgroundColor: currentCard.bg, width: 18 },
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const rcStyles = StyleSheet.create({
  tabRow: {
    gap: 8,
    paddingBottom: 14,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  tabActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#F59E0B",
  },
  tabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  tabInitial: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  tabName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  tabNameActive: {
    color: "#92400e",
  },
  previewWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  fromRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  fromAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fromInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  fromName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },
  fromSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  bubble: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 16,
  },
  bubbleText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
    fontStyle: "italic",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "92%",
    minHeight: 300,
  },

  /* Header */
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  backBtn: {
    width: 32,
    alignItems: "flex-start",
  },
  backArrow: {
    fontSize: 20,
    color: "#1E3EA1",
    fontWeight: "bold",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    fontSize: 13,
    color: "#888",
    fontWeight: "bold",
  },

  /* Step indicator */
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  stepDotActive: {
    backgroundColor: "#1E3EA1",
    width: 22,
    borderRadius: 4,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#eee",
    borderRadius: 1,
  },
  stepHint: {
    fontSize: 13,
    color: "#888",
    marginBottom: 14,
    textAlign: "center",
  },

  /* Card list */
  cardList: {
    gap: 12,
    paddingBottom: 8,
  },
  cardItem: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  checkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },

  /* Card preview */
  cardPreview: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.4,
  },
  confettiDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  cardContent: {
    alignItems: "center",
    padding: 12,
    zIndex: 1,
  },
  cardEmoji: {
    marginBottom: 6,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 16,
  },
  cardMessage: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },

  /* Inputs */
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginTop: 4,
  },
  messageInput: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#222",
    minHeight: 100,
    backgroundColor: "#fafafa",
  },
  charCount: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 12,
  },

  /* Quick messages */
  quickMsgChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  quickMsgText: {
    fontSize: 14,
    color: "#333",
  },

  /* Primary button */
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  /* Sent screen */
  sentScreen: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  sentEmoji: {
    fontSize: 52,
  },
  sentTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  sentSub: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },

  /* Recipient row (SendMessage) */
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  recipientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1E3EA1",
    alignItems: "center",
    justifyContent: "center",
  },
  recipientInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  recipientName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
  },
  recipientSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
  },

  /* Quick pills (SendMessage) */
  quickRow: {
    gap: 8,
    paddingRight: 8,
  },
  quickPill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: "transparent",
    maxWidth: 220,
  },
  quickPillActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#1E3EA1",
  },
  quickPillText: {
    fontSize: 13,
    color: "#555",
  },
  quickPillTextActive: {
    color: "#1E3EA1",
    fontWeight: "600",
  },
});
