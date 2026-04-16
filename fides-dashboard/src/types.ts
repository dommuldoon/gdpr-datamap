// Raw shape from sample_data.json
export interface RawPrivacyDeclaration {
  name: string
  data_use: string
  data_categories: string[]
  data_subjects: string[]
}

export interface RawSystem {
  fides_key: string
  name: string
  description: string
  system_type: string
  privacy_declarations: RawPrivacyDeclaration[]
  system_dependencies: string[]
}

// Normalised shape used in the app
export interface System {
  fidesKey: string
  name: string
  description: string
  systemType: string
  dataUses: string[]           // unique across all declarations
  dataCategories: string[]     // unique leaf segments across all declarations
  dataCategoriesFull: string[] // unique full paths (used for filtering)
  dependencies: string[]       // fides_keys
}

export type LayoutMode = 'systemType' | 'dataUse'
export type ViewMode = 'grid' | 'graph'
