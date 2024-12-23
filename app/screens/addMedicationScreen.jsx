import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text, FlatList, TouchableOpacity } from "react-native";
import { FAB, Dialog, Portal, TextInput, Button } from "react-native-paper";

const CurrentTreatmentsScreen = ({ navigation }) => {
  const [treatments, setTreatments] = useState([
    {
      title: "Lunesta",
      description: "Used to treat Insomnia and other sleep disorders.",
      status: "Good",
    },
    {
      title: "Amlodipine",
      description: "Controlling high blood pressure.",
      status: "Needs Attention",
    },
    {
      title: "Ventolin Inhaler",
      description: "Relieving asthma symptoms.",
      status: "Critical",
    },
    {
      title: "Methotrexate",
      description: "Treating rheumatoid arthritis.",
      status: "Good",
    },
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const hideDialog = () => {
    setDialogVisible(false);
    setNewMedication("");
    setNewCondition("");
  };

  const addTreatment = () => {
    if (newMedication && newCondition) {
      setTreatments((prev) => [
        ...prev,
        {
          title: newMedication,
          description: `For ${newCondition}`,
          status: "Good", // Default status
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
      onPress={() => navigation.navigate("MedicationDetails", { medication: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.treatmentTitle}>{item.title}</Text>
        {renderStatusTag(item.status)}
      </View>
      <Text style={styles.treatmentDescription}>{item.description}</Text>
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
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Add New Treatment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Medication Name"
              value={newMedication}
              onChangeText={setNewMedication}
              style={styles.input}
            />
            <TextInput
              label="Condition"
              value={newCondition}
              onChangeText={setNewCondition}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={addTreatment}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginBottom: 10,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6200EE",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default CurrentTreatmentsScreen;
