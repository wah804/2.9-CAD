import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 3; // Calculate width for 3 columns with padding

export default function StatsSection({ cars }) {
  const totalCars = cars.length;

  // Calculate latest year
  const latestYear = totalCars > 0 
    ? Math.max(...cars.map(c => c.year || 0)) 
    : '—';

  // Calculate unique makes
  const uniqueMakes = totalCars > 0
    ? new Set(cars.map(c => c.make?.toLowerCase().trim())).size
    : 0;

  return (
    <View style={styles.container}>
      {/* Stat 1: Total */}
      <View style={[styles.statCard, { width: CARD_WIDTH }]}>
        <Ionicons name="albums-outline" size={18} color="#D1B875" style={styles.icon} />
        <Text style={styles.label}>Vault size</Text>
        <Text style={styles.value}>{totalCars}</Text>
      </View>

      {/* Stat 2: Newest */}
      <View style={[styles.statCard, { width: CARD_WIDTH }]}>
        <Ionicons name="sparkles-outline" size={18} color="#E3CD8C" style={styles.icon} />
        <Text style={styles.label}>Newest Yr</Text>
        <Text style={styles.value}>{latestYear}</Text>
      </View>

      {/* Stat 3: Unique Makes */}
      <View style={[styles.statCard, { width: CARD_WIDTH }]}>
        <Ionicons name="key-outline" size={18} color="#A3B5AA" style={styles.icon} />
        <Text style={styles.label}>Brands</Text>
        <Text style={styles.value}>{uniqueMakes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  statCard: {
    backgroundColor: 'rgba(43, 69, 54, 0.3)', // Satin Green transparent
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 184, 117, 0.15)', // Dull Yellow transparent border
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    color: '#A3B5AA', // Text Muted
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  value: {
    color: '#E8EBE9', // Text Light
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
