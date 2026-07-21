import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load .env manual parse
const env = fs.readFileSync('.env', 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const [key, value] = line.split('=')
    if (key && value) acc[key.trim()] = value.trim()
    return acc
  }, {})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['VITE_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const projects = [
  // ELECTRICAL
  { title: "Wiring Project", location: "Nairobi Industrial Area", category: "electrical", image: "assets/electrical/1.jpeg" },
  { title: "Consumer unit wiring", location: "Kajiado", category: "electrical", image: "assets/electrical/2.jpeg" },
  { title: "Installation", location: "Kasarani", category: "electrical", image: "assets/electrical/3.jpeg" },
  { title: "Electrical fence", location: "Tassia", category: "electrical", image: "assets/electrical/4.jpeg" },
  { title: "Factory Maintenance", location: "Thika", category: "electrical", image: "assets/electrical/5.jpeg" },
  { title: "Bungalow wiring", location: "Thika", category: "electrical", image: "assets/electrical/6.jpeg" },
  
  // SOLAR
  { title: "Residential Solar Setup", location: "Karen Estate", category: "solar", image: "assets/solar/1.jpeg" },
  { title: "Commercial Solar Grid", location: "Mombasa Road", category: "solar", image: "assets/solar/2.jpeg" },
  { title: "Solar Panel Installation", location: "Ruiru", category: "solar", image: "assets/solar/3.jpeg" },
  { title: "Complete Solar System", location: "Kiambu", category: "solar", image: "assets/solar/4.jpeg" },
  { title: "Solar Maintenance", location: "Westlands", category: "solar", image: "assets/solar/5.jpeg" },
  { title: "Solar Troubleshooting", location: "Kajiado", category: "solar", image: "assets/solar/6.jpeg" },

  // BOREHOLE
  { title: "Community Borehole", location: "Kitengela", category: "borehole", image: "assets/borehole/2.jpeg" },
  { title: "Borehole Drilling", location: "Athi River", category: "borehole", image: "assets/borehole/3.jpeg" },
  { title: "Pump Installation", location: "Ongata Rongai", category: "borehole", image: "assets/borehole/4.jpeg" },
  { title: "Borehole Testing", location: "Machakos", category: "borehole", image: "assets/borehole/5.jpeg" },
  { title: "Farm Borehole", location: "Kajiado", category: "borehole", image: "assets/borehole/6.jpeg" },
  { title: "Water Drilling System", location: "Kitengela", category: "borehole", image: "assets/borehole/7.jpeg" }
]

async function seed() {
  console.log("🚀 Starting database seeding...")
  
  for (const p of projects) {
    const { title, location, category, image } = p
    
    // Insert Project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({ title, location, category, description: `Professional ${category} service project.` })
      .select()
    
    if (projectError) {
      console.error(`❌ Error inserting project ${title}:`, projectError.message)
      continue
    }
    
    const projectId = projectData[0].id
    console.log(`✅ Project created: ${title} (${projectId})`)
    
    // Insert Image
    const { error: imageError } = await supabase
      .from('images')
      .insert({ project_id: projectId, url: image, is_hero: true })
    
    if (imageError) {
      console.error(`❌ Error inserting image for ${title}:`, imageError.message)
    } else {
      console.log(`📸 Image linked for ${title}`)
    }
  }
  
  console.log("🏁 Seeding complete!")
}

seed().catch(err => console.error("Critical error:", err))
