import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import LineChartCard from './LineChartCard'; // Adjust the path based on your folder structure
import PieChartCard from './PieChartCard'; // Assuming PieChartCard is another separate component
import { Button } from 'react-native';
import router, { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native';

const metrics = {
  'Heart Rate': {
    title: 'Heart Rate Trends',
    data: [
      { value: 95, label: 'Jan' },  // High heart rate
      { value: 110, label: 'Feb' },
      { value: 85, label: 'Mar' },
      { value: 90, label: 'Apr' },
      { value: 78, label: 'May' },
      { value: 75, label: 'Jun' },  // Within normal bounds
    ],
    lowerBound: [
      { value: 60, label: 'Jan' },
      { value: 62, label: 'Feb' },
      { value: 63, label: 'Mar' },
      { value: 64, label: 'Apr' },
      { value: 65, label: 'May' },
      { value: 66, label: 'Jun' },
    ],
    upperBound: [
      { value: 85, label: 'Jan' },
      { value: 85, label: 'Feb' },
      { value: 85, label: 'Mar' },
      { value: 85, label: 'Apr' },
      { value: 85, label: 'May' },
      { value: 85, label: 'Jun' },
    ],
  },
  'Blood Pressure': {
    title: 'Blood Pressure Trends',
    data: [
      { value: 145, label: 'Jan' }, // Hypertensive
      { value: 138, label: 'Feb' },
      { value: 132, label: 'Mar' },
      { value: 125, label: 'Apr' },
      { value: 122, label: 'May' },
      { value: 120, label: 'Jun' }, // Controlled
    ],
    lowerBound: [
      { value: 100, label: 'Jan' },
      { value: 101, label: 'Feb' },
      { value: 102, label: 'Mar' },
      { value: 103, label: 'Apr' },
      { value: 104, label: 'May' },
      { value: 105, label: 'Jun' },
    ],
    upperBound: [
      { value: 140, label: 'Jan' },
      { value: 140, label: 'Feb' },
      { value: 140, label: 'Mar' },
      { value: 140, label: 'Apr' },
      { value: 140, label: 'May' },
      { value: 140, label: 'Jun' },
    ],
  },
  'Stress Levels': {
    title: 'Stress Levels Trends',
    data: [
      { value: 50, label: 'Jan' },  // Start higher
      { value: 40, label: 'Feb' },  // Slight drop
      { value: 55, label: 'Mar' },  // Further improvement
      { value: 40, label: 'Apr' },  // Minor uptick
      { value: 35, label: 'May' },  // Clear improvement
      { value: 39, label: 'Jun' },  // Stabilizing
    ],
    lowerBound: [
      { value: 20, label: 'Jan' },
      { value: 21, label: 'Feb' },
      { value: 22, label: 'Mar' },
      { value: 23, label: 'Apr' },
      { value: 24, label: 'May' },
      { value: 25, label: 'Jun' },
    ],
    upperBound: [
      { value: 40, label: 'Jan' },
      { value: 41, label: 'Feb' },
      { value: 42, label: 'Mar' },
      { value: 43, label: 'Apr' },
      { value: 44, label: 'May' },
      { value: 45, label: 'Jun' },
    ],
  }
};

const pieChartData = [
  { value: 40, color: '#4A90E2', text: 'Migrane' },
  { value: 25, color: '#9013FE', text: 'Loss of Taste' },
  { value: 35, color: '#7B61FF', text: 'Acute Pain' },
  { value: 5, color: '#4C4AFF', text: 'Blurred Vision' },
];

const HomeScreen = () => {
  const navigator = useNavigation()
  const router = useRouter()
  return (
    <ScrollView style={styles.container}>
       <Button
        title="Go to Questionnairee2"
        onPress={() => navigator.navigate("Questionnaire")}
      />
      <LineChartCard metrics={metrics} />
      <PieChartCard data={pieChartData} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default HomeScreen;
