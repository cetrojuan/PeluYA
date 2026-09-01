const track = document.getElementById('carruselTrack');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

const tarjetasVisibles = 3;

function prepararClones() {
    const tarjetasOriginales = Array.from(track.children);
    const clonesInicio = tarjetasOriginales.slice(-tarjetasVisibles).map(t => t.cloneNode(true));
    const clonesFinal = tarjetasOriginales.slice(0, tarjetasVisibles).map(t => t.cloneNode(true));

    clonesInicio.forEach(clon => track.insertBefore(clon, track.firstChild));
    clonesFinal.forEach(clon => track.appendChild(clon));
}

prepararClones();

const tarjetas = document.querySelectorAll('.servicio');
const totalReales = tarjetas.length - (tarjetasVisibles * 2); 

let indice = tarjetasVisibles; 

function moverCarrusel(conTransicion = true) {
    track.style.transition = conTransicion ? 'transform 0.4s ease' : 'none';
    const anchoTarjeta = tarjetas[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${indice * anchoTarjeta}px)`;
}

function siguiente() {
    indice++;
    moverCarrusel();
}

function anterior() {
    indice--;
    moverCarrusel();
}

track.addEventListener('transitionend', () => {
    if (indice >= totalReales + tarjetasVisibles) {
        indice = tarjetasVisibles;
        moverCarrusel(false);
    } else if (indice < tarjetasVisibles) {
        indice = totalReales + tarjetasVisibles - 1;
        moverCarrusel(false);
    }
});

btnNext.addEventListener('click', siguiente);
btnPrev.addEventListener('click', anterior);

window.addEventListener('resize', () => moverCarrusel(false));
moverCarrusel(false);