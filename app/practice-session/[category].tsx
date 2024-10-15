import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  ListRenderItem,
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import styles from "../../styles/practice-session.styles";

const { width, height } = Dimensions.get("window");

interface PracticeQuestions {
  [key: string]: string;
}

const practiceQuestions: PracticeQuestions = {
  "part-1": "What do you do in your free time?",
  "part-2":
    "Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like visiting this place.",
  "part-3": "How do you think leisure activities will change in the future?",
};

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

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initialQuestion = getPracticeQuestion();
    setMessages([
      {
        id: "1",
        text: initialQuestion,
        sender: "ai",
      },
    ]);
    playTextToSpeech(initialQuestion);

    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | undefined;
    if (isRecording) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      animationLoop.start();
    } else {
      pulseAnim.setValue(1);
      if (animationLoop) {
        animationLoop.stop();
      }
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isRecording]);

  const playTextToSpeech = async (text: string) => {
    try {
      const encodedText = encodeURIComponent(text);
      const { sound: newSound } = await Audio.Sound.createAsync(
        {
          uri: `https://s2tvrgs9-4300.euw.devtunnels.ms/api/v1/audio/stream?text=${encodedText}`,
        },
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

  const getPracticeQuestion = (): string => {
    return category && practiceQuestions[category]
      ? practiceQuestions[category]
      : "No question available for this category.";
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

          // Simulate API response
          setTimeout(() => {
            const aiResponse =
              "I've received your audio message. Could you please elaborate more on your answer?";
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: aiResponse,
              sender: "ai",
            };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
            playTextToSpeech(aiResponse);
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
