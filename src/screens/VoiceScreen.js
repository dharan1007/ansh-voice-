import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import MicButton from '../components/MicButton';
import { transcribeVerbose, classifyEmotion } from '../services/openaiClient';
import { computeProsodyFeatures, normalizeScores } from '../services/features';

export default function VoiceScreen({ navigation }) {
  const recordingRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission required', 'Please allow microphone access.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
    } catch (e) { console.error(e); Alert.alert('Error', 'Could not start recording.'); }
  };

  const stopRecording = async () => {
    try {
      setRecording(false);
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      if (!uri) return;

      setLoading(true);
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) throw new Error('No audio file');

      const filename = uri.split('/').pop() || 'recording.m4a';
      const verbose = await transcribeVerbose(uri, filename);
      const text = (verbose.text || '').trim();
      const segments = verbose.segments || [];

      const features = computeProsodyFeatures(segments);
      const tinyHint = (text.split(/\s+/).filter(Boolean).length <= 2);

      const cls = await classifyEmotion({ text, features, tinyHint });
      const scores = normalizeScores(cls.scores);
      const result = {
        text,
        emotion: cls.label || 'neutral',
        scores,
        explanation: cls.explanation || '',
        dimensions: cls.dimensions || { valence: 0, arousal: 0.5 },
        diagnostics: { features }
      };

      setLoading(false);
      navigation.navigate('Result', { result });
    } catch (e) { console.error(e); setLoading(false); Alert.alert('Error', e.message || 'Analysis failed.'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.prompt}>
          Hold the mic and speak. We analyze both content and delivery — tuned to work even for a single word.
        </Text>
      </View>

      <MicButton
        recording={recording}
        loading={loading}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'space-between' },
  bubble: { backgroundColor: '#12151C', borderRadius: 16, padding: 16, width: '100%', marginTop: 24, borderWidth: 1, borderColor: '#1E242F' },
  prompt: { fontSize: 16, lineHeight: 22 }
});
