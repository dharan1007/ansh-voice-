import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../theme';

function tagColor(tag) {
  switch (tag) {
    case 'joy': return '#1DB954';
    case 'sadness': return '#3B82F6';
    case 'anger': return '#EF4444';
    case 'fear': return '#A855F7';
    case 'surprise': return '#F59E0B';
    case 'disgust': return '#10B981';
    case 'neutral': return '#9AA3AE';
    default: return '#9AA3AE';
  }
}

export default function ResultScreen({ route }) {
  const { result } = route.params || {};
  const { text, emotion, scores, explanation, diagnostics } = result || {};
  const [showDiag, setShowDiag] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>You said</Text>
        <Text style={styles.transcript}>{text || '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Detected emotion</Text>
        <View style={[styles.chip, { backgroundColor: tagColor(emotion) + '33', borderColor: tagColor(emotion) }]}>
          <Text style={[styles.chipText, { color: tagColor(emotion) }]}>{emotion || 'neutral'}</Text>
        </View>

        {scores ? (
          <View style={{ marginTop: 12 }}>
            {Object.entries(scores).map(([k, v]) => (
              <Text key={k} style={styles.scoreLine}>{k}: {(v * 100).toFixed(1)}%</Text>
            ))}
          </View>
        ) : null}

        {!!explanation && <Text style={styles.explain}>Why: {explanation}</Text>}

        {diagnostics?.features ? (
          <>
            <Pressable onPress={() => setShowDiag(s => !s)} style={styles.diagBtn}>
              <Text style={styles.diagBtnText}>{showDiag ? 'Hide' : 'Show'} diagnostics</Text>
            </Pressable>
            {showDiag && (
              <View style={styles.diagBox}>
                {Object.entries(diagnostics.features).map(([k, v]) => (
                  <Text key={k} style={styles.diagLine}>{k}: {String(v)}</Text>
                ))}
              </View>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border
  },
  label: { color: colors.subtext, fontSize: 13, marginBottom: 8 },
  transcript: { color: colors.text, fontSize: 16, lineHeight: 22 },
  chip: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 4 },
  chipText: { fontWeight: '700', textTransform: 'capitalize' },
  scoreLine: { color: colors.subtext, fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  explain: { color: colors.subtext, marginTop: 12, fontStyle: 'italic' },
  diagBtn: { marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  diagBtnText: { color: colors.info, fontWeight: '600' },
  diagBox: { marginTop: 8, backgroundColor: '#0E1219', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: colors.border },
  diagLine: { color: colors.subtext, fontSize: 12, marginVertical: 1 }
});