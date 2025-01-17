import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from "react-native";
import { Searchbar, Button, Divider } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Card from "../Card";
import AdverseEventsPieChart from "../AdverseEventsPieChart";
import StudyInfoCard from "../StudyInfoCard";
import MetricsChart from "../MetricsCard";
import { gql, useLazyQuery } from "@apollo/client";

const SEARCH_STUDIES = gql`
  query SearchStudies($searchTerm: String!) {
    studies(searchTerm: $searchTerm) {
      studyInfo {
        title
        organization
        dates {
          start
          completion
        }
        summary
      }
      participants {
        groupName
        dosage
        medicationName
        size
        description
      }
      outcomes
      adverseEvents
    }
  }
`;

const MedicationSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedStudyIndex, setSelectedStudyIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);

  const [fetchStudies, { data, loading, error }] = useLazyQuery(SEARCH_STUDIES);

  const handleSearch = () => {
    fetchStudies({ variables: { searchTerm: searchQuery } });
  };

  useEffect(() => {
    console.log({data})
    if (data) {
      const studies = data.studies || [];
      console.log({studies})
      setSelectedMedication(studies);
      setSelectedStudyIndex(0);
      setDropdownItems(
        studies.map((study, index) => ({
          label: study.studyInfo?.title || "Untitled Study",
          value: index,
        }))
      );
    }
  }, [data]);

  const handleStudySelect = (index) => {
    console.log({data})
    setSelectedStudyIndex(index);
  };

  const selectedStudy = selectedMedication ? selectedMedication[selectedStudyIndex] : null;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search Medications"
          value={searchQuery}
          onChangeText={setSearchQuery}
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
      {loading && <ActivityIndicator size="large" color="#00308F" />}
      {error && <Text style={styles.errorText}>Error loading studies: {error.message}</Text>}
      {selectedMedication && !loading && (
        <>
          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>Select Study</Text>
            <DropDownPicker
              open={dropdownOpen}
              value={selectedStudyIndex}
              items={dropdownItems}
              setOpen={setDropdownOpen}
              setValue={(index) => handleStudySelect(index)}
              setItems={setDropdownItems}
              placeholder="Select a Study"
              style={[
                styles.dropdown,
                { width: "90%", alignSelf: "center", borderRadius: 10, borderColor: "#ccc" },
              ]}
              dropDownContainerStyle={{
                width: "90%",
                alignSelf: "center",
                borderRadius: 10,
                borderColor: "#ccc",
                marginTop: 5,
              }}
              textStyle={{
                fontSize: 14,
                color: "#333",
              }}
              placeholderStyle={{
                color: "#888",
              }}
              listItemContainerStyle={{
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
              listItemLabelStyle={{
                fontSize: 14,
                color: "#333",
              }}
            />
          </View>
          {selectedStudy && (
            <>
              <StudyInfoCard studyInfo={selectedStudy.studyInfo} />
              <MetricsChart
                key={selectedStudyIndex} // Ensures re-render when switching studies
                outcomes={selectedStudy.outcomes}
                participants={selectedStudy.participants}
              />
              <AdverseEventsPieChart
                adverseEvents={selectedStudy.adverseEvents?.common || []}
                summary={selectedStudy.adverseEvents?.summary}
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

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
  dropdown: {
    marginVertical: 10,
  },
  dropdownContainer: {
    marginVertical: 10,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    marginLeft: 20,
  },
  dropdownWrapper: {
    marginVertical: 10,
    width: "100%",
    alignItems: "left",
    zIndex: 1000,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default MedicationSearchScreen;
