import { prisma } from "../src/common/prisma/connect.prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Seed Admin
  const admin = await prisma.users.upsert({
    where: { email: "admin@xuanloc.edu.vn" },
    update: {
      password: hashedPassword,
      status: "active",
      role: "admin",
    },
    create: {
      full_name: "Quản Trị Viên (Admin)",
      email: "admin@xuanloc.edu.vn",
      password: hashedPassword,
      phone: "0901234567",
      role: "admin",
      status: "active",
    },
  });

  // 2. Seed Giáo viên
  const teacher = await prisma.users.upsert({
    where: { email: "teacher@xuanloc.edu.vn" },
    update: {
      password: hashedPassword,
      status: "active",
      role: "teacher",
    },
    create: {
      full_name: "Nguyễn Văn A (Giáo viên)",
      email: "teacher@xuanloc.edu.vn",
      password: hashedPassword,
      phone: "0908765432",
      role: "teacher",
      status: "active",
    },
  });

  // 3. Seed Học viên
  const student = await prisma.users.upsert({
    where: { email: "student@xuanloc.edu.vn" },
    update: {
      password: hashedPassword,
      status: "active",
      role: "student",
    },
    create: {
      full_name: "Trần Thị B (Học viên)",
      email: "student@xuanloc.edu.vn",
      password: hashedPassword,
      phone: "0912345678",
      role: "student",
      status: "active",
    },
  });

  // 4. Seed các phòng học mặc định
  const roomNames = ["Phòng 1", "Phòng 2", "Phòng 3", "Phòng 4", "Phòng 5"];
  for (const name of roomNames) {
    await prisma.rooms.upsert({
      where: { name },
      update: {},
      create: { name, is_active: true },
    });
  }

  console.log(" Seed dữ liệu thành công:");
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Teacher: ${teacher.email}`);
  console.log(`- Student: ${student.email}`);
  console.log(`- Rooms: ${roomNames.join(", ")}`);
}

main()
  .catch((e) => {
    console.error("Lỗi khi seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });