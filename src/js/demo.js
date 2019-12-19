import createSplash from './splash';
import logoURL from '../assets/logo.svg'
import videoURL from '../assets/video.mp4';
import imageURL from '../assets/image.jpg';

import { GUI } from 'dat.gui';

const options = {
    rows: 20,
    moveDuration: 1,
    stopDuration: 4,
    backgroundOffset: .5
}

const gui = new GUI();
gui.add( options, 'rows', 5, 30 );
gui.add( options, 'moveDuration', .2, 5, .1 );
gui.add( options, 'stopDuration', .2, 5, .1 );
gui.add( options, 'backgroundOffset', 0, 1, .1 );

const loop = () => createSplash({ videoURL, imageURL, logoURL, options: { ...options } }).then( loop );
loop();


// createSplash( document.body, videoSrc, imageSrc, { ...options } )