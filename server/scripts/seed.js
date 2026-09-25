require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Maintenance = require("../models/Maintenance");
const SparePart = require("../models/SparePart");
const Expense = require("../models/Expense");

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await connectDB();

    console.log("Clearing existing collections...");
    await Vehicle.deleteMany({});
    await Service.deleteMany({});
    await Maintenance.deleteMany({});
    await SparePart.deleteMany({});
    await Expense.deleteMany({});

    console.log("Inserting Vehicles...");
    const vehiclesData = [
      {
        vehicleNumber: "TN 01 AB 1234",
        vehicleType: "Truck",
        make: "Tata",
        model: "Prima 2830",
        year: 2023,
        driver: "Rajesh Kumar",
        mileage: 48500,
        status: "Active",
        lastServiceDate: new Date("2026-08-10"),
        nextServiceDate: new Date("2026-10-15"),
        notes: "Heavy haul prime mover. Assigned to South corridor route."
      },
      {
        vehicleNumber: "TN 02 CD 5678",
        vehicleType: "Van",
        make: "Mahindra",
        model: "Bolero Maxi Truck",
        year: 2022,
        driver: "Murugan S",
        mileage: 62000,
        status: "Active",
        lastServiceDate: new Date("2026-07-20"),
        nextServiceDate: new Date("2026-11-01"),
        notes: "Intra-city distribution van."
      },
      {
        vehicleNumber: "TN 09 EF 2468",
        vehicleType: "Truck",
        make: "Ashok Leyland",
        model: "Ecomet 1615",
        year: 2024,
        driver: "Karthik Raja",
        mileage: 29400,
        status: "In Service",
        lastServiceDate: new Date("2026-09-01"),
        nextServiceDate: new Date("2026-12-10"),
        notes: "Currently at authorized workshop for 30,000 km standard maintenance."
      },
      {
        vehicleNumber: "TN 07 GH 9012",
        vehicleType: "Car",
        make: "Toyota",
        model: "Innova Crysta",
        year: 2023,
        driver: "Suresh Babu",
        mileage: 38200,
        status: "Active",
        lastServiceDate: new Date("2026-06-15"),
        nextServiceDate: new Date("2026-09-30"),
        notes: "Executive client visit vehicle."
      },
      {
        vehicleNumber: "TN 11 JK 3456",
        vehicleType: "Bus",
        make: "BharatBenz",
        model: "1624 Staff Bus",
        year: 2021,
        driver: "Praveen Nair",
        mileage: 89000,
        status: "Maintenance",
        lastServiceDate: new Date("2026-05-18"),
        nextServiceDate: new Date("2026-09-20"),
        notes: "Brake lining and air suspension overhaul pending."
      },
      {
        vehicleNumber: "TN 14 LM 7890",
        vehicleType: "Motorcycle",
        make: "Hero",
        model: "Splendor Plus",
        year: 2022,
        driver: "Anand M",
        mileage: 24000,
        status: "Active",
        lastServiceDate: new Date("2026-08-05"),
        nextServiceDate: new Date("2026-11-20"),
        notes: "Express document courier."
      }
    ];

    const createdVehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`Inserted ${createdVehicles.length} vehicles.`);

    console.log("Inserting Services...");
    const servicesData = [
      {
        vehicle: createdVehicles[0]._id,
        serviceType: "Full Oil & Filter Replacement",
        scheduledDate: new Date("2026-08-10"),
        completedDate: new Date("2026-08-10"),
        status: "Completed",
        technician: "Ramesh Service Center",
        description: "Replaced 15W40 heavy duty engine oil, oil filter, and fuel filters.",
        cost: 6500,
        notes: "Engine running smooth."
      },
      {
        vehicle: createdVehicles[1]._id,
        serviceType: "Tire Rotation & Wheel Alignment",
        scheduledDate: new Date("2026-07-20"),
        completedDate: new Date("2026-07-20"),
        status: "Completed",
        technician: "Speedy Wheels Guindy",
        description: "4-wheel balancing and computerized alignment.",
        cost: 2200,
        notes: "Tire tread depth verified safe."
      },
      {
        vehicle: createdVehicles[2]._id,
        serviceType: "30,000 KM Periodic Maintenance",
        scheduledDate: new Date("2026-09-24"),
        completedDate: null,
        status: "In Progress",
        technician: "Leyland Authorized Hub",
        description: "Brake inspection, coolant flush, electrical check, and lubrication.",
        cost: 8500,
        notes: "Expected delivery by tomorrow evening."
      },
      {
        vehicle: createdVehicles[3]._id,
        serviceType: "Air Conditioning System Service",
        scheduledDate: new Date("2026-09-30"),
        completedDate: null,
        status: "Scheduled",
        technician: "CoolCare Auto Works",
        description: "AC gas top-up, cabin air filter replacement, and blower cleaning.",
        cost: 3400,
        notes: "Booked for morning slot."
      },
      {
        vehicle: createdVehicles[4]._id,
        serviceType: "Air Suspension Overhaul",
        scheduledDate: new Date("2026-09-18"),
        completedDate: null,
        status: "Overdue",
        technician: "Metro Bus Tech",
        description: "Suspension bellows check and compressor pressure valve repair.",
        cost: 14000,
        notes: "Parts arrived late; rescheduling in progress."
      },
      {
        vehicle: createdVehicles[5]._id,
        serviceType: "Periodic Spark Plug & Chain Lube",
        scheduledDate: new Date("2026-08-05"),
        completedDate: new Date("2026-08-05"),
        status: "Completed",
        technician: "Bikesmith Point",
        description: "Spark plug replaced, drive chain cleaned and tightened.",
        cost: 850,
        notes: "Checked brake cables and battery voltage."
      }
    ];

    const createdServices = await Service.insertMany(servicesData);
    console.log(`Inserted ${createdServices.length} service records.`);

    console.log("Inserting Maintenance Records...");
    const maintenanceData = [
      {
        vehicle: createdVehicles[4]._id,
        title: "Pneumatic Brake Leak & Air Pressure Drop",
        description: "Driver reported slow air pressure build-up and hiss near rear axle.",
        priority: "High",
        status: "In Progress",
        dueDate: new Date("2026-09-26"),
        cost: 9500
      },
      {
        vehicle: createdVehicles[0]._id,
        title: "Alternator Belt Tension Check",
        description: "Mild squeak observed on cold ignition startup.",
        priority: "Medium",
        status: "Pending",
        dueDate: new Date("2026-10-05"),
        cost: 1500
      },
      {
        vehicle: createdVehicles[1]._id,
        title: "Side Mirror Glass Replacement",
        description: "Left side rearview glass cracked during tight parking maneuver.",
        priority: "Low",
        status: "Completed",
        dueDate: new Date("2026-09-15"),
        cost: 850
      },
      {
        vehicle: createdVehicles[2]._id,
        title: "Clutch Plate Adjustment",
        description: "Clutch pedal travel slightly high. Needs cable adjustment.",
        priority: "Medium",
        status: "In Progress",
        dueDate: new Date("2026-09-28"),
        cost: 3200
      },
      {
        vehicle: createdVehicles[3]._id,
        title: "Headlamp Leveling Mechanism Repair",
        description: "Right low beam projector is aimed lower than standard beam cutoff.",
        priority: "Low",
        status: "Pending",
        dueDate: new Date("2026-10-10"),
        cost: 1200
      }
    ];

    const createdMaintenance = await Maintenance.insertMany(maintenanceData);
    console.log(`Inserted ${createdMaintenance.length} maintenance records.`);

    console.log("Inserting Spare Parts...");
    const sparePartsData = [
      {
        partName: "Heavy Duty Oil Filter (Spin-on)",
        partNumber: "FLT-TT-9821",
        category: "Engine & Filtration",
        quantity: 14,
        minimumStock: 5,
        unitCost: 650,
        supplier: "Bosch Automotive Filters",
        vehicle: createdVehicles[0]._id,
        lastReplaced: new Date("2026-08-10"),
        notes: "OEM fit for Tata Prima series."
      },
      {
        partName: "Front Disc Brake Pads Set",
        partNumber: "BRK-IN-4412",
        category: "Braking System",
        quantity: 3,
        minimumStock: 4,
        unitCost: 2800,
        supplier: "TVS Girling",
        vehicle: createdVehicles[3]._id,
        lastReplaced: new Date("2026-06-15"),
        notes: "Low stock alert. Reorder needed."
      },
      {
        partName: "Air Suspension Bellow",
        partNumber: "SUS-BB-7721",
        category: "Suspension",
        quantity: 1,
        minimumStock: 2,
        unitCost: 7500,
        supplier: "Wabco Suspension Systems",
        vehicle: createdVehicles[4]._id,
        lastReplaced: new Date("2026-05-18"),
        notes: "Critical part for passenger bus."
      },
      {
        partName: "12V 100Ah Commercial Battery",
        partNumber: "BAT-EX-100AH",
        category: "Electrical",
        quantity: 0,
        minimumStock: 2,
        unitCost: 9200,
        supplier: "Exide Commercial Power",
        vehicle: null,
        lastReplaced: null,
        notes: "Out of stock. Purchase request submitted."
      },
      {
        partName: "Diesel Fuel Water Separator Cartridge",
        partNumber: "FLT-FS-3301",
        category: "Engine & Filtration",
        quantity: 8,
        minimumStock: 3,
        unitCost: 1150,
        supplier: "Fleetguard Filters",
        vehicle: createdVehicles[2]._id,
        lastReplaced: new Date("2026-09-01"),
        notes: "Stock adequate for Q3 maintenance."
      },
      {
        partName: "Halogen H4 Headlamp Bulb (24V)",
        partNumber: "ELC-HL-24V70W",
        category: "Lighting",
        quantity: 22,
        minimumStock: 6,
        unitCost: 220,
        supplier: "Philips Automotive Lighting",
        vehicle: null,
        lastReplaced: new Date("2026-08-20"),
        notes: "Universal fit for commercial trucks."
      },
      {
        partName: "Heavy Duty Fan Belt V-Ribbed",
        partNumber: "BLT-GT-6PK1420",
        category: "Engine Drive",
        quantity: 6,
        minimumStock: 3,
        unitCost: 890,
        supplier: "Gates Rubber Corporation",
        vehicle: createdVehicles[1]._id,
        lastReplaced: new Date("2026-07-20"),
        notes: "Resistant to heat and high RPM stretch."
      },
      {
        partName: "Air Brake Quick Release Valve",
        partNumber: "PNM-QR-5540",
        category: "Pneumatics",
        quantity: 2,
        minimumStock: 3,
        unitCost: 1850,
        supplier: "Knorr-Bremse India",
        vehicle: createdVehicles[4]._id,
        lastReplaced: null,
        notes: "Low stock alert."
      }
    ];

    const createdParts = await SparePart.insertMany(sparePartsData);
    console.log(`Inserted ${createdParts.length} spare parts.`);

    console.log("Inserting Expenses...");
    const expensesData = [
      {
        vehicle: createdVehicles[0]._id,
        category: "Maintenance",
        amount: 6500,
        date: new Date("2026-08-10"),
        description: "Scheduled oil and filter change",
        service: createdServices[0]._id,
        sparePart: createdParts[0]._id
      },
      {
        vehicle: createdVehicles[1]._id,
        category: "Service",
        amount: 2200,
        date: new Date("2026-07-20"),
        description: "Wheel alignment & tire rotation service",
        service: createdServices[1]._id,
        sparePart: null
      },
      {
        vehicle: createdVehicles[4]._id,
        category: "Spare Part",
        amount: 7500,
        date: new Date("2026-09-18"),
        description: "Purchased Wabco air suspension bellow",
        service: null,
        sparePart: createdParts[2]._id
      },
      {
        vehicle: createdVehicles[0]._id,
        category: "Fuel",
        amount: 18500,
        date: new Date("2026-09-12"),
        description: "Diesel top-up 200L for Chennai - Madurai route",
        service: null,
        sparePart: null
      },
      {
        vehicle: createdVehicles[2]._id,
        category: "Fuel",
        amount: 12400,
        date: new Date("2026-09-15"),
        description: "Diesel fuel fill 140L",
        service: null,
        sparePart: null
      },
      {
        vehicle: createdVehicles[3]._id,
        category: "Insurance",
        amount: 24500,
        date: new Date("2026-06-01"),
        description: "Annual comprehensive commercial vehicle policy renewal",
        service: null,
        sparePart: null
      },
      {
        vehicle: createdVehicles[1]._id,
        category: "Maintenance",
        amount: 850,
        date: new Date("2026-09-15"),
        description: "Left wing mirror replacement",
        service: null,
        sparePart: null
      },
      {
        vehicle: createdVehicles[5]._id,
        category: "Service",
        amount: 850,
        date: new Date("2026-08-05"),
        description: "Motorcycle chain lubrication and spark plug",
        service: createdServices[5]._id,
        sparePart: null
      },
      {
        vehicle: createdVehicles[0]._id,
        category: "Toll",
        amount: 3200,
        date: new Date("2026-09-14"),
        description: "FASTag monthly highway toll automated debit",
        service: null,
        sparePart: null
      },
      {
        vehicle: createdVehicles[2]._id,
        category: "Maintenance",
        amount: 8500,
        date: new Date("2026-09-24"),
        description: "30,000 km workshop periodic inspection advance",
        service: createdServices[2]._id,
        sparePart: createdParts[4]._id
      }
    ];

    const createdExpenses = await Expense.insertMany(expensesData);
    console.log(`Inserted ${createdExpenses.length} expense records.`);

    console.log("FleetPulse database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();

