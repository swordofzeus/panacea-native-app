import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import CardComponent from './Card';

const PatientMetricsGraph = () => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.85;

  const metrics = [
    {
        name: "Hours Slept",
        description: "Lunesta appears to be working well for you after the 4th week you were in the top 5% of improved patients based on analysis of over 1000 patients in similar demographics",
        barData: [
            { value: 6.0, label: "Wk1" },
            { value: 6.5, label: "Wk2" },
            { value: 7.0, label: "Wk3" },
            { value: 7.2, label: "Wk4" },
            { value: 7.5, label: "Wk5" },
            { value: 7.8, label: "Wk6" },
            { value: 8.0, label: "Wk7" },
        ],
        lineData: [
            { value: 3.5 },
            { value: 5.5 },
            { value: 5.7 },
            { value: 7.2 },
            { value: 7.5 },
            { value: 7.8 },
            { value: 8.0 },
        ],
        legend: [
            { color: "#7CB9E8", label: "You" },
            { color: "rgba(202, 121, 224, 0.8)", label: "Expected Sleep (Other Patients)" },
        ],
    },
    {
        name: "Sleep Latency",
        description: "Time taken to fall asleep (in minutes).",
        barData: [
            { value: 45, label: "Mon" },
            { value: 40, label: "Tue" },
            { value: 35, label: "Wed" },
            { value: 30, label: "Thu" },
            { value: 25, label: "Fri" },
            { value: 20, label: "Sat" },
            { value: 18, label: "Sun" },
        ],
        lineData: [
            { value: 45 },
            { value: 40 },
            { value: 35 },
            { value: 30 },
            { value: 25 },
            { value: 20 },
            { value: 18 },
        ],
        legend: [
            { color: "#7CB9E8", label: "Patient Latency Data" },
            { color: "rgba(255, 182, 193, 0.8)", label: "Expected Latency (Other Patients)" },
        ],
    },
];

  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);
  const selectedMetric = metrics[selectedMetricIndex];

  const renderTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabContainer}
    >
      {metrics.map((metric, index) => (
        <Text
          key={metric.name}
          style={[
            styles.tab,
            index === selectedMetricIndex && styles.selectedTab,
          ]}
          onPress={() => setSelectedMetricIndex(index)}
        >
          {metric.name}
        </Text>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <CardComponent
        title="Patient Metrics"
        style={styles.card}
        description={selectedMetric.description}
      >
        {renderTabs()}
        <Text style={styles.graphTitle}>{selectedMetric.name}</Text>
        <View style={styles.chartContainer}>
          <BarChart
            isAnimated
            animationDuration={800}
            initialSpacing={10}
            data={selectedMetric.barData}
            barWidth={22}
            spacing={30}
            roundedTop
            hideRules={false}
            hideYAxisText={false}
            yAxisLabelWidth={40}
            yAxisLabelTextStyle={styles.yAxisLabel}
            cappedBars
            capThickness={4}
            capColor={selectedMetric.legend[0].color}
            height={250}
            lineData={selectedMetric.lineData}
            showGradient
            opacity={0.8}
            frontColor={selectedMetric.legend[0].color}
            gradientColor={selectedMetric.legend[1].color}
            showLine
            lineConfig={{
              color: selectedMetric.legend[0].color,
              thickness: 2,
              hideDataPoints: false,
              curved: true,
            }}
          />
        </View>
        <View style={styles.legendContainer}>
          {selectedMetric.legend.map((item, index) => (
            <View key={index} style={styles.legendRow}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </CardComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    flex: 1,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 10,
    overflow: 'hidden',
    borderRadius: 10,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  tabContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tab: {
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 5,
  },
  selectedTab: {
    borderBottomColor: '#8e44ad', // Highlight color for selected tab
    color: '#8e44ad',
    fontWeight: 'bold',
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  legendContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingHorizontal: 15,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#8e44ad',
  },
});

export default PatientMetricsGraph;
