/**
 * FOGO Sessions Diagnostic Script
 * This script helps identify what's causing the signMessage error
 */
export function diagnoseFogoSessions() {
  console.log('🔍 FOGO Sessions Diagnostic Starting...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    window: {
      location: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host
    },
    phantom: {
      available: !!window.solana,
      isPhantom: window.solana?.isPhantom || false,
      connected: window.solana?.isConnected || false,
      publicKey: window.solana?.publicKey?.toString() || null,
      hasSignMessage: typeof window.solana?.signMessage === 'function',
      hasConnect: typeof window.solana?.connect === 'function',
      hasDisconnect: typeof (window.solana as any)?.disconnect === 'function'
    },
    textEncoder: {
      available: typeof TextEncoder !== 'undefined',
      constructor: typeof TextEncoder !== 'undefined' ? TextEncoder.name : null
    },
    buffer: {
      available: typeof Buffer !== 'undefined',
      constructor: typeof Buffer !== 'undefined' ? Buffer.name : null
    },
    crypto: {
      available: typeof crypto !== 'undefined',
      hasRandomUUID: typeof crypto?.randomUUID === 'function'
    }
  };
  
  console.log('📊 Diagnostic Results:', diagnostics);
  
  // Test TextEncoder
  try {
    const testMessage = "Test message";
    const encoded = new TextEncoder().encode(testMessage);
    console.log('✅ TextEncoder test:', {
      input: testMessage,
      output: encoded,
      type: typeof encoded,
      isUint8Array: encoded instanceof Uint8Array,
      length: encoded.length
    });
  } catch (error) {
    console.error('❌ TextEncoder test failed:', error);
  }
  
  // Test Buffer
  try {
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    const buffer = Buffer.from(testData);
    const base64 = buffer.toString('base64');
    console.log('✅ Buffer test:', {
      input: Array.from(testData),
      buffer: buffer,
      base64: base64
    });
  } catch (error) {
    console.error('❌ Buffer test failed:', error);
  }
  
  // Test Phantom signMessage method signature
  if (window.solana && typeof window.solana.signMessage === 'function') {
    console.log('🔍 Phantom signMessage method analysis:');
    console.log('Method:', window.solana.signMessage);
    console.log('Method name:', window.solana.signMessage.name);
    console.log('Method length:', window.solana.signMessage.length);
    
    // Try to inspect the method
    try {
      const methodString = window.solana.signMessage.toString();
      console.log('Method source (first 200 chars):', methodString.substring(0, 200));
    } catch (error) {
      console.log('Could not inspect method source:', error);
    }
  }
  
  return diagnostics;
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).diagnoseFogoSessions = diagnoseFogoSessions;
  console.log('🔍 FOGO Sessions diagnostic available as window.diagnoseFogoSessions()');
}
