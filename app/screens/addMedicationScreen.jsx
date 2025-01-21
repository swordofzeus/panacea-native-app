import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { FAB, Dialog, Portal, Button, TextInput } from "react-native-paper";
import { gql, useLazyQuery } from "@apollo/client";
import DropDownPicker from "react-native-dropdown-picker";

const FETCH_MEDICATIONS = gql`
  query GetMedications {
    medications {
      name
      conditions
    }
  }
`;

const CurrentTreatmentsScreen = ({ navigation }) => {
  const [treatments, setTreatments] = useState([
    {
      title: "Lunesta",
      description:
        "Lunesta is a sedative medication that helps with sleep disorders such as insomnia. It works by calming the brain and aiding in maintaining a full night's sleep.",
      status: "Good",
      startedAt: "2023-11-15",
      tags: ["Sleep Duration", "Insomnia Severity"],
    },
    {
      title: "Amlodipine",
      description:
        "Amlodipine is a calcium channel blocker primarily used to treat high blood pressure and prevent angina. It helps relax and widen blood vessels for better blood flow.",
      status: "Needs Attention",
      startedAt: "2024-01-05",
      tags: ["Blood Pressure", "Heart Health"],
    },
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [conditionOpen, setConditionOpen] = useState(false); // Manage condition dropdown state
  const [conditionItems, setConditionItems] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [fetchMedications, { data, loading, error }] = useLazyQuery(FETCH_MEDICATIONS);

  useEffect(() => {
    if (data && data.medications) {
      setFilteredMedications(data.medications);
    }
  }, [data]);

  useEffect(() => {
    if (selectedMedication && data && data.medications) {
      const medication = data.medications.find(
        (med) => med.name === selectedMedication
      );
      if (medication) {
        const items = medication.conditions.map((condition) => ({
          label: condition,
          value: condition,
        }));
        setConditionItems(items);
        setSelectedCondition(null); // Reset the condition when a new medication is selected
      }
    }
  }, [selectedMedication, data]);

  const showDialog = () => {
    fetchMedications(); // Fetch medications when opening the dialog
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSearchQuery("");
    setSelectedMedication(null);
    setSelectedCondition(null);
    setConditionOpen(false); // Close dropdown on dialog close
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (data && data.medications) {
      const filtered = data.medications.filter((medication) =>
        medication.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedications(filtered);
    }
  };

  const selectMedication = (medication) => {
    setSelectedMedication(medication);
    setSearchQuery(medication);
    setFilteredMedications([]);
  };

  const addTreatment = () => {
    if (selectedMedication && selectedCondition) {
      setTreatments((prev) => [
        ...prev,
        {
          title: selectedMedication,
          description: `Used for ${selectedCondition}. This treatment monitors essential metrics for your condition.`,
          status: "Good",
          startedAt: new Date().toISOString().split("T")[0],
          tags: ["Metric 1", "Metric 2"], // Example tags
        },
      ]);
      hideDialog();
    }
  };

  const renderStatusTag = (status) => {
    let backgroundColor = "#4CAF50"; // Green for "Good"
    if (status === "Needs Attention") backgroundColor = "#FFC107"; // Yellow
    if (status === "Critical") backgroundColor = "#F44336"; // Red

    return (
      <View style={[styles.statusTag, { backgroundColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  const renderTreatmentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.treatmentCard}
      onPress={() =>
        navigation.navigate("MedicationDetails", { medication: item })
      }
    >
      <Text style={styles.treatmentTitle}>{item.title}</Text>
      {renderStatusTag(item.status)}
      <Text style={styles.treatmentDescription}>{item.description}</Text>
      <Text style={styles.startedAtText}>Started at: {item.startedAt}</Text>
      <View style={styles.tagsContainer}>
        {item.tags.map((tag, index) => (
          <Text key={index} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Current Treatments</Text>
        <FlatList
          data={treatments}
          renderItem={renderTreatmentCard}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.treatmentsList}
        />
      </ScrollView>

      <FAB
        style={styles.fab}
        small={false}
        icon="plus"
        onPress={showDialog}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Add New Treatment</Dialog.Title>
          <Dialog.Content>
            {loading ? (
              <Text>Loading medications...</Text>
            ) : (
              <>
                <TextInput
                  label="Search Medication"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  style={styles.input}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && filteredMedications.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {filteredMedications.map((medication) => (
                      <TouchableOpacity
                        key={medication.name}
                        onPress={() => selectMedication(medication.name)}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>
                          {medication.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {selectedMedication && (
                  <DropDownPicker
                    open={conditionOpen}
                    setOpen={setConditionOpen}
                    value={selectedCondition}
                    items={conditionItems}
                    setValue={setSelectedCondition}
                    placeholder="Select a condition"
                    style={{ marginVertical: 10 }}
                    dropDownContainerStyle={{ marginVertical: 10 }}
                  />
                )}
              </>
            )}
            {error && (
              <Text style={styles.errorText}>Error loading medications</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button
              onPress={addTreatment}
              disabled={!selectedMedication || !selectedCondition}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute", // Ensures the FAB is positioned relative to the screen
    right: 16, // Adjusts the FAB position from the right edge
    bottom: 16, // Adjusts the FAB position from the bottom edge
    elevation: 4, // Adds shadow to make it look elevated
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  treatmentsList: {
    paddingVertical: 10,
  },
  treatmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  treatmentDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  startedAtText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#E3F2FD",
    color: "#1E88E5",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 5,
    marginBottom: 5,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default CurrentTreatmentsScreen;
