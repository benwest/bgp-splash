import vec2 from './utils/vec2';
import aabb from './utils/aabb';

const sample = arr => arr[ Math.floor( Math.random() * arr.length ) ];
const baseLogoBlocks = [
    aabb.xywh( vec2( 188, 0 ), vec2( 213, 60 ) ),
    aabb.xywh( vec2( 0, 60 ), vec2( 373, 60 ) ),
    aabb.xywh( vec2( 188, 120 ), vec2( 280, 60 ) )
].map( box => aabb.scale( box, 1/60 ) );
const baseLogoSize = vec2(
    Math.max( ...baseLogoBlocks.map( aabb.r ) ),
    Math.max( ...baseLogoBlocks.map( aabb.b ) ),
);

const fillRow = ( rowY, rowHeight, gapX, gapWidth, canvasWidth, blockWidths ) => {
    const blocks = [];
    const push = ( x, width ) => (
        blocks.push( aabb.xywh( vec2( x, rowY ), vec2( width, rowHeight ) ) )
    )
    let x = gapX;
    while ( x > 0 ) {
        const width = sample( blockWidths );
        x -= width;
        push( x, width );
    }
    x = gapX + gapWidth;
    while ( x < canvasWidth ) {
        const width = sample( blockWidths );
        push( x, width );
        x += width;
    }
    return blocks;
}

const centerOffset = ( srcSize, destSize ) => (
    vec2.add( vec2.scale( destSize, .5 ), vec2.scale( srcSize, -.5 ) )
);

const createBlocks = ( canvasSize, rowHeight = 60 ) => {
    const logoSize = vec2.scale( baseLogoSize, rowHeight );
    const logoOffset = centerOffset( logoSize, canvasSize );
    logoOffset[ 1 ] = Math.floor( logoOffset[ 1 ] / rowHeight ) * rowHeight;
    const logoBlocks = baseLogoBlocks.map( block => (
        aabb.translate( aabb.scale( block, rowHeight ), logoOffset )
    ));
    const blockWidths = logoBlocks.map( block => aabb.w( block ) );
    const blocks = [];
    logoBlocks.forEach( block => (
        blocks.push( ...fillRow(
            aabb.y( block ),
            aabb.h( block ),
            aabb.x( block ),
            aabb.w( block ),
            canvasSize[ 0 ],
            blockWidths
        ))
    ))
    let y = aabb.y( logoBlocks[ 0 ] ) - rowHeight;
    while ( y > -rowHeight ) {
        blocks.push( ...fillRow(
            y,
            rowHeight,
            Math.random() * canvasSize[ 0 ],
            0,
            canvasSize[ 0 ],
            blockWidths
        ))
        y -= rowHeight;
    }
    y = aabb.b( logoBlocks[ 2 ] )
    while ( y < canvasSize[ 1 ] ) {
        blocks.push( ...fillRow(
            y,
            rowHeight,
            Math.random() * canvasSize[ 0 ],
            0,
            canvasSize[ 0 ],
            blockWidths
        ))
        y += rowHeight;
    }
    return {
        blocks,
        logoRect: aabb.xywh( logoOffset, logoSize )
    };
}

export default createBlocks;