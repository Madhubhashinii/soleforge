// src/designStore.js
// Saves design to localStorage when Finish is clicked
// SummaryPage reads from localStorage

export const saveDesign = (partColors) => {
  try {
    localStorage.setItem("sf_design", JSON.stringify(partColors));
  } catch(e) {
    console.warn("Could not save design:", e);
  }
};

export const loadDesign = () => {
  try {
    const raw = localStorage.getItem("sf_design");
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
};