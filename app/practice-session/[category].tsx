import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const ieltsSpekingTips = [
  "Speak clearly and at a natural pace",
  "Use a variety of vocabulary and sentence structures",
  "Provide detailed answers with examples",
  "Stay on topic and answer the question directly",
  "Use appropriate linking words to connect your ideas",
  "Practice active listening and ask for clarification if needed",
  "Show confidence through your tone and body language",
  "Don't worry about small mistakes; fluency is key",
];

const practiceQuestions = {
  "part-1": "What do you do in your free time?",
  "part-2":
    "Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like visiting this place.",
  "part-3": "How do you think leisure activities will change in the future?",
};

export default function PracticeSession() {
  const { category } = useLocalSearchParams();
  const [answer, setAnswer] = useState("");

  const getPracticeQuestion = () => {
    return (
      practiceQuestions[category as keyof typeof practiceQuestions] ||
      "No question available for this category."
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Practice Session: {category}</Text>

      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>IELTS Speaking Tips:</Text>
        {ieltsSpekingTips.map((tip, index) => (
          <Text key={index} style={styles.tip}>
            • {tip}
          </Text>
        ))}
      </View>

      <View style={styles.practiceContainer}>
        <Text style={styles.sectionTitle}>Practice Exercise:</Text>
        <Text style={styles.question}>{getPracticeQuestion()}</Text>
        <TextInput
          style={styles.answerInput}
          multiline
          numberOfLines={4}
          placeholder="Type your answer here..."
          value={answer}
          onChangeText={setAnswer}
        />
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  tipsContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  tip: {
    fontSize: 16,
    marginBottom: 10,
  },
  practiceContainer: {
    backgroundColor: "#e6f3ff",
    padding: 15,
    borderRadius: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
  },
  answerInput: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
