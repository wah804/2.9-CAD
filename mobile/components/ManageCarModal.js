import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ManageCarModal({ visible, onClose, onSave, car }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(car);

  // Initialize fields on open/change
  useEffect(() => {
    if (car) {
      setMake(car.make || '');
      setModel(car.model || '');
      setYear(car.year ? car.year.toString() : '');
    } else {
      setMake('');
      setModel('');
      setYear('');
    }
    setErrors({});
  }, [car, visible]);

  const validate = () => {
    const tempErrors = {};
    if (!make.trim()) tempErrors.make = 'Make is required';
    if (!model.trim()) tempErrors.model = 'Model is required';
    if (!year.trim()) {
      tempErrors.year = 'Year is required';
    } else {
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear + 2) {
        tempErrors.year = `Enter a valid year (1886 - ${currentYear + 2})`;
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const success = await onSave({
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year)
      });
      if (success) {
        handleClose();
      }
    } catch (err) {
      console.error('Error saving car from modal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMake('');
    setModel('');
    setYear('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEdit ? 'Edit Car Details' : 'Add New Car'}
                </Text>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#a0a0b0" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.formContainer}>
                {/* Make Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Make</Text>
                  <TextInput
                    style={[styles.input, errors.make && styles.inputError]}
                    placeholder="e.g. Porsche"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={make}
                    onChangeText={(val) => {
                      setMake(val);
                      if (errors.make) setErrors({ ...errors, make: null });
                    }}
                    autoCapitalize="words"
                  />
                  {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}
                </View>

                {/* Model Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Model</Text>
                  <TextInput
                    style={[styles.input, errors.model && styles.inputError]}
                    placeholder="e.g. 911 GT3"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={model}
                    onChangeText={(val) => {
                      setModel(val);
                      if (errors.model) setErrors({ ...errors, model: null });
                    }}
                  />
                  {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
                </View>

                {/* Year Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Year</Text>
                  <TextInput
                    style={[styles.input, errors.year && styles.inputError]}
                    placeholder="e.g. 2024"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={year}
                    onChangeText={(val) => {
                      setYear(val);
                      if (errors.year) setErrors({ ...errors, year: null });
                    }}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={handleClose}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#0a0a14" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isEdit ? 'Update Car' : 'Save to Vault'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 32, 25, 0.9)', // Match bg-dark
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#162019', // Match bg-dark
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#3A5B48', // Match satin-green-light
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2B4536', // Match satin-green
  },
  modalTitle: {
    color: '#E8EBE9', // Match text-light
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#D1B875', // Match dull-yellow
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(43, 69, 54, 0.3)', // Match satin-green transparent
    borderWidth: 1,
    borderColor: '#3A5B48', // Match satin-green-light
    borderRadius: 12,
    color: '#E8EBE9', // Match text-light
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  cancelButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 0.5,
    backgroundColor: '#D1B875', // Match dull-yellow
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#D1B875',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#162019', // Match bg-dark
    fontSize: 16,
    fontWeight: 'bold',
  },
});
