import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import GameScreen from '../../screens/GameScreen';
import { dailyChallengeApi } from '../../services/api';

jest.mock('../../services/api', () => ({
  dailyChallengeApi: {
    getToday: jest.fn(),
    submitGuess: jest.fn(),
  },
  celebrityApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGetToday = dailyChallengeApi.getToday as jest.Mock;
const mockSubmitGuess = dailyChallengeApi.submitGuess as jest.Mock;

const MOCK_CHALLENGE = {
  challengeId: 'ch1',
  celebrityId: 'cel1',
  imageUrl: 'https://example.com/photo.jpg',
  initialTileIndex: 0,
  date: '2026-02-18',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GameScreen', () => {
  describe('loading state', () => {
    it('shows loading indicator while fetching challenge', async () => {
      // Never resolves — stays in loading state
      mockGetToday.mockReturnValue(new Promise(() => {}));

      render(<GameScreen />);

      expect(screen.getByText(/loading/i)).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('shows an error message when the API fails', async () => {
      mockGetToday.mockRejectedValue(new Error('No celebrities available'));

      render(<GameScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No celebrities available/i)).toBeTruthy();
      });
    });

    it('shows a Retry button on error', async () => {
      mockGetToday.mockRejectedValue(new Error('Network error'));

      render(<GameScreen />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeTruthy();
      });
    });

    it('retries loading when Retry is pressed', async () => {
      mockGetToday
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(MOCK_CHALLENGE);

      render(<GameScreen />);

      await waitFor(() => screen.getByText('Retry'));
      fireEvent.press(screen.getByText('Retry'));

      await waitFor(() => {
        expect(mockGetToday).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('playing state', () => {
    beforeEach(() => {
      mockGetToday.mockResolvedValue(MOCK_CHALLENGE);
    });

    it('shows the game title', async () => {
      render(<GameScreen />);
      await waitFor(() => {
        expect(screen.getByText('Celebrity IQ')).toBeTruthy();
      });
    });

    it('shows the challenge date', async () => {
      render(<GameScreen />);
      await waitFor(() => {
        expect(screen.getByText(/2026-02-18/)).toBeTruthy();
      });
    });

    it('shows the guess input when game is active', async () => {
      render(<GameScreen />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter celebrity name...')).toBeTruthy();
      });
    });

    it('shows the Guess button', async () => {
      render(<GameScreen />);
      await waitFor(() => {
        expect(screen.getByText('Guess')).toBeTruthy();
      });
    });

    it('increments guesses used after submitting', async () => {
      mockSubmitGuess.mockResolvedValue({
        correct: false,
        pointsAwarded: 0,
        gameOver: false,
      });

      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Wrong Name');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText('1')).toBeTruthy(); // 1 guess used
      });
    });

    it('shows wrong-guess feedback after an incorrect guess', async () => {
      mockSubmitGuess.mockResolvedValue({
        correct: false,
        pointsAwarded: 0,
        gameOver: false,
      });

      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Wrong Name');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText(/Wrong!/i)).toBeTruthy();
      });
    });
  });

  describe('win state', () => {
    beforeEach(() => {
      mockGetToday.mockResolvedValue(MOCK_CHALLENGE);
      mockSubmitGuess.mockResolvedValue({
        correct: true,
        pointsAwarded: 5,
        gameOver: true,
        celebrityName: 'Tom Hanks',
        nationality: 'American',
        fieldOfExpertise: 'Acting',
        dateOfBirth: '1956-07-09T00:00:00Z',
      });
    });

    it('shows "Correct!" on a winning guess', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Tom Hanks');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText('Correct!')).toBeTruthy();
      });
    });

    it('displays the celebrity name after a correct guess', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Tom Hanks');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText('Tom Hanks')).toBeTruthy();
      });
    });

    it('displays the celebrity nationality after winning', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Tom Hanks');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText(/American/)).toBeTruthy();
      });
    });

    it('disables the guess input after winning', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Tom Hanks');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Come back tomorrow/i);
        expect(input.props.editable).toBe(false);
      });
    });
  });

  describe('game over state', () => {
    beforeEach(() => {
      mockGetToday.mockResolvedValue(MOCK_CHALLENGE);
      mockSubmitGuess.mockResolvedValue({
        correct: false,
        pointsAwarded: 0,
        gameOver: true,
        celebrityName: 'Tom Hanks',
        nationality: 'American',
        fieldOfExpertise: 'Acting',
        dateOfBirth: '1956-07-09T00:00:00Z',
      });
    });

    it('shows "Game Over" when all tiles are revealed', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Wrong');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText('Game Over')).toBeTruthy();
      });
    });

    it('reveals the celebrity name on game over', async () => {
      render(<GameScreen />);
      await waitFor(() => screen.getByPlaceholderText('Enter celebrity name...'));

      fireEvent.changeText(screen.getByPlaceholderText('Enter celebrity name...'), 'Wrong');
      await act(async () => {
        fireEvent.press(screen.getByText('Guess'));
      });

      await waitFor(() => {
        expect(screen.getByText('Tom Hanks')).toBeTruthy();
      });
    });
  });
});
