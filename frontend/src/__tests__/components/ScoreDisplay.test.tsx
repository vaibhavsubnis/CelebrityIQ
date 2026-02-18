import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ScoreDisplay from '../../components/ScoreDisplay';

describe('ScoreDisplay', () => {
  const defaultProps = {
    tilesRevealed: 1,
    totalTiles: 6,
    score: null,
    guessesUsed: 0,
  };

  describe('tiles revealed stat', () => {
    it('renders tiles revealed as X/totalTiles', () => {
      render(<ScoreDisplay {...defaultProps} tilesRevealed={2} totalTiles={6} />);
      expect(screen.getByText('2/6')).toBeTruthy();
    });

    it('renders label "Tiles Revealed"', () => {
      render(<ScoreDisplay {...defaultProps} />);
      expect(screen.getByText('Tiles Revealed')).toBeTruthy();
    });
  });

  describe('points display', () => {
    it('shows points available (6 - tilesRevealed) when score is null', () => {
      render(<ScoreDisplay {...defaultProps} tilesRevealed={1} score={null} />);
      // 6 - 1 = 5 points available
      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('Points Available')).toBeTruthy();
    });

    it('shows points available as 0 when all tiles are revealed and score is null', () => {
      render(<ScoreDisplay {...defaultProps} tilesRevealed={6} score={null} />);
      expect(screen.getByText('0')).toBeTruthy();
    });

    it('shows earned score when score prop is set', () => {
      render(<ScoreDisplay {...defaultProps} tilesRevealed={3} score={3} />);
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('Points Earned')).toBeTruthy();
    });

    it('shows 0 points earned when player guessed too late', () => {
      render(<ScoreDisplay {...defaultProps} score={0} />);
      expect(screen.getByText('Points Earned')).toBeTruthy();
    });
  });

  describe('guesses used stat', () => {
    it('renders guesses used count', () => {
      render(<ScoreDisplay {...defaultProps} guessesUsed={3} />);
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('Guesses Used')).toBeTruthy();
    });

    it('shows 0 guesses used on game start', () => {
      render(<ScoreDisplay {...defaultProps} guessesUsed={0} />);
      expect(screen.getByText('Guesses Used')).toBeTruthy();
    });
  });

  describe('all three stat boxes together', () => {
    it('renders all three stat labels simultaneously', () => {
      render(<ScoreDisplay {...defaultProps} />);
      expect(screen.getByText('Tiles Revealed')).toBeTruthy();
      expect(screen.getByText('Points Available')).toBeTruthy();
      expect(screen.getByText('Guesses Used')).toBeTruthy();
    });
  });
});
