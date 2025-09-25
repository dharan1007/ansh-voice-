import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Tap below to start voice emotion analysis</Text>

      <Pressable
        onPress={() => navigation.navigate('Voice')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9AA3AE', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#1DB954', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
