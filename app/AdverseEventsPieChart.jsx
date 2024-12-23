import React from "react";
import { View, StyleSheet, Text } from "react-native";
import PieChart from "react-native-pie-chart";
import Card from "./Card";

const AdverseEventsPieChart = ({ adverseEvents, summary }) => {
  console.log({adverseEvents})
  if (!adverseEvents|| adverseEvents.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No adverse events data available.</Text>
      </View>
    );
  }

  const data = adverseEvents.map((event) => event.percentage);
  const labels = adverseEvents.map((event) => event.event);
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
    "#636e72", // Dark Slate
];

  return (
    <Card title="Adverse Events" description={summary}>
    <View style={styles.container}>
      {/* <Text style={styles.title}>Adverse Events</Text> */}
      <PieChart
        widthAndHeight={200}
        series={data}
        sliceColor={colors.slice(0,adverseEvents.length)}
        doughnut={true}
        coverRadius={0.5}
        coverFill="#FFF"
      />
      <View style={styles.legendContainer}>
        {labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColorBox, { backgroundColor: colors[index % colors.length] }]}
            />
            <Text style={styles.legendText}>
              {label}: {data[index]}%
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
