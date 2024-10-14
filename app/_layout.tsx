import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
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
            routeName === "practice-session/[category]" ||
            routeName === "lesson/[id]"
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
          title: "Home",
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
        name="practice-session/[category]"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="lesson/[id]"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}
