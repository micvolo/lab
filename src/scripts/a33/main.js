import Handsfree from "handsfree";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const handsfree = new Handsfree({
    assetsPath: '/projects/a33/assets',
    // showDebug: true,
    hands: {
        enabled: true,
        maxNumHands: 1,
        // Minimum confidence [0 - 1] for a hand to be considered detected
        minDetectionConfidence: .75,
        // Minimum confidence [0 - 1] for the landmark tracker to be considered detected
        // Higher values are more robust at the expense of higher latency
        minTrackingConfidence: .6,
    },
    // weboji: true,
    // plugin: {
    //   faceScroll: {
    //     framesToFocus: 10,
    //     vertScroll: {
    //       scrollSpeed: 0.15,
    //       scrollZone: 100
    //     }
    //   }
    // }
})
// handsfree.enablePlugins("browser");
handsfree.start();
let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.pos = pos
let c = document.querySelector(".cursor1");
document.addEventListener('handsfree-data', e => {

    const hands = e.detail.hands;
    if (!hands) return;


    if (hands.landmarksVisible[1]) {


        if (hands.pinchState?.length && hands.pinchState[1]?.length && hands?.pinchState[1][1]) {
            c.style.width = 128 + 'px';
            c.style.height = 128 + 'px';
        } else if (hands.pinchState?.length && hands.pinchState[1]?.length && hands?.pinchState[1][2]) {
            c.style.width = 128 + 'px';
            c.style.height = 128 + 'px';
            c.style.borderRadius = 0;
        } else {
            c.style.width = 24 + 'px';
            c.style.height = 24 + 'px';
            c.style.borderRadius = 100 + '%';
        }

        const screenX = window.innerWidth - hands.landmarks[1][8].x * window.innerWidth;
        const screenY = hands.landmarks[1][8].y * window.innerHeight;
        const screenZ = hands.landmarks[1][8].z;


        if (Math.abs(screenX - pos.x) < 5 && Math.abs(screenY - pos.y) < 5) return;

        gsap.to(pos, { x: Math.round(screenX), y: Math.round(screenY), z: Math.round(screenZ * -100), duration: .5 })
        const $el = document.elementFromPoint(pos.x, pos.y)
        // console.log({pos, $el})
        $el.dispatchEvent(new MouseEvent('mousemove', { screenX: pos.x, screenY: pos.y, clientX: pos.x, clientY: pos.y, cancelable: true, bubbles: true }))
    }
});


// RANDOM COLOR

const priamry = Math.floor(Math.random() * 361)
const diff = 120;
let secondary, bg;
do {
    secondary = Math.floor(Math.random() * 361)
} while (Math.abs(priamry - secondary) < diff || Math.abs(priamry - secondary) > (360 - diff));
do {
    bg = Math.floor(Math.random() * 361)
} while (Math.abs(priamry - bg) < diff || Math.abs(priamry - bg) > (360 - diff));

document.documentElement.style.setProperty('--primary', `hsl(${priamry}deg, 100%, 50%)`);
document.documentElement.style.setProperty('--bg', `hsl(${bg}deg, 100%, 50%)`);
document.documentElement.style.setProperty('--secondary', `hsl(${secondary}deg, 100%, 50%)`);

// console.log({ priamry, secondary, bg })
// document.documentElement.style.setProperty('--primary', `#${Math.floor(Math.random() * 16777215).toString(16)}`);
// document.documentElement.style.setProperty('--bg', `#${Math.floor(Math.random() * 16777215).toString(16)}`);
// document.documentElement.style.setProperty('--secondary', `#${Math.floor(Math.random() * 16777215).toString(16)}`);

