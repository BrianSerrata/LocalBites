// screens/ProfileCreationScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Alert 
} from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import BasicInfo from '../components/BasicInfo';
import LocationPicker from '../components/Location'; // Updated import
import Menu from '../components/Menu';
import OwnerStory from '../components/OwnerStory';
import Pricing from '../components/Pricing';
import { firestore, auth, storage } from '../firebase';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadImageAsync } from '../utils/uploadImageAsync';

const ProfileCreationScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);

  // State for all form fields
  const [basicInfo, setBasicInfo] = useState({
    restaurantName: '',
    description: '',
    logo: null, // URI of the selected image (optional)
  });

  const [locationInfo, setLocationInfo] = useState({
    address: '',
  });

  const [menuInfo, setMenuInfo] = useState({
    menuItems: [], // Array of menu items with optional images
  });

  const [ownerStory, setOwnerStory] = useState({
    story: '',
    storyImage: null, // URI of the selected image
  });

  const [pricing, setPricing] = useState({
    plan: 'free',
  });

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    // Validate all steps before submission
    if (!basicInfo.restaurantName || !basicInfo.description) {
      Alert.alert('Error', 'Please complete all required fields in Basic Info.');
      return;
    }
    if (!locationInfo.address) {
      Alert.alert('Error', 'Please complete all required fields in Location.');
      return;
    }
    if (menuInfo.menuItems.length === 0) {
      Alert.alert('Error', 'Please add at least one menu item.');
      return;
    }
    if (!ownerStory.story || !ownerStory.storyImage) {
      Alert.alert('Error', 'Please complete all required fields in Owner Story.');
      return;
    }
    // Pricing is optional depending on your requirements

    setLoading(true);

    try {
      // Upload logo if it exists
      const logoURL = basicInfo.logo
        ? await uploadImageAsync(
            basicInfo.logo,
            `logos/${auth.currentUser.uid}/${Date.now()}`
          )
        : null;

      // Upload menu item images if they exist
      const updatedMenuItems = await Promise.all(
        menuInfo.menuItems.map(async (item) => {
          if (item.image) {
            const imageURL = await uploadImageAsync(
              item.image,
              `menuImages/${auth.currentUser.uid}/${Date.now()}`
            );
            return { ...item, image: imageURL };
          }
          return item;
        })
      );

      // Upload storyImage
      const storyImageURL = ownerStory.storyImage
        ? await uploadImageAsync(
            ownerStory.storyImage,
            `storyImages/${auth.currentUser.uid}/${Date.now()}`
          )
        : null;

      // Prepare restaurant data with uploaded image URLs
      const restaurantData = {
        restaurantName: basicInfo.restaurantName,
        description: basicInfo.description,
        logo: logoURL, // Will be null if not provided
        address: locationInfo.address,
        menuItems: updatedMenuItems,
        ownerStory: ownerStory.story,
        storyImage: storyImageURL,
        plan: pricing.plan,
        createdAt: serverTimestamp(),
      };

      // Add restaurant to Firestore
      const docRef = await addDoc(collection(firestore, 'restaurants'), restaurantData);

      // Update user's document with restaurantId
      const userId = auth.currentUser.uid;
      await setDoc(doc(firestore, 'users', userId), { restaurantId: docRef.id }, { merge: true });

      setLoading(false);
      Alert.alert('Success', 'Profile created successfully!');
      navigation.navigate('Home');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      console.error('Error creating profile:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#E0EAFC', '#CFDEF3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient} // Apply gradient style
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Your Restaurant Profile</Text>
        <Text style={styles.subtitle}>Step {step} of {totalSteps}</Text>
        <ProgressBar progress={step / totalSteps} color="#1E90FF" style={styles.progressBar} />

        <View style={styles.content}>
          {step === 1 && <BasicInfo data={basicInfo} setData={setBasicInfo} />}
          {step === 2 && <LocationPicker data={locationInfo} setData={setLocationInfo} />}
          {step === 3 && <Menu data={menuInfo} setData={setMenuInfo} />}
          {step === 4 && <OwnerStory data={ownerStory} setData={setOwnerStory} />}
          {step === 5 && <Pricing data={pricing} setData={setPricing} />}
        </View>

        <View style={styles.navigationButtons}>
          <Button 
            mode="outlined" 
            onPress={prevStep} 
            disabled={step === 1} 
            style={styles.button} 
            buttonColor='white' 
            textColor='black'
          >
            <Text>Previous</Text>
          </Button>
          {step < totalSteps ? (
            <Button 
              mode="contained" 
              onPress={nextStep} 
              style={styles.button} 
              buttonColor='#484848'
            >
              <Text style={styles.buttonText}>Next</Text>
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleFinish} 
              style={styles.button} 
              loading={loading} 
              disabled={loading}
              buttonColor='#1E90FF'
            >
              <Text style={styles.buttonText}>Finish</Text>
            </Button>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileCreationScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1, // Ensure gradient fills the screen
  },
  container: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  content: {
    marginBottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 0.45,
  },
  buttonText: {
    color: '#fff',
  },
});
