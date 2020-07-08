import renderLut from 'lut-canvas'
import './styles.css';
import findDominantColors, { colorTransform } from '../src/index'

// renderLut({}, document.getElementById('origin'))

const originCanvas = document.getElementById('origin');
const newCanvas = document.getElementById('new');

setTimeout(() => {
  colorTransform(originCanvas, newCanvas, 32)
}, 0)
