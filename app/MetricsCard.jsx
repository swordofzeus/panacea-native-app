import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart, XAxis, YAxis } from "react-native-svg-charts";
import * as scale from "d3-scale";
import Card from "./Card";

const MetricsCard = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]?.name || "");
  console.log({metrics})
  console.log(selectedMetric)
  // Extract the selected metric's data
  const metric = metrics.find((m) => m.name === selectedMetric);

  if (!metric) {
    return <Text style={styles.noDataText}>No data available for this metric</Text>;
  }

  // Prepare chart data
  const { groups } = metric;
  console.log({groups})
  const dosageLabels = groups.map((group) => group.label);
  const categories = Object.keys(groups[0].data); // Get all categories dynamically
  console.log({categories})

  const colors = ["#ADD8E6", "#DDA0DD", "#FFD700", "#FF6347", "#90EE90"]; // Add as many as needed
  const barData = categories.map((category, index) => ({
    data: groups.map((group) => group.data[category]),
    svg: { fill: colors[index % colors.length] }, // Cycle through colors
    label: category,
  }));

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
      {metrics.map((metric) => (
        <Text
          key={metric.name}
          style={[styles.tab, selectedMetric === metric.name && styles.selectedTab]}
          onPress={() => setSelectedMetric(metric.name)}
        >
          {metric.name}
        </Text>
      ))}
    </ScrollView>
  );

  return (
    <Card title="Metrics">
      <View style={styles.container}>
        {renderTabs()}
        <Text style={styles.chartTitle}>
          {selectedMetric} ({metric.units})
        </Text>
        <View style={{ flexDirection: "row", height: 300, paddingHorizontal: 10 }}>
          <YAxis
            data={barData.flatMap((group) => group.data)}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fontSize: 12, fill: "gray" }}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <BarChart
              style={{ flex: 1 }}
              data={barData}
              yAccessor={({ item }) => item}
              contentInset={{ top: 10, bottom: 10 }}
              spacingInner={0.2}
              groupMode="grouped"
            />
            <XAxis
              style={{ marginTop: 10 }}
              data={dosageLabels}
              formatLabel={(value, index) => dosageLabels[index]}
              scale={scale.scaleBand}
              svg={{ fontSize: 12, fill: "gray" }}
            />
          </View>
        </View>
        <View style={styles.legendContainer}>
          {barData.map((group, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColorBox, { backgroundColor: group.svg.fill }]} />
              <Text style={styles.legendText}>{group.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.description}>{metric.description}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "gray",
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tab: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "gray",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectedTab: {
    color: "#00308F",
    borderBottomWidth: 2,
    borderBottomColor: "#00308F",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "gray",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "left",
    marginTop: 10,
  },
});

export default MetricsCard;
