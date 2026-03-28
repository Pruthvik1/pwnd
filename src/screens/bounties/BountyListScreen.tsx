import React from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { BountyCard } from "@/components/BountyCard";
import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useBounties } from "@/hooks/useBounties";
import { useUIStore } from "@/stores/uiStore";

export function BountyListScreen() {
  const navigation = useNavigation<any>();
  const { data = [], isLoading } = useBounties();
  const { bountyFilter, setBountyFilter } = useUIStore();
  const [search, setSearch] = React.useState("");

  const filtered = data.filter((bounty) => {
    const query = search.toLowerCase();
    const matchesSearch =
      bounty.company_name.toLowerCase().includes(query) ||
      (bounty.vulnerability_type ?? "").toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    if (bountyFilter === "all") {
      return true;
    }
    if (bountyFilter === "active") {
      return ["reported", "triaging"].includes(bounty.status);
    }
    if (bountyFilter === "pending") {
      return ["reported", "triaging", "accepted"].includes(bounty.status);
    }
    return bounty.status === bountyFilter;
  });

  const filters: Array<typeof bountyFilter> = [
    "all",
    "active",
    "accepted",
    "pending",
    "duplicate",
    "rejected",
    "paid",
  ];

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bounties</Text>
        <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddBounty")}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Search company or vulnerability"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filtersWrap}>
        {filters.map((filter) => {
          const active = filter === bountyFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => setBountyFilter(filter)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? <Text>Loading bounties...</Text> : null}

      <FlatList
        scrollEnabled={false}
        data={filtered}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <BountyCard
            bounty={item}
            onPress={() => navigation.navigate("BountyDetail", { bountyId: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No bounties found.</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  addButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filtersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.white,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 11,
    color: theme.colors.muted,
    fontWeight: "700",
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  empty: {
    color: theme.colors.muted,
    marginTop: 12,
  },
});
