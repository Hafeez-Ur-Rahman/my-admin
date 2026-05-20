async function diagnose() {
  try {
    const url = 'https://perfumeapis.brainexworld.com/api/Product/getAllProducts';
    const response = await fetch(url);
    const data = await response.json();
    console.log("RESPONSE SUCCESS:", response.ok);
    console.log("DATA TYPE:", typeof data);
    console.log("DATA KEYS:", Object.keys(data));
    
    // Log the first item
    const items = data.data || data;
    if (Array.isArray(items) && items.length > 0) {
      console.log("FIRST ITEM:", JSON.stringify(items[0], null, 2));
    } else {
      console.log("RAW DATA:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("DIAGNOSTIC ERROR:", error);
  }
}

diagnose();
