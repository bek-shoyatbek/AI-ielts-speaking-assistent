import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";

const TAB_ICON = {
  index: ["book", "book-outline"],
  practice: ["mic", "mic-outline"],
  profile: ["person", "person-outline"],
};

export default function AppLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const [focusedIcon, unfocusedIcon] = TAB_ICON[route.name] || [
              null,
              null,
            ];
            const iconName = focused ? focusedIcon : unfocusedIcon;
            return iconName ? (
              <Ionicons name={iconName} size={size} color={color} />
            ) : null;
          },
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: true,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          contentStyle: styles.content,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Lessons",
            href: "/",
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: "Practice",
            href: "/practice",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: "/profile",
          }}
        />
        <Tabs.Screen
          name="lesson/[id]"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
        <Tabs.Screen
          name="practice-session/[category]"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 30, // Add padding to account for status bar
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
