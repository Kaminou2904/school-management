import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/models/Branch";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Branch.deleteMany({});
    await User.deleteMany({});

    const password = await bcrypt.hash("password123", 10);

    // Create branches
    const [main, north] = await Branch.insertMany([
      { name: "Main Campus", address: "123 Main Street, City", phone: "9800000001" },
      { name: "North Campus", address: "456 North Avenue, City", phone: "9800000002" },
    ]);

    // Create users
    await User.insertMany([
      // Admin
      {
        name: "Super Admin",
        email: "admin@school.com",
        password,
        role: "admin",
        branch: main._id,
        isActive: true,
      },
      // Teachers
      {
        name: "Rajesh Kumar",
        email: "teacher1@school.com",
        password,
        role: "teacher",
        branch: main._id,
        subjects: ["Mathematics", "Physics"],
        isActive: true,
      },
      {
        name: "Priya Sharma",
        email: "teacher2@school.com",
        password,
        role: "teacher",
        branch: north._id,
        subjects: ["English", "History"],
        isActive: true,
      },
      // Students - Main Campus
      {
        name: "Amit Singh",
        email: "student1@school.com",
        password,
        role: "student",
        branch: main._id,
        class: "10",
        section: "A",
        rollNumber: "MC001",
        isActive: true,
      },
      {
        name: "Sneha Patel",
        email: "student2@school.com",
        password,
        role: "student",
        branch: main._id,
        class: "10",
        section: "B",
        rollNumber: "MC002",
        isActive: true,
      },
      // Students - North Campus
      {
        name: "Ravi Verma",
        email: "student3@school.com",
        password,
        role: "student",
        branch: north._id,
        class: "9",
        section: "A",
        rollNumber: "NC001",
        isActive: true,
      },
      {
        name: "Pooja Nair",
        email: "student4@school.com",
        password,
        role: "student",
        branch: north._id,
        class: "9",
        section: "B",
        rollNumber: "NC002",
        isActive: true,
      },
    ]);

    return NextResponse.json({
      message: "Database seeded successfully!",
      credentials: {
        admin: "admin@school.com / password123",
        teacher1: "teacher1@school.com / password123 (Main Campus)",
        teacher2: "teacher2@school.com / password123 (North Campus)",
        student1: "student1@school.com / password123 (Main Campus, Class 10A)",
        student2: "student2@school.com / password123 (Main Campus, Class 10B)",
        student3: "student3@school.com / password123 (North Campus, Class 9A)",
        student4: "student4@school.com / password123 (North Campus, Class 9B)",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
