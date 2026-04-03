import { textParser, getSupportedFileTypes } from './parser';

async function runParserTest() {
  try {
    console.log('=== Multi-Type File Parser Test ===\n');
    
    // Display supported file types
    console.log('Supported File Types:');
    const supportedTypes = getSupportedFileTypes();
    supportedTypes.forEach((type) => {
      console.log(`  - ${type}`);
    });
    console.log('');

    // Test cases with different file types
    const testCases = [
      {
        name: 'PDF Document',
        url: 'https://pdfobject.com/pdf/sample.pdf',
      },
      {
        name: 'Plain Text File',
        url: 'https://raw.githubusercontent.com/google-gemini/cookbook/main/README.md',
      },
      // Add more test URLs as needed
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\nTesting: ${testCase.name}`);
        console.log(`URL: ${testCase.url}`);
        console.log('Fetching and parsing...');

        const extractedText = await textParser(testCase.url);

        console.log('\n--- Extracted Text Preview ---');
        console.log(extractedText.substring(0, 500)); // Show first 500 chars
        if (extractedText.length > 500) {
          console.log(`... (${extractedText.length - 500} more characters)`);
        }
        console.log('✓ Test Completed Successfully\n');
      } catch (error) {
        console.error(`✗ Test Failed for ${testCase.name}:`);
        console.error(error instanceof Error ? error.message : String(error));
      }
    }

    console.log('\n=== All Tests Completed ===');
  } catch (error) {
    console.error('Parser test suite failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runParserTest();
