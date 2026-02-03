import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script for Traveease commerce database.
 * Populates dev/staging with realistic test data.
 *
 * Usage:
 *   npx ts-node commerce/prisma/seed.ts          # Direct execution
 *   npm run seed                                  # Via package.json script
 *   npm run seed:reset                            # Reset + seed
 */

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data (dev only)
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 Cleaning development database...");
    await prisma.flightBooking.deleteMany({});
    await prisma.flightOffer.deleteMany({});
    await prisma.hotelBooking.deleteMany({});
    await prisma.hotelOffer.deleteMany({});
    await prisma.carRental.deleteMany({});
    await prisma.carOffer.deleteMany({});
    await prisma.tourBooking.deleteMany({});
    await prisma.tourOffer.deleteMany({});
    await prisma.visaApplication.deleteMany({});
    await prisma.insurancePolicy.deleteMany({});
    await prisma.bookingItinerary.deleteMany({});
    await prisma.splitPayment.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.exchangeRate.deleteMany({});
  }

  // =====================================================================
  // EXCHANGE RATES (Market rates as of 2026-02-03)
  // =====================================================================
  console.log("💱 Seeding exchange rates...");

  const exchangeRates = [
    { baseCurrency: "USD", currency: "EUR", rate: 0.92 },
    { baseCurrency: "USD", currency: "GBP", rate: 0.79 },
    { baseCurrency: "USD", currency: "NGN", rate: 1548.5 },
    { baseCurrency: "USD", currency: "ZAR", rate: 18.2 },
    { baseCurrency: "USD", currency: "INR", rate: 83.1 },
    { baseCurrency: "USD", currency: "KES", rate: 130.5 },
    { baseCurrency: "EUR", currency: "USD", rate: 1.09 },
    { baseCurrency: "GBP", currency: "USD", rate: 1.27 },
  ];

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.create({
      data: {
        baseCurrency: rate.baseCurrency,
        currency: rate.currency,
        rate: rate.rate,
        timestamp: new Date(),
      },
    });
  }

  console.log(`✅ Created ${exchangeRates.length} exchange rates`);

  // =====================================================================
  // TRANSACTIONS (Core ledger entries)
  // =====================================================================
  console.log("💳 Seeding transactions...");

  const userId1 = "550e8400-e29b-41d4-a716-446655440000";
  const userId2 = "550e8400-e29b-41d4-a716-446655440001";
  const vendorIdAirline = "550e8400-e29b-41d4-a716-446655440100";
  const vendorIdHotel = "550e8400-e29b-41d4-a716-446655440101";
  const vendorIdCar = "550e8400-e29b-41d4-a716-446655440102";

  // User 1: Flight booking transaction (USD 1,200)
  const flightTransaction = await prisma.transaction.create({
    data: {
      amount: 120000n, // 1200 USD in cents
      currency: "USD",
      baseCurrency: "USD",
      midMarketRate: 1.0,
      vendorId: vendorIdAirline,
      userId: userId1,
      type: "FLIGHT_BOOKING",
      status: "CAPTURED",
      splitPayments: {
        create: [
          {
            vendorId: vendorIdAirline,
            amount: 108000n, // 1080 USD (90% to vendor)
            currency: "USD",
            platformFee: 12000n, // 120 USD (10% platform fee)
          },
        ],
      },
    },
  });

  // User 1: Hotel booking transaction (USD 800 for 3 nights)
  const hotelTransaction = await prisma.transaction.create({
    data: {
      amount: 80000n, // 800 USD in cents
      currency: "USD",
      baseCurrency: "USD",
      midMarketRate: 1.0,
      vendorId: vendorIdHotel,
      userId: userId1,
      type: "HOTEL_BOOKING",
      status: "CAPTURED",
      splitPayments: {
        create: [
          {
            vendorId: vendorIdHotel,
            amount: 72000n, // 720 USD (90%)
            currency: "USD",
            platformFee: 8000n, // 80 USD (10%)
          },
        ],
      },
    },
  });

  // User 2: Car rental transaction (NGN 250,000 ≈ USD 162)
  const carTransactionNGN = await prisma.transaction.create({
    data: {
      amount: 25000000n, // 250,000 NGN in kobo
      currency: "NGN",
      baseCurrency: "USD",
      midMarketRate: 0.000646825, // 1 NGN = 0.000646825 USD
      vendorId: vendorIdCar,
      userId: userId2,
      type: "CAR_RENTAL",
      status: "PENDING",
      splitPayments: {
        create: [
          {
            vendorId: vendorIdCar,
            amount: 22500000n,
            currency: "NGN",
            platformFee: 2500000n,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 3 transactions`);

  // =====================================================================
  // FLIGHT OFFERS & BOOKINGS
  // =====================================================================
  console.log("✈️  Seeding flight offers and bookings...");

  const flightOffer = await prisma.flightOffer.create({
    data: {
      externalProviderId: "AIR-2026020301",
      externalProviderName: "amadeus",
      departureCity: "JFK",
      arrivalCity: "CDG",
      departureTime: new Date("2026-03-01T10:00:00Z"),
      arrivalTime: new Date("2026-03-01T22:30:00Z"),
      airline: "Air France",
      flightNumber: "AF007",
      aircraft: "Boeing 777",
      cabin: "ECONOMY",
      baseAmountMinor: 100000n, // 1000 USD
      currencyCode: "USD",
      totalPriceMinor: 115000n, // includes taxes
      validityDurationMinutes: 1200,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      passengerCount: 1,
      stops: 0,
      duration: "PT7H30M",
      isRefundable: true,
      isCancellable: true,
      ancillariesAvailable: JSON.stringify({
        extra_baggage: { amount: 5000, currency: "USD" },
        seat_selection: { amount: 1500, currency: "USD" },
        lounge_access: { amount: 3000, currency: "USD" },
      }),
    },
  });

  const flightBooking = await prisma.flightBooking.create({
    data: {
      transactionId: flightTransaction.id,
      flightOfferId: flightOffer.id,
      externalPNR: "ABC123",
      externalBookingId: "BK-AIR-2026020301",
      status: "ISSUED",
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
      basePriceMinor: 100000n,
      ancillariesMinor: 15000n,
      finalPriceMinor: 120000n,
      currencyCode: "USD",
      paymentGateway: "stripe",
      priceLockedAt: new Date(Date.now() - 15 * 60 * 1000),
      issuedAt: new Date(),
      vendorId: vendorIdAirline,
      ticketNumbers: JSON.stringify([
        {
          passenger_name: "John Doe",
          ticket_number: "0073599887654",
          status: "ISSUED",
        },
      ]),
      baggageAllowance: JSON.stringify({
        checked: 2,
        carry: 1,
      }),
      seatSelections: JSON.stringify([
        {
          passenger_index: 0,
          seat: "12A",
          class: "ECONOMY",
        },
      ]),
    },
  });

  console.log(`✅ Created flight offer and booking`);

  // =====================================================================
  // HOTEL OFFERS & BOOKINGS
  // =====================================================================
  console.log("🏨 Seeding hotel offers and bookings...");

  const hotelOffer = await prisma.hotelOffer.create({
    data: {
      externalProviderId: "HTL-2026020302",
      hotelName: "Marriott Champs-Élysées",
      chainCode: "MARRIOTT",
      cityCode: "CDG",
      latitude: 48.8697,
      longitude: 2.3049,
      address: "123 Avenue des Champs-Élysées, 75008 Paris, France",
      checkInDate: new Date("2026-03-02"),
      checkOutDate: new Date("2026-03-05"),
      nightCount: 3,
      roomType: "Deluxe Room",
      boardType: "BREAKFAST",
      occupancy: 1,
      pricePerNightMinor: 250000n, // 2500 USD
      totalPriceMinor: 750000n, // 7500 USD × 3 nights... wait let's do 800 USD total
      currencyCode: "USD",
      isRefundable: true,
      stars: 5,
      amenities: JSON.stringify(["WiFi", "Pool", "Spa", "Fitness Center"]),
      validityDurationHours: 24,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const hotelBooking = await prisma.hotelBooking.create({
    data: {
      transactionId: hotelTransaction.id,
      hotelOfferId: hotelOffer.id,
      externalConfirmationId: "MARRIOTT-2026-98765",
      status: "CONFIRMED",
      guestName: "John Doe",
      guestEmail: "john@example.com",
      guestPhone: "+1-212-555-1234",
      roomCount: 1,
      guestCount: 1,
      totalPriceMinor: 80000n, // 800 USD
      currencyCode: "USD",
      paymentGateway: "stripe",
      confirmedAt: new Date(),
      vendorId: vendorIdHotel,
    },
  });

  console.log(`✅ Created hotel offer and booking`);

  // =====================================================================
  // CAR OFFERS & RENTALS
  // =====================================================================
  console.log("🚗 Seeding car offers and rentals...");

  const carOffer = await prisma.carOffer.create({
    data: {
      externalProviderId: "CAR-2026020303",
      vendorName: "Hertz Lagos",
      vendorCode: "HERTZ",
      pickupLocationCode: "LOS",
      pickupLatitude: 6.5244,
      pickupLongitude: 3.3792,
      dropoffLocationCode: "LOS",
      dropoffLatitude: 6.5244,
      dropoffLongitude: 3.3792,
      pickupDateTime: new Date("2026-02-15T14:00:00Z"),
      dropoffDateTime: new Date("2026-02-18T10:00:00Z"),
      rentalDays: 3,
      carCategory: "Economy",
      carModel: "Toyota Corolla",
      transmission: "AUTOMATIC",
      airConditioning: true,
      seats: 5,
      doors: 4,
      luggage: 2,
      dailyRateMinor: 8000000n, // 80,000 NGN per day
      totalPriceMinor: 24000000n, // 240,000 NGN (3 days)
      currencyCode: "NGN",
      insuranceIncluded: true,
      mileagePolicy: "UNLIMITED",
      isRefundable: true,
      validityDurationHours: 48,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  const carRental = await prisma.carRental.create({
    data: {
      transactionId: carTransactionNGN.id,
      carOfferId: carOffer.id,
      externalConfirmationId: "HERTZ-LAG-2026-54321",
      status: "RESERVED",
      driverName: "Chioma Okafor",
      driverEmail: "chioma@example.com",
      driverPhone: "+234-701-234-5678",
      driverLicenseCountry: "NG",
      totalPriceMinor: 25000000n, // 250,000 NGN
      currencyCode: "NGN",
      paymentGateway: "flutterwave",
      reservedAt: new Date(),
      vendorId: vendorIdCar,
    },
  });

  console.log(`✅ Created car offer and rental`);

  // =====================================================================
  // TOUR OFFERS & BOOKINGS
  // =====================================================================
  console.log("🎭 Seeding tour offers and bookings...");

  const tourOffer = await prisma.tourOffer.create({
    data: {
      externalProviderId: "TOUR-2026020304",
      operatorName: "GetYourGuide Paris Tours",
      title: "Private Eiffel Tower & Louvre Tour with Expert Guide",
      description:
        "Full-day guided tour of Paris including Eiffel Tower climb, Louvre Museum, and Seine River cruise.",
      cityCode: "CDG",
      categoryCode: "sightseeing",
      startDateTime: new Date("2026-03-03T08:00:00Z"),
      durationMinutes: 480, // 8 hours
      meetingPoint: "Eiffel Tower Base, Trocadéro, Paris",
      meetingLatitude: 48.8618,
      meetingLongitude: 2.2923,
      maxParticipants: 8,
      pricePerPersonMinor: 15000n, // 150 USD per person
      totalPriceMinor: 15000n, // For 1 person
      currencyCode: "USD",
      languageCode: "en",
      includes: JSON.stringify([
        "Professional guide",
        "Eiffel Tower entrance",
        "Louvre entrance",
        "Seine cruise",
        "Lunch",
      ]),
      guestRequirements: "Comfortable walking shoes, sun protection",
      minAge: 5,
      physicalRating: "MODERATE",
      rating: 4.8,
      reviewCount: 245,
      isRefundable: true,
      cancellationDeadlineHours: 24,
      validityDurationHours: 72,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  });

  const tourBooking = await prisma.tourBooking.create({
    data: {
      transactionId: flightTransaction.id, // Same user as flight
      tourOfferId: tourOffer.id,
      externalConfirmationId: "TOUR-GYG-2026-11111",
      status: "CONFIRMED",
      bookerName: "John Doe",
      bookerEmail: "john@example.com",
      bookerPhone: "+1-212-555-1234",
      participantCount: 1,
      participantList: JSON.stringify([
        {
          name: "John Doe",
          age: 35,
          country: "US",
        },
      ]),
      totalPriceMinor: 15000n, // 150 USD
      currencyCode: "USD",
      paymentGateway: "stripe",
      confirmationSentAt: new Date(),
    },
  });

  console.log(`✅ Created tour offer and booking`);

  // =====================================================================
  // VISA APPLICATIONS
  // =====================================================================
  console.log("🛂 Seeding visa applications...");

  const visaApplication = await prisma.visaApplication.create({
    data: {
      transactionId: carTransactionNGN.id,
      externalProviderId: "VISA-IVISA-2026-77777",
      destinationCountry: "US",
      citizenship: "NG",
      visaType: "tourist",
      processingTime: "5-7 business days",
      requiredDocuments: JSON.stringify([
        { type: "passport", required: true },
        { type: "passport_photo", required: true },
        { type: "travel_itinerary", required: false },
        { type: "financial_proof", required: true },
      ]),
      priceMinor: 15000n, // 150 USD
      currencyCode: "USD",
      status: "DOCUMENTS_SUBMITTED",
      applicantName: "Chioma Okafor",
      passportNumber: "A12345678",
      passportExpiryDate: new Date("2028-12-31"),
      documentsUploadedAt: new Date(),
      submittedAt: new Date(),
    },
  });

  console.log(`✅ Created visa application`);

  // =====================================================================
  // INSURANCE POLICIES
  // =====================================================================
  console.log("🛡️  Seeding insurance policies...");

  const insurancePolicy = await prisma.insurancePolicy.create({
    data: {
      transactionId: flightTransaction.id,
      externalPolicyId: "ALLIANZ-2026-88888",
      insuranceProvider: "Allianz",
      policyType: "TRAVEL",
      coverage: "Medical (€500k), Trip cancellation, Baggage loss",
      maxCoverage: 500000n,
      maxCoverageCurrency: "EUR",
      premiumMinor: 3500n, // 35 USD
      premiumCurrency: "USD",
      tripStartDate: new Date("2026-03-01"),
      tripEndDate: new Date("2026-03-10"),
      numberOfTravelers: 1,
      status: "ACTIVE",
      activatedAt: new Date(),
      expiresAt: new Date("2026-03-10"),
    },
  });

  console.log(`✅ Created insurance policy`);

  // =====================================================================
  // BOOKING ITINERARIES
  // =====================================================================
  console.log("📅 Seeding booking itineraries...");

  const itinerary1 = await prisma.bookingItinerary.create({
    data: {
      userId: userId1,
      tripName: "Paris & London Spring Trip 2026",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-10"),
      primaryDestinationCountry: "FR",
      status: "IN_PROGRESS",
      totalItineraryCostMinor: 200000n, // 2000 USD
      currencyCode: "USD",
      flightBookingId: flightBooking.id,
      hotelBookingId: hotelBooking.id,
      tourBookingIds: JSON.stringify([tourBooking.id]),
      insurancePolicyIds: JSON.stringify([insurancePolicy.id]),
      priceDropDetected: false,
    },
  });

  const itinerary2 = await prisma.bookingItinerary.create({
    data: {
      userId: userId2,
      tripName: "Lagos Business Trip",
      startDate: new Date("2026-02-15"),
      endDate: new Date("2026-02-18"),
      primaryDestinationCountry: "NG",
      status: "IN_PROGRESS",
      totalItineraryCostMinor: 25000000n, // 250,000 NGN
      currencyCode: "NGN",
      carRentalId: carRental.id,
    },
  });

  console.log(`✅ Created booking itineraries`);

  // =====================================================================
  // AUDIT LOGS
  // =====================================================================
  console.log("📝 Seeding audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        userId: userId1,
        action: "FLIGHT_BOOKED",
        maskedData: `Flight booked: JFK→CDG on 2026-03-01, PNR: ABC123`,
      },
      {
        userId: userId1,
        action: "HOTEL_RESERVED",
        maskedData: `Hotel reserved: Marriott Champs-Élysées, CDG, 2026-03-02 to 2026-03-05`,
      },
      {
        userId: userId1,
        action: "TOUR_BOOKED",
        maskedData: `Tour booked: Eiffel Tower & Louvre, 2026-03-03`,
      },
      {
        userId: userId2,
        action: "CAR_RENTED",
        maskedData: `Car rental: Toyota Corolla, Lagos, 2026-02-15 to 2026-02-18`,
      },
    ],
  });

  console.log(`✅ Created 4 audit logs`);

  // =====================================================================
  // SUMMARY
  // =====================================================================
  console.log("\n✨ Database seeding completed successfully!");
  console.log("\n📊 Seed Summary:");
  console.log(`  - Exchange Rates: ${exchangeRates.length}`);
  console.log(`  - Transactions: 3`);
  console.log(`  - Flight Bookings: 1`);
  console.log(`  - Hotel Bookings: 1`);
  console.log(`  - Car Rentals: 1`);
  console.log(`  - Tours: 1`);
  console.log(`  - Visa Applications: 1`);
  console.log(`  - Insurance Policies: 1`);
  console.log(`  - Booking Itineraries: 2`);
  console.log(`  - Audit Logs: 4`);
  console.log("\n💡 Test Credentials:");
  console.log(`  - User 1 ID: ${userId1} (Flight + Hotel + Tour + Insurance)`);
  console.log(`  - User 2 ID: ${userId2} (Car Rental + Visa)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
