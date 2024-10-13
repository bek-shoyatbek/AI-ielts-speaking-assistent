import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "index") {
              iconName = focused ? "book" : "book-outline";
            } else if (route.name === "practice") {
              iconName = focused ? "mic" : "mic-outline";
            } else if (route.name === "profile") {
              iconName = focused ? "person" : "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: ((route) => {
            const routeName = route.name;
            if (
              routeName === "lesson/[id]" ||
              routeName === "practice-session/[category]"
            ) {
              return { display: "none" };
            }
            return {
              ...styles.tabBar,
              height: 50 + insets.bottom,
              paddingBottom: insets.bottom,
            };
          })(route),
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
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
          }}
        />
        <Tabs.Screen
          name="practice-session/[category]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
