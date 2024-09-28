// components/RegisterPaywall.js

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  ScrollView 
} from 'react-native';
import { Button, Card, TextInput, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient'; // Use 'react-native-linear-gradient' if not using Expo
import { auth, firestore } from '../firebase'; // Ensure this path is correct
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const RegisterPaywall = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Optional: Uncomment if you decide to add confirm password
  // const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleRegister = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Optional: Uncomment if you add confirm password
    // if (password !== confirmPassword) {
    //   Alert.alert('Error', 'Passwords do not match.');
    //   return;
    // }

    // Email format validation (basic regex)
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Password strength validation (minimum 6 characters)
    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Firebase sign-up
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        // Add more user-related fields as needed
        // Example:
        // preferences: {},
        // bookmarks: [],
      });

      setLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('User Onboarding'), // Adjust navigation route as needed
        },
      ]);
    } catch (error) {
      setLoading(false);
      let errorMessage = 'An error occurred during registration.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      Alert.alert('Registration Failed', errorMessage);
      console.error('Registration Error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#fbc2eb', '#a6c1ee']} // Gradient colors matching the Next.js version
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <MaterialCommunityIcons 
                name="silverware-fork-knife" 
                size={48} 
                color="black" 
                style={styles.icon} 
              />
              <Title style={styles.title}>LocalBites</Title>
            </View>
            <Paragraph style={styles.description}>
              Discover and savor the best local flavors tailored just for you
            </Paragraph>

            {/* Features Section */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <MaterialCommunityIcons 
                  name="map-marker-outline" 
                  size={32} 
                  color="black" 
                  style={styles.featureIcon} 
                />
                <Text style={styles.featureTitle}>Explore Local Gems</Text>
                <Text style={styles.featureDescription}>
                  Uncover hidden culinary treasures in your neighborhood
                </Text>
              </View>
              <View style={styles.feature}>
                <MaterialCommunityIcons 
                  name="heart-outline" 
                  size={32} 
                  color="black" 
                  style={styles.featureIcon} 
                />
                <Text style={styles.featureTitle}>Personalized Recommendations</Text>
                <Text style={styles.featureDescription}>
                  Get food suggestions based on your tastes and dietary needs
                </Text>
              </View>
              <View style={styles.feature}>
                <MaterialCommunityIcons 
                  name="store-outline" 
                  size={32} 
                  color="black" 
                  style={styles.featureIcon} 
                />
                <Text style={styles.featureTitle}>Support Local Businesses</Text>
                <Text style={styles.featureDescription}>
                  Help your community thrive by dining at local eateries
                </Text>
              </View>
            </View>

            {/* Email Input */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon name="email" color="#6200ee" />}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon name="lock" color="#6200ee" />}
            />

            {/* Optional: Confirm Password Input */}
            {/* 
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon name="lock" color="#6200ee" />}
            />
            */}

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              icon={loading ? 'loading' : 'arrow-right'}
              disabled={loading}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Registering...' : 'Start Your Culinary Journey'}
            </Button>
          </Card.Content>

          {/* Footer Text */}
          <Card.Actions>
            <Text style={styles.footerText}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Card.Actions>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
};

export default RegisterPaywall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // No backgroundColor when using LinearGradient
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400, // Matching max-width from Next.js (max-w-4xl ~ 576px)
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    borderRadius: 12,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    color: 'black', // Primary color
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent', // To match the card's background
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: 'black', // Primary color
    height: 48,
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row-reverse', // Place icon on the right
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8, // Space between text and icon
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    flex: 1,
  },
});
