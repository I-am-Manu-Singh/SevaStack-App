import React, { useMemo, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
 FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';

import { Stack } from 'expo-router';

import {
  Package,
  Search,
  Plus,
  AlertCircle,
  Filter,
  TrendingUp,
  Boxes,
  X,
  ChevronRight,
} from 'lucide-react-native';

import { Spacing } from '@/constants/Theme';
import { GlassCard } from '@/components/GlassCard';
import { useApp } from '@/lib/AppContext';
import { StatusBar } from 'expo-status-bar';

// ======================================================
// SCREEN
// ======================================================

export default function InventoryScreen() {
  const {
    colors,
    inventory,
    updateStock,
    theme,
  } = useApp();

  const [search, setSearch] = useState('');

  // ======================================================
  // FILTERED DATA
  // ======================================================

  const filteredInventory = useMemo(() => {
    return inventory.filter((item: any) =>
      item.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [inventory, search]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(
      (i: any) => i.stock <= i.minLevel
    ).length;
  }, [inventory]);

  const totalStockValue = useMemo(() => {
    return inventory.reduce(
      (acc: number, item: any) =>
        acc + item.stock * item.price,
      0
    );
  }, [inventory]);

  // ======================================================
  // ITEM
  // ======================================================

  const renderItem = ({ item }: { item: any }) => {
    const isLowStock =
      item.stock <= item.minLevel;

    return (
      <GlassCard
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.itemMain}>
          {/* IMAGE */}

          <Image
            source={{
              uri:
                item.image ||
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
            }}
            style={styles.itemImg}
          />

          {/* CENTER CONTENT */}

          <View style={styles.itemInfo}>
            <View style={styles.itemTopRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.itemName,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {item.name}
              </Text>

              {isLowStock && (
                <View style={styles.lowBadge}>
                  <AlertCircle
                    size={10}
                    color="#F43F5E"
                  />

                  <Text style={styles.lowText}>
                    LOW
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.itemCat,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              {item.category}
            </Text>

            <View style={styles.stockRow}>
              <Text
                style={[
                  styles.stockLabel,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Available Stock
              </Text>

              <Text
                style={[
                  styles.stockVal,
                  {
                    color: isLowStock
                      ? '#F43F5E'
                      : colors.text,
                  },
                ]}
              >
                {item.stock} {item.unit}
              </Text>
            </View>
          </View>

          {/* RIGHT SIDE */}

          <View style={styles.actionCol}>
            <Text
              style={[
                styles.priceVal,
                {
                  color: colors.primary,
                },
              ]}
            >
              ₹{item.price}
            </Text>

            <View style={styles.adjustRow}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.adjustBtn,
                  {
                    backgroundColor:
                      colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  updateStock(item.id, -1)
                }
              >
                <Text
                  style={[
                    styles.adjustTxt,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  −
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={[
                  styles.adjustBtn,
                  {
                    backgroundColor:
                      colors.primary,
                    borderColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  updateStock(item.id, 1)
                }
              >
                <Text
                  style={[
                    styles.adjustTxt,
                    {
                      color: '#FFF',
                    },
                  ]}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GlassCard>
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      <Stack.Screen
        options={{
          title: 'Inventory Hub',
          headerShadowVisible: false,

          headerStyle: {
            backgroundColor:
              colors.background,
          },

          headerTitleStyle: {
            color: colors.text,
            fontWeight: '900',
          },

          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.headerBtn,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <ChevronRight
                size={18}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* HERO */}

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Inventory Control
            </Text>

            <Text
              style={[
                styles.heroSub,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Monitor stock levels,
              refill alerts, product
              flow and valuation.
              Humanity invented supply
              chains and still loses
              onions somehow. Remarkable
              species.
            </Text>
          </View>

          <View
            style={[
              styles.heroIconWrap,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Boxes
              size={28}
              color={colors.primary}
            />
          </View>
        </View>

        {/* SEARCH */}

        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Search
              size={18}
              color={
                colors.textMuted
              }
            />

            <TextInput
              placeholder="Search stock..."
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                },
              ]}
              placeholderTextColor={
                colors.textMuted
              }
              value={search}
              onChangeText={setSearch}
            />

            {search ? (
              <TouchableOpacity
                onPress={() =>
                  setSearch('')
                }
              >
                <X
                  size={18}
                  color={
                    colors.textMuted
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Filter
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SUMMARY */}

      <View style={styles.summaryGrid}>
        <GlassCard
          style={[
            styles.sumCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Package
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.sumVal,
              {
                color: colors.text,
              },
            ]}
          >
            {inventory.length}
          </Text>

          <Text
            style={[
              styles.sumLab,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            Active SKUs
          </Text>
        </GlassCard>

        <GlassCard
          style={[
            styles.sumCard,
            {
              backgroundColor:
                '#F43F5E15',
              borderColor:
                '#F43F5E25',
            },
          ]}
        >
          <AlertCircle
            size={20}
            color="#F43F5E"
          />

          <Text
            style={[
              styles.sumVal,
              {
                color: '#F43F5E',
              },
            ]}
          >
            {lowStockCount}
          </Text>

          <Text
            style={[
              styles.sumLab,
              {
                color: '#F43F5E',
              },
            ]}
          >
            Low Stock
          </Text>
        </GlassCard>

        <GlassCard
          style={[
            styles.sumCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <TrendingUp
            size={20}
            color={colors.success}
          />

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.sumVal,
              {
                color: colors.text,
                fontSize: 15,
              },
            ]}
          >
            ₹
            {Math.round(
              totalStockValue
            )}
          </Text>

          <Text
            style={[
              styles.sumLab,
              {
                color:
                  colors.textMuted,
              },
            ]}
          >
            Stock Value
          </Text>
        </GlassCard>
      </View>

      {/* LIST */}

      <FlatList
        data={filteredInventory}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        ListEmptyComponent={
          <GlassCard
            style={[
              styles.emptyWrap,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor:
                    colors.primary +
                    '12',
                },
              ]}
            >
              <Package
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              No Inventory Found
            </Text>

            <Text
              style={[
                styles.emptySub,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Try another search or
              add products into your
              inventory system.
            </Text>
          </GlassCard>
        }
      />

      {/* FAB */}

      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.addBtn,
          {
            backgroundColor:
              colors.primary,
            shadowColor:
              colors.primary,
          },
        ]}
      >
        <Plus size={26} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 16,
  },

  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  heroSub: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    paddingRight: 12,
    fontWeight: '500',
  },

  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  filterBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 10,
    marginBottom: 14,
  },

  sumCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'center',
  },

  sumVal: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 10,
  },

  sumLab: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 130,
    paddingTop: 2,
  },

  itemCard: {
    marginBottom: 14,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
  },

  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemImg: {
    width: 74,
    height: 74,
    borderRadius: 20,
    marginRight: 14,
    backgroundColor: '#111',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  itemCat: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },

  stockRow: {
    marginTop: 10,
  },

  stockLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.5,
  },

  stockVal: {
    fontSize: 14,
    fontWeight: '900',
  },

  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F43F5E15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  lowText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F43F5E',
    textTransform: 'uppercase',
  },

  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 74,
    marginLeft: 10,
  },

  priceVal: {
    fontSize: 16,
    fontWeight: '900',
  },

  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  adjustBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  adjustTxt: {
    fontSize: 18,
    fontWeight: '900',
  },

  emptyWrap: {
    marginTop: 70,
    borderRadius: 28,
    paddingVertical: 42,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
  },

  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  emptySub: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },

  addBtn: {
    position: 'absolute',
    bottom: 30,
    right: 24,

    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 12,

    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
    }),
  },
});