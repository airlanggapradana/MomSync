import {PrismaClient} from "../generated/prisma";
import {faker} from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  await prisma.labResult.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.healthSignsMonitoring.deleteMany();
  await prisma.mother.deleteMany();

  const mothers = await Promise.all(
    Array.from({length: 5}).map(() =>
      prisma.mother.create({
        data: {
          email: faker.internet.email(),
          full_name: faker.person.fullName(),
          phone_number: faker.phone.number({style: 'international'}),
          location: faker.location.city(),
          date_of_birth: faker.date.past({years: 28}),
          updated_at: new Date(),
        },
      })
    )
  );

  const pickMother = () =>
    mothers[Math.floor(Math.random() * mothers.length)];

  // Mood mapping correlated with stress
  const moodMapping = (stress: number) => {
    if (stress <= 2) return "HAPPY";
    if (stress <= 3) return "NEUTRAL";
    if (stress <= 4) return "ANXIOUS";
    return "SAD";
  };

  // Generate last 30 days of data
  for (const mother of mothers) {
    for (let day = 30; day > 0; day--) {
      const date = faker.date.recent({days: day});

      // Simulate stress with slight drift over time
      const baseStress = faker.number.int({min: 1, max: 4});
      const stress =
        baseStress + (Math.random() < 0.1 ? faker.number.int({min: 1, max: 2}) : 0);

      // Slight HR correlation
      const heart_rate = faker.number.int({
        min: 75 + stress * 2,
        max: 95 + stress * 3,
      });

      // Blood pressure simulation
      const systolic = faker.number.int({
        min: 110 + stress * 2,
        max: 130 + stress * 3,
      });
      const diastolic = faker.number.int({
        min: 70 + stress,
        max: 85 + stress * 2,
      });

      await prisma.healthSignsMonitoring.create({
        data: {
          heart_rate,
          blood_pressure: `${systolic}/${diastolic}`,
          o2_saturation: faker.number.int({min: 96, max: 100}),
          stress_level: stress,
          motherId: mother.id,
          created_at: date,
          updated_at: date,
        },
      });

      // Journal correlated with stress
      await prisma.journalEntry.create({
        data: {
          mood: moodMapping(stress),
          symptoms:
            stress > 3
              ? faker.helpers.arrayElement(["headache", "fatigue", "nausea", "cramps"])
              : faker.helpers.arrayElement(["none", "mild fatigue"]),
          nutritions:
            stress > 3
              ? faker.helpers.arrayElement(['POOR', 'FAIR'])
              : faker.helpers.arrayElement(['GOOD', 'EXCELLENT']),
          notes: faker.lorem.sentence(),
          motherId: mother.id,
          created_at: date,
          updated_at: date,
        },
      });

      // Weekly lab
      if (day % 7 === 0) {
        const anomalyChance = Math.random();

        let value = "Normal";
        if (anomalyChance < 0.05) value = "Anemia Suspected";
        if (anomalyChance >= 0.05 && anomalyChance < 0.1) value = "High Sugar";

        await prisma.labResult.create({
          data: {
            test_name: faker.helpers.arrayElement(["Hemoglobin", "Blood Sugar", "Iron"]),
            result_value: value,
            normal_range: "Normal",
            test_date: date,
            motherId: mother.id,
            updated_at: date,
          },
        });
      }

      // Appointments occasionally
      if (Math.random() < 0.12) {
        await prisma.appointment.create({
          data: {
            appointment_date: date,
            doctor_name: faker.person.fullName(),
            purpose: faker.helpers.arrayElement([
              "Routine Check",
              "Ultrasound",
              "Nutrition Consult",
              "Blood Work",
            ]),
            location: faker.location.city(),
            motherId: mother.id,
            updated_at: date,
          },
        });
      }
    }
  }

  console.log("✅ Realistic clinical seeding v2 generated!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
