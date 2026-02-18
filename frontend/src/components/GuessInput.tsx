import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function GuessInput({
  onSubmit,
  disabled,
  placeholder = 'Enter celebrity name...',
}: GuessInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || disabled) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        editable={!disabled}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
        autoCapitalize="words"
        autoCorrect={false}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={disabled || text.trim().length === 0}
      >
        <Text style={styles.buttonText}>Guess</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  button: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b8b5d1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
