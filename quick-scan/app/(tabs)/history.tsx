import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { useHistory, useFavorites } from '../../hooks';
import { ScreenContainer, AppHeader, SearchBar, Chip, EmptyState, IconButton, ListItem, BottomSheet, OutlineButton } from '../../components';
import { ShareService, ClipboardService } from '../../services';
import { HistoryItem } from '../../types/domain';

export default function HistoryTab() {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const { items, removeRecord, clearArchive: clearHistory, updateRecordTitle } = useHistory() as any;
  const { toggleFavorite, isFavoriteScan } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [moreSheetVisible, setMoreSheetVisible] = useState<boolean>(false);
  const [renameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const [activeItemForSheet, setActiveItemForSheet] = useState<HistoryItem | null>(null);
  const [newTitleInput, setNewTitleInput] = useState<string>('');

  const filters = [
    { label: 'All', display: 'All', icon: undefined },
    { label: 'QR Codes', display: 'QR Codes', icon: 'qr' as const },
    { label: 'Barcodes', display: 'Barcodes', icon: 'barcode' as const },
    { label: 'Favorites', display: t('favorites_vault', 'Favorites').split(' ')[0], icon: 'favorite' as const },
  ];

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by type or favorite
    if (activeFilter === 'QR Codes') {
      result = result.filter((i) => i.isQR !== false && i.symbology !== 'UPC_A' && i.symbology !== 'EAN_13');
    } else if (activeFilter === 'Barcodes') {
      result = result.filter((i) => i.isQR === false || i.symbology === 'UPC_A' || i.symbology === 'EAN_13' || i.symbology?.includes('BARCODE'));
    } else if (activeFilter === 'Favorites') {
      result = result.filter((i) => isFavoriteScan(i.id) || i.isFavorite);
    }

    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => (i.displayTitle || '').toLowerCase().includes(q) || (i.rawValue || '').toLowerCase().includes(q) || (i.symbology || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, activeFilter, searchQuery, isFavoriteScan]);

  const handleClear = () => {
    Alert.alert(
      t('clear_history', 'Clear Scan History'),
      'Are you sure you want to completely delete all recorded scans from local storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Recent Scan';
    const d = new Date(ts);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isFav = isFavoriteScan(item.id) || item.isFavorite;
    return (
      <ListItem
        title={item.displayTitle || item.rawValue || 'Unknown Code'}
        subtitle={`${item.symbology || (item.isQR ? 'QR Code' : 'Barcode')} • ${formatTimestamp(item.timestamp)}`}
        leadingIcon={item.isQR === false ? 'barcode' : 'qr'}
        onPress={() => {
          router.push({
            pathname: '/(screens)/scan-result',
            params: {
              id: item.id,
              rawValue: item.rawValue,
              displayTitle: item.displayTitle,
              symbology: item.symbology,
              isQR: item.isQR ? 'true' : 'false',
            },
          });
        }}
        trailingElement={
          <View style={styles.trailingRow}>
            <IconButton
              icon={isFav ? 'favoriteFilled' : 'favorite'}
              size={22}
              color={isFav ? theme.customColors.warning : theme.customColors.textSecondary}
              onPress={() => {
                toggleFavorite({
                  id: item.id,
                  rawValue: item.rawValue,
                  displayTitle: item.displayTitle,
                  symbology: item.symbology,
                  isQR: item.isQR,
                  timestamp: item.timestamp || Date.now(),
                }, item.displayTitle).catch((e) => console.error('Error toggling fav:', e));
              }}
              accessibilityLabel="Toggle favorite"
            />
            <IconButton
              icon="delete"
              size={20}
              color={theme.customColors.textSecondary}
              onPress={() => removeRecord(item.id)}
              accessibilityLabel="Delete item"
            />
            <IconButton
              icon="more"
              size={20}
              color={theme.customColors.textSecondary}
              onPress={() => {
                setActiveItemForSheet(item);
                setNewTitleInput(item.displayTitle || item.rawValue || '');
                setMoreSheetVisible(true);
              }}
              accessibilityLabel="More options"
            />
          </View>
        }
      />
    );
  };

  return (
    <ScreenContainer withSafeArea testID="history-tab-screen">
      <AppHeader
        title={t('hist_header', 'Scan History Vault')}
        subtitle={t('hist_subtitle', 'Local offline encrypted archives')}
        showBack={false}
        rightElement={
          <IconButton
            icon="delete"
            size={22}
            onPress={handleClear}
            accessibilityLabel="Clear History"
            disabled={items.length === 0}
            color={items.length > 0 ? theme.customColors.error : theme.customColors.textDisabled}
          />
        }
      />

      <View style={[styles.searchSection, { marginVertical: theme.spacing[12] }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search_placeholder', 'Search archived scans...')}
          onClear={() => setSearchQuery('')}
        />
      </View>

      <View style={[styles.filterRow, { marginBottom: theme.spacing[16] }]}>
        {filters.map((item) => (
          <Chip
            key={item.label}
            label={item.display}
            icon={item.icon}
            selected={activeFilter === item.label}
            onPress={() => setActiveFilter(item.label)}
            style={styles.chipItem}
          />
        ))}
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="history"
            title={items.length === 0 ? t('empty_history', 'No History Recorded Yet') : 'No Matching Scans Found'}
            description={
              items.length === 0
                ? t('empty_recent', 'Your scanned QR codes and product barcodes will be stored locally on your device for instant offline recall.')
                : 'Try adjusting your filter chips or clearing the active search keyword above.'
            }
            actionLabel={items.length === 0 ? t('btn_live_scan', 'Open Scanner') : 'Reset Filters'}
            onActionPress={() => {
              if (items.length === 0) {
                router.push('/(screens)/scanner');
              } else {
                setActiveFilter('All');
                setSearchQuery('');
              }
            }}
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* More Options Bottom Sheet */}
      <BottomSheet visible={moreSheetVisible} onClose={() => setMoreSheetVisible(false)} title="History Scan Actions">
        <View style={styles.sheetContent}>
          <ListItem
            title="Rename Scan Title"
            subtitle="Custom label syncs across Favorites and History"
            leadingIcon="tag"
            onPress={() => {
              setMoreSheetVisible(false);
              setRenameModalVisible(true);
            }}
          />
          <ListItem
            title="Share Scan Payload"
            subtitle="Transmit decoded text via system dialogue"
            leadingIcon="share"
            onPress={async () => {
              setMoreSheetVisible(false);
              if (activeItemForSheet) {
                await ShareService.getInstance().shareText(activeItemForSheet.rawValue, activeItemForSheet.displayTitle || 'History Scan');
              }
            }}
          />
          <ListItem
            title="Copy to Clipboard"
            subtitle="Copy decoded raw data to device memory"
            leadingIcon="copy"
            onPress={async () => {
              setMoreSheetVisible(false);
              if (activeItemForSheet) {
                await ClipboardService.getInstance().copyToClipboard(activeItemForSheet.rawValue);
              }
            }}
          />
          <ListItem
            title="Delete Permanently"
            subtitle="Remove scan from History and Favorites"
            leadingIcon="delete"
            onPress={() => {
              setMoreSheetVisible(false);
              if (activeItemForSheet) {
                removeRecord(activeItemForSheet.id);
                setActiveItemForSheet(null);
              }
            }}
          />
          <View style={{ height: theme.spacing[8] }} />
          <OutlineButton title="Close Menu" icon="close" onPress={() => setMoreSheetVisible(false)} fullWidth />
        </View>
      </BottomSheet>

      {/* Rename Scan Title Bottom Sheet */}
      <BottomSheet visible={renameModalVisible} onClose={() => setRenameModalVisible(false)} title="Rename Scan Title">
        <View style={styles.sheetContent}>
          <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, marginBottom: theme.spacing[12] }]}>
            Enter a new display label for this scan (will sync everywhere):
          </Text>
          <TextInput
            style={[styles.renameInput, { color: theme.customColors.textPrimary, borderColor: theme.customColors.divider, backgroundColor: theme.customColors.surfaceVariant }]}
            value={newTitleInput}
            onChangeText={setNewTitleInput}
            placeholder="Enter scan title..."
            placeholderTextColor={theme.customColors.textSecondary}
          />
          <View style={{ height: theme.spacing[16] }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <OutlineButton title="Cancel" icon="close" onPress={() => setRenameModalVisible(false)} style={{ flex: 1 }} />
            <Pressable
              style={[styles.saveBtn, { backgroundColor: theme.customColors.primary }]}
              onPress={async () => {
                if (activeItemForSheet && newTitleInput.trim()) {
                  await updateRecordTitle(activeItemForSheet.id, newTitleInput.trim());
                }
                setRenameModalVisible(false);
                setActiveItemForSheet(null);
              }}
            >
              <Text style={[theme.typography.labelLarge, { color: '#FFF', fontWeight: '700' }]}>Save Title</Text>
            </Pressable>
          </View>
          <View style={{ height: theme.spacing[12] }} />
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  trailingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetContent: {
    width: '100%',
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
