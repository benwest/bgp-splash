import vec2 from './utils/vec2';
import aabb from './utils/aabb';
import createBlocks from './blocks';
import { sign } from './utils/math';
import canAutoplay from 'can-autoplay';
import tween from './utils/tween';
import quadIn from 'eases/quad-in';

const sleep = ms => new Promise( resolve => setTimeout( resolve, ms ) );

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

const drawImageClamped = ( ctx, image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight ) => {
    ctx.drawImage(
        image,
        Math.max( sx, 0 ),
        Math.max( sy, 0 ),
        Math.min( sWidth, ( image.videoWidth || image.width ) - sx ),
        Math.min( sHeight, ( image.videoHeight || image.height ) - sy ),
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
    maxPixelRatio = 1.5,
    options: {
        rows = 20,
        moveDuration = 1,
        stopDuration = 4,
        backgroundOffset = .6
    }
}) => {

    const pixelRatio = Math.min( window.devicePixelRatio, maxPixelRatio );

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = ( container.offsetWidth || 1 ) * pixelRatio;
    canvas.height = ( container.offsetHeight || 1 ) * pixelRatio;
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

        let t = 1;
        let transparent = false;
        let frame = null;
        let tick = () => {
            draw(
                ctx,
                logoImage,
                logoRect,
                offsetBlocks( t, blocks, maxBlockWidth, canvas.width ),
                backgroundImage,
                backgroundOffsets,
                transparent
            )
            frame = requestAnimationFrame( tick );
        }

        tick();

        const clicked = new Promise( resolve => {
            canvas.addEventListener( 'click', resolve );
        })

        return tween( moveDuration * 1000, tIn => { t = quadIn( 1 - tIn ) } )
            .then( () => Promise.race([
                sleep( stopDuration * 1000 ),
                clicked
            ]))
            .then( () => {
                onExitStart();
                transparent = true;
                return tween( moveDuration * 1000, tOut => { t = quadIn( tOut ) } ) 
            })
            .then( () => {
                if ( backgroundImage instanceof HTMLVideoElement ) {
                    backgroundImage.pause();
                    backgroundImage.removeAttribute('src');
                    backgroundImage.load();
                }
                cancelAnimationFrame( frame );
                container.removeChild( canvas );
                onExitComplete()
            })
    }

    const draw = ( ctx, logoImage, logoRect, blocks, backgroundImage, backgroundOffsets, transparent ) => {
        
        const canvasSize = vec2( canvas.width, canvas.height );
        const imageSize = backgroundImage instanceof HTMLVideoElement
            ? vec2( backgroundImage.videoWidth, backgroundImage.videoHeight )
            : vec2( backgroundImage.width, backgroundImage.height );
        const imageScale = 1 / vec2.cover( imageSize, canvasSize );
        const imageOffset = vec2.scale( vec2.sub( imageSize, vec2.scale( canvasSize, imageScale ) ), .5 );

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
                backgroundImage,
                ( aabb.x( block ) + ox ) * imageScale + imageOffset[ 0 ],
                ( aabb.y( block ) + oy ) * imageScale + imageOffset[ 1 ],
                aabb.w( block ) * imageScale,
                aabb.h( block ) * imageScale,
                aabb.x( block ),
                aabb.y( block ),
                Math.ceil( aabb.w( block ) ),
                Math.ceil( aabb.h( block ) )
            )
        })
    }
    return load().then( start );
}