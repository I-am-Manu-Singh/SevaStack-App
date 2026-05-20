import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Scissors, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Building, 
  Utensils, 
  Printer,
  FileText
} from 'lucide-react-native';
import { Spacing } from '../constants/Theme';
import { GlassCard } from './GlassCard';
import { useApp } from '../lib/AppContext';

/**
 * Stitching Tracker Widget (Tailor)
 * Progress timeline for custom garments
 */
export const StitchingTrackerWidget = ({ order }: { order: any }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const stages = ['Ready', 'Ironing', 'Stitching', 'Cutting', 'Measured'];
  const currentStageIdx = 2; // Mocking "Stitching"

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Scissors size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Stitching Status: {order.name}</Text>
      </View>
      
      <View style={styles.timeline}>
        {stages.map((stage, idx) => {
          const isDone = stages.length - 1 - idx < currentStageIdx;
          const isCurrent = stages.length - 1 - idx === currentStageIdx;
          
          return (
            <View key={stage} style={styles.stageRow}>
              <View style={styles.lineCol}>
                 <View style={[styles.dot, { backgroundColor: isDone || isCurrent ? colors.primary : colors.border }]} />
                 {idx !== stages.length - 1 && <View style={[styles.line, { backgroundColor: isDone ? colors.primary : colors.border }]} />}
              </View>
              <Text style={[styles.stageTxt, { color: isCurrent ? colors.text : colors.textMuted, fontWeight: isCurrent ? '700' : '400' }]}>
                {stage}
              </Text>
              {isCurrent && <Sparkles size={12} color={colors.secondary || colors.accent} style={{ marginLeft: 8 }} />}
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
};

/**
 * Library Seat Map Widget
 * Grid visualization of study seats
 */
export const LibrarySeatMapWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const seats = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, occupied: Math.random() > 0.6 }));

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <BookOpen size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Live Seat Occupancy</Text>
      </View>
      
      <View style={styles.seatGrid}>
        {seats.map(seat => (
          <View key={seat.id} style={[styles.seat, { backgroundColor: seat.occupied ? colors.primary + '15' : colors.surfaceLight + '40', borderColor: seat.occupied ? colors.primary : colors.border }]}>
             <Text style={[styles.seatNum, { color: seat.occupied ? colors.primary : colors.textMuted }]}>{seat.id}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
         <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={[styles.legendTxt, { color: colors.textMuted }]}>Occupied</Text></View>
         <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.border }]} /><Text style={[styles.legendTxt, { color: colors.textMuted }]}>Available</Text></View>
      </View>
    </GlassCard>
  );
};

/**
 * Pharmacy Refill Widget
 * List of regular medication renewals
 */
