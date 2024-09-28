// components/OnboardingWorkflow.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProgressBar, Button, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable'; // For animations

const UserOnboarding = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    foodPreferences: [],
    priceRange: [],
    allergens: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const totalSteps = 3;

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    const currentUser = auth.currentUser;
    console.log('Fetching preferences for user:', currentUser ? currentUser.uid : 'No user');
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        console.log('User document exists:', userDoc.exists());
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User data:', data);
          setPreferences({
            foodPreferences: data.foodPreferences || [],
            priceRange: data.priceRange || [],
            allergens: data.allergens || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        showSnackbar('Failed to load your preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No authenticated user found. Redirecting to Login.');
      setLoading(false);
      navigation.navigate('Login');
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await savePreferences();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updatePreferences = (key, value) => {
    setPreferences((prev) => {
      if (Array.isArray(prev[key])) {
        // Toggle selection for multi-select
        return {
          ...prev,
          [key]: prev[key].includes(value)
            ? prev[key].filter((item) => item !== value)
            : [...prev[key], value],
        };
      }
      // For single-select
      return { ...prev, [key]: value };
    });
  };

  const isSelected = (key, value) => {
    return Array.isArray(preferences[key])
      ? preferences[key].includes(value)
      : preferences[key] === value;
  };

  const renderCards = (items, key) => {
    return (
      <View style={styles.cardsContainer}>
        {items.map((item) => (
          <Animatable.View 
            key={item} 
            animation="fadeInUp" 
            delay={100} 
            duration={500}
            style={styles.cardWrapper}
          >
            <TouchableOpacity 
              onPress={() => updatePreferences(key, item)} 
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={item}
              accessibilityState={{ selected: isSelected(key, item) }}
            >
              <Card
                style={[
                  styles.card,
                  isSelected(key, item) ? styles.cardSelected : styles.cardUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected(key, item) ? styles.textSelected : styles.textUnselected,
                  ]}
                >
                  {item}
                </Text>
              </Card>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>
    );
  };

  const savePreferences = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showSnackbar('You need to be logged in to complete onboarding.');
      navigation.navigate('Login');
      return;
    }

    // Validation
    if (preferences.foodPreferences.length === 0 || preferences.priceRange.length === 0) {
      showSnackbar('Please select at least one food preference and a price range.');
      return;
    }

    setSubmitting(true);
    try {
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        foodPreferences: preferences.foodPreferences,
        priceRange: preferences.priceRange,
        allergens: preferences.allergens,
        preferencesUpdatedAt: serverTimestamp(),
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          ...userData,
          createdAt: serverTimestamp(),
          bookmarks: [],
          ratings: {},
        });
      }

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: 'Preferences saved successfully!',
        visibilityTime: 3000,
        autoHide: true,
      });

      navigation.navigate('Restaurant Discovery');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showSnackbar('Failed to save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbar({ visible: true, message });
  };

  const hideSnackbar = () => {
    setSnackbar({ visible: false, message: '' });
  };

  const getProgress = () => {
    return (step / totalSteps) * 100;
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Food Preferences</Text>
            {renderCards(['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'], 'foodPreferences')}
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Preferred Price Range</Text>
            {renderCards(['$', '$$', '$$$'], 'priceRange')}
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Allergens</Text>
            {renderCards(['Nuts', 'Dairy', 'Shellfish', 'Eggs', 'Soy', 'Wheat'], 'allergens')}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Welcome to LocalBites</Text>
          <ProgressBar progress={getProgress() / 100} color="#6200ee" style={styles.progressBar} />

          {renderContent()}

          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              onPress={handleBack}
              disabled={step === 1 || submitting}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              accessibilityLabel="Go Back"
            >
              Back
            </Button>
            <Button
              mode="contained"
              onPress={handleNext}
              loading={submitting}
              disabled={submitting}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              accessibilityLabel={step === totalSteps ? 'Finish Onboarding' : 'Go to Next Step'}
            >
              {step === totalSteps ? 'Finish' : 'Next'}
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Snackbar for Error Messages */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => {
            hideSnackbar();
          },
        }}
      >
        {snackbar.message}
      </Snackbar>

      {/* Toast Message Container */}
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0C3FC', // Light purple background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  innerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6200ee', // Primary color
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%', // Adjust to fit two cards per row
    marginBottom: 16,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 20, // Added padding for better content spacing
  },
  cardSelected: {
    backgroundColor: '#6200ee', // Primary color
  },
  cardUnselected: {
    backgroundColor: '#f0f0f0', // Light gray
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  textSelected: {
    color: '#ffffff', // White text
  },
  textUnselected: {
    color: '#333333', // Dark text
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    width: '45%', // Ensure buttons are consistent in width
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserOnboarding;
