-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "minStock" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_CatalogItem" ("category", "createdAt", "id", "name", "price") SELECT "category", "createdAt", "id", "name", "price" FROM "CatalogItem";
DROP TABLE "CatalogItem";
ALTER TABLE "new_CatalogItem" RENAME TO "CatalogItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
