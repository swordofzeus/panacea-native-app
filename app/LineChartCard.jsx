import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import DropDownPicker from 'react-native-dropdown-picker';
import CardComponent from './Card'; // Adjust the import path

const LineChartCard = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState(Object.keys(metrics)[0] || '');
  const [open, setOpen] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  // Example of the medication start date index (assuming the data corresponds to months)
  const medicationStartIndex = 3; // This corresponds to "Apr"
  const chartSpacing = screenWidth / (metrics[selectedMetric]?.data.length + 1); // Dynamically calculate spacing

  const renderLineChart = (selectedMetricData) => {
    const { data, lowerBound, upperBound } = selectedMetricData;

    return (
      <View>
        {/* Custom Vertical Line */}
        <View
          style={[
            styles.verticalLine,
            {
              left: medicationStartIndex * chartSpacing + chartSpacing / 2,
            },
          ]}
        >
          <Text style={styles.verticalLineLabel}>10mg Metropotrol</Text>
        </View>
        <LineChart
          data={data} // Patient data
          data2={lowerBound.map((point) => ({
            ...point,
            dashedLineConfig: { dashWidth: 5, dashGap: 5 }, // Lower bound dotted line
          }))}
          data3={upperBound.map((point) => ({
            ...point,
            dashedLineConfig: { dashWidth: 5, dashGap: 5 }, // Upper bound dotted line
          }))}
          curved
          verticalLines={[
            {
              value: 3, // Vertical line at the "Start Date"
              color: 'blue',
              thickness: 2,
              label: 'Start Date',
              labelStyle: { color: 'blue', fontSize: 10 },
              labelPosition: 'top',
            },
          ]}
          style={{ marginTop: 100 }} // Increase margin to prevent overlap
          isAnimated
          showVerticalLines
          hideRules={false}
          rulesColor="lightgray"
          xAxisColor="gray"
          yAxisColor="gray"
          yAxisTextStyle={{ color: '#333', fontSize: 12 }}
          xAxisTextStyle={{ color: '#333', fontSize: 12 }}
          yAxisLabelWidth={30}
          areaChart
          thickness={2.5}
          spacing={screenWidth / (data.length + 1)}
          height={250}
          width={screenWidth - 50}
          startFillColor="rgba(84, 219, 234, 1)"
          endFillColor="rgba(84, 219, 234, 1)"
          startOpacity={0.2}
          endOpacity={0.6}
          dataPointsColor="#007AFF"
          dataPointsRadius={5}
          noOfVerticalLines={data.length - 1}
          color="blue"
          color2="red" // Lower bound color
          color3="green" // Upper bound color
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
            <Text style={styles.legendText}>Patient Data</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>Lower Bound</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'green' }]} />
            <Text style={styles.legendText}>Upper Bound</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <CardComponent
      title="Metrics"
      description="Heart rate improved 15% since starting metropotrol and within bounds for the past 2 weeks"
    >
      <DropDownPicker
        open={open}
        value={selectedMetric}
        items={Object.keys(metrics).map((key) => ({
          label: metrics[key]?.title || key,
          value: key,
        }))}
        setOpen={setOpen}
        setValue={setSelectedMetric}
        placeholder="Select Metric"
        style={{
          backgroundColor: '#f5f5f5',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 40,
          marginBottom: 20,
        }}
        dropDownContainerStyle={{
          borderColor: '#ccc',
        }}
      />
      {metrics[selectedMetric] && renderLineChart(metrics[selectedMetric])}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    height: 250,
    width: 2,
    backgroundColor: '#007ACC', // Changed to a neutral blue shade
    top: 10, // Adjusted to leave space for dropdown
  },
  verticalLineLabel: {
    position: 'absolute',
    top: -25, // Moved higher above the dropdown
    left: -25,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007ACC',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
});

export default LineChartCard;
