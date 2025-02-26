import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  Searchbar,
  ActivityIndicator,
  Banner,
  Chip,
  Portal,
  Modal,
  Menu,
  Divider,
  IconButton,
  SegmentedButtons,
  DataTable,
  Surface,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NIFTY50_SYMBOLS = [
  "ADANIENT.NS",
  "ADANIPORTS.NS",
  "APOLLOHOSP.NS",
  "ASIANPAINT.NS",
  "AXISBANK.NS",
  "BAJAJ-AUTO.NS",
  "BAJAJFINSV.NS",
  "BAJFINANCE.NS",
  "BEL.NS",
  "BHARTIARTL.NS",
  "BPCL.NS",
  "BRITANNIA.NS",
  "CIPLA.NS",
  "COALINDIA.NS",
  "DIVISLAB.NS",
  "DRREDDY.NS",
  "EICHERMOT.NS",
  "GRASIM.NS",
  "HCLTECH.NS",
  "HDFCBANK.NS",
  "HDFCLIFE.NS",
  "HEROMOTOCO.NS",
  "HINDALCO.NS",
  "HINDUNILVR.NS",
  "ICICIBANK.NS",
  "INDUSINDBK.NS",
  "INFY.NS",
  "IOC.NS",
  "ITC.NS",
  "JSWSTEEL.NS",
  "KOTAKBANK.NS",
  "LT.NS",
  "M&M.NS",
  "MARUTI.NS",
  "NESTLEIND.NS",
  "NTPC.NS",
  "ONGC.NS",
  "POWERGRID.NS",
  "RELIANCE.NS",
  "SBILIFE.NS",
  "SBIN.NS",
  "SUNPHARMA.NS",
  "TATACONSUM.NS",
  "TATAMOTORS.NS",
  "TATASTEEL.NS",
  "TCS.NS",
  "TECHM.NS",
  "TITAN.NS",
  "ULTRACEMCO.NS",
  "WIPRO.NS",
];

