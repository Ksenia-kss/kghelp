class VintagePhotoEditor {
    constructor() {
        this.images = [];
        this.processedImages = [];
        this.currentIndex = 0;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scratchTexture = null;
        this.customScratchTexture = null;
        
        // Настройки царапин
        this.scratchDensity = 30;
        this.scratchSize = 30;
        this.scratchDistribution = 50;
        
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        this.setupEvents();
        this.createScratches();
    }

    setupEvents() {
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.loadImages(e.target.files);
        });

        document.getElementById('scratchInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadScratchFile(e.target.files[0]);
            }
        });

        document.getElementById('noiseSlider').addEventListener('input', (e) => {
            document.getElementById('noiseValue').textContent = e.target.value;
            this.applyEffects();
        });

        document.getElementById('sepiaSlider').addEventListener('input', (e) => {
            document.getElementById('sepiaValue').textContent = e.target.value;
            this.applyEffects();
        });

        document.getElementById('scratchSlider').addEventListener('input', (e) => {
            document.getElementById('scratchValue').textContent = e.target.value;
            this.applyEffects();
        });

        document.getElementById('densitySlider').addEventListener('input', (e) => {
            this.scratchDensity = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = this.scratchDensity;
            if (!this.customScratchTexture) {
                this.createScratches();
            }
            this.applyEffects();
        });

        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.scratchSize = parseInt(e.target.value);
            document.getElementById('sizeValue').textContent = this.scratchSize;
            if (!this.customScratchTexture) {
                this.createScratches();
            }
            this.applyEffects();
        });

        document.getElementById('distributionSlider').addEventListener('input', (e) => {
            this.scratchDistribution = parseInt(e.target.value);
            document.getElementById('distributionValue').textContent = this.scratchDistribution;
            if (!this.customScratchTexture) {
                this.createScratches();
            }
            this.applyEffects();
        });

        document.getElementById('applyBtn').addEventListener('click', () => {
            this.applyEffects();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevImage();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextImage();
        });

        document.getElementById('originalBtn').addEventListener('click', () => {
            this.showOriginal();
        });

        document.getElementById('processedBtn').addEventListener('click', () => {
            this.showProcessed();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveImage();
        });
    }

    createScratches() {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        // Прозрачный фон
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Создаем базовую текстуру царапины
        const scratchPattern = this.createScratchPattern();
        
        // Количество наложений в зависимости от плотности
        const iterations = Math.floor(3 + (this.scratchDensity / 100) * 12);
        
        for (let i = 0; i < iterations; i++) {
            this.applyScratchLayer(ctx, canvas.width, canvas.height, scratchPattern);
        }
        
        this.scratchTexture = canvas;
    }

    createScratchPattern() {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 200;
        patternCanvas.height = 200;
        const patternCtx = patternCanvas.getContext('2d');
        
        // Создаем текстуру с горизонтальными линиями
        const imageData = patternCtx.createImageData(patternCanvas.width, patternCanvas.height);
        const data = imageData.data;
        
        // Добавляем случайный шум
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < 0.02) {
                const brightness = 200 + Math.random() * 55;
                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;
                data[i + 3] = 50 + Math.random() * 100;
            }
        }
        
        patternCtx.putImageData(imageData, 0, 0);
        
        // Добавляем только горизонтальные линии
        patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        patternCtx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i < 8; i++) {
            const y = Math.random() * patternCanvas.height;
            patternCtx.beginPath();
            patternCtx.moveTo(0, y);
            patternCtx.lineTo(patternCanvas.width, y);
            patternCtx.stroke();
        }
        
        return patternCanvas;
    }

    applyScratchLayer(ctx, width, height, pattern) {
        // Масштаб в зависимости от настройки размера
        const scale = 0.3 + (this.scratchSize / 100) * 1.7;
        
        // Позиционирование в зависимости от распределения
        let x, y;
        
        if (this.scratchDistribution < 33) {
            // ТОЛЬКО СВЕРХУ - горизонтальные полосы в верхней части
            x = Math.random() * (width - pattern.width * scale);
            y = Math.random() * (height * 0.2); // Только верхние 20%
        } else if (this.scratchDistribution < 66) {
            // ТОЛЬКО СНИЗУ - горизонтальные полосы в нижней части
            x = Math.random() * (width - pattern.width * scale);
            y = height - pattern.height * scale - Math.random() * (height * 0.2); // Только нижние 20%
        } else {
            // Случайное распределение по всему холсту
            x = Math.random() * (width - pattern.width * scale);
            y = Math.random() * (height - pattern.height * scale);
        }
        
        // Прозрачность слоя
        const alpha = 0.1 + Math.random() * 0.15;
        ctx.globalAlpha = alpha;
        
        // Рисуем текстуру
        ctx.drawImage(
            pattern, 
            x, 
            y, 
            pattern.width * scale, 
            pattern.height * scale
        );
        
        ctx.globalAlpha = 1;
    }

    async loadImages(files) {
        if (!files.length) return;
        
        this.images = [];
        this.processedImages = [];
        
        for (let file of files) {
            const img = new Image();
            await new Promise((resolve) => {
                img.onload = () => {
                    this.images.push(img);
                    this.processedImages.push(img);
                    resolve();
                };
                img.src = URL.createObjectURL(file);
            });
        }
        
        this.currentIndex = 0;
        this.updateDisplay();
        this.applyEffects();
    }

    loadScratchFile(file) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 600, 400);
            this.customScratchTexture = canvas;
            this.scratchTexture = canvas;
            this.applyEffects();
        };
        img.src = URL.createObjectURL(file);
    }

    updateDisplay() {
        const counter = document.getElementById('counter');
        const noImage = document.getElementById('noImage');
        
        if (this.images.length > 0) {
            counter.textContent = `${this.currentIndex + 1}/${this.images.length}`;
            noImage.style.display = 'none';
            
            const img = this.processedImages[this.currentIndex];
            this.drawImage(img);
        } else {
            counter.textContent = '0/0';
            noImage.style.display = 'block';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawImage(img) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const scale = Math.min(
            this.canvas.width / img.width,
            this.canvas.height / img.height
        );
        
        const width = img.width * scale;
        const height = img.height * scale;
        
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;
        
        this.ctx.drawImage(img, x, y, width, height);
    }

    applyEffects() {
        if (this.images.length === 0) return;
        
        const original = this.images[this.currentIndex];
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = original.width;
        tempCanvas.height = original.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(original, 0, 0);
        
        const noise = document.getElementById('noiseSlider').value / 100;
        const sepia = document.getElementById('sepiaSlider').value / 100;
        const scratch = document.getElementById('scratchSlider').value / 100;
        
        if (sepia > 0) this.applySepia(tempCtx, tempCanvas, sepia);
        if (noise > 0) this.addNoise(tempCtx, tempCanvas, noise);
        if (scratch > 0 && this.scratchTexture) {
            const weakScratch = scratch * 0.7;
            this.addScratches(tempCtx, tempCanvas, weakScratch);
        }
        
        const processed = new Image();
        processed.onload = () => {
            this.processedImages[this.currentIndex] = processed;
            this.updateDisplay();
        };
        processed.src = tempCanvas.toDataURL();
    }

    applySepia(ctx, canvas, intensity) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const newR = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const newG = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const newB = (r * 0.272) + (g * 0.534) + (b * 0.131);
            
            data[i] = r + (newR - r) * intensity;
            data[i + 1] = g + (newG - g) * intensity;
            data[i + 2] = b + (newB - b) * intensity;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    addNoise(ctx, canvas, intensity) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < intensity * 0.3) {
                const noise = (Math.random() - 0.5) * 80;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    addScratches(ctx, canvas, intensity) {
        ctx.globalAlpha = intensity;
        ctx.drawImage(this.scratchTexture, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    }

    prevImage() {
        if (this.images.length > 1) {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
            this.updateDisplay();
        }
    }

    nextImage() {
        if (this.images.length > 1) {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.updateDisplay();
        }
    }

    showOriginal() {
        if (this.images.length > 0) {
            this.drawImage(this.images[this.currentIndex]);
        }
    }

    showProcessed() {
        this.updateDisplay();
    }

    resetSettings() {
        document.getElementById('noiseSlider').value = 30;
        document.getElementById('sepiaSlider').value = 60;
        document.getElementById('scratchSlider').value = 20;
        
        document.getElementById('noiseValue').textContent = '30';
        document.getElementById('sepiaValue').textContent = '60';
        document.getElementById('scratchValue').textContent = '20';
        
        document.getElementById('densitySlider').value = 30;
        document.getElementById('sizeSlider').value = 30;
        document.getElementById('distributionSlider').value = 50;
        
        document.getElementById('densityValue').textContent = '30';
        document.getElementById('sizeValue').textContent = '30';
        document.getElementById('distributionValue').textContent = '50';
        
        this.scratchDensity = 30;
        this.scratchSize = 30;
        this.scratchDistribution = 50;
        
        this.customScratchTexture = null;
        this.createScratches();
        this.applyEffects();
    }

    saveImage() {
        if (this.processedImages.length === 0) return;
        
        const img = this.processedImages[this.currentIndex];
        const link = document.createElement('a');
        link.download = `vintage-photo-${this.currentIndex + 1}.jpg`;
        link.href = img.src;
        link.click();
    }
}

const app = new VintagePhotoEditor();