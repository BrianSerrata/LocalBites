// screens/RestaurantDiscoveryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Searchbar, Card, Paragraph, Button, Menu, IconButton, ActivityIndicator, Snackbar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { firestore, auth } from '../firebase';
import { collection, query, getDocs, orderBy, limit, where, startAfter, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import * as Location from 'expo-location';
import { Rating } from 'react-native-elements'; // Assuming you have react-native-elements installed

const RestaurantDiscoveryScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState('Distance');
  const [cuisineType, setCuisineType] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    fetchFavorites();
    fetchRestaurants();
    getUserLocation();
  }, []);

  useEffect(() => {
    // Persist favorites to Firestore
    if (auth.currentUser) {
      const saveFavorites = async () => {
        try {
          const userDoc = doc(firestore, 'users', auth.currentUser.uid);
          await updateDoc(userDoc, { favorites });
        } catch (err) {
          console.error('Error saving favorites:', err);
        }
      };
      saveFavorites();
    }
  }, [favorites]);

  const fetchFavorites = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = doc(firestore, 'users', auth.currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setFavorites(userSnapshot.data().favorites || []);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    }
  };

  const fetchRestaurants = async (loadMore = false) => {
    if (loadMore && !hasMore) return;

    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let q = collection(firestore, 'restaurants');

      // Apply filters
      if (cuisineType !== 'All') {
        q = query(q, where('cuisineType', '==', cuisineType));
      }
      if (priceRange !== 'All') {
        q = query(q, where('priceRange', '==', priceRange));
      }

      // Apply sorting
      if (sortOption === 'Rating') {
        q = query(q, orderBy('rating', 'desc'));
      } else if (sortOption === 'Popularity') {
        q = query(q, orderBy('popularity', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      // Apply pagination
      q = query(q, limit(20));
      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible), limit(20));
      }

      const querySnapshot = await getDocs(q);
      const newRestaurants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (loadMore) {
        setRestaurants(prev => [...prev, ...newRestaurants]);
      } else {
        setRestaurants(newRestaurants);
      }

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      if (newRestaurants.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to load restaurants. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (
      lat1 == null ||
      lon1 == null ||
      lat2 == null ||
      lon2 == null
    ) {
      return 'N/A';
    }
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(1);
  };

  const toggleFavorite = (restaurantId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(restaurantId)) {
        return prevFavorites.filter(id => id !== restaurantId);
      } else {
        return [...prevFavorites, restaurantId];
      }
    });
  };

  const renderRestaurantItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover
        source={{
          uri: item.logo || 'https://via.placeholder.com/150',
        }}
      />
      <Card.Content>
        <Text style={styles.restaurantName}>{item.restaurantName}</Text>
        <View style={styles.tagsContainer}>
          {item.tags && item.tags.map((tag, index) => (
            <Chip key={index} style={styles.chip}>
              {tag}
            </Chip>
          ))}
        </View>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        <View style={styles.ratingContainer}>
          <Rating
            readonly
            startingValue={item.rating || 0}
            imageSize={20}
            style={styles.rating}
          />
          <Text style={styles.reviewCount}>({item.reviewCount || 0})</Text>
        </View>
        {userLocation && item.address && item.address.latitude && item.address.longitude && (
          <Text style={styles.distance}>
            {calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              item.address.latitude,
              item.address.longitude
            )} km away
          </Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}>
          View Details
        </Button>
        <IconButton
          icon={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
          color={favorites.includes(item.id) ? 'red' : 'gray'}
          size={24}
          onPress={() => toggleFavorite(item.id)}
          accessibilityLabel={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityHint={`Marks ${item.restaurantName} as favorite`}
        />
      </Card.Actions>
    </Card>
  );

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setLastVisible(null);
    setHasMore(true);
    await fetchRestaurants();
    setRefreshing(false);
  };

  return (
    <LinearGradient
      colors={['#E0C3FC', '#8EC5FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Discover Local Bites</Text>

        {/* Filter and Sort Menus */}
        <View style={styles.filterSortContainer}>
          {/* Filter Menu */}
          <Menu
            visible={filterVisible}
            onDismiss={() => setFilterVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setFilterVisible(true)}>
                Filters
              </Button>
            }
          >
            <Menu.Item onPress={() => { setCuisineType('Italian'); setFilterVisible(false); }} title="Italian" />
            <Menu.Item onPress={() => { setCuisineType('Chinese'); setFilterVisible(false); }} title="Chinese" />
            <Menu.Item onPress={() => { setCuisineType('All'); setFilterVisible(false); }} title="All" />
            <Menu.Item onPress={() => { setPriceRange('$'); setFilterVisible(false); }} title="$" />
            <Menu.Item onPress={() => { setPriceRange('$$'); setFilterVisible(false); }} title="$$" />
            <Menu.Item onPress={() => { setPriceRange('All'); setFilterVisible(false); }} title="All" />
          </Menu>

          {/* Sort Menu */}
          <Menu
            visible={sortVisible}
            onDismiss={() => setSortVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setSortVisible(true)}>
                Sort By: {sortOption}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortOption('Distance'); setSortVisible(false); }} title="Distance" />
            <Menu.Item onPress={() => { setSortOption('Rating'); setSortVisible(false); }} title="Rating" />
            <Menu.Item onPress={() => { setSortOption('Popularity'); setSortVisible(false); }} title="Popularity" />
          </Menu>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search restaurants"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          accessibilityLabel="Search Bar"
          accessibilityHint="Enter restaurant name to search"
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {/* Restaurant List */}
        {!loading && (
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            onEndReached={() => fetchRestaurants(true)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loadingMore ? <ActivityIndicator size="large" /> : null}
            refreshing={refreshing}
            onRefresh={onRefresh}
            getItemLayout={(data, index) => (
              { length: 300, offset: 300 * index, index }
            )}
          />
        )}

        {/* Error Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Retry',
            onPress: () => {
              fetchRestaurants();
            },
          }}
        >
          {error}
        </Snackbar>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    marginRight: 8,
  },
  reviewCount: {
    color: '#666',
  },
  distance: {
    marginTop: 8,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default RestaurantDiscoveryScreen;
