const tween = ( duration, onTick ) => new Promise( resolve => {
    const startTime = Date.now();
    const tick = () => {
        const now = Date.now();
        const ms = now - startTime;
        onTick( ms / duration, ms );
        if ( now > startTime + duration ) {
            resolve();
        } else {
            requestAnimationFrame( tick );
        }
    }
    tick();
})

export default tween;