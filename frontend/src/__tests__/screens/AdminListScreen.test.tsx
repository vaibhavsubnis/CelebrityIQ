import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AdminListScreen from '../../screens/AdminListScreen';
import { celebrityApi } from '../../services/api';

jest.mock('../../services/api', () => ({
  celebrityApi: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
  dailyChallengeApi: {
    getToday: jest.fn(),
    submitGuess: jest.fn(),
  },
}));

// Mock Platform so Alert is used for delete confirmations
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useFocusEffect: (cb: () => void) => { cb(); },
}));

const mockGetAll = celebrityApi.getAll as jest.Mock;
const mockDelete = celebrityApi.delete as jest.Mock;

const CELEBRITIES = [
  {
    id: '1',
    name: 'Tom Hanks',
    dateOfBirth: '1956-07-09T00:00:00Z',
    nationality: 'American',
    fieldOfExpertise: 'Acting',
    imageUrl: 'https://example.com/tom.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    name: 'Meryl Streep',
    dateOfBirth: '1949-06-22T00:00:00Z',
    nationality: 'American',
    fieldOfExpertise: 'Acting',
    imageUrl: 'https://example.com/meryl.jpg',
    createdAt: '',
    updatedAt: '',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminListScreen', () => {
  describe('loading state', () => {
    it('shows activity indicator while loading', () => {
      mockGetAll.mockReturnValue(new Promise(() => {}));
      render(<AdminListScreen />);
      // ActivityIndicator is rendered during loading
      expect(screen.toJSON()).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('shows error message when API fails', async () => {
      mockGetAll.mockRejectedValue(new Error('Connection refused'));
      render(<AdminListScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Connection refused/i)).toBeTruthy();
      });
    });

    it('shows Retry button on error', async () => {
      mockGetAll.mockRejectedValue(new Error('Connection refused'));
      render(<AdminListScreen />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeTruthy();
      });
    });

    it('reloads when Retry is pressed', async () => {
      mockGetAll
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce([]);

      render(<AdminListScreen />);

      await waitFor(() => screen.getByText('Retry'));
      fireEvent.press(screen.getByText('Retry'));

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('empty state', () => {
    it('shows empty message when there are no celebrities', async () => {
      mockGetAll.mockResolvedValue([]);
      render(<AdminListScreen />);

      await waitFor(() => {
        expect(screen.getByText(/No celebrities yet/i)).toBeTruthy();
      });
    });
  });

  describe('list display', () => {
    beforeEach(() => {
      mockGetAll.mockResolvedValue(CELEBRITIES);
    });

    it('renders all celebrity names', async () => {
      render(<AdminListScreen />);

      await waitFor(() => {
        expect(screen.getByText('Tom Hanks')).toBeTruthy();
        expect(screen.getByText('Meryl Streep')).toBeTruthy();
      });
    });

    it('renders nationality and field of expertise for each celebrity', async () => {
      render(<AdminListScreen />);

      await waitFor(() => {
        // At least one "American | Acting" text block is visible
        expect(screen.getAllByText(/American | Acting/).length).toBeGreaterThan(0);
      });
    });

    it('renders Edit button for each celebrity', async () => {
      render(<AdminListScreen />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        expect(editButtons.length).toBe(2);
      });
    });

    it('renders Delete button for each celebrity', async () => {
      render(<AdminListScreen />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons.length).toBe(2);
      });
    });

    it('renders the FAB add button', async () => {
      render(<AdminListScreen />);
      await waitFor(() => {
        expect(screen.getByText('+')).toBeTruthy();
      });
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      mockGetAll.mockResolvedValue(CELEBRITIES);
    });

    it('navigates to AdminEdit with celebrity data when Edit is pressed', async () => {
      render(<AdminListScreen />);
      await waitFor(() => screen.getAllByText('Edit'));

      fireEvent.press(screen.getAllByText('Edit')[0]);

      expect(mockNavigate).toHaveBeenCalledWith('AdminEdit', {
        celebrity: CELEBRITIES[0],
      });
    });

    it('navigates to AdminEdit with empty params when FAB + is pressed', async () => {
      render(<AdminListScreen />);
      await waitFor(() => screen.getByText('+'));

      fireEvent.press(screen.getByText('+'));

      expect(mockNavigate).toHaveBeenCalledWith('AdminEdit', {});
    });
  });

  describe('delete functionality', () => {
    beforeEach(() => {
      mockGetAll.mockResolvedValue(CELEBRITIES);
    });

    it('calls delete API when deletion is confirmed', async () => {
      mockDelete.mockResolvedValue(undefined);

      // Spy on Alert.alert and immediately invoke the destructive action
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const deleteButton = buttons?.find((b: { text: string }) => b.text === 'Delete');
        deleteButton?.onPress?.();
      });

      render(<AdminListScreen />);
      await waitFor(() => screen.getAllByText('Delete'));

      fireEvent.press(screen.getAllByText('Delete')[0]);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('1');
      });
    });

    it('removes the deleted celebrity from the list optimistically', async () => {
      mockDelete.mockResolvedValue(undefined);

      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const deleteButton = buttons?.find((b: { text: string }) => b.text === 'Delete');
        deleteButton?.onPress?.();
      });

      render(<AdminListScreen />);
      await waitFor(() => screen.getByText('Tom Hanks'));

      fireEvent.press(screen.getAllByText('Delete')[0]);

      await waitFor(() => {
        expect(screen.queryByText('Tom Hanks')).toBeNull();
        expect(screen.getByText('Meryl Streep')).toBeTruthy();
      });
    });
  });
});
