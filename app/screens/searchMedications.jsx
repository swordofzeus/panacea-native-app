import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { Searchbar, Button, Divider } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Card from "../Card";
import AdverseEventsPieChart from "../AdverseEventsPieChart";
import StudyInfoCard from "../StudyInfoCard";
import MetricsChart from "../MetricsCard";

const medications = {
  "Lunesta": [
    {
      studyInfo: {
        title: "A Phase III Study of Eszopiclone in Patients With Insomnia",
        funding: "Eisai Inc.",
        institution: "Eisai Co., Ltd.",
        dates: { start: "2008-10", completion: "2010-05" },
        summary:
          "The study showed that Lunesta significantly reduced sleep latency by an average of 35 minutes in elderly patients and 37 minutes in non-elderly patients. Wake Time After Sleep Onset (WASO) also decreased by 30% on average across all dosage groups. \n\n The most common side effects reported were dysgeusia (36%), nasopharyngitis (22%), and headache (10%).",
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
        summary:
          "Serious adverse events included Appendicitis, affecting 2 participants, and Acute Myocardial Infarction, affecting 1 participant. \n\n Overall, 69 participants experienced non-serious adverse events, while 8 participants experienced serious adverse events.",
        serious: [
          { event: "Appendicitis", count: 2 },
          { event: "Acute myocardial infarction", count: 1 },
          { event: "Clavicle fracture", count: 1 },
        ],
        common: [
          { event: "Dysgeusia", percentage: 36 },
          { event: "Nasopharyngitis", percentage: 22 },
          { event: "Headache", percentage: 10 },
          { event: "Somnolence", percentage: 7 },
          { event: "Back pain", percentage: 5 },
          { event: "Pharyngitis", percentage: 5 },
          { event: "Thirst", percentage: 4 },
          { event: "Cystitis", percentage: 4 },
          { event: "Upper respiratory tract infection", percentage: 4 },
          { event: "Dizziness", percentage: 3 },
        ],
      },
      metrics: [
        {
          name: "Sleep Latency",
          type: "bar",
          description: "Mean change in sleep latency.",
          units: "minutes",
          groups: [
            { label: "1 mg", data: { Elderly: 33.4, "Non-elderly": 31.2 } },
            { label: "2 mg", data: { Elderly: 35.1, "Non-elderly": 33.7 } },
          ],
        },
        {
          name: "Wake Time After Sleep Onset (WASO)",
          type: "bar",
          description:
            "Mean change in the total time spent awake after falling asleep (measured in minutes) from baseline to the end of the 4-week treatment period.",
          units: "minutes",
          groups: [
            { label: "1 mg", data: { Elderly: 30.8, "Non-elderly": 28.4 } },
            { label: "2 mg", data: { Elderly: 32.5, "Non-elderly": 29.7 } },
            { label: "3 mg", data: { Elderly: 31.0, "Non-elderly": 30.2 } },
          ],
        },
      ],
    },
    {
      studyInfo: {
        title: "A Study of Lunesta's Effect on Cognitive Function",
        funding: "National Sleep Foundation",
        institution: "University of California, San Diego",
        dates: { start: "2012-01", completion: "2014-03" },
        summary:
          "This study investigated the effects of Lunesta on cognitive function. Participants reported improvements in memory and attention span. Common side effects included dry mouth and dizziness.",
      },
      participants: {
        total: 200,
        groups: [
          { groupName: "1 mg Adults", dosage: 1, ageCategory: "Adult", size: 100 },
          { groupName: "2 mg Adults", dosage: 2, ageCategory: "Adult", size: 100 },
        ],
        demographics: {
          gender: { female: 120, male: 80 },
          dropoutRate: 0.10,
        },
      },
      adverseEvents: {
        summary:
          "The most common side effects reported were dry mouth (20%), dizziness (15%), and fatigue (10%).",
        common: [
          { event: "Dry Mouth", percentage: 20 },
          { event: "Dizziness", percentage: 15 },
          { event: "Fatigue", percentage: 10 },
          { event: "Nausea", percentage: 8 },
          { event: "Insomnia", percentage: 7 },
          { event: "Blurred vision", percentage: 6 },
          { event: "Stomach upset", percentage: 5 },
          { event: "Skin rash", percentage: 4 },
        ],
      },
      metrics: [
        {
          name: "Cognitive Improvement",
          type: "bar",
          description: "Mean improvement in cognitive test scores.",
          units: "points",
          groups: [
            { label: "1 mg", data: { Adult: 5 } },
            { label: "2 mg", data: { Adult: 8 } },
          ],
        },
      ],
    },
    {
      studyInfo: {
        title: "Impact of Lunesta on Sleep Architecture",
        funding: "Sleep Research Society",
        institution: "Harvard Medical School",
        dates: { start: "2017-09", completion: "2019-11" },
        summary:
          "This study analyzed the impact of Lunesta on sleep architecture, showing an increase in REM sleep duration.",
      },
      participants: {
        total: 250,
        groups: [
          { groupName: "1 mg REM", dosage: 1, ageCategory: "Adult", size: 125 },
          { groupName: "2 mg REM", dosage: 2, ageCategory: "Adult", size: 125 },
        ],
        demographics: {
          gender: { female: 140, male: 110 },
          dropoutRate: 0.07,
        },
      },
      adverseEvents: {
        summary:
          "The most common side effects were headache (15%) and nausea (10%).",
        common: [
          { event: "Headache", percentage: 15 },
          { event: "Nausea", percentage: 10 },
          { event: "Fatigue", percentage: 8 },
          { event: "Blurred vision", percentage: 6 },
          { event: "Muscle pain", percentage: 5 },
        ],
      },
      metrics: [
        {
          name: "REM Sleep Duration",
          type: "bar",
          description: "Increase in REM sleep duration.",
          units: "minutes",
          groups: [
            { label: "1 mg", data: { Adult: 10 } },
            { label: "2 mg", data: { Adult: 15 } },
          ],
        },
      ],
    },
  ],
};



const MedicationSearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedStudyIndex, setSelectedStudyIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);

  const handleSearch = () => {
    const medication = medications[searchQuery];
    setSelectedMedication(medication || null);
    setSelectedStudyIndex(0);
    if (medication) {
      setDropdownItems(
        medication.map((study, index) => ({
          label: study.studyInfo.title,
          value: index,
        }))
      );
    }
  };
  const handleStudySelect = (index) => {
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
      {selectedMedication && (
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
                { width: '90%', alignSelf: 'center', borderRadius: 10, borderColor: '#ccc' },
              ]}
              dropDownContainerStyle={{
                width: '90%',
                alignSelf: 'center',
                borderRadius: 10,
                borderColor: '#ccc',
                marginTop: 5,
                // backgroundColor: '#f3e5f5', // Light purple background
              }}
              textStyle={{
                fontSize: 14,
                color: '#333',
              }}
              placeholderStyle={{
                color: '#888',
              }}
              listItemContainerStyle={{
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                // backgroundColor: '#f3e5f5', // Light purple background
              }}
              listItemLabelStyle={{
                fontSize: 14,
                color: '#333',
              }}

            />
          </View>

          {selectedStudy && (
            <>
              <StudyInfoCard
                studyInfo={selectedStudy.studyInfo}
                participants={selectedStudy.participants}
              />
              <MetricsChart
                key={selectedStudyIndex} // Ensures re-render when switching studies
                metrics={selectedStudy.metrics}
                participants={selectedStudy.participants}
                selectedMetric={selectedStudy.metrics[0]?.name || ""}
                onSelectMetric={() => { }}
              />
              <AdverseEventsPieChart
                adverseEvents={selectedStudy.adverseEvents.common || []}
                summary={selectedStudy.adverseEvents.summary}
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginLeft:20
  },
  dropdownWrapper: {
    marginVertical: 10,
    width: '100%',
    alignItems: 'left',
    zIndex: 1000, // Ensure the dropdown is above other elements

  }
});

export default MedicationSearchScreen;
