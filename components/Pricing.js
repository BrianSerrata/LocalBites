// components/Pricing.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RadioButton, useTheme } from 'react-native-paper';

const Pricing = ({ data, setData }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Choose Your Plan */}
      <View style={styles.field}>
        <Text style={styles.label}>Choose Your Plan</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setData({ ...data, plan: newValue })}
          value={data.plan}
        >
          <View style={styles.radioOption}>
            <RadioButton value="free" />
            <View style={styles.planDetails}>
              <Text style={styles.planName}>Free Plan</Text>
              <Text style={styles.planDescription}>Basic features to get you started</Text>
            </View>
            <Text style={styles.planPrice}>$0/mo</Text>
          </View>
        </RadioButton.Group>
      </View>

      {/* Informational Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>No credit card required</Text>
      </View>
    </View>
  );
};

export default Pricing;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  planDetails: {
    flex: 1,
    marginLeft: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#555',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
});
