import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { celebrityApi } from '../services/api';
import { AdminStackParamList } from '../types';

type EditRoute = RouteProp<AdminStackParamList, 'AdminEdit'>;

export default function AdminEditScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditRoute>();
  const existingCelebrity = route.params?.celebrity;
  const isEditing = !!existingCelebrity;

  const [name, setName] = useState(existingCelebrity?.name ?? '');
  const [nationality, setNationality] = useState(existingCelebrity?.nationality ?? '');
  const [fieldOfExpertise, setFieldOfExpertise] = useState(
    existingCelebrity?.fieldOfExpertise ?? ''
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    existingCelebrity?.dateOfBirth
      ? new Date(existingCelebrity.dateOfBirth).toISOString().split('T')[0]
      : ''
  );
  const [imageUrl, setImageUrl] = useState(existingCelebrity?.imageUrl ?? '');
  const [saving, setSaving] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required';
    if (!nationality.trim()) return 'Nationality is required';
    if (!fieldOfExpertise.trim()) return 'Field of Expertise is required';
    if (!dateOfBirth.trim()) return 'Date of Birth is required';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return 'Date format must be YYYY-MM-DD';
    if (!imageUrl.trim()) return 'Image URL is required';
    return null;
  };

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      showError(error);
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        nationality: nationality.trim(),
        fieldOfExpertise: fieldOfExpertise.trim(),
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        imageUrl: imageUrl.trim(),
      };

      if (isEditing) {
        await celebrityApi.update(existingCelebrity.id, data);
      } else {
        await celebrityApi.create(data);
      }
      navigation.goBack();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>
        {isEditing ? 'Edit Celebrity' : 'Add Celebrity'}
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Tom Hanks"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="e.g. 1956-07-09"
          placeholderTextColor="#aaa"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nationality *</Text>
        <TextInput
          style={styles.input}
          value={nationality}
          onChangeText={setNationality}
          placeholder="e.g. American"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Field of Expertise *</Text>
        <TextInput
          style={styles.input}
          value={fieldOfExpertise}
          onChangeText={setFieldOfExpertise}
          placeholder="e.g. Acting, Music, Sports"
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Image URL *</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/photo.jpg"
          placeholderTextColor="#aaa"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Celebrity' : 'Add Celebrity'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
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
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  saveButton: {
    height: 50,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#b8b5d1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});
