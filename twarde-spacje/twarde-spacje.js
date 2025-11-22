const fs = require("fs");
const path = require("path");

// --- KONFIGURACJA ---
const INPUT_FILE = "index.html";
const OUTPUT_FILE = "index.html"; // Zapisuje do nowego pliku w folderze 'dist'

// Regex dla polskich spójników/przyimków (a, i, o, u, w, z)
// Znajduje: (spacja + krótki wyraz) + spacja
const ORPHANS_REGEX = /(\s[aAioOuUwWzZ])\s/g;

// Regex do wyizolowania zawartości tagu <body>
// Group 1: Wszystko przed tagiem <body>
// Group 2: Zawartość pomiędzy <body>...</body> (To jest to, co będziemy przetwarzać)
// Group 3: Wszystko po tagu </body>
const BODY_CAPTURE_REGEX = /(^[\s\S]*<body[^>]*>)([\s\S]*)(<\/body>[\s\S]*$)/i;

console.log(`Początek przetwarzania pliku: ${INPUT_FILE}`);

try {
  // 1. Odczyt zawartości pliku
  let content = fs.readFileSync(INPUT_FILE, "utf8");

  let changesCount = 0;

  // 2. Używamy funkcji w replace, aby przetworzyć tylko zawartość ciała (Group 2 z BODY_CAPTURE_REGEX)
  const newContent = content.replace(
    BODY_CAPTURE_REGEX,
    (match, prefix, bodyContent, suffix) => {
      // Funkcja wewnętrzna do liczenia zmian i stosowania ORPHANS_REGEX
      const correctedBodyContent = bodyContent.replace(
        ORPHANS_REGEX,
        (match, p1) => {
          changesCount++;
          // p1 to ' spójnik', dodajemy do niego &nbsp; zamiast końcowej spacji
          return p1 + "&nbsp;";
        }
      );

      // Składamy całość z powrotem: Prefix + Skorygowany Body + Suffix
      return prefix + correctedBodyContent + suffix;
    }
  );

  // Sprawdzamy, czy Body Capture Regex zadziałał (czy content się zmienił)
  if (newContent === content) {
    console.warn(
      "⚠️ Ostrzeżenie: Nie znaleziono tagu <body> w pliku. Plik nie został zmieniony."
    );
    return;
  }

  // 3. Zapis nowego pliku
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, newContent, "utf8");

  console.log("✅ Pomyślnie zakończono!");
  console.log(`Liczba wprowadzonych twardych spacji w <body>: ${changesCount}`);
  console.log(`Plik zapisano jako: ${OUTPUT_FILE}`);
} catch (error) {
  console.error(
    `❌ Wystąpił błąd podczas przetwarzania pliku ${INPUT_FILE}:`,
    error.message
  );
}
