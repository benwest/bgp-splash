import vec2 from './vec2';

const aabb = ( min, max ) => [ min, max ];
aabb.left = aabb.x = b => b[ 0 ][ 0 ];
aabb.top = aabb.y = b => b[ 0 ][ 1 ];
aabb.right = aabb.r = b => b[ 1 ][ 0 ];
aabb.bottom = aabb.b = b => b[ 1 ][ 1 ];
aabb.width = aabb.w = b => aabb.r( b ) - aabb.x( b );
aabb.height = aabb.h = b => aabb.b( b ) - aabb.y( b );
aabb.xywh = ( xy, wh ) => aabb( xy, vec2.add( xy, wh ) );
aabb.size = b => vec2.subtract( b[ 1 ], b[ 0 ] );
aabb.center = b => vec2.add( b[ 0 ], vec2.scale( aabb.size( b ), .5 ) );
aabb.translate = ( b, v ) => [ vec2.add( b[ 0 ], v ), vec2.add( b[ 1 ], v ) ];
aabb.scale = ( b, s ) => [ vec2.scale( b[ 0 ], s ), vec2.scale( b[ 1 ], s ) ];
aabb.topLeft = b => b[ 0 ];
aabb.topRight = b => vec2( b[ 1 ][ 0 ], b[ 0 ][ 1 ] );
aabb.bottomLeft = b => vec2( b[ 0 ][ 0 ], b[ 1 ][ 1 ] );
aabb.bottomRight = b => b[ 1 ];

export default aabb;