/**
 * Ultra-simple FOGO Session test function
 * This bypasses all complex logic and tests the core signMessage functionality
 */
export async function ultraSimpleFogoTest(): Promise<any> {
  console.log('🧪 Starting ultra-simple FOGO test...');
  
  try {
    // Step 1: Check Phantom
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found');
    }
    
    console.log('✅ Phantom detected');
    
    // Step 2: Connect
    let publicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
    } else {
      const response = await window.solana.connect();
      publicKey = response.publicKey;
    }
    
    console.log('✅ Connected to:', publicKey.toString());
    
    // Step 3: Create the simplest possible message
    const simpleMessage = "Fogo Sessions Test Message";
    console.log('📄 Simple message:', simpleMessage);
    
    // Step 4: Encode with TextEncoder
    const encodedMessage = new TextEncoder().encode(simpleMessage);
    console.log('📄 Encoded message:', {
      type: typeof encodedMessage,
      constructor: encodedMessage.constructor.name,
      isUint8Array: encodedMessage instanceof Uint8Array,
      length: encodedMessage.length,
      bytes: Array.from(encodedMessage.slice(0, 5))
    });
    
    // Step 5: Sign with Phantom
    console.log('✍️ Calling window.solana.signMessage...');
    console.log('🔍 About to call signMessage with:', encodedMessage);
    
    const signature = await window.solana.signMessage(encodedMessage);
    
    console.log('✅ Signature received:', {
      type: typeof signature,
      constructor: signature.constructor.name,
      isUint8Array: signature instanceof Uint8Array,
      length: signature.length
    });
    
    // Step 6: Convert to base64
    const signatureBase64 = Buffer.from(signature).toString("base64");
    console.log('📄 Signature (base64):', signatureBase64);
    
    const result = {
      success: true,
      publicKey: publicKey.toString(),
      message: simpleMessage,
      signature: signatureBase64,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Ultra-simple test completed successfully!');
    return result;
    
  } catch (error: any) {
    console.error('❌ Ultra-simple test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).ultraSimpleFogoTest = ultraSimpleFogoTest;
  console.log('🧪 Ultra-simple FOGO test available as window.ultraSimpleFogoTest()');
}
