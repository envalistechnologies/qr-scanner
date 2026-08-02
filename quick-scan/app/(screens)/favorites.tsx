import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { useFavorites } from '../../hooks/useFavorites';
import { useHistory } from '../../hooks/useHistory';
import { ClipboardService } from '../../services/ClipboardService';
import { ShareService } from '../../services/ShareService';
import { useResponsive } from '../../utils/responsive';
import {
  ScreenContainer,
  AppHeader,
  SearchBar,
  Card,
  OutlineButton,
  IconButton,
  FloatingActionButton,
  Icon,
  Divider,
  Chip,
  BottomSheet,
  ListItem,
  EmptyState,
  FavoriteCard,
  FavoriteItemData,
} from '../../components';

// --- Filter & Sort Settings ---

const FILTER_OPTIONS = [
  'All',
  'QR Code',
  'Barcode',
  'Website',
  'Wi-Fi',
  'Text',
  'Contact',
  'Email',
  'Phone',
  'Location',
];

const SORT_OPTIONS = [
  'Newest First',
  'Oldest First',
  'Alphabetical (A-Z)',
  'Recently Used',
  'Most Used',
];

export default function FavoritesScreen() {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const { isTabletOrFoldable } = useResponsive();
  const { favorites, removeFavorite, updateFavoriteTitle } = useFavorites();
  const { removeRecord } = useHistory();

  const mappedFavorites: FavoriteItemData[] = useMemo(() => {
    return favorites.map((f) => {
      const data = f.itemData || ({} as any);
      const sym = (data.symbology || 'QR').toUpperCase();
      let icon: any = 'url';
      let cat = 'Website';
      if (sym.includes('WIFI')) { icon = 'wifi'; cat = 'Wi-Fi'; }
      else if (sym.includes('CONTACT') || sym.includes('VCARD') || sym.includes('ME-CARD')) { icon = 'contact'; cat = 'Contact'; }
      else if (sym.includes('PHONE')) { icon = 'phone'; cat = 'Phone'; }
      else if (sym.includes('EMAIL')) { icon = 'email'; cat = 'Email'; }
      else if (sym.includes('UPC') || sym.includes('EAN') || sym.includes('BARCODE') || !data.isQR) { icon = 'barcode'; cat = 'Barcode'; }
      else if (sym.includes('TEXT') || sym === 'PLAIN_TEXT') { icon = 'text'; cat = 'Text'; }
      else { icon = 'myQr'; cat = 'QR Code'; }

      const d = new Date(f.addedTimestamp || Date.now());
      return {
        id: f.id || f.scanResultId || 'fav',
        title: f.customLabel || data.displayTitle || data.rawValue || 'Favorite Item',
        subtitle: data.rawValue || 'No payload value',
        category: cat,
        dateSaved: `Saved ${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        icon: icon,
        accentVariant: 'primary',
      };
    });
  }, [favorites]);

  // Demo State & Navigation Switcher
  const [uiState, setUiState] = useState<'normal' | 'multiselect' | 'empty' | 'no_results'>('normal');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('Newest First');

  const qrCount = useMemo(() => mappedFavorites.filter((f) => f.category !== 'Barcode').length, [mappedFavorites]);
  const barcodeCount = useMemo(() => mappedFavorites.filter((f) => f.category === 'Barcode').length, [mappedFavorites]);
  const websiteCount = useMemo(() => mappedFavorites.filter((f) => f.category === 'Website').length, [mappedFavorites]);

  const categoryBreakdown = useMemo(() => [
    { label: 'Websites', category: 'Website', icon: 'url' as const },
    { label: 'Contacts', category: 'Contact', icon: 'contact' as const },
    { label: 'Wi-Fi Networks', category: 'Wi-Fi', icon: 'wifi' as const },
    { label: 'Barcodes', category: 'Barcode', icon: 'barcode' as const },
    { label: 'Text & Notes', category: 'Text', icon: 'text' as const },
    { label: 'Emails', category: 'Email', icon: 'email' as const },
    { label: 'Phone Numbers', category: 'Phone', icon: 'phone' as const },
  ].map((cat) => ({ ...cat, count: mappedFavorites.filter((item) => item.category === cat.category).length })), [mappedFavorites]);

  const filteredFavorites = useMemo(() => {
    let list = mappedFavorites;
    if (selectedFilter !== 'All') {
      list = list.filter((f) => f.category.toLowerCase() === selectedFilter.toLowerCase() || (selectedFilter === 'QR Code' && f.category !== 'Barcode'));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => f.title.toLowerCase().includes(q) || f.subtitle.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    }
    if (selectedSort === 'Alphabetical (A-Z)') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'Oldest First') {
      list = [...list].reverse();
    }
    return list;
  }, [mappedFavorites, selectedFilter, searchQuery, selectedSort]);

  // Multi-select & Action Dialog State
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [moreSheetVisible, setMoreSheetVisible] = useState<boolean>(false);
  const [sortSheetVisible, setSortSheetVisible] = useState<boolean>(false);
  const [activeCardForSheet, setActiveCardForSheet] = useState<FavoriteItemData | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const [newTitleInput, setNewTitleInput] = useState<string>('');

  const isMultiSelectMode = uiState === 'multiselect';

  const showDemoToast = (_msg: string) => {};

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  // Render Empty State UI when no favorites exist in vault
  if (mappedFavorites.length === 0 && uiState !== 'multiselect') {
    return (
      <ScreenContainer scrollable={false} withSafeArea testID="favorites-empty-screen">
        <AppHeader
          title={t('favorites_vault', 'Favorites Vault')}
          subtitle="Saved Bookmarks"
          showBack={true}
          showMore={true}
          onMore={() => setMoreSheetVisible(true)}
        />
        <View style={{ flex: 1, minHeight: 450, justifyContent: 'center' }}>
          <EmptyState
            icon="favorite"
            title="No Favorite Bookmarks Yet"
            description="You have not pinned or starred any scanned codes. Tap the heart icon after scanning a QR matrix to save essential links directly to this quick vault."
            actionLabel="Start Scanning"
            onActionPress={() => router.push('/(screens)/scanner' as any)}
          />
        </View>
      </ScreenContainer>
    );
  }

  // --- Render Header Element for FlashList (Stable element to preserve focus and avoid remounts) ---
  const listHeaderElement = (
    <View style={styles.headerContent}>
      {/* Multi-Select Toolbar (When in Multi-Select Mode) */}
      {isMultiSelectMode ? (
        <View
          style={[
            styles.selectionToolbar,
            {
              backgroundColor: theme.customColors.primaryContainer,
              borderColor: theme.customColors.primary,
              borderRadius: theme.radius[16],
              paddingHorizontal: theme.spacing[16],
              paddingVertical: theme.spacing[12],
              marginVertical: theme.spacing[12],
            },
          ]}
        >
          <View style={styles.toolbarLeft}>
            <Icon name="checkbox" size={24} color={theme.customColors.primary} />
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginLeft: 10, fontWeight: '700' }]}>
              {selectedCount} Favorites Selected
            </Text>
          </View>
          <View style={styles.toolbarActions}>
            <IconButton icon="share" size={20} onPress={() => {
              const selectedItems = mappedFavorites.filter((f) => selectedIds[f.id]);
              if (selectedItems.length > 0) {
                ShareService.getInstance().shareText(selectedItems.map((i) => `${i.title}: ${i.subtitle}`).join('\n\n'), 'Selected Favorites');
              }
            }} accessibilityLabel="Share selected" />
            <IconButton icon="export" size={20} onPress={() => {
              const selectedItems = mappedFavorites.filter((f) => selectedIds[f.id]);
              if (selectedItems.length > 0) {
                ShareService.getInstance().shareText(JSON.stringify(selectedItems, null, 2), 'Exported Favorites JSON');
              }
            }} accessibilityLabel="Export selected" />
            <IconButton
              icon="delete"
              size={20}
              color={theme.customColors.error}
              onPress={() => {
                Object.keys(selectedIds).forEach((id) => {
                  if (selectedIds[id]) {
                    removeFavorite(id).catch((e) => console.error(e));
                    removeRecord(id).catch((e) => console.error(e));
                  }
                });
                setSelectedIds({});
                setUiState('normal');
              }}
              accessibilityLabel="Delete selected"
            />
            <IconButton icon="close" size={20} onPress={() => setUiState('normal')} accessibilityLabel="Cancel selection" />
          </View>
        </View>
      ) : (
        /* Favorites Summary Hero Card */
        <Card
          variant="elevated"
          elevationLevel={3}
          style={[
            styles.heroSummaryCard,
            { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[24], padding: theme.spacing[20], marginVertical: theme.spacing[16] },
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroLeft}>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>VAULT METRIC OVERVIEW</Text>
              <Text style={[theme.typography.headlineLarge, { color: theme.customColors.textPrimary, fontWeight: '800', marginTop: 2 }]}>
                {mappedFavorites.length} {mappedFavorites.length === 1 ? 'Favorite' : 'Favorites'}
              </Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: theme.customColors.primaryContainer, borderRadius: theme.radius[20] }]}>
              <Icon name="starFilled" size={32} color={theme.customColors.warning} />
            </View>
          </View>

          <Divider marginVertical={theme.spacing[16]} />

          <View style={styles.summaryStatsRow}>
            <View style={styles.statCell}>
              <Icon name="myQr" size={22} color={theme.customColors.primary} />
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700', marginTop: 4 }]}>{qrCount}</Text>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>QR Codes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.customColors.divider }]} />
            <View style={styles.statCell}>
              <Icon name="barcode" size={22} color={theme.customColors.primary} />
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700', marginTop: 4 }]}>{barcodeCount}</Text>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>Barcodes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.customColors.divider }]} />
            <View style={styles.statCell}>
              <Icon name="url" size={22} color={theme.customColors.primary} />
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700', marginTop: 4 }]}>{websiteCount}</Text>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>Websites</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search favorites by title, URL or tag..." onClear={() => setSearchQuery('')} />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsWrap, { marginVertical: theme.spacing[12] }]}>
        {FILTER_OPTIONS.map((flt) => (
          <Chip
            key={flt}
            label={flt === 'All' ? `All (${mappedFavorites.length})` : flt}
            selected={selectedFilter === flt}
            style={{ marginRight: 6 }}
            onPress={() => {
              setSelectedFilter(flt);
            }}
          />
        ))}
      </ScrollView>

      {/* Sort Dropdown & Grid/List Toggle Row */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => setSortSheetVisible(true)}
          style={[
            styles.sortDropdownButton,
            {
              backgroundColor: theme.customColors.surfaceVariant,
              borderRadius: theme.radius[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
              paddingHorizontal: theme.spacing[16],
              paddingVertical: theme.spacing[8],
            },
          ]}
          accessibilityLabel="Change sort order"
          accessibilityRole="button"
        >
          <Icon name="sort" size={18} color={theme.customColors.primary} />
          <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary, marginHorizontal: 8, fontWeight: '600' }]}>
            {selectedSort}
          </Text>
          <Icon name="chevronDown" size={18} color={theme.customColors.textSecondary} />
        </Pressable>

        <View style={[styles.segmentedControl, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[16], padding: 4 }]}>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[
              styles.segmentBtn,
              viewMode === 'list' && { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[12], elevation: 2 },
            ]}
            accessibilityLabel="Switch to list view"
          >
            <Icon name="list" size={20} color={viewMode === 'list' ? theme.customColors.primary : theme.customColors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('grid')}
            style={[
              styles.segmentBtn,
              viewMode === 'grid' && { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[12], elevation: 2 },
            ]}
            accessibilityLabel="Switch to grid view"
          >
            <Icon name="grid" size={20} color={viewMode === 'grid' ? theme.customColors.primary : theme.customColors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginVertical: theme.spacing[12], fontWeight: '700' }]}>
        Pinned Vault Items ({filteredFavorites.length})
      </Text>
    </View>
  );

  // --- Render Footer Element for FlashList ---
  const listFooterElement = (
    <View style={styles.footerContent}>
      <View style={{ height: theme.spacing[20] }} />
      <Divider marginVertical={theme.spacing[16]} />

      {/* Recent Favorites Section (Horizontal Cards) */}
      {mappedFavorites.length > 0 && (
        <>
          <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12], fontWeight: '700' }]}>
            Recently Added Bookmarks
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentCardsRow}>
            {mappedFavorites.slice(0, 5).map((rc, idx) => (
              <Pressable
                key={`rc-${rc.id}_${idx}`}
                onPress={() => {
                  router.push({
                    pathname: '/(screens)/scan-result',
                    params: {
                      id: rc.id,
                      rawValue: rc.subtitle,
                      displayTitle: rc.title,
                      symbology: rc.category,
                      isQR: rc.icon !== 'barcode' ? 'true' : 'false',
                    },
                  });
                }}
                style={[
                  styles.recentCard,
                  {
                    backgroundColor: theme.customColors.surface,
                    borderRadius: theme.radius[16],
                    padding: theme.spacing[16],
                    borderColor: theme.customColors.divider,
                    borderWidth: StyleSheet.hairlineWidth,
                    width: isTabletOrFoldable ? 240 : 180,
                    marginRight: theme.spacing[12],
                  },
                ]}
              >
                <View style={styles.recentIconRow}>
                  <Icon name={rc.icon} size={24} color={theme.customColors.primary} />
                  <Icon name="starFilled" size={16} color={theme.customColors.warning} />
                </View>
                <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12], fontWeight: '700' }]} numberOfLines={1}>
                  {rc.title}
                </Text>
                <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {rc.category} • {rc.dateSaved}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={{ height: theme.spacing[24] }} />
        </>
      )}

      {/* Category Section (Beautiful Category Cards) */}
      <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12], fontWeight: '700' }]}>
        Vault Categories
      </Text>
      <View style={styles.categoriesGrid}>
        {categoryBreakdown.map((cat, idx) => (
          <Pressable
            key={`cat-${idx}`}
            onPress={() => {
              setSelectedFilter(cat.category);
            }}
            style={[
              styles.categoryTile,
              {
                backgroundColor: theme.customColors.surfaceVariant,
                borderRadius: theme.radius[16],
                padding: theme.spacing[16],
                borderColor: theme.customColors.divider,
                borderWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={[styles.catIconWrap, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[12] }]}>
              <Icon name={cat.icon} size={22} color={theme.customColors.primary} />
            </View>
            <View style={styles.catTextWrap}>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
                {cat.label}
              </Text>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginTop: 2 }]}>
                {cat.count} {cat.count === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </View>
  );

  return (
    <ScreenContainer scrollable={false} withSafeArea testID="favorites-premium-screen">
      {/* 1. Header with Search & More Menu */}
      <AppHeader
        title={t('favorites_vault', 'Favorites Vault')}
        subtitle="Bookmarked Scans & Studios"
        showBack={true}
        showMore={true}
        onMore={() => setMoreSheetVisible(true)}
      />

      {/* 2. FlashList of Favorites */}
      <View style={styles.listContainer}>
        <FlashList
          data={filteredFavorites}
          key={viewMode === 'grid' ? 'grid-mode-cols-2' : 'list-mode-col-1'}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item: any, index: number) => `${item.id}_${index}`}
          ListHeaderComponent={listHeaderElement}
          ListFooterComponent={listFooterElement}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <EmptyState
                icon="search"
                title="No favorite found."
                description="Your search query or category filter did not match any stored bookmarks."
                actionLabel="Clear Filters"
                onActionPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={viewMode === 'grid' ? [styles.gridItemWrapper, index % 2 === 0 ? { paddingRight: 6 } : { paddingLeft: 6 }] : undefined}>
              <FavoriteCard
                item={item}
                viewMode={viewMode}
                isMultiSelect={isMultiSelectMode}
                isSelected={!!selectedIds[item.id]}
                onSelectToggle={() => toggleSelectId(item.id)}
                onPress={() => {
                  if (isMultiSelectMode) {
                    toggleSelectId(item.id);
                  } else {
                    router.push({
                      pathname: '/(screens)/scan-result',
                      params: {
                        id: item.id,
                        rawValue: item.subtitle,
                        displayTitle: item.title,
                        symbology: item.category,
                        isQR: item.icon !== 'barcode' ? 'true' : 'false',
                      },
                    });
                  }
                }}
                onLongPress={() => {
                  setUiState('multiselect');
                  toggleSelectId(item.id);
                }}
                onMorePress={() => {
                  setActiveCardForSheet(item);
                  setMoreSheetVisible(true);
                }}
              />
            </View>
          )}
        />
      </View>

      {/* 3. Premium Floating Action Button */}
      <View style={styles.fabWrapper}>
        <FloatingActionButton
          label="Scan New QR"
          icon="qr"
          variant="primary"
          onPress={() => router.push('/(screens)/scanner' as any)}
          accessibilityLabel="Scan New QR Code"
        />
      </View>

      {/* 4. Reusable More Actions Bottom Sheet */}
      <BottomSheet
        visible={moreSheetVisible}
        onClose={() => {
          setMoreSheetVisible(false);
          setActiveCardForSheet(null);
        }}
        title={activeCardForSheet ? `Manage: ${activeCardForSheet.title}` : 'Vault Management Actions'}
      >
        <View style={styles.sheetContent}>
          {activeCardForSheet ? (
            <>
              <ListItem
                title="Rename Bookmark Title"
                subtitle="Edit display label for quick search indexing"
                leadingIcon="rename"
                onPress={() => {
                  setMoreSheetVisible(false);
                  setNewTitleInput(activeCardForSheet.title);
                  setTimeout(() => setRenameModalVisible(true), 250);
                }}
              />
              <ListItem
                title="Share Decoded Payload"
                subtitle="Transmit link or content via system messenger"
                leadingIcon="share"
                onPress={() => {
                  setMoreSheetVisible(false);
                  ShareService.getInstance().shareText(activeCardForSheet.subtitle, activeCardForSheet.title);
                }}
              />
              <ListItem
                title="Copy Text to Clipboard"
                subtitle="Copy decoded contents to system clipboard"
                leadingIcon="copy"
                onPress={() => {
                  setMoreSheetVisible(false);
                  ClipboardService.getInstance().copyToClipboard(activeCardForSheet.subtitle);
                }}
              />
              <ListItem
                title="Remove Favorite Badge"
                subtitle="Unpin from favorites vault while keeping in history"
                leadingIcon="star"
                onPress={() => {
                  setMoreSheetVisible(false);
                  removeFavorite(activeCardForSheet.id).catch((e) => console.error(e));
                }}
              />
              <ListItem
                title="Delete Permanently"
                subtitle="Wipe entry entirely from both favorites and scan history"
                leadingIcon="delete"
                onPress={() => {
                  setMoreSheetVisible(false);
                  removeFavorite(activeCardForSheet.id).catch((e) => console.error(e));
                  removeRecord(activeCardForSheet.id).catch((e) => console.error(e));
                }}
              />
            </>
          ) : (
            <ListItem
              title="Export Vault as JSON"
              subtitle="Save structured offline backup of all favorites"
              leadingIcon="export"
              onPress={() => {
                setMoreSheetVisible(false);
                ShareService.getInstance().shareText(JSON.stringify(mappedFavorites, null, 2), 'Favorites Vault Archive');
              }}
            />
          )}

          <View style={{ height: theme.spacing[12] }} />

          <OutlineButton
            title="Cancel Menu"
            icon="close"
            onPress={() => {
              setMoreSheetVisible(false);
              setActiveCardForSheet(null);
            }}
            fullWidth
            style={{ minHeight: 48 }}
          />
        </View>
      </BottomSheet>

      {/* 5. Sort Dropdown Bottom Sheet */}
      <BottomSheet visible={sortSheetVisible} onClose={() => setSortSheetVisible(false)} title="Select Vault Sorting Order">
        <View style={styles.sheetContent}>
          {SORT_OPTIONS.map((s) => (
            <ListItem
              key={s}
              title={s}
              leadingIcon={selectedSort === s ? 'check' : 'sort'}
              onPress={() => {
                setSelectedSort(s);
                setSortSheetVisible(false);
              }}
            />
          ))}
          <View style={{ height: theme.spacing[12] }} />
          <OutlineButton title="Close" icon="close" onPress={() => setSortSheetVisible(false)} fullWidth />
        </View>
      </BottomSheet>

      {/* 6. Rename Bookmark Title Bottom Sheet */}
      <BottomSheet visible={renameModalVisible} onClose={() => setRenameModalVisible(false)} title="Rename Bookmark Title">
        <View style={styles.sheetContent}>
          <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, marginBottom: theme.spacing[12] }]}>
            Enter a new display label for this bookmark:
          </Text>
          <TextInput
            style={[styles.renameInput, { color: theme.customColors.textPrimary, borderColor: theme.customColors.divider, backgroundColor: theme.customColors.surfaceVariant }]}
            value={newTitleInput}
            onChangeText={setNewTitleInput}
            placeholder="Bookmark title..."
            placeholderTextColor={theme.customColors.textSecondary}
          />
          <View style={{ height: theme.spacing[16] }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <OutlineButton title="Cancel" icon="close" onPress={() => setRenameModalVisible(false)} style={{ flex: 1 }} />
            <Pressable
              style={[styles.saveBtn, { backgroundColor: theme.customColors.primary }]}
              onPress={async () => {
                if (activeCardForSheet && newTitleInput.trim()) {
                  await updateFavoriteTitle(activeCardForSheet.id, newTitleInput.trim());
                }
                setRenameModalVisible(false);
                setActiveCardForSheet(null);
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
  listContainer: {
    flex: 1,
    width: '100%',
  },
  headerContent: {
    width: '100%',
  },
  footerContent: {
    width: '100%',
  },
  statePickerRow: {
    width: '100%',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSummaryCard: {
    width: '100%',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  searchSection: {
    width: '100%',
  },
  searchWrap: {
    width: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sortDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  recentCardsRow: {
    flexDirection: 'row',
  },
  recentCard: {
    justifyContent: 'flex-start',
  },
  recentIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexGrow: 1,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catTextWrap: {
    flex: 1,
  },
  fabWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
