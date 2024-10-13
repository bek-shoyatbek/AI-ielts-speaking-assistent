import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { useFocusEffect } from "@react-navigation/native";

interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  thumbnailUrl: string;
}

const { width } = Dimensions.get("window");

const LessonsScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playingLesson, setPlayingLesson] = useState<Lesson | null>(null);

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
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useFocusEffect(
    useCallback(() => {
      // This effect runs when the screen comes into focus
      return () => {
        // This cleanup function runs when the screen goes out of focus
        setPlayingLesson(null);
      };
    }, []),
  );

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const playVideo = useCallback((lesson: Lesson): void => {
    setPlayingLesson(lesson);
  }, []);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlayingLesson(null);
    }
  }, []);

  const renderVideoPlayer = () => {
    if (!playingLesson) return null;

    const videoId = extractVideoId(playingLesson.youtubeLink);
    if (!videoId) return null;

    return (
      <View style={styles.videoSection}>
        <YoutubePlayer
          height={width * 0.5625}
          width={width}
          play={true}
          videoId={videoId}
          onChangeState={onStateChange}
        />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{playingLesson.title}</Text>
          <Text style={styles.videoDescription}>
            {playingLesson.description}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Lesson }) => (
    <View style={styles.lessonItem}>
      <TouchableOpacity onPress={() => playVideo(item)}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playButton}>
          <Ionicons name="play-circle" size={60} color="white" />
        </View>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <Text style={styles.lessonDescription}>{item.description}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderVideoPlayer()}
      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoSection: {
    backgroundColor: "white",
    marginBottom: 20,
  },
  videoInfo: {
    padding: 15,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  videoDescription: {
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    padding: 10,
  },
  lessonItem: {
    marginBottom: 20,
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
});

export default LessonsScreen;
