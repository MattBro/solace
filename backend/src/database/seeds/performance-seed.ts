import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { advocates } from "../schemas";
import { faker } from '@faker-js/faker';
import { sql } from "drizzle-orm";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const specialties = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health (anxiety, depression, stress, grief, life transitions)",
  "Men's issues",
  "Relationship Issues (family, friends, couple, etc)",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues (post-partum, infertility, family planning)",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching (leadership, career, academic and wellness)",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations & testing (ADHD testing)",
  "Attention and Hyperactivity (ADHD)",
  "Sleep issues",
  "Schizophrenia and psychotic disorders",
  "Learning disorders",
  "Domestic abuse",
];

const degrees = ["MD", "PhD", "MSW", "PsyD", "LCSW", "LMFT", "LPC", "NP", "PA"];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "San Francisco", "Columbus", "Fort Worth",
  "Indianapolis", "Charlotte", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Memphis",
  "Portland", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore",
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
  "Mesa", "Kansas City", "Atlanta", "Long Beach", "Colorado Springs",
  "Raleigh", "Miami", "Virginia Beach", "Omaha", "Oakland",
  "Minneapolis", "Tulsa", "Arlington", "New Orleans", "Wichita"
];

function getRandomSpecialties(): string[] {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 specialties
  const shuffled = [...specialties].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generatePhoneNumber(): number {
  return parseInt(`555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`);
}

async function seedPerformanceData(recordCount: number = 100000) {
  console.log(`🚀 Starting performance seed with ${recordCount.toLocaleString()} records...`);
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);
  
  const batchSize = 1000;
  const totalBatches = Math.ceil(recordCount / batchSize);
  
  console.time('Total seeding time');
  
  try {
    // Clear existing data
    console.log('Clearing existing advocates...');
    await db.execute(sql`TRUNCATE TABLE advocates RESTART IDENTITY`);
    
    let totalInserted = 0;
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, recordCount - totalInserted);
      const advocatesBatch = [];
      
      for (let i = 0; i < currentBatchSize; i++) {
        advocatesBatch.push({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          city: cities[Math.floor(Math.random() * cities.length)],
          degree: degrees[Math.floor(Math.random() * degrees.length)],
          specialties: getRandomSpecialties(),
          yearsOfExperience: Math.floor(Math.random() * 30) + 1,
          phoneNumber: generatePhoneNumber(),
        });
      }
      
      await db.insert(advocates).values(advocatesBatch);
      totalInserted += currentBatchSize;
      
      // Progress logging
      if ((batch + 1) % 10 === 0 || batch === totalBatches - 1) {
        const progress = ((totalInserted / recordCount) * 100).toFixed(1);
        console.log(`Progress: ${totalInserted.toLocaleString()} / ${recordCount.toLocaleString()} (${progress}%)`);
      }
    }
    
    console.timeEnd('Total seeding time');
    console.log(`✅ Successfully seeded ${totalInserted.toLocaleString()} advocate records`);
    
    // Verify count
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM advocates`) as any[];
    const count = result[0].count;
    console.log(`📊 Database now contains ${(count as number).toLocaleString()} advocates`);
    
    // Close connection
    await client.end();
    
  } catch (error) {
    console.error('❌ Error seeding performance data:', error);
    await client.end();
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const recordCount = args[0] ? parseInt(args[0]) : 100000;

if (isNaN(recordCount) || recordCount < 1) {
  console.error('Please provide a valid number of records to generate');
  console.log('Usage: npm run seed:performance [number-of-records]');
  console.log('Default: 100000 records');
  process.exit(1);
}

// Run the seeding
seedPerformanceData(recordCount)
  .then(() => {
    console.log('🎉 Performance seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed performance data:', error);
    process.exit(1);
  });