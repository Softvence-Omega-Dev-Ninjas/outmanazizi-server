#!/usr/bin/env node
// Compose prisma/schema.prisma (generator + datasource) with all model files in prisma/models/*.prisma
// Output: prisma/_schema.composed.prisma

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const prismaDir = path.join(repoRoot, 'prisma');
const baseSchemaPath = path.join(prismaDir, 'schema.prisma');
const modelsDir = path.join(prismaDir, 'models');
const outPath = path.join(prismaDir, '_schema.composed.prisma');

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function extractHeader(schemaText) {
  // Keep generator and datasource blocks; drop model/enum/etc. if any
  const markers = [/(^|\n)model\s+/m, /(^|\n)enum\s+/m, /(^|\n)view\s+/m, /(^|\n)type\s+/m];
  const positions = markers
    .map((re) => {
      const m = re.exec(schemaText);
      return m ? m.index : Number.POSITIVE_INFINITY;
    })
    .sort((a, b) => a - b);
  const cutAt = positions[0];
  if (!isFinite(cutAt)) return schemaText; // only header present
  return schemaText.slice(0, cutAt).trimEnd() + '\n\n';
}

function stripGeneratorDatasource(schemaText) {
  // Remove generator and datasource blocks from model files if any were accidentally included
  return schemaText
    .replace(/generator\s+\w+\s*\{[\s\S]*?\}/g, '')
    .replace(/datasource\s+\w+\s*\{[\s\S]*?\}/g, '')
    .trim();
}

function main() {
  const base = readFileSafe(baseSchemaPath);
  if (!base) {
    console.error(`[compose-prisma-schema] Missing base schema at ${baseSchemaPath}`);
    process.exit(1);
  }

  const header = extractHeader(base);
  let body = '';

  if (fs.existsSync(modelsDir)) {
    const files = fs
      .readdirSync(modelsDir)
      .filter((f) => f.toLowerCase().endsWith('.prisma'))
      .sort();

    for (const file of files) {
      const p = path.join(modelsDir, file);
      const txt = readFileSafe(p);
      if (!txt) continue;
      const cleaned = stripGeneratorDatasource(txt);
      if (cleaned.trim().length === 0) continue;
      body += `// --- from models/${file} ---\n` + cleaned + '\n\n';
    }
  } else {
    console.warn(`[compose-prisma-schema] Models directory not found at ${modelsDir}. Composing header only.`);
  }

  ensureDir(prismaDir);
  const composed = header + body;
  fs.writeFileSync(outPath, composed, 'utf8');
  console.log(`[compose-prisma-schema] Wrote composed schema to ${outPath}`);
}

main();
