import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import TileGrid, { TOTAL_TILES } from '../components/TileGrid';
import GuessInput from '../components/GuessInput';
import ScoreDisplay from '../components/ScoreDisplay';
import { dailyChallengeApi } from '../services/api';
import { DailyChallengeResponse } from '../types';

type GameState = 'loading' | 'playing' | 'won' | 'lost' | 'error';

export default function GameScreen() {
  const [challenge, setChallenge] = useState<DailyChallengeResponse | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<GameState>('loading');
  const [score, setScore] = useState<number | null>(null);
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [celebrityName, setCelebrityName] = useState<string | null>(null);
  const [celebrityInfo, setCelebrityInfo] = useState<{
    nationality: string;
    fieldOfExpertise: string;
    dateOfBirth: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadChallenge = useCallback(async () => {
    setGameState('loading');
    setScore(null);
    setGuessesUsed(0);
    setCelebrityName(null);
    setCelebrityInfo(null);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const data = await dailyChallengeApi.getToday();
      setChallenge(data);
      setRevealedTiles(new Set([data.initialTileIndex]));
      setGameState('playing');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load challenge'
      );
      setGameState('error');
    }
  }, []);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const getNextTileToReveal = useCallback((): number => {
    const unrevealed: number[] = [];
    for (let i = 0; i < TOTAL_TILES; i++) {
      if (!revealedTiles.has(i)) {
        unrevealed.push(i);
      }
    }
    if (unrevealed.length === 0) return -1;
    // Deterministic order based on challenge date
    return unrevealed[0];
  }, [revealedTiles]);

  const handleGuess = async (guess: string) => {
    if (!challenge || gameState !== 'playing') return;

    setGuessesUsed((prev) => prev + 1);

    try {
      const result = await dailyChallengeApi.submitGuess({
        celebrityId: challenge.celebrityId,
        guess,
        tilesRevealed: revealedTiles.size,
      });

      if (result.correct) {
        setScore(result.pointsAwarded);
        setCelebrityName(result.celebrityName);
        if (result.nationality && result.fieldOfExpertise && result.dateOfBirth) {
          setCelebrityInfo({
            nationality: result.nationality,
            fieldOfExpertise: result.fieldOfExpertise,
            dateOfBirth: result.dateOfBirth,
          });
        }
        setFeedback(null);
        setGameState('won');
        // Reveal all tiles on win
        const allTiles = new Set<number>();
        for (let i = 0; i < TOTAL_TILES; i++) allTiles.add(i);
        setRevealedTiles(allTiles);
      } else if (result.gameOver) {
        setScore(0);
        setCelebrityName(result.celebrityName);
        if (result.nationality && result.fieldOfExpertise && result.dateOfBirth) {
          setCelebrityInfo({
            nationality: result.nationality,
            fieldOfExpertise: result.fieldOfExpertise,
            dateOfBirth: result.dateOfBirth,
          });
        }
        setFeedback(null);
        setGameState('lost');
        // Reveal all tiles on loss
        const allTiles = new Set<number>();
        for (let i = 0; i < TOTAL_TILES; i++) allTiles.add(i);
        setRevealedTiles(allTiles);
      } else {
        // Wrong guess — reveal another tile
        const nextTile = getNextTileToReveal();
        if (nextTile >= 0) {
          setRevealedTiles((prev) => new Set([...prev, nextTile]));
        }
        setFeedback(`Wrong! Try again. ${Math.max(0, TOTAL_TILES - revealedTiles.size - 1)} points available.`);
      }
    } catch (err) {
      setFeedback('Failed to submit guess. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (gameState === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading today's challenge...</Text>
      </View>
    );
  }

  if (gameState === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChallenge}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Celebrity IQ</Text>
      <Text style={styles.subtitle}>
        {challenge?.date ? `Daily Challenge - ${challenge.date}` : 'Daily Challenge'}
      </Text>

      {challenge && (
        <TileGrid imageUrl={challenge.imageUrl} revealedTiles={revealedTiles} />
      )}

      <ScoreDisplay
        tilesRevealed={revealedTiles.size}
        totalTiles={TOTAL_TILES}
        score={score}
        guessesUsed={guessesUsed}
      />

      {feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {(gameState === 'won' || gameState === 'lost') && celebrityName && (
        <View
          style={[
            styles.resultContainer,
            gameState === 'won' ? styles.resultWon : styles.resultLost,
          ]}
        >
          <Text style={styles.resultTitle}>
            {gameState === 'won' ? 'Correct!' : 'Game Over'}
          </Text>
          <Text style={styles.resultName}>{celebrityName}</Text>
          {celebrityInfo && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Nationality: {celebrityInfo.nationality}
              </Text>
              <Text style={styles.infoText}>
                Field: {celebrityInfo.fieldOfExpertise}
              </Text>
              <Text style={styles.infoText}>
                Born: {formatDate(celebrityInfo.dateOfBirth)}
              </Text>
            </View>
          )}
          <Text style={styles.resultScore}>
            {score !== null && score > 0
              ? `You earned ${score} point${score !== 1 ? 's' : ''}!`
              : 'Better luck tomorrow!'}
          </Text>
        </View>
      )}

      <GuessInput
        onSubmit={handleGuess}
        disabled={gameState !== 'playing'}
        placeholder={
          gameState === 'playing'
            ? 'Enter celebrity name...'
            : 'Come back tomorrow for a new challenge!'
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorIcon: {
    fontSize: 48,
    fontWeight: '800',
    color: '#e74c3c',
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
    borderRadius: 32,
    backgroundColor: '#ffeaea',
    marginBottom: 16,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  feedbackText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultContainer: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultWon: {
    backgroundColor: '#d4edda',
  },
  resultLost: {
    backgroundColor: '#f8d7da',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  resultName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  infoContainer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  resultScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
  },
});
