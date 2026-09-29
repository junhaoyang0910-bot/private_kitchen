import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { beforeEach, test } from "node:test";
import { IDBFactory } from "fake-indexeddb";
import ts from "typescript";

// Run the production database code with an isolated IndexedDB for each test.
const source = await readFile(new URL("../src/lib/db.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
let moduleId = 0;
let db;

async function loadDatabaseModule() {
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}#${moduleId++}`);
}

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  db = await loadDatabaseModule();
});

const recipe = {
  id: "test-recipe",
  name: "测试菜谱",
  category: "测试分类",
  imageDataUrl: "data:image/png;base64,dGVzdA==",
  ingredients: ["测试食材"],
  steps: ["测试步骤"],
  notes: "保留原始备注",
  xiaohongshuUrl: "https://www.xiaohongshu.com/",
  createdAt: "2026-09-26T01:00:00.000Z",
  updatedAt: "2026-09-27T01:00:00.000Z",
  extraField: { preserved: true },
};
const load = async (recipes) => recipes;

test("empty databases receive every original field without changing IDs or timestamps", async () => {
  const defaults = [recipe, { ...recipe, id: "older", updatedAt: "2026-09-25T01:00:00.000Z" }];
  assert.deepEqual(await db.initializeRecipes(() => load(defaults)), defaults);
  assert.deepEqual(await db.exportRecipes(), defaults);
  const connection = await db.initDB();
  assert.equal(connection.name, "personal-recipe-db");
  assert.equal(connection.version, 1);
});

test("existing user records are preserved even when default IDs collide", async () => {
  const local = { ...recipe, name: "本机修改", imageDataUrl: "data:image/png;base64,bG9jYWw=" };
  await db.createRecipe(local);
  assert.deepEqual(await db.initializeRecipes(() => { throw new Error("Should not load defaults"); }), [local]);
  assert.deepEqual(await db.exportRecipes(), [local]);
});

test("existing template records also prevent any automatic import", async () => {
  const template = { ...recipe, id: "demo-1", name: "现有模板" };
  await db.createRecipe(template);
  assert.deepEqual(await db.initializeRecipes(() => { throw new Error("Should not load defaults"); }), [template]);
});

test("concurrent connections and repeated initialization import only once", async () => {
  const secondTab = await loadDatabaseModule();
  const [first, second] = await Promise.all([
    db.initializeRecipes(() => load([recipe])),
    secondTab.initializeRecipes(() => load([{ ...recipe, name: "不可覆盖" }, { ...recipe, id: "other" }])),
  ]);
  assert.deepEqual(first, [recipe]);
  assert.deepEqual(second, [recipe]);
  assert.deepEqual(await db.initializeRecipes(() => { throw new Error("Should not load defaults"); }), [recipe]);
});

test("a user write queued before initialization is never overwritten", async () => {
  const local = { ...recipe, name: "刚新增的本地菜谱" };
  await db.initDB();
  const [, loaded] = await Promise.all([db.createRecipe(local), db.initializeRecipes(() => load([recipe]))]);
  assert.deepEqual(loaded, [local]);
});

test("duplicate default IDs roll back the entire import and allow retry", async () => {
  await assert.rejects(db.initializeRecipes(() => load([recipe, { ...recipe, name: "重复 ID" }])));
  assert.deepEqual(await db.exportRecipes(), []);
  assert.deepEqual(await db.initializeRecipes(() => load([recipe])), [recipe]);
});

test("uncloneable defaults roll back previously queued inserts", async () => {
  await assert.rejects(db.initializeRecipes(() => load([recipe, { ...recipe, id: "invalid", invalid: () => {} }])));
  assert.deepEqual(await db.exportRecipes(), []);
});

test("create, edit, delete, export and manual merge/replace continue to work", async () => {
  await db.initializeRecipes(() => load([recipe]));
  const created = { ...recipe, id: "created" };
  await db.createRecipe(created);
  const edited = { ...created, name: "编辑后的菜谱" };
  await db.updateRecipe(edited);
  assert.deepEqual(await db.getRecipeById(created.id), edited);
  await db.deleteRecipe(recipe.id);
  assert.deepEqual(await db.exportRecipes(), [edited]);

  const merged = { ...edited, notes: "手动合并" };
  assert.deepEqual(await db.importRecipes([merged], "merge"), [merged]);
  assert.deepEqual(await db.importRecipes([recipe], "replace"), [recipe]);

  await db.deleteRecipe(recipe.id);
  assert.deepEqual(await db.exportRecipes(), []);
  assert.deepEqual(await db.initializeRecipes(() => load([recipe])), [recipe]);
});

test("the supplied backup imports all 37 recipes without changing any field", async () => {
  const defaults = JSON.parse(await readFile(new URL("../src/data/defaultRecipes.json", import.meta.url), "utf8"));
  assert.equal(defaults.length, 37);
  assert.deepEqual(await db.initializeRecipes(() => load(defaults)),
    [...defaults].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
});
