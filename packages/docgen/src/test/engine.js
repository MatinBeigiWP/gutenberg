/**
 * Internal dependencies
 */
const engine = require( '../engine' );

describe( 'Engine', () => {
	it( 'should return an empty result for undefined code', () => {
		const result = engine( undefined );
		expect( result ).toBeNull();
	} );
} );
