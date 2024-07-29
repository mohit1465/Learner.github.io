const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const saturationInput = document.getElementById('saturation');
const sepiaInput = document.getElementById('sepia');
const invertInput = document.getElementById('invert');
const grayscaleInput = document.getElementById('grayscale');
const blurInput = document.getElementById('blur');
const rotateButton = document.getElementById('rotate');
const flipButton = document.getElementById('flip');
const drawButton = document.getElementById('draw');
const eraseButton = document.getElementById('erase');
const saveButton = document.getElementById('save');

let img = new Image();
let imgData;
let isDrawing = false;
let isErasing = false;
let rotation = 0;
let flip = false;

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
});

img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyFilters();
};

const applyFilters = () => {
    ctx.putImageData(imgData, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply brightness
        data[i] = r * brightnessInput.value;
        data[i + 1] = g * brightnessInput.value;
        data[i + 2] = b * brightnessInput.value;

        // Apply contrast
        data[i] = ((data[i] - 128) * contrastInput.value + 128);
        data[i + 1] = ((data[i + 1] - 128) * contrastInput.value + 128);
        data[i + 2] = ((data[i + 2] - 128) * contrastInput.value + 128);

        // Apply saturation
        const avg = (r + g + b) / 3;
        data[i] = avg + (data[i] - avg) * saturationInput.value;
        data[i + 1] = avg + (data[i + 1] - avg) * saturationInput.value;
        data[i + 2] = avg + (data[i + 2] - avg) * saturationInput.value;

        // Apply sepia
        if (sepiaInput.checked) {
            data[i] = r * 0.393 + g * 0.769 + b * 0.189;
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }

        // Apply invert
        if (invertInput.checked) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        // Apply grayscale
        if (grayscaleInput.checked) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
    }

    // Apply blur
    ctx.filter = `blur(${blurInput.value}px)`;
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'none';
};

const smoothApplyFilters = () => {
    requestAnimationFrame(applyFilters);
};

brightnessInput.addEventListener('input', smoothApplyFilters);
contrastInput.addEventListener('input', smoothApplyFilters);
saturationInput.addEventListener('input', smoothApplyFilters);
sepiaInput.addEventListener('change', smoothApplyFilters);
invertInput.addEventListener('change', smoothApplyFilters);
grayscaleInput.addEventListener('change', smoothApplyFilters);
blurInput.addEventListener('input', smoothApplyFilters);

rotateButton.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
});

flipButton.addEventListener('click', () => {
    flip = !flip;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(flip ? -1 : 1, 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
});

canvas.addEventListener('mousedown', () => {
    isDrawing = true;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else if (isErasing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.clearRect(x - 5, y - 5, 10, 10);
    }
});

drawButton.addEventListener('click', () => {
    isDrawing = !isDrawing;
    isErasing = false;
});

eraseButton.addEventListener('click', () => {
    isErasing = !isErasing;
    isDrawing = false;
});

saveButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
});
