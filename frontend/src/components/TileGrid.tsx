import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';

const GRID_COLS = 3;
const GRID_ROWS = 2;
const TOTAL_TILES = GRID_COLS * GRID_ROWS;

interface TileGridProps {
  imageUrl: string;
  revealedTiles: Set<number>;
}

export default function TileGrid({ imageUrl, revealedTiles }: TileGridProps) {
  const screenWidth = Math.min(Dimensions.get('window').width - 32, 450);
  const tileWidth = screenWidth / GRID_COLS;
  const tileHeight = tileWidth * 0.75;
  const gridHeight = tileHeight * GRID_ROWS;

  const tiles = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const index = row * GRID_COLS + col;
      const isRevealed = revealedTiles.has(index);

      tiles.push(
        <View
          key={index}
          style={[
            styles.tile,
            {
              width: tileWidth,
              height: tileHeight,
              left: col * tileWidth,
              top: row * tileHeight,
            },
          ]}
        >
          {isRevealed ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: screenWidth,
                  height: gridHeight,
                  position: 'absolute',
                  left: -(col * tileWidth),
                  top: -(row * tileHeight),
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.covered}>
              <View style={styles.questionMark}>
                <View style={styles.questionMarkInner} />
              </View>
            </View>
          )}
        </View>
      );
    }
  }

  return (
    <View style={[styles.grid, { width: screenWidth, height: gridHeight }]}>
      {tiles}
    </View>
  );
}

export { TOTAL_TILES };

const styles = StyleSheet.create({
  grid: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  tile: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  covered: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMarkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
