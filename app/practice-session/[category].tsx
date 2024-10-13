import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function PracticeSession() {
  const { category } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Session: {category}</Text>
      <Text>Practice content goes here.</Text>
    </View>
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
});
