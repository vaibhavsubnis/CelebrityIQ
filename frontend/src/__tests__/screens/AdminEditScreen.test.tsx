import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AdminEditScreen from '../../screens/AdminEditScreen';
import { celebrityApi } from '../../services/api';

jest.mock('../../services/api', () => ({
  celebrityApi: {
    create: jest.fn(),
    update: jest.fn(),
  },
  dailyChallengeApi: {
    getToday: jest.fn(),
    submitGuess: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: jest.fn(),
}));

const mockCreate = celebrityApi.create as jest.Mock;
const mockUpdate = celebrityApi.update as jest.Mock;

const EXISTING_CELEBRITY = {
  id: 'cel1',
  name: 'Tom Hanks',
  dateOfBirth: '1956-07-09T00:00:00Z',
  nationality: 'American',
  fieldOfExpertise: 'Acting',
  imageUrl: 'https://example.com/tom.jpg',
  createdAt: '',
  updatedAt: '',
};

function setupRoute(celebrity?: typeof EXISTING_CELEBRITY) {
  const { useRoute } = require('@react-navigation/native');
  (useRoute as jest.Mock).mockReturnValue({ params: { celebrity } });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminEditScreen', () => {
  describe('add mode (no existing celebrity)', () => {
    beforeEach(() => setupRoute(undefined));

    it('shows "Add Celebrity" heading', () => {
      render(<AdminEditScreen />);
      expect(screen.getByText('Add Celebrity')).toBeTruthy();
    });

    it('renders all required form fields', () => {
      render(<AdminEditScreen />);
      expect(screen.getByPlaceholderText(/Tom Hanks/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/1956-07-09/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/American/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/Acting/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/https:\/\/example/i)).toBeTruthy();
    });

    it('renders empty fields when adding a new celebrity', () => {
      render(<AdminEditScreen />);
      const nameInput = screen.getByPlaceholderText(/Tom Hanks/i);
      expect(nameInput.props.value).toBe('');
    });

    it('shows "Add Celebrity" on the save button', () => {
      render(<AdminEditScreen />);
      expect(screen.getByText('Add Celebrity')).toBeTruthy();
    });

    it('calls create API with form values on save', async () => {
      mockCreate.mockResolvedValue({ ...EXISTING_CELEBRITY, id: 'new-id' });

      render(<AdminEditScreen />);

      fireEvent.changeText(screen.getByPlaceholderText(/Tom Hanks/i), 'New Celebrity');
      fireEvent.changeText(screen.getByPlaceholderText(/1956-07-09/i), '1990-01-15');
      fireEvent.changeText(screen.getByPlaceholderText(/American/i), 'British');
      fireEvent.changeText(screen.getByPlaceholderText(/Acting/i), 'Music');
      fireEvent.changeText(screen.getByPlaceholderText(/https:\/\/example/i), 'https://img.com/photo.jpg');

      await act(async () => {
        fireEvent.press(screen.getAllByText('Add Celebrity')[0]);
      });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Celebrity',
            nationality: 'British',
            fieldOfExpertise: 'Music',
            imageUrl: 'https://img.com/photo.jpg',
          })
        );
      });
    });

    it('navigates back after successful creation', async () => {
      mockCreate.mockResolvedValue({ ...EXISTING_CELEBRITY, id: 'new-id' });

      render(<AdminEditScreen />);

      fireEvent.changeText(screen.getByPlaceholderText(/Tom Hanks/i), 'Celebrity Name');
      fireEvent.changeText(screen.getByPlaceholderText(/1956-07-09/i), '1990-01-15');
      fireEvent.changeText(screen.getByPlaceholderText(/American/i), 'British');
      fireEvent.changeText(screen.getByPlaceholderText(/Acting/i), 'Music');
      fireEvent.changeText(
        screen.getByPlaceholderText(/https:\/\/example/i),
        'https://img.com/photo.jpg'
      );

      await act(async () => {
        fireEvent.press(screen.getAllByText('Add Celebrity')[0]);
      });

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe('edit mode (existing celebrity)', () => {
    beforeEach(() => setupRoute(EXISTING_CELEBRITY));

    it('shows "Edit Celebrity" heading', () => {
      render(<AdminEditScreen />);
      expect(screen.getByText('Edit Celebrity')).toBeTruthy();
    });

    it('pre-fills the name field with the existing celebrity name', () => {
      render(<AdminEditScreen />);
      const nameInput = screen.getByPlaceholderText(/Tom Hanks/i);
      expect(nameInput.props.value).toBe('Tom Hanks');
    });

    it('pre-fills the nationality field', () => {
      render(<AdminEditScreen />);
      const nationalityInput = screen.getByPlaceholderText(/American/i);
      expect(nationalityInput.props.value).toBe('American');
    });

    it('pre-fills the field of expertise', () => {
      render(<AdminEditScreen />);
      const fieldInput = screen.getByPlaceholderText(/Acting/i);
      expect(fieldInput.props.value).toBe('Acting');
    });

    it('shows "Update Celebrity" on the save button', () => {
      render(<AdminEditScreen />);
      expect(screen.getByText('Update Celebrity')).toBeTruthy();
    });

    it('calls update API with celebrity id and form values on save', async () => {
      mockUpdate.mockResolvedValue(undefined);

      render(<AdminEditScreen />);

      // Change the name
      fireEvent.changeText(screen.getByPlaceholderText(/Tom Hanks/i), 'Tom Hanks Updated');

      await act(async () => {
        fireEvent.press(screen.getByText('Update Celebrity'));
      });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          'cel1',
          expect.objectContaining({ name: 'Tom Hanks Updated' })
        );
      });
    });

    it('navigates back after successful update', async () => {
      mockUpdate.mockResolvedValue(undefined);

      render(<AdminEditScreen />);

      await act(async () => {
        fireEvent.press(screen.getByText('Update Celebrity'));
      });

      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalled();
      });
    });
  });

  describe('validation', () => {
    beforeEach(() => setupRoute(undefined));

    it('alerts when name is empty', async () => {
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert');

      render(<AdminEditScreen />);
      await act(async () => {
        fireEvent.press(screen.getAllByText('Add Celebrity')[0]);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name is required');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('alerts when date format is invalid', async () => {
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert');

      render(<AdminEditScreen />);
      fireEvent.changeText(screen.getByPlaceholderText(/Tom Hanks/i), 'Valid Name');
      fireEvent.changeText(screen.getByPlaceholderText(/1956-07-09/i), '07/09/1956');

      await act(async () => {
        fireEvent.press(screen.getAllByText('Add Celebrity')[0]);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Date format must be YYYY-MM-DD');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('alerts when image URL is empty', async () => {
      const { Alert } = require('react-native');
      jest.spyOn(Alert, 'alert');

      render(<AdminEditScreen />);
      fireEvent.changeText(screen.getByPlaceholderText(/Tom Hanks/i), 'Valid Name');
      fireEvent.changeText(screen.getByPlaceholderText(/1956-07-09/i), '1990-01-15');
      fireEvent.changeText(screen.getByPlaceholderText(/American/i), 'British');
      fireEvent.changeText(screen.getByPlaceholderText(/Acting/i), 'Music');
      // Leave imageUrl empty

      await act(async () => {
        fireEvent.press(screen.getAllByText('Add Celebrity')[0]);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Image URL is required');
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    beforeEach(() => setupRoute(undefined));

    it('navigates back when Cancel is pressed', () => {
      render(<AdminEditScreen />);
      fireEvent.press(screen.getByText('Cancel'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
