import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryGroup,
  VictoryTooltip,
  VictoryLegend,
} from "victory";
import CardComponent from "./Card";

const MetricsChart = ({ metrics, participants, selectedMetric, onSelectMetric }) => {
  const prepareChartData = (metricName) => {
    if (!metrics || !metricName || !participants) return { elderly: [], nonElderly: [], dosageLabels: [] };

    const metric = metrics.find((m) => m.name === metricName);
    if (!metric) return { elderly: [], nonElderly: [], dosageLabels: [] };

    const elderlyData = [];
    const nonElderlyData = [];
    const dosageLabels = [...new Set(participants.groups.map((g) => `${g.dosage} mg`))];

    participants.groups.forEach((group) => {
      const metricData = metric.data.find((m) => m.group === group.groupName);
      const value = metricData ? metricData.baseline + metricData.change : 0;

      if (group.ageCategory === "Elderly") {
        elderlyData.push({ dosage: `${group.dosage} mg`, value });
      } else {
        nonElderlyData.push({ dosage: `${group.dosage} mg`, value });
      }
    });

    return { elderly: elderlyData, nonElderly: nonElderlyData, dosageLabels };
  };

  const renderTabs = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {metrics.map((metric) => (
          <Text
            key={metric.name}
            style={[styles.tab, selectedMetric === metric.name && styles.selectedTab]}
            onPress={() => onSelectMetric(metric.name)}
          >
            {metric.name}
          </Text>
        ))}
      </ScrollView>
    );
  };

  const renderChart = () => {
    const { elderly, nonElderly, dosageLabels } = prepareChartData(selectedMetric);

    const metric = metrics.find((m) => m.name === selectedMetric);

    return (
      <>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ x: 30 }}
          style={{ parent: { maxWidth: "90%", margin: "0 auto" } }}
        >
          <VictoryLegend
            x={125}
            y={10}
            orientation="horizontal"
            gutter={20}
            data={[
              { name: "Elderly", symbol: { fill: "rgba(173, 216, 230, 0.8)" } },
              { name: "Non-Elderly", symbol: { fill: "rgba(221, 160, 221, 0.8)" } },
            ]}
          />
          <VictoryAxis
            tickValues={dosageLabels}
            label="Dosage"
            style={{
              axis: { stroke: "#756f6a" },
              axisLabel: { fontSize: 14, padding: 30, fill: "#4a4a4a" },
              tickLabels: { fontSize: 12, padding: 5, fill: "#4a4a4a" },
            }}
          />
          <VictoryAxis
            dependentAxis
            label={`Change in ${selectedMetric} (${metric?.units || ""})`}
            style={{
              axis: { stroke: "#756f6a" },
              axisLabel: { fontSize: 14, padding: 40, fill: "#4a4a4a" },
              grid: { stroke: "#e0e0e0", strokeDasharray: "4,4" },
              tickLabels: { fontSize: 12, padding: 5, fill: "#4a4a4a" },
            }}
          />
          <VictoryGroup offset={20}>
            <VictoryBar
              data={elderly}
              x="dosage"
              y="value"
              labels={({ datum }) => `${datum.value.toFixed(1)} ${metric?.units || ""}`}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{ fill: "white", stroke: "#ccc" }}
                  style={{ fontSize: 10 }}
                />
              }
              barWidth={25}
              cornerRadius={6}
              style={{
                data: {
                  fill: "rgba(173, 216, 230, 0.8)", // Light blue
                  stroke: "rgba(0, 123, 255, 0.8)", // Border color
                  strokeWidth: 1,
                },
              }}
            />
            <VictoryBar
              data={nonElderly}
              x="dosage"
              y="value"
              labels={({ datum }) => `${datum.value.toFixed(1)} ${metric?.units || ""}`}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{ fill: "white", stroke: "#ccc" }}
                  style={{ fontSize: 10 }}
                />
              }
              barWidth={25}
              cornerRadius={6}
              style={{
                data: {
                  fill: "rgba(221, 160, 221, 0.8)", // Light purple
                  stroke: "rgba(186, 85, 211, 0.8)", // Border color
                  strokeWidth: 1,
                },
              }}
            />
          </VictoryGroup>
        </VictoryChart>
        {metric?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <CardComponent title="Metrics">
      {renderTabs()}
      {renderChart()}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
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
  descriptionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  metricDescription: {
    fontSize: 13,
    color: "#555",
  },
});

export default MetricsChart;
