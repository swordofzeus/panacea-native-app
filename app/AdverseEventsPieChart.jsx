import React from "react";
import { View, StyleSheet, Text } from "react-native";
import PieChart from "react-native-pie-chart";
import Card from "./Card";

const AdverseEventsPieChart = ({ adverseEvents, summary }) => {
  if (!adverseEvents || adverseEvents.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No adverse events data available.</Text>
      </View>
    );
  }

  // Sort adverse events by percentage in descending order
  const sortedAdverseEvents = [...adverseEvents].sort(
    (a, b) => b.percentage - a.percentage
  );

  // Separate top 15 events and the rest
  const topAdverseEvents = sortedAdverseEvents.slice(0, 15);
  const otherAdverseEvents = sortedAdverseEvents.slice(15);

  // Calculate "Other" percentage
  const otherPercentage = otherAdverseEvents.reduce(
    (sum, event) => sum + event.percentage,
    0
  );

  // Prepare data for the chart
  const data = topAdverseEvents.map((event) => event.percentage);
  const labels = topAdverseEvents.map((event) => event.event);

  if (otherPercentage > 0) {
    data.push(otherPercentage);
    labels.push("Other");
  }

  // Extend colors if needed
  const colors = [
    "#8e44ad", // Dark Purple
    "#6c5ce7", // Light Indigo
    "#4834d4", // Deep Blue
    "#74b9ff", // Light Blue
    "#00cec9", // Teal
    "#a29bfe", // Lavender
    "#dfe6e9", // Soft Grey-Blue
    "#2d3436", // Charcoal
    "#b2bec3", // Light Slate
    "#636e72", // Dark Slate,
    "#f39c12", // Orange
    "#e74c3c", // Red
    "#16a085", // Green
    "#2980b9", // Bold Blue
    "#f1c40f", // Yellow
    "#95a5a6", // Light Gray
  ];

  return (
    <Card title="Adverse Events" description={summary}>
      <View style={styles.container}>
        <PieChart
          widthAndHeight={200}
          series={data}
          sliceColor={colors.slice(0, data.length)}
          doughnut={true}
          coverRadius={0.5}
          coverFill="#FFF"
        />
        <View style={styles.legendContainer}>
          {labels.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColorBox,
                  { backgroundColor: colors[index % colors.length] },
                ]}
              />
              <Text style={styles.legendText}>
                {label}: {data[index].toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  legendContainer: {
    marginTop: 20,
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
});

export default AdverseEventsPieChart;
