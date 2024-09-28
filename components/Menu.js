// components/Menu.js
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';

const Menu = ({ data, setData }) => {
  const theme = useTheme();

  // Function to pick an image for a specific menu item
  const pickMenuItemImage = async (index) => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Update the specific menu item's image URI
      const updatedMenuItems = data.menuItems.map((item, i) => {
        if (i === index) {
          return { ...item, image: result.assets[0].uri };
        }
        return item;
      });
      setData({ ...data, menuItems: updatedMenuItems });
    }
  };

  // Function to remove the image from a specific menu item
  const removeMenuItemImage = (index) => {
    const updatedMenuItems = data.menuItems.map((item, i) => {
      if (i === index) {
        return { ...item, image: null };
      }
      return item;
    });
    setData({ ...data, menuItems: updatedMenuItems });
  };

  // Function to add a new menu item
  const addMenuItem = () => {
    setData({
      ...data,
      menuItems: [...data.menuItems, { itemName: '', price: '', image: null }],
    });
  };

  // Function to remove a menu item
  const removeMenuItem = (index) => {
    const updatedMenu = data.menuItems.filter((_, i) => i !== index);
    setData({
      ...data,
      menuItems: updatedMenu,
    });
  };

  // Function to update a specific field of a menu item
  const updateMenuItem = (index, field, value) => {
    const updatedMenu = data.menuItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setData({
      ...data,
      menuItems: updatedMenu,
    });
  };

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      <View style={styles.field}>
        <Text style={styles.label}>Add Menu Items</Text>
        {data.menuItems.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            {/* Item Name */}
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={item.itemName}
              onChangeText={(text) => updateMenuItem(index, 'itemName', text)}
            />
            {/* Price */}
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={item.price}
              onChangeText={(text) => updateMenuItem(index, 'price', text)}
              keyboardType="numeric"
            />
            {/* Image Upload Button */}
            <TouchableOpacity onPress={() => pickMenuItemImage(index)} style={styles.imageButton}>
              <Icon name="image" size={24} color="#1E90FF" />
              <Text style={styles.imageButtonText}>Add Image</Text>
            </TouchableOpacity>
            {/* Display Selected Image */}
            {item.image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
                <TouchableOpacity onPress={() => removeMenuItemImage(index)} style={styles.removeImageButton}>
                  <Icon name="x-circle" size={24} color="#FF0000" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noImageText}>No image attached</Text>
            )}
            {/* Move the trash icon to the bottom right */}
            <TouchableOpacity 
              onPress={() => removeMenuItem(index)} 
              style={styles.trashIcon}
            >
              <Icon name="trash-2" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        ))}
        <Button mode="outlined" onPress={addMenuItem} icon="plus" textColor='black'>
          Add Menu Item
        </Button>
      </View>
    </View>
  );
};

export default Menu;

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
  menuItem: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    position: 'relative', // Allow absolute positioning inside
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageButtonText: {
    color: '#1E90FF',
    fontSize: 16,
    marginLeft: 4,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  removeImageButton: {
    padding: 4,
  },
  noImageText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  trashIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8, // Position it at the bottom right corner
    padding: 4,
  },
});
