import { useMemo } from "react";
import { FilterProvider, useFilters } from "./store";
import { systems } from "./data";
import { Header } from "./components/Header";
import { Toolbar } from "./components/Toolbar";
import { GridView } from "./components/GridView";
import { GraphView } from "./components/GraphView";

const DataMap = () => {
  const {
    selectedDataUses,
    selectedCategories,
    layoutMode,
    viewMode,
    showArrows,
    darkMode
  } = useFilters();

  const filteredSystems = useMemo(() => {
    if (selectedDataUses.length === 0 && selectedCategories.length === 0)
      return systems;
    return systems.filter((s) => {
      const matchesUse =
        selectedDataUses.length === 0 ||
        s.dataUses.some((u) => selectedDataUses.includes(u));
      const matchesCategory =
        selectedCategories.length === 0 ||
        s.dataCategoriesFull.some((c) => selectedCategories.includes(c));
      return matchesUse && matchesCategory;
    });
  }, [selectedDataUses, selectedCategories]);

  return (
    <div
      className={darkMode ? "dark" : ""}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--page-bg)"
      }}
    >
      <Header
        totalCount={systems.length}
        filteredCount={filteredSystems.length}
      />

      <Toolbar />

      <main className="flex-1 mx-auto max-w-screen-2xl w-full px-8 py-6">
        {viewMode === "grid" ? (
          <GridView
            systems={filteredSystems}
            layoutMode={layoutMode}
            showArrows={showArrows}
          />
        ) : (
          <GraphView
            systems={filteredSystems}
            layoutMode={layoutMode}
            showArrows={showArrows}
          />
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <FilterProvider>
      <DataMap />
    </FilterProvider>
  );
};

export default App;
