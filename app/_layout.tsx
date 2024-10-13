import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  return (
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
        // Hide the tab bar for specific routes
        tabBarStyle: ((route) => {
          const routeName = route.name;
          if (
            routeName === "lesson/[id]" ||
            routeName === "practice-session/[category]"
          ) {
            return { display: "none" };
          }
          return;
        })(route),
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
  );
}
