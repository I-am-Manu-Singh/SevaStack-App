import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Platform
} from 'react-native';
import { X, Calendar, Clock, User, CheckCircle2, ShoppingBag } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { useApp } from '../lib/AppContext';

export const BookingModal = ({ 
  visible, 
  onClose 
}: { 
  visible: boolean; 
  onClose: () => void; 
}) => {
  const { colors, businessType, addAppointment, catalog } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [time, setTime] = useState('10:30 AM');
  const [step, setStep] = useState(1);

  const businessServices = catalog.filter(s => s.businessType === businessType);

  const handleBooking = () => {
    if (!customerName || !selectedService) return;
    
    const newApt = {
      customerName,
      service: selectedService.name,
      time,
      price: selectedService.price,
      status: 'confirmed',
      businessType,
      avatar: `https://ui-avatars.com/api/?name=${customerName}&background=random`
    };

    addAppointment(newApt);
    setStep(3); // Success step
  };

  const reset = () => {
    setCustomerName('');
    setSelectedService(null);
    setStep(1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={reset}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 3 ? 'Confirmed' : 'New Appointment'}
            </Text>
            <TouchableOpacity onPress={reset}>
               <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {step === 1 && (
            <ScrollView style={styles.body}>
              <Text style={[styles.label, { color: colors.text }]}>Customer Name</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                 <User size={18} color={colors.textMuted} />
                 <TextInput 
                   placeholder="Enter name"
                   style={[styles.input, { color: colors.text }]}
                   placeholderTextColor={colors.textMuted}
                   value={customerName}
                   onChangeText={setCustomerName}
                 />
              </View>

              <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Select Service</Text>
              <View style={styles.serviceGrid}>
                 {businessServices.map(service => (
                   <TouchableOpacity 
                     key={service.id}
                     onPress={() => setSelectedService(service)}
                     style={[
                       styles.serviceItem, 
                       { borderColor: colors.border },
                       selectedService?.id === service.id && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
                     ]}
                   >
                      <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                      <Text style={[styles.servicePrice, { color: colors.primary }]}>₹{service.price}</Text>
                   </TouchableOpacity>
                 ))}
              </View>

              <TouchableOpacity 
                disabled={!customerName || !selectedService}
                onPress={() => setStep(2)}
                style={[styles.mainBtn, { backgroundColor: (!customerName || !selectedService) ? colors.textMuted : colors.primary }]}
              >
                 <Text style={styles.mainBtnText}>Continue</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 2 && (
            <View style={styles.body}>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                 <Text style={[styles.sumLabel, { color: colors.textMuted }]}>Service</Text>
                 <Text style={[styles.sumVal, { color: colors.text }]}>{selectedService?.name}</Text>
                 
                 <View style={styles.sumDivider} />
                 
                 <Text style={[styles.sumLabel, { color: colors.textMuted }]}>Customer</Text>
                 <Text style={[styles.sumVal, { color: colors.text }]}>{customerName}</Text>
                 
                 <View style={styles.sumDivider} />

                 <View style={styles.timeRow}>
                    <Clock size={16} color={colors.textMuted} />
                    <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                 </View>
              </View>

              <TouchableOpacity 
                onPress={handleBooking}
                style={[styles.mainBtn, { backgroundColor: colors.primary }]}
              >
                 <Text style={styles.mainBtnText}>Confirm Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                 <Text style={[styles.backText, { color: colors.textMuted }]}>Back to Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={[styles.body, styles.centerBody]}>
               <CheckCircle2 size={64} color={Colors.success} />
               <Text style={[styles.successTitle, { color: colors.text }]}>Booking Successful!</Text>
               <Text style={[styles.successSubtitle, { color: colors.textMuted }]}>
                  Appointment for {customerName} has been added to your schedule.
               </Text>
               <TouchableOpacity onPress={reset} style={[styles.mainBtn, { backgroundColor: colors.primary, width: '100%' }]}>
                  <Text style={styles.mainBtnText}>Done</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: '60%',
    maxHeight: '90%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...Typography.h3,
    fontSize: 20,
  },
  body: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontWeight: '600',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItem: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '700',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  mainBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  mainBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sumLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  sumVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  sumDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
  },
  centerBody: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  successSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  }
});