const StockList = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [markets, setMarkets] = useState(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [marketCapFilter, setMarketCapFilter] = useState(null);
  const [priceRangeFilter, setPriceRangeFilter] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  console.log(API_URL);
  const yahooFinanceAPI = useMemo(
    () => `${API_URL}/stocks/quotes?symbols=${NIFTY50_SYMBOLS.join(",")}`,
    [],
  );

  // Fetch market structure
  const fetchMarkets = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/stocks/markets`);
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      const data = await response.json();
      setMarkets(data.markets);
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const fetchStockData = useCallback(async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setStocks([]);
        setPage(1);
        pageNumber = 1;
      }
      
      setError(null);
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const url = new URL(`${API_URL}/stocks/all`);
      url.searchParams.append('page', pageNumber);
      url.searchParams.append('search', searchQuery);
      if (selectedMarket) url.searchParams.append('market', selectedMarket);
      if (selectedSector) url.searchParams.append('sector', selectedSector);
      if (marketCapFilter) url.searchParams.append('marketCap', marketCapFilter);
      if (priceRangeFilter) url.searchParams.append('priceRange', priceRangeFilter);
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('sortOrder', sortOrder);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks (${response.status})`);
      }
      const data = await response.json();
      
      if (data.stocks.length === 0) {
        setHasMore(false);
      } else {
        setStocks(prevStocks => 
          pageNumber === 1 ? data.stocks : [...prevStocks, ...data.stocks]
        );
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedMarket, selectedSector, marketCapFilter, priceRangeFilter, sortBy, sortOrder]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStockData(1, true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedMarket, selectedSector, marketCapFilter, priceRangeFilter, sortBy, sortOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStockData(1, true);
  }, [fetchStockData]);

  const loadMoreStocks = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStockData(nextPage);
    }
  }, [loadingMore, hasMore, loading, page, fetchStockData]);

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFiltersModal}
        onDismiss={() => setShowFiltersModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Text variant="titleLarge" style={styles.modalTitle}>Filters</Text>
        
        <Text variant="titleMedium" style={styles.filterSectionTitle}>Market</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          <Chip
            selected={!selectedMarket}
            onPress={() => setSelectedMarket(null)}
            style={styles.filterChip}
          >
            All Markets
          </Chip>
          {markets?.map(market => (
            <Chip
              key={market.id}
              selected={selectedMarket === market.id}
              onPress={() => setSelectedMarket(market.id)}
              style={styles.filterChip}
            >
              {market.name}
            </Chip>
          ))}
        </ScrollView>

        <Text variant="titleMedium" style={styles.filterSectionTitle}>Sector</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          <Chip
            selected={!selectedSector}
            onPress={() => setSelectedSector(null)}
            style={styles.filterChip}
          >
            All Sectors
          </Chip>
          {selectedMarket && markets?.find(m => m.id === selectedMarket)?.sectors.map(sector => (
            <Chip
              key={sector.id}
              selected={selectedSector === sector.id}
              onPress={() => setSelectedSector(sector.id)}
              style={styles.filterChip}
            >
              {sector.name} ({sector.stockCount})
            </Chip>
          ))}
        </ScrollView>

        <Text variant="titleMedium" style={styles.filterSectionTitle}>Market Cap</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          <Chip
            selected={!marketCapFilter}
            onPress={() => setMarketCapFilter(null)}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={marketCapFilter === 'LARGE_CAP'}
            onPress={() => setMarketCapFilter('LARGE_CAP')}
            style={styles.filterChip}
          >
            Large Cap
          </Chip>
          <Chip
            selected={marketCapFilter === 'MID_CAP'}
            onPress={() => setMarketCapFilter('MID_CAP')}
            style={styles.filterChip}
          >
            Mid Cap
          </Chip>
          <Chip
            selected={marketCapFilter === 'SMALL_CAP'}
            onPress={() => setMarketCapFilter('SMALL_CAP')}
            style={styles.filterChip}
          >
            Small Cap
          </Chip>
        </ScrollView>

        <Button
          mode="contained"
          onPress={() => setShowFiltersModal(false)}
          style={styles.applyButton}
        >
          Apply Filters
        </Button>
      </Modal>
    </Portal>
  );

  const renderHeader = () => (
    <Surface style={styles.header} elevation={2}>
      <View style={styles.searchRow}>
        <Searchbar
          placeholder='Search stocks...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => (
            <MaterialCommunityIcons name='magnify' size={24} color='#666' />
          )}
        />
        <IconButton
          icon="filter-variant"
          size={24}
          onPress={() => setShowFiltersModal(true)}
        />
        <IconButton
          icon={viewMode === 'table' ? 'view-grid' : 'table'}
          size={24}
          onPress={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.activeFilters}
      >
        {selectedMarket && (
          <Chip
            onClose={() => setSelectedMarket(null)}
            style={styles.activeFilterChip}
          >
            {markets?.find(m => m.id === selectedMarket)?.name}
          </Chip>
        )}
        {selectedSector && (
          <Chip
            onClose={() => setSelectedSector(null)}
            style={styles.activeFilterChip}
          >
            {selectedMarket && 
              markets?.find(m => m.id === selectedMarket)?.sectors.find(s => s.id === selectedSector)?.name}
          </Chip>
        )}
        {marketCapFilter && (
          <Chip
            onClose={() => setMarketCapFilter(null)}
            style={styles.activeFilterChip}
          >
            {marketCapFilter.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
          </Chip>
        )}
      </ScrollView>
    </Surface>
  );

  const renderTableHeader = () => (
    <DataTable.Header style={styles.tableHeader}>
      <DataTable.Title 
        onPress={() => {
          if (sortBy === 'symbol') {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy('symbol');
            setSortOrder('asc');
          }
        }}
        sortDirection={sortBy === 'symbol' ? sortOrder : undefined}
      >
        Symbol
      </DataTable.Title>
      <DataTable.Title 
        numeric
        onPress={() => {
          if (sortBy === 'price') {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy('price');
            setSortOrder('desc');
          }
        }}
        sortDirection={sortBy === 'price' ? sortOrder : undefined}
      >
        Price
      </DataTable.Title>
      <DataTable.Title 
        numeric
        onPress={() => {
          if (sortBy === 'change') {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy('change');
            setSortOrder('desc');
          }
        }}
        sortDirection={sortBy === 'change' ? sortOrder : undefined}
      >
        Change
      </DataTable.Title>
      <DataTable.Title numeric>Actions</DataTable.Title>
    </DataTable.Header>
  );

  const renderTableRow = ({ item, index }) => (
    <DataTable.Row onPress={() => navigation.navigate("StockDetails", { stock: item })}>
      <DataTable.Cell>
        <View>
          <Text style={styles.symbolText}>{item.symbol.replace(".NS", "")}</Text>
          <Text style={styles.sectorText}>{item.sector}</Text>
        </View>
      </DataTable.Cell>
      <DataTable.Cell numeric>
        <Text style={styles.priceText}>
          {item.category === 'Indian' ? '₹' : '$'}
          {item.price?.toLocaleString(item.category === 'Indian' ? 'en-IN' : 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </DataTable.Cell>
      <DataTable.Cell numeric>
        <Text
          style={[
            styles.changeText,
            { color: item.change < 0 ? "#FF4444" : "#4CAF50" },
          ]}
        >
          {item.change < 0 ? "▼" : "▲"} {Math.abs(item.changePercent).toFixed(2)}%
        </Text>
      </DataTable.Cell>
      <DataTable.Cell numeric>
        <View style={styles.tableActions}>
          <IconButton
            icon="cart"
            size={20}
            onPress={() => navigation.navigate("Buy", { stock: item })}
          />
          <IconButton
            icon="sale"
            size={20}
            onPress={() => navigation.navigate("Sell", { stock: item })}
          />
    </View>
      </DataTable.Cell>
    </DataTable.Row>
  );

  const renderCardView = ({ item }) => (
      <Card
        style={styles.stockCard}
        onPress={() => navigation.navigate("StockDetails", { stock: item })}
      >
      <Card.Content style={styles.cardContent}>
          <View style={styles.stockHeader}>
            <View style={styles.stockInfo}>
            <Text variant='titleSmall' style={styles.symbolText}>
                {item.symbol.replace(".NS", "")}
              </Text>
            <Text numberOfLines={1} style={styles.companyName}>
                {item.companyName || item.symbol}
              </Text>
            </View>
          <Chip 
            style={[
              styles.categoryIndicator,
              { backgroundColor: item.category === 'Indian' ? '#E3F2FD' : '#FFF3E0' }
            ]}
            textStyle={{ 
              color: item.category === 'Indian' ? '#1976D2' : '#F57C00',
              fontSize: 10
            }}
          >
            {item.category}
          </Chip>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceText}>
            {item.category === 'Indian' ? '₹' : '$'}
            {item.price?.toLocaleString(item.category === 'Indian' ? 'en-IN' : 'en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text
                style={[
                  styles.changeText,
                  { color: item.change < 0 ? "#FF4444" : "#4CAF50" },
                ]}
              >
            {item.change < 0 ? "▼" : "▲"} {Math.abs(item.changePercent).toFixed(2)}%
              </Text>
            </View>

        <View style={styles.stockDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Open</Text>
            <Text style={styles.detailValue}>{item.open?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>High</Text>
            <Text style={styles.detailValue}>{item.dayHigh?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Low</Text>
            <Text style={styles.detailValue}>{item.dayLow?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <IconButton
            icon="cart"
            mode="contained"
            size={20}
            onPress={() => navigation.navigate("Buy", { stock: item })}
            containerColor="#4CAF50"
            iconColor="white"
            style={styles.actionIcon}
          />
          <IconButton
            icon="sale"
            mode="contained"
            size={20}
            onPress={() => navigation.navigate("Sell", { stock: item })}
            containerColor="#FF4444"
            iconColor="white"
            style={styles.actionIcon}
          />
        </View>
      </Card.Content>
      </Card>
  );

  return (
    <View style={styles.container}>
      {error && (
        <Banner
          visible={true}
          actions={[{ label: "Retry", onPress: () => fetchStockData(1, true) }]}
          icon='alert-circle'
        >
          {error}
        </Banner>
      )}

      {viewMode === 'table' ? (
        <DataTable>
          {renderHeader()}
          {renderTableHeader()}
          {loading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <FlatList
              data={stocks}
              renderItem={renderTableRow}
              keyExtractor={(item, index) => `${item.symbol}-${index}`}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={loadMoreStocks}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" />
                </View>
              ) : null}
            />
          )}
        </DataTable>
      ) : (
      <FlatList
          data={stocks}
          renderItem={renderCardView}
          keyExtractor={(item, index) => `${item.symbol}-${index}`}
          numColumns={3}
        contentContainerStyle={[
          styles.listContainer,
            !stocks.length && styles.emptyListContainer,
        ]}
          columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={loading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name='chart-line' size={64} color='#ccc' />
              <Text style={styles.emptyStateText}>
                {error
                  ? "Failed to load stocks"
                  : searchQuery
                  ? "No stocks found matching your search"
                  : "No stocks available"}
              </Text>
            </View>
          )}
          ListFooterComponent={loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" />
            </View>
          ) : null}
          onEndReached={loadMoreStocks}
          onEndReachedThreshold={0.5}
        />
      )}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
  },
  activeFilters: {
    marginTop: 8,
  },
  activeFilterChip: {
    marginRight: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  filterSectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  applyButton: {
    marginTop: 16,
  },
  listContainer: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  stockCard: {
    flex: 1,
    margin: 4,
    maxWidth: '32%',
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 8,
  },
  stockHeader: {
    flexDirection: "column",
    marginBottom: 8,
  },
  stockInfo: {
    marginBottom: 4,
  },
  symbolText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  companyName: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  categoryIndicator: {
    alignSelf: 'flex-start',
    height: 22,
  },
  priceSection: {
    marginVertical: 8,
    alignItems: 'center',
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  changeText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#666',
    fontSize: 10,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionIcon: {
    margin: 0,
  },
  tableHeader: {
    backgroundColor: '#f8f8f8',
  },
  tableActions: {
    flexDirection: 'row',
  },
  loader: {
    marginTop: 20,
  },
  footerLoader: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});

export default StockList;
