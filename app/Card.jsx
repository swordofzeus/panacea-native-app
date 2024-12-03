import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardComponent = ({ title, subheader, children, description }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subheader && <Text style={styles.subheader}>{subheader}</Text>}
      </View>
      <View style={styles.content}>
        {children}
        {/* Summary/Description Section */}
        <View style={styles.summary}>
          <Text style={styles.description}>
            {description || 'This is a summary section with some dummy placeholder text about the data shown in the graph.'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  content: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  summary: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});

export default CardComponent;
