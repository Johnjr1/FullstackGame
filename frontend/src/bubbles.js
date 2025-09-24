let THEME = "light";
const MOTION_PREF = "allow";

const PARTICLE_COUNT = 40;
const DARK_COLORS = ["#9c00d0", "#3a0ca3", "#7209b7", "#f72585"];
const LIGHT_COLORS = ["#6fadff", "#a2d2ff", "#ffafcc", "#ffc8dd"];

const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
};

class Particle {
    constructor(context, radius, x, y, speed, bounds) {
        this.context = context;
        this.radius = radius;
        this.direction = Math.random() * Math.PI * 2;
        this.turnSpeed = Math.random() - 0.8;
        this.scale = 1 + Math.random() * 0.3;
        this.originalScale = this.scale;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.bounds = bounds;
        this.inertia = 0;
        this.scrollDelta = 0;
    }

    move(delta, count) {
        this.direction += this.turnSpeed * 0.01;
        this.x += Math.sin(this.direction) * this.speed;
        this.y += Math.cos(this.direction) * this.speed;

        if (this.inertia > 0) {
            const depthShift = (this.radius / 10) * this.scrollDelta * this.inertia;
            this.y += depthShift;
            this.inertia -= delta * 0.02;
        }

        if (this.x < this.bounds.x) {
            this.x += this.bounds.width;
        } else if (this.x > this.bounds.x + this.bounds.width) {
            this.x -= this.bounds.width;
        }

        if (this.y < this.bounds.y) {
            this.y += this.bounds.height;
        } else if (this.y > this.bounds.y + this.bounds.height) {
            this.y -= this.bounds.height;
        }
    }

    shift(amount) {
        const depthShift = (this.radius / 10) * amount;
        this.y += depthShift;
    }
}

class Bubbles {
    constructor() {
        this.setVars();
        this.init();
        this.createParticles();
        this.bindEvents();
    }

    get isLightTheme() {
        return THEME === "light";
    }

    get motionPref() {
        return MOTION_PREF === "allow";
    }

    setVars() {
        this.particles = [];
        this.particleTotal = PARTICLE_COUNT;
        this.count = 0;
        this.background = this.isLightTheme ? "cyan" : "indigo";
        this.scrollY = 0;
        this.ticking = false;
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);

        this.bounds = {
            x: -50,
            y: -50,
            width: window.innerWidth + 100,
            height: window.innerHeight + 100
        };

        this.canvas.width = this.bounds.width;
        this.canvas.height = this.bounds.height;

        this.createParticles();
        this.tick();
    }

    bindEvents() {
        window.addEventListener("resize", debounce(this.handleResize, 250));
        window.addEventListener("scroll", this.handleScroll);
    }

    tick() {
        this.count += 0.2;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((particle) => {
            particle.move(0.2, this.count);
            this.drawParticle(particle);
        });

        requestAnimationFrame(() => this.tick());
    }

   drawParticle(particle) {
    this.context.beginPath();
    this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);

    // Use different colors based on particle index for variety & theme
    const colors = this.isLightTheme ? LIGHT_COLORS : DARK_COLORS;
    const colorIndex = Math.floor(particle.radius) % colors.length;

    this.context.fillStyle = colors[colorIndex];
    this.context.fill();
    this.context.closePath();
}
    createParticles() {
        if (this.particles.length > 0) {
            return;
        }

        for (let i = 0; i < this.particleTotal; i++) {
            const x = Math.random() * this.bounds.width;
            const y = Math.random() * this.bounds.height;
            const radius = Math.random() * 10 + 4;
            const speed = this.motionPref ? Math.random() : 0;

            const particle = new Particle(this.context, radius, x, y, speed, this.bounds);
            this.particles.push(particle);
        }
    }

    handleResize = () => {
        this.bounds.width = window.innerWidth + 100;
        this.bounds.height = window.innerHeight + 100;

        this.canvas.width = this.bounds.width;
        this.canvas.height = this.bounds.height;

        this.particles = [];
        this.createParticles();
    };

    handleScroll = () => {
        let newScroll = window.scrollY;
        let scrollDelta = this.scrollY - newScroll;
        let delta = Math.floor(scrollDelta) || 0;
        this.scrollY = newScroll;
        this.particles.forEach((particle) => {
            particle.inertia = 1;
            particle.scrollDelta = delta;
        });
    };

    // Remove listeners and clean up
    cleanUp() {
        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("scroll", this.handleScroll);
        document.body.removeChild(this.canvas);
    }
}

const app = new Bubbles();

// Listen for theme switch events from React
window.addEventListener("themeSwitch", (event) => {
  THEME = event.detail;
  console.log('Bubbles theme updated to:', THEME);
});
