import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import LineChartCard from './LineChartCard'; // Adjust the path based on your folder structure
import PieChartCard from './PieChartCard'; // Assuming PieChartCard is another separate component

const metrics = {
  'Metric A': {
    title: 'Heart Rate Trends',
    data: [
      { value: 60, label: 'Jan' },
      { value: 72, label: 'Feb' },
      { value: 55, label: 'Mar' },
      { value: 90, label: 'Apr' },
      { value: 85, label: 'May' },
      { value: 65, label: 'Jun' },
    ],
    lowerBound: [
      { value: 10, label: 'Jan' },
      { value: 20, label: 'Feb' },
      { value: 20, label: 'Mar' },
      { value: 20, label: 'Apr' },
      { value: 20, label: 'May' },
      { value: 19, label: 'Jun' },
    ],
    upperBound: [
      { value: 85, label: 'Jan' },
      { value: 80, label: 'Feb' },
      { value: 80, label: 'Mar' },
      { value: 80, label: 'Apr' },
      { value: 80, label: 'May' },
      { value: 80, label: 'Jun' },
    ],
  },
};

const pieChartData = [
  { value: 40, color: '#4A90E2', text: 'Category A' },
  { value: 25, color: '#9013FE', text: 'Category B' },
  { value: 15, color: '#7B61FF', text: 'Category C' },
  { value: 20, color: '#4C4AFF', text: 'Category D' },
];

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
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
