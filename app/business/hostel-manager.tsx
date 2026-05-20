import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert, Dimensions, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { 
  Building, 
  Users, 
  CreditCard, 
  AlertTriangle,
  ChevronRight,
  Plus,
  Home,
  CheckCircle,
  Clock,
  Key,
  Calendar,
  Shield,
  Trash2,
  Lock,
  ArrowUpRight
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { CustomerBusinessView } from '@/components/CustomerBusinessView';

const { width } = Dimensions.get('window');

interface StudentResident {
  id: string;
  name: string;
  room: string;
  due: number;
  status: 'Paid' | 'Overdue' | 'Vacating';
  image: string;
  college: string;
}

interface GatePass {
  id: string;
  studentName: string;
  room: string;
  reason: string;
  outTime: string;
  status: 'Pending' | 'Approved' | 'Returned';
}

export default function HostelManagerScreen() {
  const { userRole, businessType } = useApp();
  
  if (userRole === 'customer' || businessType !== 'Hostel') {
    return <CustomerBusinessView type="Hostel" />;
  }

  return <HostelManagerScreenMerchant />;
}

function HostelManagerScreenMerchant() {

  const { colors, theme, profile, userRole, businessType } = useApp();
  
  
  
  // Dynamic Supabase State
  const [residents, setResidents] = useState<any[]>([]);
  const [gatePasses, setGatePasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const [resData, passData] = await Promise.all([
        supabase.from('hostel_residents').select('*').eq('merchant_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('hostel_gate_passes').select('*, resident:hostel_residents(student_name, room_number)').eq('merchant_id', profile.id).order('created_at', { ascending: false })
      ]);

      let finalResidents = resData.data || [];
      if (!resData.data || resData.data.length === 0) {
        const defaultResidents = [
          { student_name: 'Varun Dhawan', room_number: 'Room A-108', college_affiliation: 'IIT Kota', rent_due: 4500, status: 'Overdue', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80' },
          { student_name: 'Alia Bhatt', room_number: 'Room C-204', college_affiliation: 'IIIT Kota', rent_due: 0, status: 'Paid', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' }
        ].map(r => ({ ...r, merchant_id: profile.id }));
        const seedRes = await supabase.from('hostel_residents').insert(defaultResidents).select();
        if (seedRes.data) finalResidents = seedRes.data;
      }

      const mappedResidents = finalResidents.map((row: any) => ({
        id: row.id,
        name: row.student_name,
        room: row.room_number,
        due: parseFloat(row.rent_due) || 0,
        status: row.status,
        image: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
        college: row.college_affiliation
      }));
      setResidents(mappedResidents);

      let finalPasses = passData.data || [];
      if ((!passData.data || passData.data.length === 0) && finalResidents.length > 0) {
        const varunId = finalResidents.find(r => r.student_name === 'Varun Dhawan')?.id;
        const aliaId = finalResidents.find(r => r.student_name === 'Alia Bhatt')?.id;

        const defaultPasses = [];
        if (varunId) {
          defaultPasses.push({ resident_id: varunId, reason: 'Coaching Class Doubt Session', out_time: 'Today 04:00 PM', status: 'Pending' });
        }
        if (aliaId) {
          defaultPasses.push({ resident_id: aliaId, reason: 'Visiting Parents', out_time: 'Yesterday 09:00 AM', status: 'Approved' });
        }

        if (defaultPasses.length > 0) {
          const seedPasses = defaultPasses.map(p => ({ ...p, merchant_id: profile.id }));
          const seedRes = await supabase.from('hostel_gate_passes').insert(seedPasses).select('*, resident:hostel_residents(student_name, room_number)');
          if (seedRes.data) finalPasses = seedRes.data;
        }
      }

      const mappedPasses = finalPasses.map((row: any) => ({
        id: row.id,
        studentName: row.resident?.student_name || 'Resident',
        room: row.resident?.room_number || 'N/A',
        reason: row.reason,
        outTime: row.out_time,
        status: row.status
      }));
      setGatePasses(mappedPasses);

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const [activeTab, setActiveTab] = useState<'residents' | 'gatepass' | 'maintenance'>('residents');
  
  // Form State for Adding Student
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    room: '',
    due: '',
    college: '',
  });

  // Analytics
  const occupiedRooms = residents.length;
  const totalCapacity = 45;
  const occupancyPercentage = totalCapacity > 0 ? (occupiedRooms / totalCapacity) * 100 : 0;
  const pendingRentTotal = residents.reduce((sum, r) => sum + r.due, 0);

  const handleSettleRent = (id: string, name: string) => {
    Alert.alert(
      "Settle Rent Dues",
      `Record complete payment of outstanding dues for ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Settle",
          onPress: async () => {
            try {
              const { error } = await supabase.from('hostel_residents').update({
                rent_due: 0,
                status: 'Paid'
              }).eq('id', id);
              if (error) throw error;
              Alert.alert("Rent Settle Recorded", `${name}'s outstanding dues have been successfully settled!`);
              fetchData();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }
        }
      ]
    );
  };

  const handleApproveGatePass = async (id: string) => {
    try {
      const { error } = await supabase.from('hostel_gate_passes').update({ status: 'Approved' }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleReturnGatePass = async (id: string) => {
    try {
      const { error } = await supabase.from('hostel_gate_passes').update({ status: 'Returned' }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleAddStudentSubmit = async () => {
    if (!newStudent.name || !newStudent.room) {
      Alert.alert("Input Required", "Please provide a student name and room number.");
      return;
    }
    if (!profile?.id) return;

    const dueVal = parseFloat(newStudent.due) || 0;

    try {
      const { error } = await supabase.from('hostel_residents').insert([{
        merchant_id: profile.id,
        student_name: newStudent.name,
        room_number: newStudent.room,
        college_affiliation: newStudent.college || 'Kota Educational Academy',
        rent_due: dueVal,
        status: dueVal > 0 ? 'Overdue' : 'Paid',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'
      }]);

      if (error) throw error;

      Alert.alert("Student Registered", `${newStudent.name} is now allocated to Room ${newStudent.room}.`);
      setIsAddingStudent(false);
      setNewStudent({ name: '', room: '', due: '', college: '' });
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Hostel Manager' }} />

      <ScrollView 
         showsVerticalScrollIndicator={false} 
         contentContainerStyle={styles.scrollContent}
         refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {/* Occupancy and Rent HUD */}
        <GlassCard style={styles.hudCard}>
          <View style={styles.hudHeader}>
             <View>
                <Text style={[styles.hudSub, { color: 'rgba(255,255,255,0.7)' }]}>MONTHLY OUTSTANDING</Text>
                <Text style={styles.hudPendingAmt}>₹{pendingRentTotal.toLocaleString('en-IN')}</Text>
             </View>
             <Building size={32} color="#FFF" />
          </View>

          <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 }]} />

          {/* Progress Occupancy */}
          <View style={styles.occupancyBarContainer}>
             <View style={styles.occupancyLabels}>
                <Text style={styles.occupancyText}>Hostel Room Occupancy</Text>
                <Text style={styles.occupancyText}>{occupiedRooms}/{totalCapacity} Rooms</Text>
             </View>
             <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${occupancyPercentage}%` }]} />
             </View>
          </View>
        </GlassCard>

        {/* Residents View */}
        {activeTab === 'residents' && (
          <View style={styles.fadeContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Roster</Text>
              {!isAddingStudent && (
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setIsAddingStudent(true)}>
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.addBtnTxt}>Add Resident</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Add Resident Form */}
            {isAddingStudent && (
              <GlassCard style={styles.formCard}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Register New Student</Text>
                
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Student Name</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={newStudent.name}
                  onChangeText={val => setNewStudent({ ...newStudent, name: val })}
                />

                <View style={styles.formRow}>
                  <View style={styles.flex1}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Room No</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                      placeholder="304"
                      placeholderTextColor={colors.textMuted}
                      value={newStudent.room}
                      onChangeText={val => setNewStudent({ ...newStudent, room: val })}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Advance/Due (₹)</Text>
                    <TextInput
                      style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={newStudent.due}
                      onChangeText={val => setNewStudent({ ...newStudent, due: val })}
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Kota Coaching College/Institute</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceLight }]}
                  placeholder="e.g. Allen Institute"
                  placeholderTextColor={colors.textMuted}
                  value={newStudent.college}
                  onChangeText={val => setNewStudent({ ...newStudent, college: val })}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={[styles.cancelFormBtn, { borderColor: colors.border }]} onPress={() => setIsAddingStudent(false)}>
                    <Text style={[styles.cancelFormTxt, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitFormBtn, { backgroundColor: colors.primary }]} onPress={handleAddStudentSubmit}>
                    <Text style={styles.submitFormTxt}>Save Allocation</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            )}

            {/* Residents Cards */}
            {residents.map((student) => (
              <GlassCard key={student.id} style={styles.residentCard}>
                <View style={styles.residentHeader}>
                  <Image source={{ uri: student.image }} style={styles.residentAvatar} />
                  <View style={styles.residentInfo}>
                    <Text style={[styles.residentName, { color: colors.text }]}>{student.name}</Text>
                    <Text style={[styles.residentCollege, { color: colors.textMuted }]}>{student.college}</Text>
                    <View style={[styles.roomBadge, { backgroundColor: colors.surface }]}>
                      <Key size={10} color={colors.primary} />
                      <Text style={[styles.roomBadgeTxt, { color: colors.text }]}>Room {student.room}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: student.status === 'Paid' ? colors.success + '20' : colors.error + '20' }]}>
                      <Text style={[styles.statusTxt, { color: student.status === 'Paid' ? colors.success : colors.error }]}>
                        {student.status.toUpperCase()}
                      </Text>
                    </View>
                    {student.due > 0 && <Text style={[styles.dueAmt, { color: colors.text }]}>₹{student.due}</Text>}
                  </View>
                </View>

                {student.due > 0 && (
                  <View style={styles.residentActions}>
                    <TouchableOpacity 
                      style={[styles.settleBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleSettleRent(student.id, student.name)}
                    >
                      <CreditCard size={14} color="#FFF" />
                      <Text style={styles.settleBtnTxt}>Record Rent Cashout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {/* Gate Pass View */}
        {activeTab === 'gatepass' && (
          <View style={styles.fadeContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Active Checkout Passes</Text>
            
            {gatePasses.map((pass) => (
              <GlassCard key={pass.id} style={styles.passCard}>
                <View style={styles.passHeader}>
                  <View>
                    <Text style={[styles.passStudent, { color: colors.text }]}>{pass.studentName}</Text>
                    <Text style={[styles.passMeta, { color: colors.textMuted }]}>Room {pass.room} • Out at: {pass.outTime}</Text>
                  </View>

                  <View style={[
                    styles.passStatusBadge, 
                    pass.status === 'Approved' && { backgroundColor: colors.success + '20' },
                    pass.status === 'Pending' && { backgroundColor: '#F59E0B20' },
                    pass.status === 'Returned' && { backgroundColor: colors.primary + '20' }
                  ]}>
                    <Text style={[
                      styles.passStatusTxt,
                      pass.status === 'Approved' && { color: colors.success },
                      pass.status === 'Pending' && { color: '#F59E0B' },
                      pass.status === 'Returned' && { color: colors.primary }
                    ]}>
                      {pass.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.passReason, { color: colors.text, backgroundColor: colors.surface }]}>
                  Reason: {pass.reason}
                </Text>

                {pass.status === 'Pending' && (
                  <View style={styles.passActions}>
                    <TouchableOpacity 
                      style={[styles.passApproveBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleApproveGatePass(pass.id)}
                    >
                      <CheckCircle size={14} color="#FFF" />
                      <Text style={styles.passApproveTxt}>Approve Outing</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {pass.status === 'Approved' && (
                  <View style={styles.passActions}>
                    <TouchableOpacity 
                      style={[styles.passReturnBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleReturnGatePass(pass.id)}
                    >
                      <ArrowUpRight size={14} color="#FFF" />
                      <Text style={styles.passReturnTxt}>Record Return Check-in</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {/* Maintenance View */}
        {activeTab === 'maintenance' && (
          <View style={styles.fadeContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Amenities & Repairs Check</Text>
            
            <GlassCard style={styles.maintenanceCard}>
              <View style={styles.amenityStatusRow}>
                <View style={styles.amenityIconBox}>
                  <Home size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amenityTitle, { color: colors.text }]}>High-speed Hostel Wi-Fi</Text>
                  <Text style={[styles.amenityDesc, { color: colors.textMuted }]}>Main router server (Common room)</Text>
                </View>
                <View style={[styles.amenityActiveBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.amenityActiveTxt, { color: colors.success }]}>NOMINAL</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 14 }]} />

              <View style={styles.amenityStatusRow}>
                <View style={[styles.amenityIconBox, { backgroundColor: '#F59E0B20' }]}>
                  <AlertTriangle size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amenityTitle, { color: colors.text }]}>Hostel Elevator Block B</Text>
                  <Text style={[styles.amenityDesc, { color: colors.textMuted }]}>Scheduled motor safety inspection</Text>
                </View>
                <View style={[styles.amenityActiveBadge, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={[styles.amenityActiveTxt, { color: '#F59E0B' }]}>MAINTENANCE DUE</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 14 }]} />

              <View style={styles.amenityStatusRow}>
                <View style={[styles.amenityIconBox, { backgroundColor: colors.error + '20' }]}>
                  <Lock size={22} color={colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amenityTitle, { color: colors.text }]}>Biometric Attendance Gate</Text>
                  <Text style={[styles.amenityDesc, { color: colors.textMuted }]}>Warden exit fingerprint gate offline</Text>
                </View>
                <View style={[styles.amenityActiveBadge, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.amenityActiveTxt, { color: colors.error }]}>INCIDENT LOGGED</Text>
                </View>
              </View>
            </GlassCard>

            <TouchableOpacity 
              style={[styles.reportIncidentBtn, { borderColor: colors.error }]}
              onPress={() => Alert.alert("Incident Reporting Center", "Log Wi-Fi outages or broken water filters to Warden desk.")}
            >
              <AlertTriangle size={18} color={colors.error} />
              <Text style={[styles.reportIncidentTxt, { color: colors.error }]}>Log New Hostel Issue</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={[
        styles.bottomTabBar, 
        { 
          backgroundColor: colors.surface + 'E8', 
          borderColor: colors.border,
          shadowColor: colors.primary,
        }
      ]}>
        {[
          { id: 'residents', label: 'Residents', icon: Users },
          { id: 'gatepass', label: 'Gate Pass', icon: Key },
          { id: 'maintenance', label: 'Amenities', icon: Shield },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.bottomTabBtn, isActive && { backgroundColor: colors.primary + '18' }]}
              onPress={() => { setActiveTab(tab.id as any); setIsAddingStudent(false); }}
            >
              <View style={[styles.bottomTabIndicator, isActive && { backgroundColor: colors.primary }]} />
              <Icon size={20} color={isActive ? colors.primary : colors.textMuted} />
              <Text style={[styles.bottomTabLabel, { color: isActive ? colors.primary : colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  hudCard: {
    backgroundColor: '#6366F1',
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudSub: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hudPendingAmt: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  divider: {
    height: 1,
  },
  occupancyBarContainer: {
    gap: 8,
  },
  occupancyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fadeContainer: {
    animationDuration: '300ms',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  addBtnTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  residentCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  residentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 14,
  },
  residentInfo: {
    flex: 1,
    gap: 4,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  residentCollege: {
    fontSize: 11,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roomBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
  },
  paymentInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTxt: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dueAmt: {
    fontSize: 15,
    fontWeight: '800',
  },
  residentActions: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  settleBtn: {
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  settleBtnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  passCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passStudent: {
    fontSize: 15,
    fontWeight: '700',
  },
  passMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  passStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passStatusTxt: {
    fontSize: 9,
    fontWeight: '900',
  },
  passReason: {
    fontSize: 12,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  passActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  passApproveBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  passApproveTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  passReturnBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  passReturnTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  maintenanceCard: {
    padding: 16,
  },
  amenityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amenityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  amenityDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  amenityActiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amenityActiveTxt: {
    fontSize: 8,
    fontWeight: '900',
  },
  reportIncidentBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  reportIncidentTxt: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  formCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelFormBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelFormTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitFormBtn: {
    flex: 2,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitFormTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    elevation: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  bottomTabBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  bottomTabIndicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  bottomTabLabel: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
