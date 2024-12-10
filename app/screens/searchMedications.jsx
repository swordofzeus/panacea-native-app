import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { Searchbar, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CardComponent from "../Card";
import AdverseEventsDonutChart from '../AdverseEventsPieChart'
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryGroup,
  VictoryTooltip,
  VictoryLegend,
} from "victory";
import StudyInfoCard from "../StudyInfoCard";
import MetricsChart from "../MetricsCard";

const medications = [
  {
    name: "Lunesta",
    studyInfo: {
      title: "A Phase III Study of Eszopiclone in Patients With Insomnia",
      funding: "Eisai Inc.",
      institution: "Eisai Co., Ltd.",
      dates: { start: "2008-10", completion: "2010-05" },
      summary: "The study showed that Lunesta significantly reduced sleep latency by an average of 35 minutes in elderly patients and 37 minutes in non-elderly patients. Wake Time After Sleep Onset (WASO) also decreased by 30% on average across all dosage groups. \n\n The most common side effects reported were dysgeusia (36%), nasopharyngitis (22%), and headache (10%)."

    },
    participants: {
      total: 324,
      groups: [
        { groupName: "1 mg Elderly", dosage: 1, ageCategory: "Elderly", size: 80 },
        { groupName: "2 mg Elderly", dosage: 2, ageCategory: "Elderly", size: 83 },
        { groupName: "2 mg Non-elderly", dosage: 2, ageCategory: "Non-elderly", size: 84 },
        { groupName: "3 mg Non-elderly", dosage: 3, ageCategory: "Non-elderly", size: 77 },
      ],
      demographics: {
        gender: { female: 180, male: 144 },
        dropoutRate: 0.12,
      },
    },
    adverseEvents: {
      serious: [
        { event: "Myocardial Infarction", count: 1 },
        { event: "Appendicitis", count: 2 },
        { event: "Clavicle Fracture", count: 1 },
      ],
      common: [
        { event: "Dysgeusia", percentage: 36 },
        { event: "Nasopharyngitis", percentage: 22 },
        { event: "Headache", percentage: 10 },
      ],
    },
    metrics: [
      {
        name: "Sleep Latency",
        type: "bar",
        description:
          "Mean change in the time it takes to fall asleep (measured in minutes) from baseline to the end of the 4-week treatment period.",
        units: "minutes",
        data: [
          { group: "1 mg Elderly", baseline: 65.5, change: -32.1 },
          { group: "2 mg Elderly", baseline: 70.7, change: -37.0 },
          { group: "2 mg Non-elderly", baseline: 71.8, change: -36.7 },
          { group: "3 mg Non-elderly", baseline: 64.0, change: -32.8 },
        ],
      },
      {
        name: "Wake Time After Sleep Onset (WASO)",
        type: "bar",
        description:
          "Mean change in the total time spent awake after falling asleep (measured in minutes) from baseline to the end of the 4-week treatment period.",
        units: "minutes",
        data: [
          { group: "1 mg Elderly", baseline: 61.6, change: -30.8 },
          { group: "2 mg Elderly", baseline: 68.8, change: -35.1 },
          { group: "2 mg Non-elderly", baseline: 53.2, change: -32.4 },
          { group: "3 mg Non-elderly", baseline: 42.3, change: -23.3 },
        ],
      },
    ],
  },
];


const MedicationSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("");

  const handleSearch = () => {
    const medication = medications.find((med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedMedication(medication || null);
    setSelectedMetric(medication?.metrics[0]?.name || ""); // Default to the first metric
  };




  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Medications"
          value={searchQuery}
          onChangeText={(query) => setSearchQuery(query)}
          style={styles.searchBar}
        />
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          icon={() => <Icon name="magnify" size={20} color="#fff" />}
        />
      </View>

      <Divider style={styles.divider} />

      {selectedMedication && (
        <>
          <StudyInfoCard studyInfo={selectedMedication.studyInfo} participants={selectedMedication.participants} />
          <MetricsChart
            metrics={selectedMedication.metrics}
            participants={selectedMedication.participants}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
          />
          <AdverseEventsDonutChart adverseEvents={selectedMedication?.adverseEvents?.common || []} />
        </>
      )}
    </ScrollView>
  );
};


// Add your styles here...

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  searchButton: {
    height: 40,
    justifyContent: "center",
    alignSelf: "center",
  },
  divider: {
    marginVertical: 10,
    backgroundColor: "gray",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 5, // Reduced space between tabs and chart
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
  chartContainer: {
    marginVertical: 2, // Reduced spacing above and below the chart
  },
  studyInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  studyInfoContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  infoLine: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  highlightedLine: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  summaryBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  summaryText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});


export default MedicationSearchScreen;
