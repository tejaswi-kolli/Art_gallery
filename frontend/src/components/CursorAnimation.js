import React, { useEffect, useRef } from 'react';

const CursorAnimation = () => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    let hue = 0;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas to full screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.color = `hsl(${hue}, 100%, 50%)`;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.2) this.size -= 0.1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const handleMouseMove = (e) => {
            // Create multiple particles for "splash" effect
            for (let i = 0; i < 3; i++) {
                particles.current.push(new Particle(e.x, e.y));
            }
            hue += 2; // Cycle colors
        }

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            // Semi-transparent clears create trails
            // ctx.fillStyle = 'rgba(0,0,0,0.02)'; // For dark background trailer
            // Since our app is likely light/white, we clear completely or use fade:
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.current.length; i++) {
                particles.current[i].update();
                particles.current[i].draw();

                if (particles.current[i].size <= 0.3) {
                    particles.current.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through
                zIndex: 9999 // On top of everything
            }}
        />
    );
};

export default CursorAnimation;
