import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function MicButton({ recording, loading, onPressIn, onPressOut }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [recording]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={loading}
          style={({ pressed }) => [
            styles.mic,
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 }
          ]}
        >
          <View style={styles.dot} />
        </Pressable>
      </Animated.View>
      <Text style={styles.caption}>
        {loading ? 'Analyzing…' : (recording ? 'Release to stop' : 'Hold to talk')}
      </Text>
      {loading ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  mic: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8
  },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.bg },
  caption: { color: colors.subtext, marginTop: 10, fontSize: 14 }
});
