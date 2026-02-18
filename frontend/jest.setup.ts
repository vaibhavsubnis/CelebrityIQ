import '@testing-library/jest-native/extend-expect';

// Silence non-actionable React Navigation warnings in tests
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: (callback: () => void) => callback(),
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Silence the Animated warning about native driver in tests
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
