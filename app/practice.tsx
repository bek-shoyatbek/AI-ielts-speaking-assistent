import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

const partDescriptions = {
  "Full Test": "Complete IELTS Speaking test simulation (11-14 minutes)",
  "Part 1": "Introduction and interview (4-5 minutes)",
  "Part 2": "Individual long turn (3-4 minutes)",
  "Part 3": "Two-way discussion (4-5 minutes)",
};

const generalTips = [
  "Speak clearly and confidently",
  "Use a variety of vocabulary and structures",
  "Provide detailed answers with examples",
  "Stay on topic and listen carefully to questions",
  "Practice regularly with a timer",
];

export default function Practice() {
  const router = useRouter();

  const navigateToSession = (part: string) => {
    router.push(`/practice-session/${part}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>IELTS Speaking Practice</Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>General Tips:</Text>
          {generalTips.map((tip, index) => (
            <Text key={index} style={styles.tip}>
              • {tip}
            </Text>
          ))}
        </View>

        {Object.entries(partDescriptions).map(([part, description]) => (
          <View key={part} style={styles.partContainer}>
            <Text style={styles.partTitle}>{part}</Text>
            <Text style={styles.partDescription}>{description}</Text>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                part === "Full Test" ? styles.fullTestButton : {},
              ]}
              onPress={() => navigateToSession(part)}
            >
              <Text style={styles.categoryButtonText}>Practice {part}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80, // Additional padding to account for tab bar
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  tipsContainer: {
    backgroundColor: "#e6f3ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tip: {
    fontSize: 16,
    marginBottom: 5,
  },
  partContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  partDescription: {
    fontSize: 16,
    marginBottom: 15,
    color: "#666",
  },
  categoryButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  categoryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  fullTestButton: {
    backgroundColor: "#28A745", // A different color to make it stand out
  },
});
