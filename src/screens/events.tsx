import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const initialEvents = [
  { id: "1", title: "Team Building Workshop", date: "March 18 3:00PM", icon: "🎯" },
  { id: "2", title: "Product Launch Party",   date: "March 18 3:00PM", icon: "🚀" },
  { id: "3", title: "Wellness Yoga",           date: "March 18 3:00PM", icon: "🧘‍♀️" },
];

export default function Events({ navigation }: any) {
  const [events, setEvents] = useState(initialEvents);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [newTitle, setNewTitle]       = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [timeTo, setTimeTo]           = useState("14:00");
  const [timeFrom, setTimeFrom]       = useState("16:00");
  const [location, setLocation]       = useState("");
  const [activeDays, setActiveDays]   = useState<number[]>([6]); // Sunday default
  const [activeTab, setActiveTab]     = useState<"upcoming" | "my">("upcoming");
  const [rsvpIds, setRsvpIds]         = useState<Set<string>>(new Set());

  const handleRsvp = (id: string) => setRsvpIds((prev) => new Set(prev).add(id));

  const upcomingEvents = events.filter((e) => !rsvpIds.has(e.id));
  const myEvents       = events.filter((e) => rsvpIds.has(e.id));
  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : myEvents;

  const toggleDay = (i: number) =>
    setActiveDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );

  const handleSave = () => {
    if (!newTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newTitle.trim(),
        date: meetingDate.trim() || `${timeTo} – ${timeFrom}`,
        icon: "📅",
      },
    ]);
    // reset
    setNewTitle(""); setMeetingDate(""); setTimeTo("14:00");
    setTimeFrom("16:00"); setLocation(""); setActiveDays([6]);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate("Settings")}>
            <Image source={require("../images/avatar.png")} style={styles.avatar} />
          </Pressable>
          <Text style={styles.title}>Events</Text>
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

        {/* Tab row */}
        <View style={styles.tabRow}>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
                Upcoming
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "my" && styles.tabActive]}
              onPress={() => setActiveTab("my")}
            >
              <Text style={[styles.tabText, activeTab === "my" && styles.tabTextActive]}>
                My Events
              </Text>
            </Pressable>
          </View>
          {activeTab === "upcoming" && (
            <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ Add event</Text>
            </Pressable>
          )}
        </View>

        {/* Event cards */}
        {displayedEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventIcon}>{event.icon}</Text>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>📅 {event.date}</Text>
            </View>
            {activeTab === "upcoming" ? (
              <Pressable style={styles.rsvpBtn} onPress={() => handleRsvp(event.id)}>
                <Text style={styles.rsvpText}>RSVP</Text>
              </Pressable>
            ) : (
              <View style={styles.goingBadge}>
                <Text style={styles.goingText}>Going ✓</Text>
              </View>
            )}
          </View>
        ))}

        {activeTab === "my" && myEvents.length === 0 && (
          <Text style={styles.emptyText}>No events yet. RSVP to upcoming events!</Text>
        )}

      </ScrollView>

      {/* ── Add Event Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalCard}
          >
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add new event</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeCircle}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              {/* Title */}
              <TextInput
                style={styles.inputField}
                placeholder="Title"
                placeholderTextColor="#aaa"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Date & Time card */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionCardIcon}>🕐</Text>
                  <Text style={styles.sectionCardTitle}>Date & Time</Text>
                </View>

                <Text style={styles.fieldLabel}>Meeting date</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Choose date"
                  placeholderTextColor="#aaa"
                  value={meetingDate}
                  onChangeText={setMeetingDate}
                />

                <View style={styles.timeRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.fieldLabel}>To</Text>
                    <View style={styles.timeDropdown}>
                      <Text style={styles.timeValue}>{timeTo}</Text>
                      <Text style={styles.dropdownArrow}>⌄</Text>
                    </View>
                  </View>
                  <View style={styles.timeCol}>
                    <Text style={styles.fieldLabel}>From</Text>
                    <View style={styles.timeDropdown}>
                      <Text style={styles.timeValue}>{timeFrom}</Text>
                      <Text style={styles.dropdownArrow}>⌄</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.iconInputRow}>
                <Text style={styles.rowIcon}>📍</Text>
                <TextInput
                  style={styles.iconInputText}
                  placeholder="Choose location"
                  placeholderTextColor="#aaa"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {/* Add participants */}
              <View style={styles.iconInputRow}>
                <Text style={styles.rowIcon}>👤</Text>
                <Text style={styles.iconInputPlaceholder}>Add participants</Text>
              </View>

              {/* Participant chips */}
              <View style={styles.participantRow}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.participantChip}>
                    <Image source={require("../images/avatar.png")} style={styles.chipAvatar} />
                    <Text style={styles.chipDots}>...</Text>
                    <Pressable style={styles.chipRemove}>
                      <Text style={styles.chipRemoveText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* Repeating card */}
              <View style={styles.sectionCard}>
                <View style={styles.repeatHeaderRow}>
                  <View style={styles.repeatLeft}>
                    <Text style={styles.sectionCardIcon}>🔄</Text>
                    <Text style={styles.sectionCardTitle}>Repeating</Text>
                  </View>
                  <View style={styles.allDayRow}>
                    <Text style={styles.allDayText}>All day</Text>
                    <Text style={styles.eyeIcon}>👁</Text>
                  </View>
                </View>

                <View style={styles.daysRow}>
                  <Text style={styles.onLabel}>On</Text>
                  {DAYS.map((d, i) => (
                    <Pressable
                      key={i}
                      onPress={() => toggleDay(i)}
                      style={[styles.dayPill, activeDays.includes(i) && styles.dayPillActive]}
                    >
                      <Text style={[styles.dayPillText, activeDays.includes(i) && styles.dayPillTextActive]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Save button */}
              <View style={styles.saveRow}>
                <Pressable
                  style={[styles.saveBtn, !newTitle.trim() && styles.saveBtnDisabled]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  /* Birthday Card */
  birthdayCard: {
    backgroundColor: "#1E3EA1",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  birthdayEmoji: {
    fontSize: 52,
    marginRight: 16,
  },
  birthdayTextBlock: { flex: 1 },
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

  /* Tab row */
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 3,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  tabActive: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
  tabTextActive: {
    color: "#1E3EA1",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 14,
    marginTop: 40,
  },
  addBtn: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  /* Event cards */
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: "#666",
  },
  rsvpBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rsvpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  goingBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  closeX: {
    color: "#E53935",
    fontSize: 13,
    fontWeight: "bold",
  },

  /* Inputs */
  inputField: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    color: "#222",
  },
  fieldLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },

  /* Section cards (Date&Time, Repeating) */
  sectionCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionCardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sectionCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },

  /* Time row */
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  timeCol: {
    flex: 1,
  },
  timeDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeValue: {
    fontSize: 15,
    color: "#222",
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#888",
  },

  /* Icon input rows (location, participants) */
  iconInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 10,
  },
  rowIcon: {
    fontSize: 18,
  },
  iconInputText: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  iconInputPlaceholder: {
    fontSize: 15,
    color: "#aaa",
    flex: 1,
  },

  /* Participant chips */
  participantRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  participantChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  chipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chipDots: {
    fontSize: 12,
    color: "#666",
  },
  chipRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  chipRemoveText: {
    color: "#E53935",
    fontSize: 9,
    fontWeight: "bold",
  },

  /* Repeating card */
  repeatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  repeatLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  allDayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  allDayText: {
    fontSize: 13,
    color: "#555",
  },
  eyeIcon: {
    fontSize: 14,
  },
  daysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onLabel: {
    fontSize: 13,
    color: "#555",
    marginRight: 4,
  },
  dayPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  dayPillActive: {
    backgroundColor: "#E53935",
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  dayPillTextActive: {
    color: "#fff",
  },

  /* Save */
  saveRow: {
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: "#E53935",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  saveBtnDisabled: {
    backgroundColor: "#ccc",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
