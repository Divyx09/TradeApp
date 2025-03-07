import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ScrollView, TouchableOpacity } from "react-native";
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

const MAJOR_INDICES = [
  { symbol: "^NSEI", name: "NIFTY 50", category: "Indian" },
  { symbol: "^BSESN", name: "SENSEX", category: "Indian" },
  { symbol: "^NSEBANK", name: "NIFTY BANK", category: "Indian" },
  { symbol: "^CNX100", name: "NIFTY 100", category: "Indian" },
  { symbol: "^CRSLDX", name: "NIFTY 500", category: "Indian" },
  { symbol: "^GSPC", name: "S&P 500", category: "US" },
  { symbol: "^NDX", name: "NASDAQ 100", category: "US" },
  { symbol: "^DJI", name: "Dow Jones", category: "US" },
  { symbol: "^RUT", name: "Russell 2000", category: "US" }
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
  const [indices, setIndices] = useState([]);

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

  const fetchIndices = useCallback(async () => {
    try {
      const symbols = MAJOR_INDICES.map(index => index.symbol).join(',');
      const response = await fetch(`${API_URL}/stocks/quotes?symbols=${symbols}`);
      if (!response.ok) throw new Error('Failed to fetch indices');
      
      const data = await response.json();
      const indicesData = Array.isArray(data) ? data : [data];
      
      const formattedIndices = indicesData.map(quote => {
        const indexInfo = MAJOR_INDICES.find(i => i.symbol === quote.symbol);
        return {
          ...quote,
          companyName: indexInfo.name,
          category: indexInfo.category,
          regularMarketPrice: quote.regularMarketPrice || quote.price,
          regularMarketChangePercent: quote.regularMarketChangePercent || quote.changePercent,
          regularMarketChange: quote.regularMarketChange || quote.change
        };
      });
      
      setIndices(formattedIndices);
    } catch (error) {
      console.error('Error fetching indices:', error);
    }
  }, []);

  useEffect(() => {
    fetchIndices();
    // Refresh indices every 30 seconds
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, [fetchIndices]);

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFiltersModal}
        onDismiss={() => setShowFiltersModal(false)}
        contentContainerStyle={styles.filtersModal}
      >
        <Text style={styles.modalTitle}>Filter Stocks</Text>

        {/* Market Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Market</Text>
          <View style={styles.chipGroup}>
            {markets?.map((market) => (
              <Chip
                key={market.id}
                selected={selectedMarket === market.id}
                onPress={() => setSelectedMarket(market.id)}
                style={[
                  styles.filterChip,
                  selectedMarket === market.id && styles.selectedChip
                ]}
              >
                {market.name}
              </Chip>
            ))}
          </View>
        </View>

        {/* Sector Filter */}
        {selectedMarket && (
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sector</Text>
            <View style={styles.chipGroup}>
              {markets
                ?.find((m) => m.id === selectedMarket)
                ?.sectors.map((sector) => (
                  <Chip
                    key={sector.id}
                    selected={selectedSector === sector.id}
                    onPress={() => setSelectedSector(sector.id)}
                    style={[
                      styles.filterChip,
                      selectedSector === sector.id && styles.selectedChip
                    ]}
                  >
                    {sector.name}
                  </Chip>
                ))}
            </View>
          </View>
        )}

        {/* Market Cap Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Market Cap</Text>
          <View style={styles.chipGroup}>
            {["LARGE_CAP", "MID_CAP", "SMALL_CAP"].map((cap) => (
              <Chip
                key={cap}
                selected={marketCapFilter === cap}
                onPress={() => setMarketCapFilter(cap)}
                style={[
                  styles.filterChip,
                  marketCapFilter === cap && styles.selectedChip
                ]}
              >
                {cap.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedMarket(null);
              setSelectedSector(null);
              setMarketCapFilter(null);
              setPriceRangeFilter(null);
              setShowFiltersModal(false);
            }}
            textColor="#FFFFFF"
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFiltersModal(false)}
            buttonColor="#00B4D8"
          >
            Apply
          </Button>
        </View>
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
        style={styles.indicesContainer}
      >
        {indices.length > 0 ? (
          indices.map((index) => (
            <TouchableOpacity
              key={index.symbol}
              onPress={() => navigation.navigate("StockDetails", { 
                stock: {
                  ...index,
                  symbol: index.symbol,
                  companyName: index.companyName,
                  price: index.regularMarketPrice,
                  change: index.regularMarketChange,
                  changePercent: index.regularMarketChangePercent,
                  category: index.category,
                  open: index.regularMarketOpen,
                  dayHigh: index.regularMarketDayHigh,
                  dayLow: index.regularMarketDayLow,
                  volume: index.regularMarketVolume,
                  marketCap: index.marketCap,
                  pe: index.priceToEarnings
                }
              })}
            >
              <Surface style={styles.indexCard} elevation={1}>
                <Text style={styles.indexName}>{index.companyName}</Text>
                <Text style={styles.indexPrice}>
                  {index.category === "Indian" ? "₹" : "$"}
                  {index.regularMarketPrice?.toLocaleString(
                    index.category === "Indian" ? "en-IN" : "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>
                <Text style={[
                  styles.indexChange,
                  { color: index.regularMarketChangePercent >= 0 ? "#4CAF50" : "#FF4444" }
                ]}>
                  {index.regularMarketChangePercent >= 0 ? "+" : ""}
                  {index.regularMarketChangePercent?.toFixed(2)}%
                </Text>
              </Surface>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.indicesLoadingContainer}>
            <ActivityIndicator size="small" color="#00B4D8" />
            <Text style={styles.indicesLoadingText}>Loading indices...</Text>
          </View>
        )}
      </ScrollView>

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
    <DataTable.Row onPress={() => navigation.navigate("StockDetails", { 
      stock: {
        ...item,
        open: item.regularMarketOpen || item.open,
        dayHigh: item.regularMarketDayHigh || item.dayHigh,
        dayLow: item.regularMarketDayLow || item.dayLow,
        volume: item.regularMarketVolume || item.volume,
        marketCap: item.marketCap,
        pe: item.priceToEarnings || item.pe
      }
    })}>
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
        onPress={() => navigation.navigate("StockDetails", { 
          stock: {
            ...item,
            open: item.regularMarketOpen || item.open,
            dayHigh: item.regularMarketDayHigh || item.dayHigh,
            dayLow: item.regularMarketDayLow || item.dayLow,
            volume: item.regularMarketVolume || item.volume,
            marketCap: item.marketCap,
            pe: item.priceToEarnings || item.pe
          }
        })}
      >
      <Card.Content style={styles.cardContent}>
          <View style={styles.stockHeader}>
            <View style={styles.stockInfo}>
            <Text style={styles.symbolText} numberOfLines={1}>
                {item.symbol.replace(".NS", "")}
              </Text>
            <Text style={styles.companyName} numberOfLines={1}>
                {item.companyName || item.symbol}
              </Text>
            </View>
          <Chip 
            style={[
              styles.categoryIndicator,
              { backgroundColor: item.category === 'Indian' ? '#E3F2FD20' : '#FFF3E020' }
            ]}
            textStyle={{ 
              color: item.category === 'Indian' ? '#90CAF9' : '#FFB74D',
              fontSize: 10
            }}
          >
            {item.category}
          </Chip>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceText} numberOfLines={1}>
            {item.category === 'Indian' ? '₹' : '$'}
            {item.price?.toLocaleString(item.category === 'Indian' ? 'en-IN' : 'en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text
                style={[
                  styles.changeText,
              { color: item.changePercent >= 0 ? '#4CAF50' : '#FF4444' }
                ]}
            numberOfLines={1}
              >
            {item.changePercent >= 0 ? '+' : ''}
            {item.changePercent?.toFixed(2)}%
              </Text>
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
          numColumns={2}
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
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  activeFilters: {
    marginTop: 12,
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: "#2A2A2A",
  },
  tableHeader: {
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  headerText: {
    color: "#B0B0B0",
    fontWeight: "bold",
  },
  symbolText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectorText: {
    color: "#B0B0B0",
    fontSize: 12,
  },
  companyName: {
    color: "#B0B0B0",
    fontSize: 12,
    marginTop: 2,
  },
  priceText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  changeText: {
    fontWeight: "bold",
  },
  tableActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  stockCard: {
    flex: 0.5,
    margin: 6,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryIndicator: {
    height: 24,
    paddingHorizontal: 8,
  },
  priceSection: {
    marginTop: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    padding: 6,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  loader: {
    padding: 20,
  },
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },
  filtersModal: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    color: "#B0B0B0",
    fontSize: 14,
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#2A2A2A",
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: "#00B4D8",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  indicesContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  indexCard: {
    backgroundColor: "#2A2A2A",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  indexName: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 4,
  },
  indexPrice: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  indexChange: {
    fontSize: 12,
    fontWeight: "500",
  },
  indicesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    marginRight: 8,
  },
  indicesLoadingText: {
    color: "#B0B0B0",
    marginLeft: 8,
    fontSize: 12,
  },
});

export default StockList;
