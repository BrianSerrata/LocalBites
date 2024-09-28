// components/OwnerStory.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';

const OwnerStory = ({ data, setData }) => {
  const theme = useTheme();

  const pickStoryImage = async () => {
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
      aspect: [4, 3], // Aspect ratio for images
      quality: 0.5,
    });

    if (!result.canceled) {
      setData({
        ...data,
        storyImage: result.assets[0].uri,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Owner Story */}
      <View style={styles.field}>
        <Text style={styles.label}>Your Restaurant's Story</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Share your journey and values"
          value={data.story}
          onChangeText={(text) => setData({ ...data, story: text })}
          multiline
          numberOfLines={6}
        />
      </View>

      {/* Upload Story Image */}
      <View style={styles.field}>
        <Text style={styles.label}>Upload Story Image</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={pickStoryImage}>
          <Icon name="camera" size={20} color="#000" style={styles.icon} />
          <Text style={styles.uploadText}>Choose File</Text>
        </TouchableOpacity>
        {data.storyImage ? (
          <Image source={{ uri: data.storyImage }} style={styles.storyImage} />
        ) : (
          <Text style={styles.noFileText}>No file chosen</Text>
        )}
      </View>
    </View>
  );
};

export default OwnerStory;

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
  },
  textarea: {
    height: 150,
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
  storyImage: {
    marginTop: 8,
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
