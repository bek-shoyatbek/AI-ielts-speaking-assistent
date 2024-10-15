import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Animated,
  ListRenderItem,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import styles from "../../styles/practice-session.styles";
import axios from "axios";

const API_URL = "https://s2tvrgs9-4300.euw.devtunnels.ms/api/v1";

interface PracticeQuestion {
  content: string;
  topic: string;
  category: "PART1" | "PART2" | "PART3";
}

interface Message {
  id: string;
  text?: string;
  audio?: string;
  sender: "user" | "ai";
}

export default function PracticeSession() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [examplesModalVisible, setExamplesModalVisible] =
    useState<boolean>(false);
  const [ideasModalVisible, setIdeasModalVisible] = useState<boolean>(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchQuestions();
    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      askQuestion(questions[currentQuestionIndex]);
    }
  }, [questions, currentQuestionIndex]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/practice-questions/questions?category=${category}`,
      );
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      Alert.alert("Error", "Failed to fetch questions. Please try again.");
    }
  };

  const setupAudio = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
  };

  const askQuestion = (question: PracticeQuestion) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: question.content,
      sender: "ai",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    playTextToSpeech(question.content);
  };

  const playTextToSpeech = async (text: string) => {
    try {
      const encodedText = encodeURIComponent(text);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `${API_URL}/audio/stream?text=${encodedText}` },
        { shouldPlay: true },
      );
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err: any) {
      Alert.alert("Failed to play text-to-speech", err.message);
    }
  };

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err: any) {
      Alert.alert("Failed to start recording", err.message);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(undefined);
        if (uri) {
          const userMessage: Message = {
            id: Date.now().toString(),
            audio: uri,
            sender: "user",
          };
          setMessages((prevMessages) => [...prevMessages, userMessage]);

          // Move to the next question after a short delay
          setTimeout(() => {
            setCurrentQuestionIndex(
              (prevIndex) => (prevIndex + 1) % questions.length,
            );
          }, 1000);
        }
      }
    } catch (err: any) {
      Alert.alert("Failed to stop recording", err.message);
    }
  }

  async function playSound(audio: string, messageId: string) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      if (playingAudioId === messageId) {
        setIsPlaying(false);
        setPlayingAudioId(null);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio },
        { shouldPlay: true },
      );
      setSound(newSound);
      setIsPlaying(true);
      setPlayingAudioId(messageId);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setPlayingAudioId(null);
        }
      });
    } catch (err: any) {
      Alert.alert("Failed to play sound", err.message);
    }
  }

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.text ? (
        <View>
          <Text
            style={[
              styles.messageText,
              item.sender === "ai" && styles.aiMessageText,
            ]}
          >
            {item.text}
          </Text>
          {item.sender === "ai" && (
            <TouchableOpacity
              onPress={() => playTextToSpeech(item.text!)}
              style={styles.playButton}
            >
              <Ionicons name="volume-high" size={24} color="#4A90E2" />
            </TouchableOpacity>
          )}
        </View>
      ) : item.audio ? (
        <TouchableOpacity
          onPress={() => playSound(item.audio!, item.id)}
          disabled={isPlaying && playingAudioId !== item.id}
          style={styles.audioButton}
        >
          <Ionicons
            name={isPlaying && playingAudioId === item.id ? "pause" : "play"}
            size={24}
            color="white"
          />
          <Text style={styles.audioButtonText}>
            {isPlaying && playingAudioId === item.id ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Practice Session: {category}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
      <View style={styles.sideButtonsContainer}>
        <TouchableOpacity
          style={styles.sideButton}
          onPress={() => setExamplesModalVisible(true)}
        >
          <Ionicons name="list" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sideButton}
          onPress={() => setIdeasModalVisible(true)}
        >
          <Ionicons name="bulb" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.recordingButton]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons name="mic" size={40} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={examplesModalVisible}
        onRequestClose={() => setExamplesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.modalTitle}>Example Answers</Text>
              <Text>Here are some example answers...</Text>
              {/* Add your example content here */}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setExamplesModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={ideasModalVisible}
        onRequestClose={() => setIdeasModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.modalTitle}>Ideas to Consider</Text>
              <Text>Here are some ideas to consider...</Text>
              {/* Add your ideas content here */}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIdeasModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
