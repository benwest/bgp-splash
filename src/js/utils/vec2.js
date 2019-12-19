import { clamp, lerp } from './math';

const vec2 = ( x = 0, y = 0 ) => {
    var v = new Float32Array( 2 );
    v[ 0 ] = x;
    v[ 1 ] = y;
    return v;
}

vec2.add = ( v1, v2 ) => vec2( v1[ 0 ] + v2[ 0 ], v1[ 1 ] + v2[ 1 ] );
vec2.sub = vec2.subtract = ( v1, v2 ) => vec2( v1[ 0 ] - v2[ 0 ], v1[ 1 ] - v2[ 1 ] );
vec2.len2 = v => v[ 0 ] * v[ 0 ] + v[ 1 ] * v[ 1 ];
vec2.len = v => Math.sqrt( vec2.len2( v ) );
vec2.dist = vec2.distance = ( v1, v2 ) => vec2.len( vec2.sub( v1, v2 ) );
vec2.angle = v => Math.atan2( v[ 1 ], v[ 0 ] );
vec2.dot = ( v1, v2 ) => v1[ 0 ] * v2[ 0 ] + v1[ 1 ] * v2[ 1 ];
vec2.normalize = ( v, len = vec2.len( v ) ) => vec2.scale( v, 1 / len );
vec2.divide = ( v1, v2 ) => vec2( v1[ 0 ] / v2[ 0 ], v1[ 1 ] / v2[ 1 ] );
vec2.mult = vec2.multiply = ( v1, v2 ) => vec2( v1[ 0 ] * v2[ 0 ], v1[ 1 ] * v2[ 1 ] );
vec2.scale = ( [ x, y ], s ) => vec2( x * s, y * s );
vec2.cover = ( src, dest ) => Math.max( dest[ 0 ] / src[ 0 ], dest[ 1 ] / src[ 1 ] );
vec2.contain = ( src, dest ) => Math.min( dest[ 0 ] / src[ 0 ], dest[ 1 ] / src[ 1 ] );
vec2.ratio = v => v[ 1 ] / v[ 0 ];
vec2.clamp = ( v, min, max ) => vec2( clamp( v[ 0 ], min[ 0 ], max[ 0 ] ), clamp( v[ 1 ], min[ 1 ], max[ 1 ] ) )
vec2.elementSize = el => {
    var { width, height } = el.getBoundingClientRect();
    return vec2( width, height );
}
vec2.equal = ( v1, v2 ) => v1[ 0 ] === v2[ 0 ] && v1[ 1 ] === v2[ 1 ];
vec2.lerp = ( v1, v2, t ) => vec2( lerp( v1[ 0 ], v2[ 0 ], t ), lerp( v1[ 1 ], v2[ 1 ], t ) );
vec2.copy = v => vec2( v[ 0 ], v[ 1 ] );
vec2.negate = v => vec2.scale( v, -1 );
vec2.up = ( v, x ) => vec2( v[ 0 ], v[ 1 ] - x );
vec2.down = ( v, x ) => vec2( v[ 0 ], v[ 1 ] + x );
vec2.left = ( v, x ) => vec2( v[ 0 ] - x, v[ 1 ] );
vec2.right = ( v, x ) => vec2( v[ 0 ] + x, v[ 1 ] );

export default vec2;