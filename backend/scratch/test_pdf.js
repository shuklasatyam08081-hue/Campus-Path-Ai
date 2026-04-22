const pdf = require('pdf-parse');
console.log('PDF-PARSE EXPORT:', typeof pdf, pdf);


async function test() {
  try {
    const dummyBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const data = await pdf(dummyBuffer);
    console.log('✅ pdf-parse works. Data:', data);
  } catch (e) {
    console.error('❌ pdf-parse failed:', e);
  }
}

test();
