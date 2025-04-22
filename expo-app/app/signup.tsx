import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const router = useRouter();
  const { createUserDocument } = useAuth();

  const handleSignup = async () => {
    try {
      if (!privacyPolicy) {
        setError('You must accept the privacy policy');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUserDocument({
        ...formData,
        marketingConsent,
        privacyPolicy,
      });

      router.replace('/profile');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({...formData, password: text})}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData({...formData, firstName: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData({...formData, lastName: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({...formData, phone: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={formData.dateOfBirth}
        onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
      />

      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => setMarketingConsent(!marketingConsent)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>{marketingConsent ? '☑' : '□'} I agree to receive marketing communications</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => setPrivacyPolicy(!privacyPolicy)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>{privacyPolicy ? '☑' : '□'} I accept the privacy policy</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
}); 