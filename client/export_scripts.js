import { MongoClient, ObjectId } from 'mongodb';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const IDS = [
  "6a225bbab7c1f0cc7db42462",
  "6a225243d6394dfc1c023290",
  "6a21e4c5086c90dbf4fb9d48",
  "6a21d981086c90dbf4fb9d16",
  "6a21aeb7086c90dbf4fb9bae",
  "6a218c05086c90dbf4fb9b1c",
  "6a215cba086c90dbf4fb99ee",
  "6a21410b086c90dbf4fb99a0",
  "6a212f47086c90dbf4fb9958",
  "6a208ae387661cfb7e132bfc",
  "6a20813587661cfb7e132bdd",
  "6a206a2f01745dfa75d19e9c",
  "6a2055e801745dfa75d19e30",
  "6a202ff501745dfa75d19d33",
  "6a1f16cdb53a31ff221c30d9",
  "6a1efc69614bb43c4ddd61b2",
  "6a1d881797d6c105eb3a4629",
  "6a1d731a97d6c105eb3a45e6",
  "6a1d5e8597d6c105eb3a45c7",
];

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME   = "curious-chappal";
const COL_NAME  = "ideas";
const OUT_PATH  = join(__dirname, "scripts_export.json");

/**
 * Extract the locked spoken script from the Editor Brief (§1 body).
 * Mirrors extractSpokenScript() in EditorBriefOutput.tsx:
 *   1. Fenced code block  ```...```
 *   2. Blockquote block after "Locked spoken script" heading
 */
function extractSpokenScript(body) {
  if (!body) return "";

  // 1. Fenced code block
  const fenced = body.match(/```(?:md|markdown)?[ \t]*\n([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  // 2. Find end of "Locked spoken script" heading line
  const headingMatch = body.match(/\*\*Locked spoken script\b/i);
  const searchFrom   = headingMatch ? body.indexOf("\n", body.indexOf(headingMatch[0])) + 1 : 0;

  // 3. Find contiguous blockquote block from that position
  const lines      = body.slice(searchFrom).split("\n");
  const bqLines    = [];
  let   inBlock    = false;
  for (const line of lines) {
    if (/^> /.test(line) || line === ">") {
      inBlock = true;
      bqLines.push(line.replace(/^> ?/, ""));
    } else if (inBlock) {
      break; // end of blockquote block
    }
  }
  if (bqLines.length) return bqLines.join("\n").trim();

  return "";
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log("Connected to MongoDB\n");

  const col = client.db(DB_NAME).collection(COL_NAME);
  const results = [];

  for (const id of IDS) {
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      console.log(`❌  Not found: ${id}`);
      continue;
    }
    const steps         = Array.isArray(doc.steps) ? doc.steps : [];
    const editorBrief   = steps[3]?.aiOutput ?? "";   // 04_EDITOR_BRIEF
    const script        = extractSpokenScript(editorBrief);
    results.push({ id, title: doc.title || "", script });
    const scriptPreview = script ? "locked script ✓" : "⚠️  no locked script found";
    console.log(`✅  ${(doc.title || "").slice(0, 55).padEnd(55)}  ${scriptPreview}`);
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nExported ${results.length} scripts → ${OUT_PATH}`);
  await client.close();
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});