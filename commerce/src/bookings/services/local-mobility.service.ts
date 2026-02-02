import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Local Mobility DTOs
interface RideOffer {
  id: string;
  provider: 'uber' | 'bolt' | 'treepz' | 'travu' | 'local_taxi';
  rideType: 'ECONOMY' | 'COMFORT' | 'PREMIUM' | 'SHUTTLE' | 'MINIBUS';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  estimatedDuration: number; // minutes
  estimatedDistance: number; // km
  pricing: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgePricing: number; // surge multiplier
    totalEstimate: number;
    currency: string;
    breakdown?: Record<string, number>;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    capacity: number;
    features: string[];
  };
  driver: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    profileImageUrl: string;
    verified: boolean;
    yearsExperience: number;
  };
  availabilityWindow: {
    estimatedPickupTime: string;
    acceptanceDeadline: string;
  };
}

interface RideBooking {
  bookingId: string;
  rideOfferId: string;
  provider: string;
  rideType: string;
  passenger: PassengerDetails;
  additionalPassengers?: PassengerDetails[];
  pickupDetails: LocationDetails;
  dropoffDetails: LocationDetails;
  estimatedFare: number;
  actualFare?: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'ARRIVING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driver: DriverInfo;
  vehicle: VehicleInfo;
  rideStartTime?: string;
  rideEndTime?: string;
  distanceTraveled?: number;
  createdAt: Date;
  specialRequests?: string;
  paymentMethod: 'CARD' | 'CASH' | 'WALLET' | 'CORPORATE';
  cancellationPolicy: {
    freeCancellationWindow: number; // minutes
    cancellationFeePercentage: number;
  };
}

interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: { name: string; phone: string };
}

interface LocationDetails {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  placeId?: string;
  timestamp: string;
}

interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  profileImageUrl: string;
  licensePlateNumber: string;
  vehicleColor: string;
  estimatedArrivalTime: number; // minutes
}

interface VehicleInfo {
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  capacity: number;
  registrationNumber: string;
}

interface RideSearchRequest {
  pickupLocation: { latitude: number; longitude: number; address?: string };
  dropoffLocation: { latitude: number; longitude: number; address?: string };
  requestedTime?: string;
  passengerCount?: number;
  rideTypes?: string[];
  preferredProviders?: string[];
  specialRequests?: string;
}

interface AirportTransferPackage {
  type: 'AIRPORT_TO_CITY' | 'CITY_TO_AIRPORT' | 'AIRPORT_TO_HOTEL' | 'HOTEL_TO_AIRPORT';
  airport: string;
  destination: string;
  estimatedDuration: number;
  flatRate: number;
  includesWaitTime: boolean;
  waitTimeAllocation: number; // minutes
}

interface ShuttleService {
  id: string;
  provider: 'treepz' | 'travu';
  operatingCities: string[];
  scheduleType: 'FIXED_ROUTE' | 'ON_DEMAND';
  stops: Array<{ name: string; latitude: number; longitude: number; arrivalTime: string }>;
  capacity: number;
  price: number;
  estimatedDuration: number;
  nextDeparture: string;
  amenities: string[];
}

interface InterCityTransport {
  id: string;
  provider: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  transportType: 'BUS' | 'MINIBUS' | 'COACH' | 'SHUTTLE';
  capacity: number;
  availableSeats: number;
  price: number;
  estimatedDuration: number;
  stops: string[];
  amenities: string[];
  operatorRating: number;
}

