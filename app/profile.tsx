import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");

  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    console.log("Google Sign-In pressed");
    setIsLoggedIn(true); // Simulating successful login
  };

  const friends = [
    { id: "1", name: "Alice Johnson" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Carol Williams" },
  ];

  const speakingHistories = [
    { id: "1", topic: "Introducing Yourself", date: "2023-05-15", score: 8.5 },
    {
      id: "2",
      topic: "Describing Your Hometown",
      date: "2023-05-18",
      score: 7.8,
    },
    { id: "3", topic: "Talking About Hobbies", date: "2023-05-20", score: 9.0 },
  ];

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Ionicons
              name="logo-google"
              size={24}
              color="white"
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderFriendItem = ({ item }) => (
    <View style={styles.listItem}>
      <Ionicons name="person-circle-outline" size={24} color="#4A90E2" />
      <Text style={styles.listItemText}>{item.name}</Text>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.listItem}>
      <Ionicons name="chatbubble-ellipses-outline" size={24} color="#4A90E2" />
      <View style={styles.historyInfo}>
        <Text style={styles.historyTopic}>{item.topic}</Text>
        <Text style={styles.historyDetails}>
          {item.date} - Score: {item.score}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
          style={styles.profilePicture}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john@example.com</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <Ionicons
            name="people"
            size={24}
            color={activeTab === "friends" ? "#4A90E2" : "#888"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Ionicons
            name="time"
            size={24}
            color={activeTab === "history" ? "#4A90E2" : "#888"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === "friends" ? friends : speakingHistories}
        renderItem={
          activeTab === "friends" ? renderFriendItem : renderHistoryItem
        }
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "white",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4A90E2",
  },
  list: {
    backgroundColor: "white",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  listItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  historyInfo: {
    marginLeft: 10,
    flex: 1,
  },
  historyTopic: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  historyDetails: {
    fontSize: 14,
    color: "#666",
  },
});
