import connectDB from "./config/db.js";
import JournalEntry from "./models/JournalEntry.js";

connectDB();

JournalEntry.create({
  title: "Sample Test Trip",
  location: "Goa, India",
  dateVisited: new Date(),
  description: "Testing DB insert",
  isPublic: true,
  coordinates: { lat: 15.29, lng: 74.12 }
})
.then(() => console.log("✅ Test Entry Inserted"))
.then(() => process.exit());
