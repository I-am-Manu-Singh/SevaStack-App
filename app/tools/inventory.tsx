import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Package, 
  Search, 
  Plus, 
  AlertCircle, 
  ArrowRight,
  Filter,
  ArrowUpDown
} from 'lucide-react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';

export default function InventoryScreen() {
  const { colors, t, inventory, updateStock } = useApp();
  const [search, setSearch] = useState('');

  const lowStockCount = inventory.filter(i => i.stock <= i.minLevel).length;

  const renderItem = ({ item }: { item: any }) => {
    const isLowStock = item.stock <= item.minLevel;
    
    return (
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemMain}>
          <Image source={{ uri: item.image }} style={styles.itemImg} />
          <View style={styles.itemInfo}>
             <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
             <Text style={[styles.itemCat, { color: colors.textMuted }]}>{item.category}</Text>
             <View style={styles.stockRow}>
                <Text style={[styles.stockVal, { color: isLowStock ? '#F43F5E' : colors.text }]}>
                   Current: {item.stock} {item.unit}
                </Text>
                {isLowStock && (
                  <View style={styles.lowBadge}>
                     <AlertCircle size={10} color="#F43F5E" />
                     <Text style={styles.lowText}>Refill</Text>
                  </View>
                )}
             </View>
          </View>
          <View style={styles.actionCol}>
             <Text style={[styles.priceVal, { color: colors.primary }]}>₹{item.price}</Text>
             <View style={styles.adjustRow}>
                <TouchableOpacity 
                   style={[styles.adjustBtn, { backgroundColor: colors.surface }]}
                   onPress={() => updateStock(item.id, -1)}
                >
                   <Text style={{ color: colors.text, fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
                   onPress={() => updateStock(item.id, 1)}
                >
                   <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Inventory Hub' }} />
      
      <View style={styles.searchRow}>
         <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput 
              placeholder="Search stock..." 
              style={[styles.input, { color: colors.text }]}
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
         </View>
         <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.surface }]}>
            <Filter size={20} color={colors.text} />
         </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
         <View style={[styles.sumCard, { backgroundColor: colors.surface }]}>
            <Package size={20} color={colors.primary} />
            <Text style={[styles.sumVal, { color: colors.text }]}>{inventory.length}</Text>
            <Text style={[styles.sumLab, { color: colors.textMuted }]}>SKUs Active</Text>
         </View>
         <View style={[styles.sumCard, { backgroundColor: '#F43F5E15' }]}>
            <AlertCircle size={20} color="#F43F5E" />
            <Text style={[styles.sumVal, { color: '#F43F5E' }]}>{lowStockCount}</Text>
            <Text style={[styles.sumLab, { color: '#F43F5E' }]}>Refill Needed</Text>
         </View>
      </View>

      <FlatList
        data={inventory.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
         <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 12,
    marginBottom: Spacing.md,
  },
  sumCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    gap: 4,
  },
  sumVal: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  sumLab: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 12,
    padding: 12,
  },
  itemMain: {
    flexDirection: 'row',
    gap: 12,
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemCat: {
    fontSize: 12,
    marginTop: 2,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  stockVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F43F5E15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F43F5E',
    textTransform: 'uppercase',
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});
