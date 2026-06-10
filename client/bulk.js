const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const ids = [
  "6a225bbab7c1f0cc7db42462","6a225243d6394dfc1c023290","6a21e4c5086c90dbf4fb9d48",
  "6a21d981086c90dbf4fb9d16","6a21aeb7086c90dbf4fb9bae","6a218c05086c90dbf4fb9b1c",
  "6a215cba086c90dbf4fb99ee","6a21410b086c90dbf4fb99a0","6a212f47086c90dbf4fb9958",
  "6a208ae387661cfb7e132bfc","6a20813587661cfb7e132bdd","6a206a2f01745dfa75d19e9c",
  "6a2055e801745dfa75d19e30","6a202ff501745dfa75d19d33","6a1f16cdb53a31ff221c30d9",
  "6a1efc69614bb43c4ddd61b2","6a1d881797d6c105eb3a4629","6a1d731a97d6c105eb3a45e6",
  "6a1d5e8597d6c105eb3a45c7"
];

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const col = client.db("curious-chappal").collection("ideas");

  const results = [];
  for (const id of ids) {
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (doc) {
      const steps = doc.steps || [];
      const script = steps[3]?.aiOutput || "";
      results.push({ id, title: doc.title || "", script });
      console.log("✅", (doc.title || "").slice(0, 60));
    } else {
      console.log("❌ Not found:", id);
    }
  }

  const out = "/Users/piyushlawatre/Documents/Curious Chappal/Curious Engine/knowledge/scripts_export.json";
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log("\nSaved to:", out);
  await client.close();
}

run().catch(console.error);
EOF