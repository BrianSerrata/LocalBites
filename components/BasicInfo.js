// components/BasicInfo.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const BasicInfo = ({ data, setData }) => {
  const pickLogo = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.5,
    });

    if (!result.canceled) {
      setData({
        ...data,
        logo: result.assets[0].uri,
      });
    }
  };

  return (
      <View style={styles.container}>
        {/* Restaurant Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your restaurant's name"
            value={data.restaurantName}
            onChangeText={(text) => setData({ ...data, restaurantName: text })}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe your restaurant"
            value={data.description}
            onChangeText={(text) => setData({ ...data, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Upload Logo (Optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Upload Logo (Optional)</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickLogo}>
            <Icon name="camera" size={20} color="#000" style={styles.icon} />
            <Text style={styles.uploadText}>Choose File</Text>
          </TouchableOpacity>
          {data.logo ? (
            <Image source={{ uri: data.logo }} style={styles.logoPreview} />
          ) : (
            <Text style={styles.noFileText}>No file chosen</Text>
          )}
        </View>
      </View>
  );
};

export default BasicInfo;

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  container: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top', // For Android
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  icon: {
    marginRight: 8,
  },
  uploadText: {
    color: '#1E90FF',
    fontSize: 16,
  },
  noFileText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  logoPreview: {
    marginTop: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
