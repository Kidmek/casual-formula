import { create } from "zustand";
import { evaluate } from "mathjs";

const useStore = create((set) => ({
  formulaResult: "",
  updateFormula: (formula) =>
    set(() => {
      try {
        return { formulaResult: evaluate(formula).toString() };
      } catch {
        return { formulaResult: "Invalid" };
      }
    }),
}));

export default useStore;
