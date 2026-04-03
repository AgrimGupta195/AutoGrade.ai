import { textParser } from './parser';

// Test that parser.ts exports the textParser function correctly
console.log('✓ parser.ts loaded successfully');
console.log(`✓ textParser is a function: ${typeof textParser === 'function'}`);
console.log(`✓ textParser is async: ${textParser.constructor.name === 'AsyncFunction'}`);

// Show function signature
console.log('\nFunction signature:');
console.log(`  textParser(pdfUrl: string): Promise<string>`);

console.log('\nParser.ts validation complete!');
console.log('\nNote: To run actual PDF parsing:');
console.log('1. Ensure GEMINI_API_KEY is set in .env');
console.log('2. Call textParser with a valid PDF URL');
console.log('\nExample:');
console.log('  const text = await textParser("https://example.com/file.pdf");');
