import type { RawSystem, System } from "./types";
import rawData from "../../sample_data.json";

// This file is responsible for transforming the raw data from sample_data.json into the format we want to use in our app. It also extracts the unique data uses, data categories, and system types for use in filters and dropdowns.

// here we get the leaf segment of a data category, e.g. "user.contact.email" -> "email"
export const leafSegment = (category: string): string => {
  const parts = category.split(".");
  return parts[parts.length - 1];
};

// here we get the unique values from an array, e.g. ["email", "email", "phone"] -> ["email", "phone"]
// we use a Set to deduplicate the values, and then convert it back to an array
const unique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

// Here we normalise the raw data from sample_data.json into the format we want to use in our app.
// We also extract the unique data uses and data categories for each system.
const normalise = (raw: RawSystem): System => {
  const allCategories = raw.privacy_declarations.flatMap(
    (d) => d.data_categories
  );

  const allUses = raw.privacy_declarations.map((d) => d.data_use);
  return {
    fidesKey: raw.fides_key,
    name: raw.name,
    description: raw.description,
    systemType: raw.system_type,
    dataUses: unique(allUses),
    dataCategories: unique(allCategories.map(leafSegment)),
    dataCategoriesFull: unique(allCategories),
    dependencies: raw.system_dependencies
  };
};

// Deduplicate by fides_key (keep first occurrence)
const seen = new Set<string>();

export const systems: System[] = (rawData as RawSystem[])
  .filter((s) => {
    if (seen.has(s.fides_key)) return false;
    seen.add(s.fides_key);
    return true;
  })
  .map(normalise);

export const allDataUses: string[] = unique(
  systems.flatMap((s) => s.dataUses)
).sort();

export const allDataCategories: string[] = unique(
  systems.flatMap((s) => s.dataCategoriesFull)
).sort();

export const allSystemTypes: string[] = unique(
  systems.map((s) => s.systemType)
).sort();
