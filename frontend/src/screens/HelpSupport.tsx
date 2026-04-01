import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const faqs = [
  {
    q: "How do I book a meeting pod?",
    a: "Go to Office mode → tap 'Make a Booking', choose your date, time, and pod, then tap 'Book Now'.",
  },
  {
    q: "How do I control the lights and fan?",
    a: "Navigate to the Controls tab. Use the brightness slider to adjust lights and the +/− buttons to change fan speed. Changes are sent to the pod in real time.",
  },
  {
    q: "What is the Knock feature?",
    a: "Knocking lets you notify a colleague in another pod without disturbing them. Their pod flashes a light signal so they know you want their attention.",
  },
  {
    q: "How do I cancel a booking?",
    a: "Go to Office mode → 'View my Bookings' → find the booking and tap 'Cancel Booking'.",
  },
  {
    q: "Why are my controls not working?",
    a: "Make sure your phone is on the same WiFi as the backend server, the backend is running, and the ESP32 pod is powered on and connected to AWS IoT.",
  },
];


export default function HelpSupport({ navigation }: any) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.card}>
            {faqs.map((faq, idx) => (
              <View key={idx}>
                <Pressable
                  style={[styles.faqRow, idx < faqs.length - 1 && !openIndex && styles.rowBorder]}
                  onPress={() => toggleFaq(idx)}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={openIndex === idx ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#888"
                  />
                </Pressable>
                {openIndex === idx && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
                {idx < faqs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

<View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