@Injectable()
export class LocalMobilityService {
  private uberApiKey: string;
  private boltApiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.uberApiKey = 'test_uber_api_key';
    this.boltApiKey = 'test_bolt_api_key';
  }

  // ==================== RIDE-HAILING ====================

  // Search Ride Offers
  async searchRides(request: RideSearchRequest): Promise<RideOffer[]> {
    const offers: RideOffer[] = [];

    try {
      // Query multiple providers in parallel
      const [uberOffers, boltOffers, localOffers] = await Promise.allSettled([
        this.getUberOffers(request),
        this.getBoltOffers(request),
        this.getLocalTaxiOffers(request),
      ]);

      if (uberOffers.status === 'fulfilled') offers.push(...uberOffers.value);
      if (boltOffers.status === 'fulfilled') offers.push(...boltOffers.value);
      if (localOffers.status === 'fulfilled') offers.push(...localOffers.value);
    } catch (error) {
      console.error('Ride search error:', error);
    }

    // Generate mock offers if no real data
    if (offers.length === 0) {
      return this.generateMockRideOffers(request);
    }

    return offers;
  }

  // Get Uber Offers
  private async getUberOffers(request: RideSearchRequest): Promise<RideOffer[]> {
    try {
      // In production: Call Uber API
      // For now: Return mock data
      return this.generateMockRideOffers(request, 'uber');
    } catch (error) {
      console.error('Uber API error:', error);
      return [];
    }
  }

  // Get Bolt Offers
  private async getBoltOffers(request: RideSearchRequest): Promise<RideOffer[]> {
    try {
      // In production: Call Bolt API
      // For now: Return mock data
      return this.generateMockRideOffers(request, 'bolt');
    } catch (error) {
      console.error('Bolt API error:', error);
      return [];
    }
  }

  // Get Local Taxi Offers
  private async getLocalTaxiOffers(request: RideSearchRequest): Promise<RideOffer[]> {
    try {
      // Query local taxi services
      return this.generateMockRideOffers(request, 'local_taxi');
    } catch (error) {
      console.error('Local taxi API error:', error);
      return [];
    }
  }

  // Book Ride
  async bookRide(offerId: string, passenger: PassengerDetails, paymentMethod: 'CARD' | 'CASH' | 'WALLET' | 'CORPORATE'): Promise<RideBooking> {
    const offers = await this.searchRides({
      pickupLocation: { latitude: 34.0522, longitude: -118.2437 },
      dropoffLocation: { latitude: 34.0195, longitude: -118.4912 },
    });

    const offer = offers.find((o) => o.id === offerId);
    if (!offer) {
      throw new HttpException('Ride offer not found', HttpStatus.NOT_FOUND);
    }

    const booking: RideBooking = {
      bookingId: `RB${uuidv4().substring(0, 10).toUpperCase()}`,
      rideOfferId: offerId,
      provider: offer.provider,
      rideType: offer.rideType,
      passenger,
      pickupDetails: {
        latitude: offer.pickupLocation.latitude,
        longitude: offer.pickupLocation.longitude,
        address: offer.pickupLocation.address,
        city: offer.pickupLocation.city,
        country: offer.pickupLocation.country,
        timestamp: new Date().toISOString(),
      },
      dropoffDetails: {
        latitude: offer.dropoffLocation.latitude,
        longitude: offer.dropoffLocation.longitude,
        address: offer.dropoffLocation.address,
        city: offer.dropoffLocation.city,
        country: offer.dropoffLocation.country,
        timestamp: new Date(Date.now() + offer.estimatedDuration * 60 * 1000).toISOString(),
      },
      estimatedFare: offer.pricing.totalEstimate,
      status: 'REQUESTED',
      driver: this.extractDriverInfo(offer),
      vehicle: {
        licensePlate: offer.vehicle.licensePlate,
        make: offer.vehicle.make,
        model: offer.vehicle.model,
        color: offer.vehicle.color,
        capacity: offer.vehicle.capacity,
        registrationNumber: `REG${Math.random().toString().substring(2, 8)}`,
      },
      createdAt: new Date(),
      paymentMethod,
      cancellationPolicy: {
        freeCancellationWindow: 5,
        cancellationFeePercentage: 20,
      },
    };

    return booking;
  }

  // Accept Ride (Driver confirms)
  async acceptRide(bookingId: string): Promise<RideBooking> {
    return {
      bookingId,
      rideOfferId: `OFFER${uuidv4().substring(0, 8)}`,
      provider: 'uber',
      rideType: 'COMFORT',
      passenger: {} as PassengerDetails,
      pickupDetails: {} as LocationDetails,
      dropoffDetails: {} as LocationDetails,
      estimatedFare: 25.5,
      status: 'ACCEPTED',
      driver: {
        id: 'DRV123456',
        name: 'John Smith',
        rating: 4.9,
        phone: '+1234567890',
        profileImageUrl: 'https://example.com/driver.jpg',
        licensePlateNumber: 'ABC123',
        vehicleColor: 'Black',
        estimatedArrivalTime: 3,
        reviewCount: 2100,
      },
      vehicle: {
        licensePlate: 'ABC123',
        make: 'Toyota',
        model: 'Prius',
        color: 'Black',
        capacity: 4,
        registrationNumber: 'REG789012',
      },
      createdAt: new Date(),
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 5,
        cancellationFeePercentage: 20,
      },
    };
  }

  // Start Ride (Driver arrives and passenger boards)
  async startRide(bookingId: string): Promise<RideBooking> {
    return {
      bookingId,
      rideOfferId: `OFFER${uuidv4().substring(0, 8)}`,
      provider: 'uber',
      rideType: 'COMFORT',
      passenger: {} as PassengerDetails,
      pickupDetails: {} as LocationDetails,
      dropoffDetails: {} as LocationDetails,
      estimatedFare: 25.5,
      status: 'IN_PROGRESS',
      driver: {} as DriverInfo,
      vehicle: {} as VehicleInfo,
      rideStartTime: new Date().toISOString(),
      createdAt: new Date(),
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 5,
        cancellationFeePercentage: 20,
      },
    };
  }

  // Complete Ride (Passenger arrives at destination)
  async completeRide(bookingId: string, actualFare: number, rating: number, review: string): Promise<RideBooking> {
    return {
      bookingId,
      rideOfferId: `OFFER${uuidv4().substring(0, 8)}`,
      provider: 'uber',
      rideType: 'COMFORT',
      passenger: {} as PassengerDetails,
      pickupDetails: {} as LocationDetails,
      dropoffDetails: {} as LocationDetails,
      estimatedFare: 25.5,
      actualFare,
      status: 'COMPLETED',
      driver: {} as DriverInfo,
      vehicle: {} as VehicleInfo,
      rideStartTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      rideEndTime: new Date().toISOString(),
      distanceTraveled: 12.5,
      createdAt: new Date(),
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 5,
        cancellationFeePercentage: 20,
      },
    };
  }

  // Cancel Ride
  async cancelRide(bookingId: string, reason: string): Promise<{ status: string; cancellationFee: number; refund: number }> {
    const estimatedFare = 25.5;
    const cancellationFee = estimatedFare * 0.2; // 20% fee

    return {
      status: 'CANCELLED',
      cancellationFee,
      refund: estimatedFare - cancellationFee,
    };
  }

  // ==================== AIRPORT TRANSFERS ====================

  // Get Airport Transfer Packages
  async getAirportTransferPackages(airport: string, destination: string, passengerCount: number): Promise<AirportTransferPackage[]> {
    const packages: AirportTransferPackage[] = [
      {
        type: 'AIRPORT_TO_CITY',
        airport,
        destination,
        estimatedDuration: 45,
        flatRate: 50,
        includesWaitTime: true,
        waitTimeAllocation: 15,
      },
      {
        type: 'AIRPORT_TO_HOTEL',
        airport,
        destination,
        estimatedDuration: 60,
        flatRate: 65,
        includesWaitTime: true,
        waitTimeAllocation: 20,
      },
    ];

    return packages;
  }

  // Book Airport Transfer
  async bookAirportTransfer(
    packageType: string,
    passenger: PassengerDetails,
    flightDetails: { flightNumber: string; arrivalTime: string },
  ): Promise<RideBooking> {
    const booking: RideBooking = {
      bookingId: `AT${uuidv4().substring(0, 10).toUpperCase()}`,
      rideOfferId: `AIRPORT${uuidv4().substring(0, 8)}`,
      provider: 'uber',
      rideType: 'SHUTTLE',
      passenger,
      pickupDetails: {
        latitude: 33.9425,
        longitude: -118.4081,
        address: 'LAX Terminal 1',
        city: 'Los Angeles',
        country: 'USA',
        timestamp: flightDetails.arrivalTime,
      },
      dropoffDetails: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Downtown Hotel',
        city: 'Los Angeles',
        country: 'USA',
        timestamp: new Date(new Date(flightDetails.arrivalTime).getTime() + 45 * 60 * 1000).toISOString(),
      },
      estimatedFare: 50,
      status: 'REQUESTED',
      driver: {} as DriverInfo,
      vehicle: {} as VehicleInfo,
      createdAt: new Date(),
      specialRequests: `Flight ${flightDetails.flightNumber} - Wait at arrival area`,
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 2,
        cancellationFeePercentage: 30,
      },
    };

    return booking;
  }

  // ==================== SHUTTLE SERVICES ====================

  // Search Shuttle Services (Treepz, Travu)
  async searchShuttleServices(fromCity: string, toCity: string): Promise<ShuttleService[]> {
    try {
      // Call Treepz API
      const treepzServices = await this.getTreepzServices(fromCity, toCity);
      // Call Travu API
      const travuServices = await this.getTravuServices(fromCity, toCity);

      return [...treepzServices, ...travuServices];
    } catch (error) {
      console.error('Shuttle search error:', error);
      return this.generateMockShuttleServices(fromCity, toCity);
    }
  }

  // Get Treepz Services (African shuttles)
  private async getTreepzServices(fromCity: string, toCity: string): Promise<ShuttleService[]> {
    try {
      // In production: Call Treepz API
      return this.generateMockTreepzServices(fromCity, toCity);
    } catch (error) {
      return [];
    }
  }

  // Get Travu Services (African mobility)
  private async getTravuServices(fromCity: string, toCity: string): Promise<ShuttleService[]> {
    try {
      // In production: Call Travu API
      return this.generateMockTravuServices(fromCity, toCity);
    } catch (error) {
      return [];
    }
  }

  // Book Shuttle Service
  async bookShuttleService(serviceId: string, passenger: PassengerDetails, seatCount: number): Promise<RideBooking> {
    const services = await this.searchShuttleServices('Lagos', 'Ibadan');
    const service = services.find((s) => s.id === serviceId);

    if (!service) {
      throw new HttpException('Shuttle service not found', HttpStatus.NOT_FOUND);
    }

    const booking: RideBooking = {
      bookingId: `SH${uuidv4().substring(0, 10).toUpperCase()}`,
      rideOfferId: serviceId,
      provider: service.provider,
      rideType: 'SHUTTLE',
      passenger,
      pickupDetails: {
        latitude: service.stops[0].latitude,
        longitude: service.stops[0].longitude,
        address: service.stops[0].name,
        city: service.operatingCities[0],
        country: 'Nigeria',
        timestamp: service.nextDeparture,
      },
      dropoffDetails: {
        latitude: service.stops[service.stops.length - 1].latitude,
        longitude: service.stops[service.stops.length - 1].longitude,
        address: service.stops[service.stops.length - 1].name,
        city: service.operatingCities[service.operatingCities.length - 1],
        country: 'Nigeria',
        timestamp: new Date(new Date(service.nextDeparture).getTime() + service.estimatedDuration * 60 * 1000).toISOString(),
      },
      estimatedFare: service.price * seatCount,
      status: 'REQUESTED',
      driver: {
        id: `DRV${Math.random().toString().substring(2, 8)}`,
        name: 'Premium Shuttle Driver',
        rating: 4.7,
        reviewCount: 450,
        profileImageUrl: 'https://example.com/driver.jpg',
        licensePlateNumber: service.id,
        vehicleColor: 'White',
        estimatedArrivalTime: 10,
      },
      vehicle: {
        licensePlate: service.id,
        make: 'Mercedes',
        model: 'Sprinter',
        color: 'White',
        capacity: service.capacity,
        registrationNumber: `REG${Math.random().toString().substring(2, 8)}`,
      },
      createdAt: new Date(),
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 24,
        cancellationFeePercentage: 10,
      },
    };

    return booking;
  }

  // ==================== INTER-CITY TRANSPORT ====================

  // Search Inter-City Transport
  async searchInterCityTransport(fromCity: string, toCity: string, travelDate: string): Promise<InterCityTransport[]> {
    return this.generateMockInterCityTransport(fromCity, toCity, travelDate);
  }

  // Book Inter-City Transport
  async bookInterCityTransport(
    transportId: string,
    passenger: PassengerDetails,
    seatNumber: string,
  ): Promise<RideBooking> {
    const transports = await this.searchInterCityTransport('Lagos', 'Abuja', new Date().toISOString().split('T')[0]);
    const transport = transports.find((t) => t.id === transportId);

    if (!transport) {
      throw new HttpException('Transport not found', HttpStatus.NOT_FOUND);
    }

    const booking: RideBooking = {
      bookingId: `IC${uuidv4().substring(0, 10).toUpperCase()}`,
      rideOfferId: transportId,
      provider: transport.provider,
      rideType: 'MINIBUS',
      passenger,
      pickupDetails: {
        latitude: 6.5244,
        longitude: 3.3792,
        address: 'Lagos Main Terminal',
        city: 'Lagos',
        country: 'Nigeria',
        timestamp: transport.departureTime,
      },
      dropoffDetails: {
        latitude: 9.0765,
        longitude: 7.3986,
        address: 'Abuja Central Station',
        city: 'Abuja',
        country: 'Nigeria',
        timestamp: transport.arrivalTime,
      },
      estimatedFare: transport.price,
      status: 'REQUESTED',
      driver: {
        id: `DRV${Math.random().toString().substring(2, 8)}`,
        name: 'Senior Coach Driver',
        rating: 4.8,
        reviewCount: 892,
        profileImageUrl: 'https://example.com/driver.jpg',
        licensePlateNumber: `${seatNumber}`,
        vehicleColor: 'Blue',
        estimatedArrivalTime: 0,
      },
      vehicle: {
        licensePlate: `COACH${Math.random().toString().substring(2, 6)}`,
        make: 'Sienna',
        model: 'Deluxe Coach',
        color: 'Blue',
        capacity: transport.capacity,
        registrationNumber: transportId,
      },
      createdAt: new Date(),
      paymentMethod: 'CARD',
      cancellationPolicy: {
        freeCancellationWindow: 48,
        cancellationFeePercentage: 15,
      },
    };

    return booking;
  }

  // ==================== HELPER METHODS ====================

  private generateMockRideOffers(request: RideSearchRequest, provider?: string): RideOffer[] {
    const offers: RideOffer[] = [];
    const providers: Array<'uber' | 'bolt' | 'local_taxi'> = provider ? [provider as any] : ['uber', 'bolt', 'local_taxi'];
    const rideTypes: Array<'ECONOMY' | 'COMFORT' | 'PREMIUM'> = ['ECONOMY', 'COMFORT', 'PREMIUM'];

    for (let i = 0; i < 6; i++) {
      const rideType = rideTypes[i % rideTypes.length];
      const basePrice = 10;
      const distanceMultiplier = request.dropoffLocation ? 0.5 : 0.3;
      const timeMultiplier = 0.2;
      const surgePrice = Math.random() > 0.7 ? 1.5 : 1.0;

      const offer: RideOffer = {
        id: `RIDE${uuidv4().substring(0, 8).toUpperCase()}`,
        provider: providers[i % providers.length],
        rideType,
        pickupLocation: {
          latitude: request.pickupLocation.latitude,
          longitude: request.pickupLocation.longitude,
          address: request.pickupLocation.address || '123 Main Street',
          city: 'Los Angeles',
          country: 'USA',
        },
        dropoffLocation: {
          latitude: request.dropoffLocation?.latitude || 34.0522,
          longitude: request.dropoffLocation?.longitude || -118.2437,
          address: request.dropoffLocation?.address || 'Downtown Hotel',
          city: 'Los Angeles',
          country: 'USA',
        },
        estimatedDuration: 15 + i * 3,
        estimatedDistance: 8 + i * 1.5,
        pricing: {
          baseFare: basePrice,
          distanceFare: (8 + i * 1.5) * distanceMultiplier,
          timeFare: (15 + i * 3) * timeMultiplier,
          surgePricing: surgePrice,
          totalEstimate: (basePrice + (8 + i * 1.5) * distanceMultiplier + (15 + i * 3) * timeMultiplier) * surgePrice * (1 + (i * 0.1)),
          currency: 'USD',
        },
        vehicle: {
          make: ['Toyota', 'Honda', 'Hyundai', 'Ford'][i % 4],
          model: ['Prius', 'Civic', 'Elantra', 'Fusion'][i % 4],
          year: 2022 + (i % 2),
          licensePlate: `ABC${100 + i}`,
          color: ['Black', 'White', 'Silver', 'Gray'][i % 4],
          capacity: i % 3 === 0 ? 4 : 5,
          features: ['WiFi', 'Phone Charger', 'Water'],
        },
        driver: {
          id: `DRV${uuidv4().substring(0, 6)}`,
          name: `Driver ${i + 1}`,
          rating: 4.6 + Math.random() * 0.4,
          reviewCount: 100 + i * 50,
          profileImageUrl: 'https://example.com/driver.jpg',
          verified: true,
          yearsExperience: 3 + i,
        },
        availabilityWindow: {
          estimatedPickupTime: new Date(Date.now() + (2 + i) * 60 * 1000).toISOString(),
          acceptanceDeadline: new Date(Date.now() + 30 * 1000).toISOString(),
        },
      };

      offers.push(offer);
    }

    return offers;
  }

  private generateMockTreepzServices(fromCity: string, toCity: string): ShuttleService[] {
    return [
      {
        id: `TREEPZ${uuidv4().substring(0, 6)}`,
        provider: 'treepz',
        operatingCities: [fromCity, toCity],
        scheduleType: 'FIXED_ROUTE',
        stops: [
          { name: `${fromCity} Terminal`, latitude: 6.5244, longitude: 3.3792, arrivalTime: '08:00' },
          { name: `${toCity} Terminal`, latitude: 9.0765, longitude: 7.3986, arrivalTime: '11:00' },
        ],
        capacity: 14,
        price: 3500,
        estimatedDuration: 180,
        nextDeparture: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amenities: ['WiFi', 'Phone Charger', 'Air Conditioning', 'Comfortable Seats'],
      },
    ];
  }

  private generateMockTravuServices(fromCity: string, toCity: string): ShuttleService[] {
    return [
      {
        id: `TRAVU${uuidv4().substring(0, 6)}`,
        provider: 'travu',
        operatingCities: [fromCity, toCity],
        scheduleType: 'ON_DEMAND',
        stops: [
          { name: `${fromCity} Center`, latitude: 6.5244, longitude: 3.3792, arrivalTime: '08:30' },
          { name: `${toCity} Center`, latitude: 9.0765, longitude: 7.3986, arrivalTime: '11:30' },
        ],
        capacity: 12,
        price: 3000,
        estimatedDuration: 200,
        nextDeparture: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        amenities: ['WiFi', 'Power Banks', 'AC', 'Water'],
      },
    ];
  }

  private generateMockShuttleServices(fromCity: string, toCity: string): ShuttleService[] {
    return [...this.generateMockTreepzServices(fromCity, toCity), ...this.generateMockTravuServices(fromCity, toCity)];
  }

  private generateMockInterCityTransport(fromCity: string, toCity: string, travelDate: string): InterCityTransport[] {
    const transports: InterCityTransport[] = [];

    for (let i = 0; i < 5; i++) {
      const departureHour = 6 + i * 3;
      const departureTime = `${String(departureHour).padStart(2, '0')}:00`;
      const arrivalHour = departureHour + 3;
      const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:00`;

      transports.push({
        id: `ICT${uuidv4().substring(0, 8)}`,
        provider: ['Danfo', 'Keke', 'SafeRide'][i % 3],
        fromCity,
        toCity,
        departureTime: `${travelDate}T${departureTime}:00Z`,
        arrivalTime: `${travelDate}T${arrivalTime}:00Z`,
        transportType: ['BUS', 'MINIBUS', 'COACH'][i % 3] as any,
        capacity: 45 + i * 5,
        availableSeats: 10 + Math.floor(Math.random() * 20),
        price: 2000 + i * 500,
        estimatedDuration: 180 + i * 30,
        stops: ['Stop 1', 'Stop 2', 'Stop 3'],
        amenities: ['WiFi', 'Charging', 'AC', 'Toilet'],
        operatorRating: 4.3 + Math.random() * 0.6,
      });
    }

    return transports;
  }

  private extractDriverInfo(offer: RideOffer): DriverInfo {
    return {
      id: offer.driver.id,
      name: offer.driver.name,
      rating: offer.driver.rating,
      reviewCount: offer.driver.reviewCount,
      phone: undefined,
      profileImageUrl: offer.driver.profileImageUrl,
      licensePlateNumber: offer.vehicle.licensePlate,
      vehicleColor: offer.vehicle.color,
      estimatedArrivalTime: 3,
    };
  }
}
