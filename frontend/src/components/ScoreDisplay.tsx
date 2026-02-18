import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreDisplayProps {
  tilesRevealed: number;
  totalTiles: number;
  score: number | null;
  guessesUsed: number;
}

export default function ScoreDisplay({
  tilesRevealed,
  totalTiles,
  score,
  guessesUsed,
}: ScoreDisplayProps) {
  const possiblePoints = Math.max(0, totalTiles - tilesRevealed);

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{tilesRevealed}/{totalTiles}</Text>
        <Text style={styles.statLabel}>Tiles Revealed</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={[styles.statValue, styles.pointsValue]}>
          {score !== null ? score : possiblePoints}
        </Text>
        <Text style={styles.statLabel}>
          {score !== null ? 'Points Earned' : 'Points Available'}
        </Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statValue}>{guessesUsed}</Text>
        <Text style={styles.statLabel}>Guesses Used</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  pointsValue: {
    color: '#6c5ce7',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
});
