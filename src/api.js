export const fetchSuggestions = async (query) => {
  const response = await fetch(
    `https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${query}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  } else {
    const suggestions = await response.json();
    const uniqueIds = new Set();
    const filteredArr = suggestions?.filter((obj) => {
      if (uniqueIds.has(obj.id)) {
        return false;
      } else {
        uniqueIds.add(obj.id);
        return true;
      }
    });
    return filteredArr;
  }
};
