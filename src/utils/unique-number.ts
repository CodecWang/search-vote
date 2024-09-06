export function uniqueNumberGenerator() {
  const numbers = new Set();

  function generateUniqueNumber() {
    let num;
    do {
      num = Math.floor(Math.random() * 100);
    } while (numbers.has(num));

    numbers.add(num);
    return num;
  }

  function removeNumber(num: number) {
    if (numbers.has(num)) {
      numbers.delete(num);
    }
  }

  return {
    generateUniqueNumber,
    removeNumber,
  };
}
