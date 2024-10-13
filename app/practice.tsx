import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Practice() {
  return (
    <View style={styles.container}>
      <Link href="/practice-session/Part 1" asChild>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Part 1</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/practice-session/Part 2" asChild>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Part 2</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/practice-session/Part 3" asChild>
        <TouchableOpacity style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>Part 3</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  categoryButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  categoryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
