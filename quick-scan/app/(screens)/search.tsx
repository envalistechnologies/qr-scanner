import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ScreenContainer, AppHeader, SearchBar, EmptyState, Tag } from '../../components';

export default function SearchScreen() {
  const { theme } = useAppTheme();
  const [query, setQuery] = useState('');

  return (
    <ScreenContainer withSafeArea testID="search-placeholder-screen">
      <AppHeader title="Universal Search" subtitle="Query history, bookmarks & settings" showBack={true} />

      <View style={[styles.searchBox, { marginVertical: theme.spacing[16] }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Type URLs, SSIDs, or EAN product titles..."
          onClear={() => setQuery('')}
          autoFocus={true}
        />
      </View>

      <View style={{ alignItems: 'center', marginBottom: theme.spacing[12] }}>
        <Tag label="LOCAL DATABASE SEARCH READY" variant="info" dot />
      </View>

      <View style={styles.resultContainer}>
        {query.length === 0 ? (
          <EmptyState
            icon="search"
            title="Search Quick Scan Database"
            description="Enter any keyword above to instantly search through your locally stored scan logs, generated QR matrix assets, and application configurations."
          />
        ) : (
          <EmptyState
            icon="error"
            title={`No Matches for "${query}"`}
            description="We couldn't find any corresponding local records matching your search criteria in this demo preview."
            actionLabel="Clear Search Filter"
            onActionPress={() => setQuery('')}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    width: '100%',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
