self.onmessage = function(e) {
    const { imgData, filters } = e.data;
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply brightness
        data[i] = r * filters.brightness;
        data[i + 1] = g * filters.brightness;
        data[i + 2] = b * filters.brightness;

        // Apply contrast
        data[i] = ((data[i] - 128) * filters.contrast + 128);
        data[i + 1] = ((data[i + 1] - 128) * filters.contrast + 128);
        data[i + 2] = ((data[i + 2] - 128) * filters.contrast + 128);

        // Apply saturation
        const avg = (r + g + b) / 3;
        data[i] = avg + (data[i] - avg) * filters.saturation;
        data[i + 1] = avg + (data[i + 1] - avg) * filters.saturation;
        data[i + 2] = avg + (data[i + 2] - avg) * filters.saturation;

        // Apply hue rotation
        const hue = filters.hue * Math.PI / 180;
        const cosA = Math.cos(hue);
        const sinA = Math.sin(hue);
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = cosA * data[i] + (1 - cosA) * avg + sinA * avg;
        data[i + 1] = cosA * data[i + 1] + (1 - cosA) * avg;
        data[i + 2] = cosA * data[i + 2] + (1 - cosA) * avg - sinA * avg;

        // Apply sepia
        if (filters.sepia) {
            const tr = 0.393 * data[i] + 0.769 * data[i + 1] + 0.189 * data[i + 2];
            const tg = 0.349 * data[i] + 0.686 * data[i + 1] + 0.168 * data[i + 2];
            const tb = 0.272 * data[i] + 0.534 * data[i + 1] + 0.131 * data[i + 2];
            data[i] = tr;
            data[i + 1] = tg;
            data[i + 2] = tb;
        }

        // Apply invert
        if (filters.invert) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        // Apply grayscale
        if (filters.grayscale) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
    }

    // Apply blur (simple blur filter)
    if (filters.blur > 0) {
        const weight = 1 / (filters.blur * filters.blur);
        const kernelSize = Math.floor(filters.blur);
        const blurredData = new Uint8ClampedArray(data.length);

        for (let i = 0; i < imgData.width; i++) {
            for (let j = 0; j < imgData.height; j++) {
                let r = 0, g = 0, b = 0;
                let count = 0;
                for (let x = -kernelSize; x <= kernelSize; x++) {
                    for (let y = -kernelSize; y <= kernelSize; y++) {
                        const xi = i + x;
                        const yi = j + y;
                        if (xi >= 0 && xi < imgData.width && yi >= 0 && yi < imgData.height) {
                            const p = ((yi * imgData.width) + xi) * 4;
                            r += data[p] * weight;
                            g += data[p + 1] * weight;
                            b += data[p + 2] * weight;
                            count++;
                        }
                    }
                }
                const p = ((j * imgData.width) + i) * 4;
                blurredData[p] = r;
                blurredData[p + 1] = g;
                blurredData[p + 2] = b;
                blurredData[p + 3] = data[p + 3];
            }
        }
        imgData.data.set(blurredData);
    }

    // Apply sharpen (simple sharpen filter)
    if (filters.sharpen) {
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        const weight = 1;
        const sharpenedData = new Uint8ClampedArray(data.length);

        for (let i = 0; i < imgData.width; i++) {
            for (let j = 0; j < imgData.height; j++) {
                let r = 0, g = 0, b = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        const xi = i + x;
                        const yi = j + y;
                        if (xi >= 0 && xi < imgData.width && yi >= 0 && yi < imgData.height) {
                            const p = ((yi * imgData.width) + xi) * 4;
                            r += data[p] * kernel[y + 1][x + 1];
                            g += data[p + 1] * kernel[y + 1][x + 1];
                            b += data[p + 2] * kernel[y + 1][x + 1];
                        }
                    }
                }
                const p = ((j * imgData.width) + i) * 4;
                sharpenedData[p] = r * weight;
                sharpenedData[p + 1] = g * weight;
                sharpenedData[p + 2] = b * weight;
                sharpenedData[p + 3] = data[p + 3];
            }
        }
        imgData.data.set(sharpenedData);
    }

    self.postMessage(imgData);
};
