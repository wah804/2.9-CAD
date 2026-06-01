import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CarCard({ car, onEdit, onDelete }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="car-sport" size={28} color="#D1B875" />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.makeText} numberOfLines={1}>{car.make}</Text>
          <Text style={styles.modelText} numberOfLines={1}>{car.model}</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{car.year}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <Pressable 
          style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && styles.buttonPressed]} 
          onPress={() => onEdit(car)}
        >
          <Ionicons name="create-outline" size={20} color="#D1B875" />
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.buttonPressed]} 
          onPress={() => onDelete(car._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(43, 69, 54, 0.85)', // Satin Green with transparency
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A5B48', // Satin Green Light
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: 'rgba(58, 91, 72, 0.95)', // Satin Green Light
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(209, 184, 117, 0.1)', // Dull Yellow tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  makeText: {
    color: '#D1B875', // Dull Yellow
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modelText: {
    color: '#E8EBE9', // Text Light
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  yearBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  yearText: {
    color: '#E8EBE9', // Text Light
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: 'rgba(209, 184, 117, 0.08)', // Dull Yellow tint
    borderColor: 'rgba(209, 184, 117, 0.25)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)', // Soft red tint
    borderColor: 'rgba(255, 107, 107, 0.25)',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});
