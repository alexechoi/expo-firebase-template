import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';
import { api } from '../../../../lib/api';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [apiMessage, setApiMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testApiCall = async () => {
    try {
      const response = await api.get<{ message: string, user: any }>('/');
      setApiMessage(response.message);
      setError('');
    } catch (err) {
      setError('Failed to connect to API');
      console.error('API Error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Home</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(authenticated)/(tabs)/profile' as unknown as RelativePathString)}
      >
        <Text style={styles.buttonText}>View Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testApiCall}
      >
        <Text style={styles.buttonText}>Test API Connection</Text>
      </TouchableOpacity>

      {apiMessage ? (
        <Text style={styles.message}>{apiMessage}</Text>
      ) : null}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    color: '#2e7d32',
  },
  error: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    color: '#c62828',
  }
}); 