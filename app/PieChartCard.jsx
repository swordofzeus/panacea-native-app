import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import CardComponent from './Card'; // Ensure correct import path

const PieChartCard = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <CardComponent title="Side Effects">No data available</CardComponent>;
  }

  return (
    <CardComponent title="Side Effects"
      description="All side effects you experience are common for the medications you are taking. Consult your doctor for adjustments if they become too severe"
    >
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          donut
          radius={100}
          innerRadius={60}
          // showText
          textSize={10}
          textColor="white"
          centerLabelComponent={() => (
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Side Effects</Text>
          )}
        />
      </View>
      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{`${item.text} - ${item.value}%`}</Text>
          </View>
        ))}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center', // Center the PieChart horizontally
    justifyContent: 'center', // Center the PieChart vertically (if applicable)
    marginVertical: 20, // Add some spacing
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});

export default PieChartCard;
