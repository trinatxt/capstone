import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "../context/UserContext";
import { API_URL } from "../api/apiClient";

const TIME_SLOTS = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
];

const TIME_SLOT_START: Record<string, { h: number; m: number }> = {
  "9:00 AM - 10:00 AM":  { h: 9,  m: 0 },
  "10:00 AM - 11:00 AM": { h: 10, m: 0 },
  "11:00 AM - 12:00 PM": { h: 11, m: 0 },
  "1:00 PM - 2:00 PM":   { h: 13, m: 0 },
  "2:00 PM - 3:00 PM":   { h: 14, m: 0 },
  "3:00 PM - 4:00 PM":   { h: 15, m: 0 },
  "4:00 PM - 5:00 PM":   { h: 16, m: 0 },
};

const pods = [
  {
    id: "1",
    name: "Delta Pod 10",
    location: "Floor 4, Office 2",
    people: 4,
    image: require("../images/office.png"),
  },
  {
    id: "2",
    name: "Delta Pod 12",
    location: "Floor 5, Office 1",
    people: 6,
    image: require("../images/office.png"),
  },
];

function formatDateDisplay(d: Date) {
  return d.toLocaleDateString("en-SG", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MakeBooking({ navigation }: any) {
  const { user } = useUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailableSlots = (date: Date) => {
    const isToday = formatDateISO(date) === formatDateISO(new Date());
    if (!isToday) return TIME_SLOTS;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return TIME_SLOTS.filter(s => TIME_SLOT_START[s].h * 60 + TIME_SLOT_START[s].m > nowMins);
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(() => getAvailableSlots(new Date())[0] ?? TIME_SLOTS[0]);

  const availableTimeSlots = getAvailableSlots(selectedDate);
  const [bookedPodNames, setBookedPodNames] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/bookings/booked-pods?date=${formatDateISO(selectedDate)}&time_label=${encodeURIComponent(selectedTimeSlot)}`
        );
        const data = await res.json();
        setBookedPodNames(Array.isArray(data) ? data : []);
      } catch {
        setBookedPodNames([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate, selectedTimeSlot]);

  const availablePods = pods.filter((p) => !bookedPodNames.includes(p.name));

  const handleBookNow = async (pod: typeof pods[0]) => {
    if (!user?.id) return;
    setBookingLoading(pod.id);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          pod_name: pod.name,
          location: pod.location,
          booking_date: formatDateISO(selectedDate),
          time_label: selectedTimeSlot,
          people_count: pod.people,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      // Remove pod from available list immediately
      setBookedPodNames((prev) => [...prev, pod.name]);
      Alert.alert("Booking confirmed!", `${pod.name} booked for ${formatDateDisplay(selectedDate)}, ${selectedTimeSlot}.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Image source={require("../images/avatar.png")} style={styles.avatar} />
        <Text style={styles.headerTitle}>Make a Booking</Text>
      </View>

      {/* Date & Time Slot */}
      <View style={styles.dateTimeCard}>
        <Pressable style={styles.dateTimeCol} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={15} color="#056af7" />
            <Text style={styles.fieldValue}>{formatDateDisplay(selectedDate)}</Text>
          </View>
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={today}
          onChange={(_event, date) => {
            setShowDatePicker(Platform.OS === "ios");
            if (date) {
              setSelectedDate(date);
              const slots = getAvailableSlots(date);
              setSelectedTimeSlot(slots[0] ?? TIME_SLOTS[0]);
            }
          }}
        />
      )}

      {/* Time Slots */}
      <Text style={styles.sectionLabel}>Time Slot</Text>
      {availableTimeSlots.length === 0 ? (
        <View style={styles.noPodsState}>
          <Ionicons name="time-outline" size={36} color="#ccc" />
          <Text style={styles.noPodsText}>No more slots today — please select a future date</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotsContainer}
        >
          {availableTimeSlots.map((slot) => (
            <Pressable
              key={slot}
              style={[styles.timeSlotChip, selectedTimeSlot === slot && styles.timeSlotChipSelected]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Text style={[styles.timeSlotText, selectedTimeSlot === slot && styles.timeSlotTextSelected]}>
                {slot}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Available Pods — only shown when time slots exist */}
      {availableTimeSlots.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Available Pods</Text>
          {availabilityLoading ? (
            <ActivityIndicator size="large" color="#056af7" style={{ marginVertical: 30 }} />
          ) : availablePods.length === 0 ? (
            <View style={styles.noPodsState}>
              <Ionicons name="close-circle-outline" size={40} color="#ccc" />
              <Text style={styles.noPodsText}>No available pods for this slot</Text>
            </View>
          ) : (
            availablePods.map((pod) => (
              <View key={pod.id} style={styles.podCard}>
                <Image source={pod.image} style={styles.podImage} resizeMode="cover" />
                <View style={styles.podInfo}>
                  <Text style={styles.podName}>{pod.name}</Text>
                  <View style={styles.podRow}>
                    <Ionicons name="location-outline" size={13} color="#666" />
                    <Text style={styles.podDetail}>{pod.location}</Text>
                  </View>
                  <View style={styles.podRow}>
                    <Ionicons name="people-outline" size={13} color="#666" />
                    <Text style={styles.podDetail}>{pod.people} pax</Text>
                  </View>
                  <Pressable
                    style={styles.bookBtn}
                    onPress={() => handleBookNow(pod)}
                    disabled={bookingLoading === pod.id}
                  >
                    {bookingLoading === pod.id ? (
                      <ActivityIndicator size="small" color="#065f46" />
                    ) : (
                      <Text style={styles.bookBtnText}>Book Now</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </>
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
  dateTimeCard: {
    marginHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateTimeCol: {
    gap: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
    color: "#111",
  },
  timeSlotsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 28,
  },
  timeSlotChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  timeSlotChipSelected: {
    backgroundColor: "#EEF4FF",
    borderColor: "#056af7",
  },
  timeSlotText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  timeSlotTextSelected: {
    color: "#056af7",
    fontWeight: "700",
  },
  noPodsState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  noPodsText: {
    fontSize: 14,
    color: "#aaa",
  },
  podCard: {
    flexDirection: "row",
    height: 150,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  podImage: {
    width: 110,
  },
  podInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  podName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  podRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  podDetail: {
    fontSize: 12,
    color: "#555",
  },
  bookBtn: {
    marginTop: 8,
    backgroundColor: "#4ADE80",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  bookBtnText: {
    color: "#065f46",
    fontWeight: "bold",
    fontSize: 13,
  },
});
