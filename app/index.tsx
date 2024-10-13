import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  ListRenderItem,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

const { width, height } = Dimensions.get("window");

const LessonsScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  const fetchLessons = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://s2tvrgs9-4300.euw.devtunnels.ms/api/v1/lessons`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch lessons");
      }
      const data: Lesson[] = await response.json();
      setLessons(data);
    } catch (err) {
      setError("Failed to fetch lessons. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    fetchLessons();
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, [fetchLessons, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const playVideo = useCallback((youtubeLink: string): void => {
    const videoId = extractVideoId(youtubeLink);
    if (videoId) {
      setSelectedVideoId(videoId);
      setModalVisible(true);
    } else {
      console.error("Invalid YouTube URL");
    }
  }, []);

  const closeVideo = useCallback((): void => {
    setModalVisible(false);
    setSelectedVideoId(null);
  }, []);

  const renderItem: ListRenderItem<Lesson> = useCallback(
    ({ item }) => (
      <View style={styles.lessonItem}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => playVideo(item.youtubeLink)}
        >
          <Ionicons name="play-circle" size={60} color="white" />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonDescription}>{item.description}</Text>
        </View>
      </View>
    ),
    [playVideo],
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error && lessons.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList<Lesson>
        data={lessons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        refreshControl={
          <Animated.View style={styles.refreshControl}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={24} color="#4A90E2" />
            </Animated.View>
          </Animated.View>
        }
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeVideo}
      >
        <SafeAreaView style={styles.videoContainer}>
          {selectedVideoId && (
            <View style={styles.playerWrapper}>
              <YoutubePlayer
                height={width * 0.5625} // 16:9 aspect ratio
                width={width}
                play={true}
                videoId={selectedVideoId}
              />
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={closeVideo}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingTop: StatusBar.currentHeight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonItem: {
    marginBottom: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 200,
  },
  playButton: {
    position: "absolute",
    top: 70,
    left: width / 2 - 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 30,
  },
  textContainer: {
    padding: 15,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  lessonDescription: {
    fontSize: 14,
    color: "#666",
  },
  refreshControl: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  playerWrapper: {
    width: width,
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default LessonsScreen;