// MOUSE
if (matchMedia('(pointer:fine)').matches) {

    // HORIZONTAL
    let sections = gsap.utils.toArray("section, article");
    gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
            // markers: true,
            trigger: "main",
            pin: true,
            scrub: 0,
            snap: {
                snapTo: 1 / (sections.length - 1),
                delay: 0,
                duration: { min: 0, max: 1 },
                ease: 'power4'
            },
            end: `+=${1000 * sections.length}`,
        }
    });

    let cur, cur1;
    let mouseX, mouseY;
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cur) {
            cur = document.querySelector(".cursor");
            cur1 = document.querySelector(".cursor1");
            cur.style.opacity = 1;
            cur1.style.opacity = 1;
            cur.style.left = mouseX + 'px';
            cur.style.top = mouseY + 'px';
            cur1.style.left = mouseX + 'px';
            cur1.style.top = mouseY + 'px';
        }
        if (cur?.style.opacity === '0') {
            cur.style.opacity = 1;
            cur1.style.opacity = 1;
        }

        cur.style.left = mouseX + 'px';
        cur.style.top = mouseY + 'px';
        gsap.to(cur1, { left: e.clientX, top: e.clientY, duration: .15 })
    })
    document.addEventListener("mouseleave", (e) => {
        if (cur) {
            cur.style.opacity = 0;
            cur1.style.opacity = 0;
        }
    });

    // SCROLLBAR
    document.querySelectorAll('.gallery').forEach(d => {
        const scrollH = 200;
        d.addEventListener('mouseenter', () => {
            if (!cur) return;
            const percentage = d.scrollTop / (d.scrollHeight - d.clientHeight);
            cur1.style.height = scrollH + 16 + 'px';
            cur1.style.borderRadius = 0;
            cur.style.borderRadius = 0;
            cur.style.width = 12 + 'px';
            cur1.style.width = 14 + 'px';
            const n = (scrollH * percentage) - (scrollH / 2);
            cur.style.translate = `0 ${n}px`
        });
        d.addEventListener('scroll', () => {
            if (!cur) return;
            const percentage = d.scrollTop / (d.scrollHeight - d.clientHeight);
            const n = (scrollH * percentage) - (scrollH / 2);
            cur.style.translate = `0 ${n}px`
        });
        d.addEventListener('mouseleave', () => {
            if (!cur) return;
            cur1.style.height = 24 + 'px';
            cur1.style.width = 24 + 'px';
            cur1

            cur.style.borderRadius = 100 + '%';
            cur.style.width = 12 + 'px';
            cur.style.translate = '0px 0px';
        });
    })

    // RESET ON SCROLL
    window.addEventListener('scroll', (e) => {
        // if (document.elementFromPoint(mouseX, mouseY).tagName !== 'IMG') {
        //   cur1.style.height = 24 + 'px';
        //   cur1.style.borderRadius = 100 + '%';
        //   cur.style.borderRadius = 100 + '%';
        //   cur.style.width = 12 + 'px';
        //   cur.style.translate = '0px 0px';
        // }
    })


    // A
    document.querySelectorAll('a, button').forEach(d => {
        d.addEventListener('mouseenter', () => {
            if (!cur) return;
            cur1.style.width = 64 + 'px';
            cur1.style.height = 64 + 'px';
            cur1.style.borderRadius = 0;


            cur.style.width = 32 + 'px';
            cur.style.height = 32 + 'px';
        });
        d.addEventListener('mouseleave', () => {
            if (!cur) return;
            cur1.style.width = 24 + 'px';
            cur1.style.height = 24 + 'px';
            cur1.style.borderRadius = '100%';


            cur.style.width = 12 + 'px';
            cur.style.height = 12 + 'px';
        });
    })
}

window.onload = () => {
    if (window.location.hash) {
        if (matchMedia('(pointer:fine)').matches) {
            const percent = document.querySelector(`[href="${window.location.hash}"]`)?.dataset.w;
            const scrollValue = (+percent / 100) * (document.documentElement.scrollHeight - document.documentElement.clientHeight);
            window.scrollTo({
                top: scrollValue,
                left: 0,
            });
        } else {
            const element = document.querySelector(window.location.hash);
            element.scrollIntoView();
        }
    }
}
