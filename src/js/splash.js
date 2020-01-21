import vec2 from './utils/vec2';
import aabb from './utils/aabb';
import createBlocks from './blocks';
import { sign } from './utils/math';
import canAutoplay from 'can-autoplay';
import tween from './utils/tween';
import quadIn from 'eases/quad-in';

const loadImage = src => new Promise( ( resolve, reject ) => {
    const image = new Image();
    image.addEventListener( 'load', () => resolve( image ) )
    image.addEventListener( 'error', reject );
    image.src = src;
})

const loadVideo = src => new Promise( resolve => {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.addEventListener( 'canplay', () => {
        video.play();
        resolve( video )
    });
    video.src = src;
})

const tryLoadVideo = ( src, fallback ) => {
    return canAutoplay.video({ inline: true, muted: true })
        .then( ({ result }) => result ? loadVideo( src ) : loadImage( fallback ) )
}

const offsetBlocks = ( t, blocks, maxBlockWidth, canvasWidth ) => {
    const halfWidth = canvasWidth / 2;
    const minOffset = canvasWidth / 2 + maxBlockWidth;
    return blocks.map( block => {
        const cx = aabb.center( block )[ 0 ];
        const offset = ( ( cx - halfWidth ) / halfWidth );
        const to = ( minOffset + minOffset * Math.abs( offset ) * 5 ) * sign( offset );
        return aabb.translate( block, [ to * t, 0 ] );
    })
}

const coverCanvas = ( ctx, image ) => {
    const canvasSize = vec2( ctx.canvas.width, ctx.canvas.height );
    const imageSize = image instanceof HTMLVideoElement
        ? vec2( image.videoWidth, image.videoHeight )
        : vec2( image.width, image.height );
    const scale = vec2.cover( imageSize, canvasSize );
    const scaledImageSize = vec2.scale( imageSize, scale );
    const offset = vec2.scale( vec2.sub( canvasSize, scaledImageSize ), .5 );
    ctx.drawImage( image, offset[ 0 ], offset[ 1 ], scaledImageSize[ 0 ], scaledImageSize[ 1 ] );
}

const drawImageClamped = ( ctx, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight ) => {
    ctx.drawImage(
        image,
        Math.max( sx, 0 ),
        Math.max( sy, 0 ),
        Math.min( sWidth, image.width - sx ),
        Math.min( sHeight, image.width - sy ),
        dx, dy, dWidth, dHeight
    )
}

module.exports = ({
    container = document.body,
    logoURL,
    videoURL,
    imageURL,
    onExitStart = () => {},
    onExitComplete = () => {},
    options: {
        rows = 20,
        moveDuration = 1,
        stopDuration = 4,
        backgroundOffset = .6
    }
}) => {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = ( container.offsetWidth || 1 ) * window.devicePixelRatio;
    canvas.height = ( container.offsetHeight || 1 ) * window.devicePixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild( canvas );
    const rowHeight = canvas.height / rows;
    const maxBackgroundOffset = rowHeight

    const load = () => Promise.all([
        loadImage( logoURL ),
        tryLoadVideo( videoURL, imageURL )
    ])

    const start = ([ logoImage, backgroundImage ]) => {
        const { blocks, logoRect } = createBlocks( [ canvas.width, canvas.height ], rowHeight );
        const maxBlockWidth = Math.max( ...blocks.map( aabb.w ) );
        const backgroundOffsets = blocks.map( () => 
            vec2(
                ( Math.random() * 2 - 1 ) * maxBackgroundOffset * backgroundOffset,
                ( Math.random() * 2 - 1 ) * maxBackgroundOffset * backgroundOffset
            )
        )
        const render = ( t, transparent ) => draw(
            ctx,
            logoImage,
            logoRect,
            offsetBlocks( t, blocks, maxBlockWidth, canvas.width ),
            backgroundImage,
            backgroundOffsets,
            transparent
        );
        return tween( moveDuration * 1000, t => render( quadIn( 1 - t ) ) )
            .then( () => tween( stopDuration * 1000, () => render( 0 ) ) )
            .then( () => {
                onExitStart();
                return tween( moveDuration * 1000, t => render( quadIn( t ), true ) )
            })
            .then( () => {
                if ( backgroundImage instanceof HTMLVideoElement ) {
                    backgroundImage.pause();
                    backgroundImage.removeAttribute('src');
                    backgroundImage.load();
                }
                container.removeChild( canvas )
                onExitComplete()
            })
    }

    const backgroundCanvas = document.createElement('canvas');
    const backgroundCtx = backgroundCanvas.getContext('2d');
    backgroundCanvas.width = ( container.offsetWidth + maxBackgroundOffset * 2 ) * window.devicePixelRatio;
    backgroundCanvas.height = ( container.offsetHeight + maxBackgroundOffset * 2 ) * window.devicePixelRatio;
    const draw = ( ctx, logoImage, logoRect, blocks, backgroundImage, backgroundOffsets, transparent ) => {

        coverCanvas( backgroundCtx, backgroundImage );

        if ( transparent ) {
            ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
        } else {
            ctx.fillStyle = 'white';
            ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
            ctx.drawImage(
                logoImage,
                aabb.x( logoRect ),
                aabb.y( logoRect ),
                aabb.w( logoRect ),
                aabb.h( logoRect )
            );
        }
        blocks.forEach( ( block, i ) => {
            const [ ox, oy ] = backgroundOffsets[ i ];
            drawImageClamped(
                ctx,
                backgroundCanvas,
                aabb.x( block ) + ox,
                aabb.y( block ) + oy,
                aabb.w( block ),
                aabb.h( block ),
                aabb.x( block ),
                aabb.y( block ),
                aabb.w( block ),
                aabb.h( block )
            )
        })
    }
    return load().then( start );
}