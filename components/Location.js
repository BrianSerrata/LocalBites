// components/LocationPicker.js
import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';

const LocationPicker = ({ data, setData }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Address Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your restaurant's address"
          value={data.address}
          onChangeText={(text) => setData({ ...data, address: text })}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
      </View>
    </View>
  );
};

export default LocationPicker;

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
});
