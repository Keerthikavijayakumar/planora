const testRegex = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            const parsed = JSON.parse(match[0]);
            return { success: true, data: parsed };
        } catch (e) {
            return { success: false, error: e.message, match: match[0].substring(0, 50) + '...' };
        }
    } else {
        return { success: false, error: 'No JSON block found' };
    }
};

const testCases = [
    '{"title": "Test"}',
    'Here is the JSON: {"title": "Test"} Result.',
    '```json\n{"title": "Test"}\n```',
    'Some text before {"title": "Test", "nested": {"key": "val"}} and after.',
    'Invalid JSON {"title": "Test",}'
];

testCases.forEach((tc, i) => {
    const result = testRegex(tc);
    console.log(`Case ${i + 1}: ${tc.replace(/\n/g, '\\n')}`);
    console.log(`  Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!result.success) console.log(`  Error: ${result.error}`);
    if (result.success) console.log(`  Parsed: ${JSON.stringify(result.data)}`);
    console.log('---');
});
