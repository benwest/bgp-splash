export const sum = xs => xs.reduce( ( a, b ) => a + b, 0 );
export const mean = xs => sum( xs ) / xs.length;
export const clamp = ( x, min, max ) => Math.max( Math.min( x, max ), min );
export const lerp = ( a, b, t ) => a + ( b - a ) * t;
export const map = ( x, oldMin, oldMax, newMin, newMax ) => (
    newMin + ( x - oldMin ) / ( oldMax - oldMin ) * ( newMax - newMin )
);
export const mapClamped = ( x, oldMin, oldMax, newMin, newMax ) => (
    clamp( map( x, oldMin, oldMax, newMin, newMax ), newMin, newMax )
)
export const sign = x => x > 0 ? 1 : -1;