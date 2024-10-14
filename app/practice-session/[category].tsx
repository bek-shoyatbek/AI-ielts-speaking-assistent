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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

const practiceQuestions = {
  "part-1": "What do you do in your free time?",
  "part-2":
    "Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like visiting this place.",
  "part-3": "How do you think leisure activities will change in the future?",
};

export default function PracticeSession() {
  const { category } = useLocalSearchParams();
  const [messages, setMessages] = useState<any>([]);
  const [recording, setRecording] = useState();
  const [sound, setSound] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [examplesModalVisible, setExamplesModalVisible] = useState(false);
  const [ideasModalVisible, setIdeasModalVisible] = useState(false);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: getPracticeQuestion(),
        sender: "ai",
      },
    ]);

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
    let animationLoop;
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

  const getPracticeQuestion = () => {
    return (
      practiceQuestions[category as keyof typeof practiceQuestions] ||
      "No question available for this category."
    );
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
    } catch (err) {
      Alert.alert("Failed to start recording", err.message);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      const userMessage = {
        id: Date.now().toString(),
        audio: uri,
        sender: "user",
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: "I've received your audio message. Could you please elaborate more on your answer?",
          sender: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }, 1000);
    } catch (err) {
      Alert.alert("Failed to stop recording", err.message);
    }
  }

  async function playSound(audio, messageId) {
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
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlayingAudioId(null);
        }
      });
    } catch (err) {
      Alert.alert("Failed to play sound", err.message);
    }
  }

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.text ? (
        <Text
          style={[
            styles.messageText,
            item.sender === "ai" && styles.aiMessageText,
          ]}
        >
          {item.text}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => playSound(item.audio, item.id)}
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
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Practice Session: {category}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 15,
    paddingBottom: 100, // Add extra padding at the bottom to account for the buttons
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  aiMessageText: {
    color: "#000",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sideButtonsContainer: {
    position: "absolute",
    bottom: 90, // Adjust this value to change the distance from the bottom
    right: 20,
    flexDirection: "column",
  },
  sideButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  micButton: {
    backgroundColor: "#4A90E2",
    padding: 20,
    borderRadius: 40,
  },
  recordingButton: {
    backgroundColor: "red",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 10,
    borderRadius: 20,
  },
  audioButtonText: {
    color: "#fff",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxHeight: height * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