export const RefillReminderWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const router = useRouter();
  const refills = [
    { name: 'Sameer Khan', med: 'Glycomet 500mg', days: 2 },
    { name: 'Rohan Mehra', med: 'Telma 40', days: 5 },
  ];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <FileText size={18} color={colors.error || '#EF4444'} />
        <Text style={[styles.title, { color: colors.text }]}>Impending Refills</Text>
      </View>
      
      {refills.map((item, idx) => (
        <View key={idx} style={[styles.refillItem, { borderBottomWidth: idx === refills.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
           <View style={styles.flex1}>
              <Text style={[styles.customerName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.medName, { color: colors.textMuted }]}>{item.med}</Text>
           </View>
           <View style={[styles.daysBadge, { backgroundColor: (colors.error || '#EF4444') + '15' }]}>
              <Text style={[styles.daysTxt, { color: colors.error || '#EF4444' }]}>{item.days} days left</Text>
           </View>
           <TouchableOpacity 
             style={[styles.callBtn, { backgroundColor: colors.primary }]}
             onPress={() => router.push('/business/chemist-shop' as any)}
           >
              <ArrowRight size={14} color="#FFF" />
           </TouchableOpacity>
        </View>
      ))}
    </GlassCard>
  );
};

/**
 * Hostel Room Management Widget
 * Track occupancy and fee status
 */
export const HostelRoomManagementWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const rooms = [
    { no: '101', type: 'Single', status: 'Occupied', fee: 'Paid' },
    { no: '102', type: 'Double', status: 'Available', fee: '-' },
    { no: '201', type: 'Single', status: 'Occupied', fee: 'Pending' },
    { no: '202', type: 'Triple', status: 'Occupied', fee: 'Paid' },
  ];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Building size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Hostel Room Map</Text>
      </View>
      <View style={styles.roomList}>
        {rooms.map((room, idx) => (
          <View key={idx} style={[styles.roomItem, { backgroundColor: room.status === 'Available' ? (colors.success || '#10B981') + '15' : colors.surfaceLight + '30' }]}>
            <Text style={[styles.roomNo, { color: colors.text }]}>{room.no}</Text>
            <Text style={[styles.roomType, { color: colors.textMuted }]}>{room.type}</Text>
            <View style={[styles.feeBadge, { backgroundColor: room.fee === 'Pending' ? '#EF4444' : (room.fee === 'Paid' ? (colors.success || '#10B981') : colors.border) }]}>
              <Text style={styles.feeTxt}>{room.fee}</Text>
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
};

/**
 * Tiffin Menu Planner
 * Weekly meal management
 */
export const TiffinMenuWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const router = useRouter();
  const days = [
    { day: 'Mon', lunch: 'Paneer, Roti, Rice', dinner: 'Dal Tadka, Roti' },
    { day: 'Tue', lunch: 'Mix Veg, Roti, Rice', dinner: 'Kadi Pakoda, Rice' },
    { day: 'Wed', lunch: 'Aloo Gobhi, Paratha', dinner: 'Egg Curry, Roti' },
  ];

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Utensils size={18} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Mess Weekly Menu</Text>
        </View>
        <TouchableOpacity 
          style={{ padding: 4 }}
          onPress={() => router.push('/business/tiffin-manager' as any)}
        >
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
        {days.map((item, idx) => (
          <View key={idx} style={[styles.menuDayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.menuDayLabel, { color: colors.primary }]}>{item.day}</Text>
            <View style={styles.menuMeal}>
               <Text style={[styles.mealTime, { color: colors.textMuted }]}>Lunch</Text>
               <Text style={[styles.mealContent, { color: colors.text }]}>{item.lunch}</Text>
            </View>
            <View style={styles.menuMeal}>
               <Text style={[styles.mealTime, { color: colors.textMuted }]}>Dinner</Text>
               <Text style={[styles.mealContent, { color: colors.text }]}>{item.dinner}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </GlassCard>
  );
};

/**
 * Live Barber Salon Seat Desk & Queue Widget
 * Real-time chair status and waiting list
 */
export const SalonQueueWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const router = useRouter();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Scissors size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Live Barber Seat Desk</Text>
      </View>
      
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>
          Seat 1 & 2: Busy • Seat 3: Vacant
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
          Manoj & Vikranth are styling. Next up: Sumit Agrawal (Fade Cut).
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, backgroundColor: colors.surfaceLight + '30', padding: 10, borderRadius: 8 }}>
        <View>
          <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '700' }}>WAITING CLIENTS</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 }}>3 Students</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '700' }}>EST. WAIT TIME</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.accent, marginTop: 2 }}>~25 Mins</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={{
          flexDirection: 'row',
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}
        onPress={() => router.push('/business/barber-manager' as any)}
      >
        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Manage Queue & Seats</Text>
        <ArrowRight size={14} color="#FFF" />
      </TouchableOpacity>
    </GlassCard>
  );
};

/**
 * Stationery & Printing Queue Widget
 * Real-time active print jobs and exam study booklet metrics
 */
export const StationeryPrintWidget = () => {
  const { colors } = useApp();
  const styles = getStyles(colors);
  const router = useRouter();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Printer size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Live Print Queue Desk</Text>
      </View>
      
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>
          Active Print Job: CS-302_OS_Lab_Report.pdf
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
          Double-sided B/W • 42 Pages • Vikram Grover • Spiral Binding
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, backgroundColor: colors.surfaceLight + '30', padding: 10, borderRadius: 8 }}>
        <View>
          <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '700' }}>QUEUED JOBS</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 }}>3 Active PDF Files</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '700' }}>CRITICAL SYLLABUS PACKS</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.error || '#EF4444', marginTop: 2 }}>2 Low-Stock Items</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={{
          flexDirection: 'row',
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}
        onPress={() => router.push('/business/stationery-manager' as any)}
      >
        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Manage Print Queue & Packs</Text>
        <ArrowRight size={14} color="#FFF" />
      </TouchableOpacity>
    </GlassCard>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  timeline: {
    paddingLeft: 4,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
  },
  lineCol: {
    alignItems: 'center',
    width: 20,
    height: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
  },
  stageTxt: {
    fontSize: 13,
    marginLeft: 12,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTxt: {
    fontSize: 10,
    fontWeight: '600',
  },
  refillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  medName: {
    fontSize: 12,
    marginTop: 2,
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  daysTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roomItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  roomNo: {
    fontSize: 16,
    fontWeight: '800',
  },
  roomType: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  feeBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  feeTxt: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  menuScroll: {
    marginTop: 4,
  },
  menuDayCard: {
    width: 140,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10,
    gap: 8,
  },
  menuDayLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuMeal: {
    gap: 2,
  },
  mealTime: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  mealContent: {
    fontSize: 11,
    fontWeight: '600',
  }
});
